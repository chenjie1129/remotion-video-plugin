# DeepSeek Harness smoke test

The release smoke test proves that the packed artifact installs as an out-of-tree Harness bundle, appears in the composed profile, boots in the real Web runtime, and exposes the packaged skill through the Harness skill registry.

## Automated package checks

```bash
npm ci
npm run check
```

This runs the provider lifecycle tests, TypeScript build, and package-content dry run.

## Isolated Harness profile

From the plugin repository, build a tarball and use a temporary Harness home so the test cannot alter a normal profile:

```bash
npm pack
export DSH_HOME="$(mktemp -d)"
cd /path/to/deepseek-harness
node --import tsx/esm apps/cli/src/bin.ts plugin --profile web add /absolute/path/to/chenjie1129-dsh-remotion-video-plugin-0.1.0.tgz
node --import tsx/esm apps/cli/src/bin.ts --profile web --dump-config
node --import tsx/esm apps/cli/src/bin.ts web --port 3091
```

Expected evidence:

1. The profile manifest lists `@chenjie1129/dsh-remotion-video-plugin` as a dependency and bundle.
2. The configuration dump includes the `remotion-video-plugin` row.
3. The Web runtime starts without a Loader or dependency-resolution error.
4. `http://127.0.0.1:3091` returns HTTP 200 and renders the Harness UI without an error overlay.

## Skill-registry probe

Run the package test or an equivalent Cordis probe and verify:

- `ctx.skills.list()` contains `remotion-video` from `remotion-video-plugin`;
- `ctx.skills.get('remotion-video')` loads the packaged Markdown;
- the loaded text contains preview and render commands;
- disposing the plugin removes the candidate.

## Optional model smoke test

When a non-production model credential is available, open a new standard-preset Web session and send:

> Load the remotion-video skill. Do not create files. Summarize its required animation method, preview command, and final render command.

Pass when the transcript shows the skill load and the answer identifies frame-driven animation, Remotion Studio or the project preview script, and `npx remotion render`. This optional step spends model tokens and is not required to prove plugin loading.
