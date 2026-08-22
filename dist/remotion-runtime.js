import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, mkdir, readFile, readdir, realpath, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
const ENTRY_CANDIDATES = ['src/index.ts', 'src/index.tsx', 'src/index.js', 'src/index.jsx'];
const COMPOSITION_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/;
const ANSI_ESCAPE = /\u001B\[[0-?]*[ -/]*[@-~]/g;
const OUTPUT_TAIL_LENGTH = 4_000;
export function normalizeToolsConfig(config = {}) {
    const maxOutputBytes = positiveInteger(config.maxOutputBytes ?? 64 * 1024, 'maxOutputBytes', 4 * 1024, 1024 * 1024);
    const maxPropsBytes = positiveInteger(config.maxPropsBytes ?? 64 * 1024, 'maxPropsBytes', 1, 1024 * 1024);
    const graceMs = positiveInteger(config.graceMs ?? 2_000, 'graceMs', 100, 30_000);
    const browserMode = config.browserMode ?? 'chrome-for-testing';
    if (browserMode !== 'headless-shell' && browserMode !== 'chrome-for-testing') {
        throw new Error('remotion-video-tools: browserMode must be headless-shell or chrome-for-testing');
    }
    const browserExecutable = config.browserExecutable;
    if (browserExecutable !== undefined && (!isAbsolute(browserExecutable) || browserExecutable.includes('\0'))) {
        throw new Error('remotion-video-tools: browserExecutable must be an absolute path without NUL bytes');
    }
    return { maxOutputBytes, maxPropsBytes, graceMs, browserMode, ...browserExecutable === undefined ? {} : { browserExecutable } };
}
function positiveInteger(value, name, minimum, maximum) {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new Error(`remotion-video-tools: ${name} must be an integer between ${minimum} and ${maximum}`);
    }
    return value;
}
function within(root, target) {
    const rel = relative(root, target);
    return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`));
}
function displayPath(root, target) {
    const value = relative(root, target);
    return value === '' ? '.' : value.split(sep).join('/');
}
async function existingDirectoryWithin(root, input, label) {
    if (input.includes('\0') || isAbsolute(input))
        throw new Error(`${label} must be a relative path inside the session workspace`);
    const target = await realpath(resolve(root, input));
    if (!within(root, target))
        throw new Error(`${label} resolves outside the session workspace`);
    if (!(await stat(target)).isDirectory())
        throw new Error(`${label} is not a directory`);
    return target;
}
async function existingFileWithin(root, input, label) {
    if (input.includes('\0') || isAbsolute(input))
        throw new Error(`${label} must be a relative path`);
    const target = await realpath(resolve(root, input));
    if (!within(root, target))
        throw new Error(`${label} resolves outside its allowed directory`);
    if (!(await stat(target)).isFile())
        throw new Error(`${label} is not a file`);
    return target;
}
async function optionalFile(path) {
    try {
        return (await stat(path)).isFile();
    }
    catch {
        return false;
    }
}
async function readPackage(path) {
    try {
        const parsed = JSON.parse(await readFile(path, 'utf8'));
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : undefined;
    }
    catch {
        return undefined;
    }
}
function dependencyVersion(packageJson, name) {
    const value = packageJson?.dependencies?.[name] ?? packageJson?.devDependencies?.[name];
    return typeof value === 'string' ? value : undefined;
}
async function detectPackageManager(project) {
    const candidates = [
        ['pnpm', 'pnpm-lock.yaml'],
        ['yarn', 'yarn.lock'],
        ['bun', 'bun.lock'],
        ['bun', 'bun.lockb'],
        ['npm', 'package-lock.json'],
    ];
    for (const [manager, lock] of candidates) {
        if (await optionalFile(join(project, lock)))
            return manager;
    }
    return 'unknown';
}
async function localExecutable(project, name) {
    const candidate = join(project, 'node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name);
    try {
        const target = await realpath(candidate);
        if (!within(project, target) || !(await stat(target)).isFile())
            return undefined;
        return target;
    }
    catch {
        return undefined;
    }
}
async function bundledFfprobe(project) {
    const remotionModules = join(project, 'node_modules', '@remotion');
    let names;
    try {
        names = await readdir(remotionModules);
    }
    catch {
        return undefined;
    }
    for (const name of names.filter(value => value.startsWith('compositor-')).sort()) {
        const candidate = join(remotionModules, name, process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');
        try {
            const target = await realpath(candidate);
            if (within(project, target) && (await stat(target)).isFile())
                return target;
        }
        catch {
            // Try the next platform package.
        }
    }
    return undefined;
}
export async function inspectProject(exec, projectPath = '.') {
    const requestedWorkspace = exec.agent?.session.header.cwd ?? process.cwd();
    const workspace = await realpath(requestedWorkspace);
    if (!(await stat(workspace)).isDirectory())
        throw new Error('session workspace is not a directory');
    const project = await existingDirectoryWithin(workspace, projectPath, 'project_path');
    const packageJson = await readPackage(join(project, 'package.json'));
    return {
        workspace,
        project,
        projectPath: displayPath(workspace, project),
        packageManager: await detectPackageManager(project),
        packageJson,
        remotionVersion: dependencyVersion(packageJson, 'remotion'),
        remotionBin: await localExecutable(project, 'remotion'),
        ffprobeBin: await bundledFfprobe(project),
    };
}
export async function resolveEntryPoint(project, requested) {
    if (requested !== undefined) {
        const absolute = await existingFileWithin(project.project, requested, 'entry_point');
        return { absolute, relative: displayPath(project.project, absolute) };
    }
    for (const candidate of ENTRY_CANDIDATES) {
        try {
            const absolute = await existingFileWithin(project.project, candidate, 'entry_point');
            return { absolute, relative: candidate };
        }
        catch {
            // Continue through the conventional entry points.
        }
    }
    throw new Error(`no Remotion entry point found; specify entry_point or create one of ${ENTRY_CANDIDATES.join(', ')}`);
}
export function requireCompositionId(value) {
    if (!COMPOSITION_ID.test(value)) {
        throw new Error('composition_id must contain 1-100 ASCII letters, digits, underscores, or hyphens and start with a letter or digit');
    }
    return value;
}
export function propsArgument(value, maxBytes) {
    if (value === undefined)
        return [];
    if (Buffer.byteLength(value, 'utf8') > maxBytes)
        throw new Error(`props_json exceeds the ${maxBytes}-byte limit`);
    let parsed;
    try {
        parsed = JSON.parse(value);
    }
    catch {
        throw new Error('props_json must be valid JSON');
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
        throw new Error('props_json must encode a JSON object');
    return [`--props=${JSON.stringify(parsed)}`];
}
async function nearestExisting(path) {
    let current = path;
    while (true) {
        try {
            await lstat(current);
            return current;
        }
        catch (error) {
            if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT')
                throw error;
            const parent = dirname(current);
            if (parent === current)
                throw new Error(`no existing ancestor for ${path}`);
            current = parent;
        }
    }
}
export async function prepareOutput(project, outputPath, extensions, overwrite) {
    if (outputPath.length === 0 || outputPath.includes('\0') || isAbsolute(outputPath)) {
        throw new Error('output_path must be a non-empty relative path');
    }
    const absolute = resolve(project.project, outputPath);
    if (!within(project.workspace, absolute))
        throw new Error('output_path escapes the session workspace');
    if (!extensions.includes(extname(absolute).toLowerCase())) {
        throw new Error(`output_path must use one of these extensions: ${extensions.join(', ')}`);
    }
    const existingAncestor = await realpath(await nearestExisting(dirname(absolute)));
    if (!within(project.workspace, existingAncestor))
        throw new Error('output_path follows a directory symlink outside the session workspace');
    await mkdir(dirname(absolute), { recursive: true });
    const outputDirectory = await realpath(dirname(absolute));
    if (!within(project.workspace, outputDirectory))
        throw new Error('output_path resolves outside the session workspace');
    try {
        const current = await lstat(absolute);
        if (current.isSymbolicLink())
            throw new Error('output_path must not be a symbolic link');
        if (!current.isFile())
            throw new Error('output_path exists and is not a regular file');
        if (!overwrite)
            throw new Error('output_path already exists; set overwrite=true only when replacement is intended');
    }
    catch (error) {
        if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT')
            throw error;
    }
    return { absolute, relative: displayPath(project.workspace, absolute) };
}
export async function browserArguments(ctx, exec, config) {
    if (config.browserExecutable === undefined)
        return [];
    const executable = await ctx.subprocess.resolveExecutable(config.browserExecutable, undefined, exec.signal);
    return [`--browser-executable=${executable}`, `--chrome-mode=${config.browserMode}`];
}
export async function runManaged(ctx, exec, config, cwd, argv, env = {}) {
    exec.signal.throwIfAborted();
    const started = Date.now();
    const spec = {
        argv,
        cwd,
        stdio: {
            stdin: 'ignore',
            stdout: { maxBytes: config.maxOutputBytes },
            stderr: { maxBytes: config.maxOutputBytes },
        },
        graceMs: config.graceMs,
        signal: exec.signal,
        env: { CI: '1', NO_COLOR: '1', ...env },
    };
    const handle = ctx.subprocess.spawn(spec);
    const outcome = await handle.done;
    const stdout = handle.collected.stdout?.readFrom(0);
    const stderr = handle.collected.stderr?.readFrom(0);
    if (stdout === undefined || stderr === undefined)
        throw new Error('managed Remotion command did not expose collected output');
    exec.signal.throwIfAborted();
    const cleanStdout = stdout.text.replace(ANSI_ESCAPE, '');
    const cleanStderr = stderr.text.replace(ANSI_ESCAPE, '');
    if (outcome.exitCode !== 0 || outcome.signal !== null) {
        const diagnostic = (cleanStderr.trim() || cleanStdout.trim() || 'no diagnostic output').slice(-OUTPUT_TAIL_LENGTH);
        throw new Error(`managed Remotion command failed (${outcome.signal ?? `exit ${outcome.exitCode ?? 'unknown'}`}): ${diagnostic}`);
    }
    return {
        stdout: cleanStdout,
        stderr: cleanStderr,
        stdoutTruncated: stdout.lossy,
        stderrTruncated: stderr.lossy,
        durationMs: Date.now() - started,
    };
}
export function parseCompositionIds(output) {
    const lines = output.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const candidate = lines.at(-1) ?? '';
    const ids = candidate.split(/\s+/).filter(value => COMPOSITION_ID.test(value));
    if (ids.length === 0)
        throw new Error('Remotion returned no parseable composition IDs');
    return [...new Set(ids)];
}
async function sha256(path) {
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path))
        hash.update(chunk);
    return hash.digest('hex');
}
export async function inspectArtifact(project, path, kind) {
    const target = await realpath(path);
    if (!within(project.workspace, target))
        throw new Error('rendered artifact resolves outside the session workspace');
    const info = await stat(target);
    if (!info.isFile() || info.size <= 0)
        throw new Error('rendered artifact is missing or empty');
    return { path: displayPath(project.workspace, target), sizeBytes: info.size, sha256: await sha256(target), kind };
}
function finiteNumber(value, fallback = 0) {
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}
function optionalInteger(value) {
    const parsed = finiteNumber(value, Number.NaN);
    return Number.isInteger(parsed) ? parsed : null;
}
function frameRate(value) {
    if (typeof value !== 'string')
        return null;
    const parts = value.split('/');
    if (parts.length !== 2)
        return null;
    const [numerator, denominator] = parts.map(Number);
    if (numerator === undefined || denominator === undefined
        || !Number.isFinite(numerator) || !Number.isFinite(denominator)
        || numerator <= 0 || denominator <= 0)
        return null;
    return Number((numerator / denominator).toFixed(6));
}
export function resolveFrameRate(average, fallback) {
    return frameRate(average) ?? frameRate(fallback);
}
export async function probeMedia(ctx, exec, config, project, inputPath) {
    if (project.ffprobeBin === undefined)
        throw new Error('the project does not contain Remotion\'s bundled ffprobe binary');
    const input = await existingFileWithin(project.workspace, inputPath, 'input_path');
    const run = await runManaged(ctx, exec, config, project.project, [
        project.ffprobeBin,
        '-v', 'error',
        '-show_format',
        '-show_streams',
        '-of', 'json',
        input,
    ], process.platform === 'darwin' ? { DYLD_LIBRARY_PATH: dirname(project.ffprobeBin) } : {});
    let document;
    try {
        document = JSON.parse(run.stdout);
    }
    catch {
        throw new Error('ffprobe returned invalid JSON');
    }
    const fileInfo = await stat(input);
    return {
        path: displayPath(project.workspace, input),
        format: typeof document.format?.format_name === 'string' ? document.format.format_name : 'unknown',
        durationSeconds: finiteNumber(document.format?.duration),
        sizeBytes: fileInfo.size,
        streams: (Array.isArray(document.streams) ? document.streams : []).map(stream => ({
            type: typeof stream.codec_type === 'string' ? stream.codec_type : 'unknown',
            codec: typeof stream.codec_name === 'string' ? stream.codec_name : 'unknown',
            width: optionalInteger(stream.width),
            height: optionalInteger(stream.height),
            fps: resolveFrameRate(stream.avg_frame_rate, stream.r_frame_rate),
            sampleRate: optionalInteger(stream.sample_rate),
            channels: optionalInteger(stream.channels),
        })),
    };
}
//# sourceMappingURL=remotion-runtime.js.map