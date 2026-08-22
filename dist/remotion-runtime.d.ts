import type { HarnessContext, ToolExecutionContext } from './host-contracts.js';
export interface ToolsConfig {
    /** Trusted absolute browser executable used instead of an implicit browser download. */
    browserExecutable?: string;
    /** Browser flavor matching the configured executable. Defaults to chrome-for-testing. */
    browserMode?: 'headless-shell' | 'chrome-for-testing';
    /** In-memory cap for each child output stream. */
    maxOutputBytes?: number;
    /** Maximum serialized `--props` payload accepted from the model. */
    maxPropsBytes?: number;
    /** TERM-to-KILL grace passed to the Harness subprocess provider. */
    graceMs?: number;
}
export interface NormalizedToolsConfig {
    browserExecutable?: string;
    browserMode: 'headless-shell' | 'chrome-for-testing';
    maxOutputBytes: number;
    maxPropsBytes: number;
    graceMs: number;
}
export interface ProjectContext {
    workspace: string;
    project: string;
    projectPath: string;
    packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
    packageJson: PackageJson | undefined;
    remotionVersion: string | undefined;
    remotionBin: string | undefined;
    ffprobeBin: string | undefined;
}
interface PackageJson {
    name?: unknown;
    dependencies?: Record<string, unknown>;
    devDependencies?: Record<string, unknown>;
}
export interface ManagedRun {
    stdout: string;
    stderr: string;
    stdoutTruncated: boolean;
    stderrTruncated: boolean;
    durationMs: number;
}
export interface Artifact {
    path: string;
    sizeBytes: number;
    sha256: string;
    kind: 'image' | 'video';
}
export interface MediaProbe {
    path: string;
    format: string;
    durationSeconds: number;
    sizeBytes: number;
    streams: Array<{
        type: string;
        codec: string;
        width: number | null;
        height: number | null;
        fps: number | null;
        sampleRate: number | null;
        channels: number | null;
    }>;
}
export declare function normalizeToolsConfig(config?: ToolsConfig): NormalizedToolsConfig;
export declare function inspectProject(exec: ToolExecutionContext, projectPath?: string): Promise<ProjectContext>;
export declare function resolveEntryPoint(project: ProjectContext, requested?: string): Promise<{
    absolute: string;
    relative: string;
}>;
export declare function requireCompositionId(value: string): string;
export declare function propsArgument(value: string | undefined, maxBytes: number): string[];
export declare function prepareOutput(project: ProjectContext, outputPath: string, extensions: readonly string[], overwrite: boolean): Promise<{
    absolute: string;
    relative: string;
}>;
export declare function browserArguments(ctx: HarnessContext, exec: ToolExecutionContext, config: NormalizedToolsConfig): Promise<string[]>;
export declare function runManaged(ctx: HarnessContext, exec: ToolExecutionContext, config: NormalizedToolsConfig, cwd: string, argv: readonly string[], env?: NodeJS.ProcessEnv): Promise<ManagedRun>;
export declare function parseCompositionIds(output: string): string[];
export declare function inspectArtifact(project: ProjectContext, path: string, kind: Artifact['kind']): Promise<Artifact>;
export declare function probeMedia(ctx: HarnessContext, exec: ToolExecutionContext, config: NormalizedToolsConfig, project: ProjectContext, inputPath: string): Promise<MediaProbe>;
export {};
//# sourceMappingURL=remotion-runtime.d.ts.map