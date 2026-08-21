# Remotion Video Plugin for DeepSeek Harness

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-53d7ff.svg)](LICENSE)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-0.1.0--rc.5-9e7bff.svg)](docs/SMOKE_TEST_RESULTS.md)

Give DeepSeek Harness a repeatable workflow for creating programmatic videos with [Remotion](https://www.remotion.dev/): inspect the project, write frame-driven React animation, preview it, and render verified output.

[![12-second Remotion Video Plugin demo](.github/assets/remotion-video-plugin-demo.gif)](.github/assets/remotion-video-plugin-demo.mp4)

**[Watch the 12-second MP4](.github/assets/remotion-video-plugin-demo.mp4)** · [See how the proof is reproduced](docs/DEMO.md)

## Quick start

Install the plugin into the DeepSeek Harness Web profile:

```bash
dsh plugin --profile web add github:chenjie1129/remotion-video-plugin
dsh web
```

Start a new standard-agent session, select `remotion-video` from the skill menu, or ask naturally:

> Create a 15-second 16:9 launch video for my product. Use frame-driven animation, show me a preview, and render an MP4 after the checks pass.

Other useful prompts:

- “Turn these screenshots and copy into a polished Remotion product demo.”
- “Improve the pacing and text animation in this existing Remotion composition.”
- “Render a representative still first, check it, then render the final video.”

## What the plugin adds

- A model- and user-invocable `remotion-video` skill in the standard Harness skill catalog.
- Guidance for project inspection, Remotion scaffolding, compositions, frame-driven animation, media handling, preview, rendering, and output verification.
- A Harness bundle that mounts automatically when installed with `dsh plugin ... add`.
- A permission-aware workflow: ordinary Harness tools perform file changes, installs, previews, and renders under the active policy.

This plugin does not collect telemetry, store credentials, upload media, or contact an external service.

## Proof it works

| Check | Result | Evidence |
| --- | --- | --- |
| Plugin unit tests | 2/2 passed | [Test source](tests/plugin.spec.ts) |
| Harness bundle install | Passed | [Smoke-test results](docs/SMOKE_TEST_RESULTS.md) |
| Composed Harness config | Plugin mounted and enabled | [Smoke-test procedure](docs/SMOKE_TEST.md) |
| Demo source checks | ESLint and TypeScript passed | [Reproducible demo](demo/) |
| Real render | H.264, 1280×720, 30 fps, ~12 s | [MP4](.github/assets/remotion-video-plugin-demo.mp4) |
| Package security | No runtime service or credential access | [Security policy](SECURITY.md) |

## Requirements

- Node.js `^22.19.0` or `>=24.0.0`
- DeepSeek Harness with `@deepseek-ai/dsh-skill >=0.0.1-rc.1 <0.2.0`
- A model and the standard agent preset when the skill should be model-visible
- Remotion dependencies only in the video project being created or edited

DeepSeek Harness is in developer preview. The recorded smoke test used Harness `0.1.0-rc.5`.

## Verify or remove

Inspect the composed configuration without starting Harness:

```bash
dsh web --dump-config
```

The output should contain `id: remotion-video-plugin` and `name: '@chenjie1129/dsh-remotion-video-plugin'`.

Remove the plugin with:

```bash
dsh plugin --profile web remove @chenjie1129/dsh-remotion-video-plugin
```

Restart Harness after installing or removing it.

## Development

```bash
npm install
npm run check
dsh plugin --profile web add .
```

To reproduce the promotional video, follow [demo/README.md](demo/README.md).

More documentation: [architecture](docs/ARCHITECTURE.md) · [smoke test](docs/SMOKE_TEST.md) · [contributing](CONTRIBUTING.md) · [changelog](CHANGELOG.md)

## Project status and license

This is an independent community plugin, not an official DeepSeek or Remotion project. The plugin is MIT licensed. Remotion has its own license terms; users are responsible for checking them for their team and usage model.
