# Contributing

## Development setup

Use a supported Node.js version and install the locked dependencies:

```bash
npm ci
```

Before submitting a change, run:

```bash
npm run check
npm run release:verify
npm run test:e2e -- --probe-only
npm --prefix demo run lint
```

Changes to rendering behavior must also pass the full browser-backed integration test against a real Harness checkout:

```bash
DEEPSEEK_HARNESS_CHECKOUT=/path/to/deepseek-harness \
REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-or-chromium \
npm run test:e2e
```

Probe-only validates the real Harness tool registry, managed subprocess path, doctor, and ffprobe output. It is not a substitute for the still/video render gate. Update source and generated `dist/` together, and include the exact commands and any skipped checks in the pull request.

Behavior changes should update the provider tests and the relevant documentation. Changes to the bundled Remotion instructions should preserve these rules:

- inspect an existing project before scaffolding;
- drive animation from Remotion frames rather than CSS animation;
- keep media and timing deterministic;
- preview or render representative output;
- report checks and skipped review honestly;
- do not weaken Harness permissions or approval controls.

Use focused commits and do not include unreviewed generated video files, private media, credentials, or `node_modules`. Release evidence under `.github/assets/` is allowed only when it is intentional, reproducible, and license-safe.
