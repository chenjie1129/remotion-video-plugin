# Compatibility and release gates

DeepSeek Harness is a developer preview and may introduce breaking changes. This plugin keeps a narrow pre-`0.2` host API range and treats compatibility as a tested claim rather than an assumption.

## Supported matrix

| Component | Declared range | Release gate |
| --- | --- | --- |
| Node.js | `^22.19.0` or `>=24.0.0` | Unit, build, evaluation-contract, and package checks on Node 22 and 24 |
| DeepSeek Harness | `@deepseek-ai/dsh-skill`, `dsh-tools`, and `dsh-subprocess` before `0.2.0` | Isolated bundle install, composed-config inspection, real registry mount, and Web boot |
| Remotion project | Project-owned; no runtime dependency is installed by this plugin | Project-local CLI discovery, still render, full render, and ffprobe metadata check |
| Host OS | macOS and Linux | macOS local smoke plus Linux GitHub-hosted integration workflow |

The last recorded v0.1 smoke used Harness `0.1.0-rc.5`. Version 0.4 must update `docs/SMOKE_TEST_RESULTS.md` with its exact tested commit and environment before release.

## Required gates

Every release requires:

1. `npm ci` from the committed lockfile.
2. `npm run check` on Node 22 and Node 24.
3. `npm run test:e2e` against a real Harness checkout and approved Chrome/Chromium executable.
4. A clean isolated `dsh plugin --profile web add <packed-artifact>` installation.
5. `dsh --profile web --dump-config` showing both plugin rows.
6. Real Harness Web boot, HTTP 200, plugin inventory inspection, and no new browser errors.
7. Secret, packed-content, dependency, and repository-history review.
8. `npm run release:verify` from the exact release tag.

The narrower `npm run test:e2e -- --probe-only` proves the real tool registry, subprocess seam, doctor, and media probe. It does not replace the browser-backed still and video render gate.

## Version policy

- Patch: documentation, evaluation data, diagnostics, or compatible fixes.
- Minor while pre-1.0: new tools, parameters, templates, or host integrations.
- Major: removed or renamed tools, changed artifact contracts, or a new incompatible Harness API band.

Pin production installs to an npm version, release tarball, tag, or commit. Do not use an unpinned moving Git branch for unattended environments.
