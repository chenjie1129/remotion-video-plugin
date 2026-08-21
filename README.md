# Remotion Video Plugin for DeepSeek Harness

A standalone [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that contributes the model- and user-invocable `remotion-video` skill. The skill guides Harness agents through inspecting an existing video project, scaffolding Remotion when needed, writing frame-driven React animations, previewing the composition, and rendering verified output.

## What it does

- Registers one skill provider on Harness `ctx.skills`.
- Adds the `remotion-video` skill to the standard Harness skill catalog.
- Ships as a Harness bundle, so `dsh plugin ... add` mounts it automatically.
- Provides instructions only; normal Harness tools perform file changes, dependency installation, previews, and renders under the active permission policy.
- Does not collect telemetry, store credentials, or contact an external service.

## Requirements

- Node.js `^22.19.0` or `>=24.0.0`
- DeepSeek Harness with `@deepseek-ai/dsh-skill >=0.0.1-rc.1 <0.2.0`
- A model and the standard agent preset when the skill should be model-visible
- Remotion dependencies only in the video project being created or edited

DeepSeek Harness is in developer preview. This plugin was smoke-tested with the local Harness `0.1.0-rc.5` checkout; see [Smoke testing](docs/SMOKE_TEST.md) for the exact validation path.

## Install from GitHub

Install it into the Web profile:

```bash
dsh plugin --profile web add github:chenjie1129/remotion-video-plugin
```

The package declares a Harness bundle whose `cordis.patch.yml` inserts the plugin row automatically. Restart Harness after installation:

```bash
dsh web
```

Start a new session with the standard preset, then invoke `remotion-video` from the skill menu or ask the model to create or edit a Remotion video.

Inspect the composed configuration without starting Harness:

```bash
dsh web --dump-config
```

The output should contain `id: remotion-video-plugin` and `name: '@chenjie1129/dsh-remotion-video-plugin'`.

## Install a local checkout

From this repository:

```bash
npm install
npm run check
dsh plugin --profile web add .
```

Relative local paths are resolved from the invoking directory by the Harness plugin command.

## Remove

```bash
dsh plugin --profile web remove @chenjie1129/dsh-remotion-video-plugin
```

Restart Harness after removal. The bundle is removed from the profile when its dependency is removed.

## Development

```bash
npm install
npm test
npm run build
npm pack --dry-run
```

Repository documentation:

- [Architecture and behavior](docs/ARCHITECTURE.md)
- [Harness smoke test](docs/SMOKE_TEST.md)
- [Latest smoke-test results](docs/SMOKE_TEST_RESULTS.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## License

MIT. Remotion has its own license terms; users are responsible for checking them for their team and usage model.
