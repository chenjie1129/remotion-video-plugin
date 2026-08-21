# Smoke-test results

## 2026-08-21 - version 0.1.0

Result: **PASS**

Environment:

- DeepSeek Harness local checkout: `0.1.0-rc.5`
- Harness commit: `028eeb2dbb`
- Node.js: `22.22.0`
- Profile package manager: pnpm `11.22.0`
- Host: macOS

Evidence:

1. `npm run check` passed two provider and bundle tests, compiled the TypeScript source, and validated the package contents.
2. `npm install` reported no known vulnerabilities in the plugin development dependency set.
3. The `0.1.0` tarball installed into a new isolated Harness Web profile through `dsh plugin --profile web add <tarball>`.
4. `pnpm peers check` reported `No peer dependency issues found` in the generated profile.
5. Harness added `@chenjie1129/dsh-remotion-video-plugin` to the profile dependency list and bundle stack.
6. `dsh --profile web --dump-config` contained the `remotion-video-plugin` Loader row.
7. The real Harness Web runtime started on `127.0.0.1:3091` and returned HTTP 200.
8. Browser verification rendered the DeepSeek Harness new-session UI without an error overlay.
9. The Harness Settings plugin inventory filtered to exactly one Remotion result and reported `remotion-video-plugin` as mounted and enabled.
10. After the final stable load, browser logs contained no new warnings or errors.

The optional model-token smoke test was not run because the isolated test profile intentionally contained no API key. Provider lifecycle tests directly verified that `ctx.skills.list()` exposes `remotion-video`, `ctx.skills.get()` loads its packaged instructions, and plugin disposal removes it.
