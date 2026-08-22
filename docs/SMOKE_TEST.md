# DeepSeek Harness smoke test

The release smoke proves that the packed artifact installs as an out-of-tree Harness bundle, contributes both rows to the composed profile, boots in the real Web runtime, exposes the packaged skill, and registers all five executable tools through Harness's managed subprocess service.

## Automated package checks

```bash
npm ci
npm run check
npm run release:verify
npm run test:e2e -- --probe-only
```

This runs unit and presentation-contract tests, the bilingual evaluation contract, TypeScript build, package-content dry run, release invariants, and a real Harness registry/subprocess probe. Probe-only does not render new media.

## Full render-tool integration

The release commit must run all five tools with a real Harness checkout and an approved Chrome/Chromium executable:

```bash
DEEPSEEK_HARNESS_CHECKOUT=/path/to/deepseek-harness \
REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-or-chromium \
npm run test:e2e
```

Pass requires composition discovery, a newly rendered still, a newly rendered video, H.264 metadata at 1280×720 and 30 fps, and duration within 0.1 seconds of 12 seconds. `.github/workflows/integration.yml` runs this gate on a GitHub-hosted Linux runner and uploads both artifacts.

## Isolated Harness profile

Build a tarball and use a temporary Harness home so the test cannot alter a normal profile:

```bash
npm pack
export DSH_HOME="$(mktemp -d)"
cd /path/to/deepseek-harness
node --import tsx/esm apps/cli/src/bin.ts plugin --profile web add /absolute/path/to/chenjie1129-dsh-remotion-video-plugin-0.4.0.tgz
node --import tsx/esm apps/cli/src/bin.ts --profile web --dump-config
node --import tsx/esm apps/cli/src/bin.ts web --port 3091
```

Expected evidence:

1. The profile manifest lists `@chenjie1129/dsh-remotion-video-plugin` as a dependency and bundle.
2. The configuration dump includes `remotion-video-plugin` and `remotion-video-tools`.
3. The Web runtime starts without a Loader or dependency-resolution error.
4. `http://127.0.0.1:3091` returns HTTP 200 and renders the Harness UI without an error overlay.
5. The Settings plugin inventory reports both rows as mounted and enabled.

## Registry probes

Verify that:

- `ctx.skills.list()` contains `remotion-video` from `remotion-video-plugin`;
- `ctx.skills.get('remotion-video')` loads the packaged Markdown and resource base;
- disposing the skill plugin removes the candidate;
- `ctx.tools.get()` returns all five documented Remotion tool names;
- doctor and ffprobe execute through the real Harness subprocess provider;
- a rendered artifact result includes only a workspace-relative path, size, and SHA-256 digest.

## Optional model smoke test

When a non-production model credential is available, open a new standard-preset Web session and send:

> Load the remotion-video skill. Do not create files. Summarize its required animation method, preview command, final render command, and verification gate.

Pass when the transcript shows the skill load and identifies frame-driven animation, Remotion Studio or the project preview script, `npx remotion render`, and inspection of representative stills plus final metadata. This step spends model tokens and is not required to prove plugin loading or tool execution.
