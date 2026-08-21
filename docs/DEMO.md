# Reproducible Remotion demo

The repository includes a real 12-second Remotion composition and its rendered output. The demo was created with the same inspect, animate, preview, and render workflow taught by the `remotion-video` skill.

## Watch the proof

- [Rendered MP4](../.github/assets/remotion-video-plugin-demo.mp4)
- [Animated README preview](../.github/assets/remotion-video-plugin-demo.gif)
- [Video poster](../.github/assets/demo-poster.png)
- [GitHub social preview](../.github/assets/social-preview.png)

The MP4 is H.264, 1280×720, 30 fps, and approximately 12 seconds long.

## Reproduce it

```bash
cd demo
npm install
npm run lint
npm run render:poster
npm run render:social
npm run render:demo
npm run render:gif
```

The project uses `useCurrentFrame()`, `interpolate()`, `Sequence`, and local assets. It has no credentials, telemetry, remote service calls, or runtime asset downloads.

## What this proves

1. The plugin installs as a DeepSeek Harness bundle and exposes `remotion-video`.
2. The skill describes a complete, preview-first Remotion workflow.
3. The included composition passes ESLint and TypeScript checks.
4. The composition renders into a playable MP4 and a lightweight README preview.

Harness installation evidence is recorded separately in [SMOKE_TEST_RESULTS.md](SMOKE_TEST_RESULTS.md).
