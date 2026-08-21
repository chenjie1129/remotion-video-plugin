# Contributing

## Development setup

Use a supported Node.js version and install the locked dependencies:

```bash
npm ci
```

Before submitting a change, run:

```bash
npm run check
```

Behavior changes should update the provider tests and the relevant documentation. Changes to the bundled Remotion instructions should preserve these rules:

- inspect an existing project before scaffolding;
- drive animation from Remotion frames rather than CSS animation;
- keep media and timing deterministic;
- preview or render representative output;
- report checks and skipped review honestly;
- do not weaken Harness permissions or approval controls.

Use focused commits and do not include generated video files, local media, credentials, or `node_modules`.
