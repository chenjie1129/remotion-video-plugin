# Release procedure

## Prepare

1. Create a focused branch from the current default branch.
2. Update `package.json`, `package-lock.json`, `CHANGELOG.md`, both READMEs, compatibility evidence, and smoke-test results.
3. Run `npm ci`, `npm run check`, the full `npm run test:e2e`, demo lint/type checks, audits, secret scans, and `git diff --check`.
4. Inspect `npm pack --dry-run` and unpack the final tarball into a temporary directory for a clean-profile Harness installation.
5. Commit generated `dist/` output with its TypeScript source.

## Review and merge

Push a release branch and open a pull request containing:

- behavioral summary and capability/security boundaries;
- exact validation commands and results;
- artifact metadata and known skipped checks;
- compatibility or migration notes;
- confirmation that both README languages agree.

Wait for required CI, review the complete diff and packed contents, then merge without bypassing failed checks.

## Publish

1. Create an annotated `vX.Y.Z` tag from the merged commit.
2. Publish a GitHub release with the package tarball, checksums, demo evidence, and concise release notes.
3. Confirm CI and the release-triggered integration workflow passed for the tag, then manually dispatch `.github/workflows/publish.yml` with that exact tag.
4. Verify the npm version, public access, provenance, unpacked files, and clean-profile install by package name.
5. Update the DeepSeek Harness community discussion, plugin directory pull request, and related community posts with the release link and evidence.

The npm workflow uses GitHub OIDC trusted publishing when configured for repository `chenjie1129/remotion-video-plugin` and workflow `publish.yml`. For the first package publication, an owner may need to establish the package or provide a short-lived granular `NPM_TOKEN`; remove that secret after trusted publishing is confirmed. Never commit or print npm credentials.

If npm publication fails, keep the GitHub release valid, report npm as unavailable, and do not claim the package-name installation path works.
