# Remotion video

Create, edit, preview, render, and verify programmatic videos with Remotion. Treat the video as deterministic React code: every animation must be derived from the current frame, and every deliverable must be checked before it is reported as complete.

## Required workflow

1. Inspect the workspace before editing. Preserve the package manager, Remotion version, composition IDs, styling system, and unrelated files.
2. Read only the focused references needed for the task from `rules/` and, when useful, choose a starting blueprint from `templates/`.
3. Implement frame-driven React animation with `useCurrentFrame()`. Do not use CSS transitions, CSS keyframes, Tailwind animation classes, wall-clock time, or unseeded randomness for timeline motion.
4. Run the project's existing lint and type checks.
5. Inspect a representative still before spending time on a full render.
6. Render the requested deliverable, probe its metadata, and report the exact checks performed. Never claim a render passed from source checks alone.

## Reference router

- Core animation, interpolation, springs, and determinism: [`rules/animation.md`](rules/animation.md)
- Compositions, schemas, dynamic duration, and reusable data: [`rules/compositions.md`](rules/compositions.md)
- Sequences, scenes, pacing, and transitions: [`rules/sequencing.md`](rules/sequencing.md)
- Images, video, audio, captions, and remote media: [`rules/media.md`](rules/media.md)
- Fonts, text fitting, Chinese typography, and safe layout: [`rules/typography.md`](rules/typography.md)
- Still checks, final renders, metadata probing, and acceptance gates: [`rules/rendering.md`](rules/rendering.md)
- GIF, Lottie, 3D, charts, maps, and visual effects: [`rules/advanced.md`](rules/advanced.md)
- Failure recovery, security, licensing, and publishing: [`rules/troubleshooting.md`](rules/troubleshooting.md)

## Starting a new project

Only scaffold in an empty destination:

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video
npm install
```

Prefer the project's local Remotion CLI. Register dimensions, frame rate, and duration explicitly, or use `calculateMetadata` when they depend on validated input data.

## Preview and render

Use Remotion Studio for interactive inspection:

```bash
npx remotion studio src/index.ts
```

Render a representative still first:

```bash
npx remotion still src/index.ts MainVideo out/smoke-frame.png --frame=30 --scale=0.25
```

Then render and verify the final output:

```bash
npx remotion render src/index.ts MainVideo out/final.mp4
ffprobe -v error -show_format -show_streams -of json out/final.mp4
```

When the `remotion_doctor`, `remotion_list_compositions`, `remotion_render_still`, `remotion_render_video`, or `remotion_probe_output` Harness tools are available, prefer them for bounded, workspace-confined execution and structured evidence.

## Reusable blueprints

- Product launch landscape video: [`templates/product-launch.md`](templates/product-launch.md)
- Captioned vertical short: [`templates/vertical-captioned.md`](templates/vertical-captioned.md)
- Data-driven report or chart story: [`templates/data-story.md`](templates/data-story.md)

Official documentation: https://www.remotion.dev/docs/
