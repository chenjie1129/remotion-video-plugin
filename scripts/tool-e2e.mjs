import {constants} from 'node:fs';
import {access} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as RemotionTools from '../dist/tools-plugin.js';

const harnessCheckout = resolve(process.env.DEEPSEEK_HARNESS_CHECKOUT ?? new URL('../../deepseek-harness', import.meta.url).pathname);
const harnessImport = (path) => import(pathToFileURL(join(harnessCheckout, path)).href);
const {Context} = await harnessImport('vendor/cordis/lib/index.js');
const {default: SystemPrompt} = await harnessImport('packages/core/system-prompt/lib/index.js');
const {default: ToolRuntime} = await harnessImport('packages/core/tools/lib/index.js');
const {default: LocalSubprocessRuntime} = await harnessImport('packages/subprocess/subprocess-local/lib/index.js');
const probeOnly = process.argv.includes('--probe-only');

const browserCandidates = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

let browserExecutable;
for (const candidate of browserCandidates) {
  try {
    await access(candidate, constants.X_OK);
    browserExecutable = candidate;
    break;
  } catch {
    // Try the next known browser location.
  }
}
if (!probeOnly && !browserExecutable) throw new Error('Set REMOTION_BROWSER_EXECUTABLE to an approved Chrome or Chromium executable.');

const ctx = new Context();
const fibers = [];
fibers.push(await ctx.plugin(SystemPrompt));
fibers.push(await ctx.plugin(ToolRuntime));
fibers.push(await ctx.plugin(LocalSubprocessRuntime));
fibers.push(await ctx.plugin(RemotionTools, browserExecutable ? {browserExecutable} : {}));

const exec = {signal: new AbortController().signal};
const call = async (name, args) => {
  const definition = ctx.tools.get(name);
  if (!definition) throw new Error(`Tool ${name} was not registered.`);
  return definition.execute(args, exec);
};

try {
  const doctor = await call('remotion_doctor', {project_path: 'demo'});
  if (doctor.status !== 'ready') throw new Error(`Doctor failed: ${JSON.stringify(doctor)}`);

  if (probeOnly) {
    const probe = await call('remotion_probe_output', {
      project_path: 'demo',
      input_path: '.github/assets/remotion-video-plugin-demo.mp4',
    });
    const videoStream = probe.streams.find((stream) => stream.type === 'video');
    if (!videoStream || videoStream.width !== 1280 || videoStream.height !== 720 || videoStream.fps !== 30) {
      throw new Error(`Unexpected checked-in demo metadata: ${JSON.stringify(probe)}`);
    }
    console.log(JSON.stringify({
      status: 'probe-pass',
      tools: ['remotion_doctor', 'remotion_probe_output'],
      probe,
      note: 'Browser-backed list/still/video checks were intentionally skipped.',
    }, null, 2));
    process.exitCode = 0;
  } else {

    const listed = await call('remotion_list_compositions', {project_path: 'demo'});
    if (!listed.compositions.includes('RemotionVideoPluginDemo')) throw new Error('Demo composition was not discovered.');

    const still = await call('remotion_render_still', {
      project_path: 'demo',
      composition_id: 'RemotionVideoPluginDemo',
      output_path: 'out/tool-smoke.png',
      frame: 90,
      scale: 0.25,
      overwrite: true,
    });

    const video = await call('remotion_render_video', {
      project_path: 'demo',
      composition_id: 'RemotionVideoPluginDemo',
      output_path: 'out/tool-smoke.mp4',
      codec: 'h264',
      concurrency: 2,
      overwrite: true,
    });
    const videoStream = video.probe.streams.find((stream) => stream.type === 'video');
    if (!videoStream || videoStream.width !== 1280 || videoStream.height !== 720 || videoStream.fps !== 30) {
      throw new Error(`Unexpected video metadata: ${JSON.stringify(video.probe)}`);
    }
    if (Math.abs(video.probe.durationSeconds - 12) > 0.1) throw new Error(`Unexpected duration ${video.probe.durationSeconds}.`);

    console.log(JSON.stringify({
      status: 'pass',
      browserExecutable,
      tools: ['remotion_doctor', 'remotion_list_compositions', 'remotion_render_still', 'remotion_render_video', 'remotion_probe_output'],
      compositions: listed.compositions,
      still: still.artifact,
      video: video.artifact,
      probe: video.probe,
    }, null, 2));
  }
} finally {
  for (const fiber of fibers.reverse()) await fiber.dispose();
}
