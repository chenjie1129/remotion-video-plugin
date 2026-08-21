# Promotion demo

This Remotion project is the reproducible source for the public Remotion Video Plugin demo. It follows the same workflow contributed by the `remotion-video` skill: inspect, animate with `useCurrentFrame()` and `interpolate()`, preview, render a still, and render the final MP4.

## Render locally

```bash
npm install
npm run lint
npm run render:poster
npm run render:social
npm run render:demo
npm run render:gif
```

Outputs are written to `../.github/assets/`.

## Preview

```bash
npm run dev
```

Choose `RemotionVideoPluginDemo`, `DemoPoster`, or `SocialPreview` in Remotion Studio.

This demo contains no credentials, telemetry, remote service calls, or runtime asset downloads.
