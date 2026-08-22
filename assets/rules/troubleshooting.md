# Troubleshooting, security, and release safety

Start with the smallest failing layer:

1. Confirm the selected project and package manager.
2. Confirm the local Remotion CLI and entry point exist.
3. List compositions before rendering.
4. Render one still before a full video.
5. Read the first actionable bundler, browser, media, or encoder error.

Common failures:

- Browser download fails: configure an approved local browser executable or restore network access to the official browser package source.
- Composition is missing: verify the entry point calls `registerRoot()` and the ID matches exactly.
- Asset is missing: use `staticFile()` and verify case-sensitive paths on Linux.
- Render hangs: inspect unresolved `delayRender()` handles, media requests, and remote fonts; ensure cancellation signals reach long-running work.
- Output is blank: inspect an early and middle still and check scene `from`/`durationInFrames` calculations.
- Audio is absent: probe streams and verify the source is not muted or trimmed outside the composition.

Security boundary:

- Treat a Remotion project as executable code. Rendering runs its bundler and React composition.
- Render only inside the authorized workspace. Do not follow output paths through symlinks outside it.
- Use fixed argument arrays rather than shell strings; bound output, time, concurrency, and input-prop size.
- Do not forward Harness credentials into render subprocesses.
- Do not publish private media, environment files, browser profiles, render caches, or generated artifacts unless intentionally selected.

Check Remotion's current licensing terms for the user's team and automation model before commercial or service deployment. Record third-party asset licenses and attribution requirements with the project.
