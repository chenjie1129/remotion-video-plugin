# Smoke-test results

## 2026-08-22 - version 0.4.0 release candidate

Result: **PASS**

Environment:

- DeepSeek Harness clean hosted checkout: `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
- Node.js: `22.22.0`
- Harness build pnpm: `11.7.0`; isolated profile pnpm: `11.22.0`
- Host: GitHub-hosted Ubuntu runner with system Chrome

Evidence:

1. `npm run check` passed 8 unit/contract tests, validated 10 bilingual model-to-render cases, compiled TypeScript, and inspected a 48-file npm payload.
2. `npm run release:verify` confirmed the stable version, matching lockfile and changelog, synchronized README release number, both Cordis rows, full render and isolated Web smokes, and the npm OIDC/publication contract.
3. `npm --prefix demo run lint` passed ESLint and TypeScript checks.
4. The real Harness `ToolRuntime` and `LocalSubprocessRuntime` mounted all five tools and discovered `RemotionVideoPluginDemo`, `SocialPreview`, and `DemoPoster`.
5. Final-head integration run [32550322333](https://github.com/chenjie1129/remotion-video-plugin/actions/runs/32550322333) built the full clean Harness checkout and passed the real registry/subprocess render and isolated Web gate in 3m47s.
6. The hosted render produced a 1,593-byte PNG (`sha256:52b5af20ad16ea14cfa8bfe05d067205936deb4fb6cb181d1ac927b2f1e722f0`) and a 2,212,827-byte MP4 (`sha256:61f6ad93484a26af7585fdc0bdb610553f2564d6a18408b3e958d2672ce21af1`).
7. ffprobe verified the fresh MP4 as H.264 at 1280×720 and 30 fps with AAC stereo audio at 48 kHz and a duration of 12.053333 seconds.
8. The `0.4.0` tarball was unpacked and its 48-file payload inspected. It contained no `node_modules`, local environment files, or credentials; the final tarball checksum belongs in the GitHub release because a package cannot contain its own stable hash.
9. That exact tarball installed into a brand-new isolated Web profile. `pnpm peers check` reported no peer issues, and the composed config contained both `remotion-video-plugin` and `remotion-video-tools`.
10. The real Harness Web server returned HTTP 200. Chrome found exactly the two package modules, reported both as `Mounted, Enabled`, and recorded distinct Loader ids `include:remotion-video-plugin` and `include:remotion-video-tools`.
11. The browser proof reported empty console-error, console-warning, page-error, request-failure, and alert collections. The full-page inventory screenshot, PNG, and MP4 were uploaded as artifact `remotion-tool-smoke-f898b8ea38f17c2ade6cf3b44828a09a3223cccb` (artifact digest `sha256:0e1c95dda751649a1f7b1ad48a80b6fa77342461222a4433c46cf65c82ce8d30`).
12. The first hosted Web-gate attempt correctly failed because it conflated configured ids with runtime-generated Loader ids. The corrected assertion now checks configured ids in dumped config, exact package modules in the browser inventory, and unique Loader ids at runtime.
13. Current files, packed files, tracked filenames, and Git history produced no match for the reviewed common secret/key patterns or sensitive filenames.
14. The lockfile-only plugin install reported zero vulnerabilities from available npm data. A live audit refresh for the demo could not resolve `registry.npmjs.org`; the earlier 0.1 release record remains the last successful live demo audit.

Remaining publication steps (not failed test gates):

- The restricted local host still rejects the isolated Web server bind with `listen EPERM` on `127.0.0.1:3094`. The successful clean GitHub-hosted gate is the authoritative 0.4 Web evidence.
- Create the annotated `v0.4.0` tag and GitHub release, pass the release-triggered integration run, publish and verify npm provenance, then update the community post.

## 2026-08-21 - version 0.1.0

Result: **PASS**

![Harness plugin inventory showing remotion-video-plugin mounted and enabled](../.github/assets/harness-plugin-mounted.png)

Environment:

- DeepSeek Harness local checkout: `0.1.0-rc.5`
- Harness commit: `028eeb2dbb`
- Node.js: `22.22.0`
- Profile package manager: pnpm `11.22.0`
- Host: macOS

Evidence:

1. `npm run check` passed two provider and bundle tests, compiled the TypeScript source, and validated the package contents.
2. `npm audit` reported zero known vulnerabilities in both the plugin and reproducible demo dependency sets.
3. The `0.1.0` tarball installed into a new isolated Harness Web profile through `dsh plugin --profile web add <tarball>`.
4. `pnpm peers check` reported `No peer dependency issues found` in the generated profile.
5. Harness added `@chenjie1129/dsh-remotion-video-plugin` to the profile dependency list and bundle stack.
6. `dsh --profile web --dump-config` contained the `remotion-video-plugin` Loader row.
7. The final release artifact was reinstalled into a brand-new isolated profile; the real Harness Web runtime started on `127.0.0.1:3093` and returned HTTP 200.
8. Browser verification rendered the DeepSeek Harness new-session UI without an error overlay.
9. The Harness Settings plugin inventory filtered to exactly one Remotion result and reported `remotion-video-plugin` as mounted and enabled.
10. After the final stable load, browser logs contained no new warnings or errors.
11. The included Remotion composition passed ESLint and TypeScript checks and rendered a 12-second H.264 MP4 at 1280×720 and 30 fps.

The optional model-token smoke test was not run because the isolated test profile intentionally contained no API key. Provider lifecycle tests directly verified that `ctx.skills.list()` exposes `remotion-video`, `ctx.skills.get()` loads its packaged instructions, and plugin disposal removes it.
