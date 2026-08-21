# Remotion video

Create, preview, and render programmatic videos with [Remotion](https://www.remotion.dev/). Remotion expresses video compositions as React code and renders them deterministically frame by frame. Use this skill for motion graphics, animated slideshows, product demos, captions, data-driven video, and reusable video templates.

## Before changing a project

Inspect the current workspace first. If it already contains a Remotion project, preserve its package manager, version, composition structure, styling system, and scripts. Do not scaffold over a non-empty directory or replace unrelated files.

When starting in an empty workspace, scaffold a minimal project:

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video
npm install
```

Replace `my-video` with a suitable directory name. Use another official template only when it clearly matches the requested output.

## Composition structure

Register compositions with `<Composition>` and define dimensions, frame rate, and duration explicitly:

```tsx
import {Composition} from 'remotion';
import {MainVideo} from './MainVideo';

export const RemotionRoot = () => {
  return (
    <Composition
      id="MainVideo"
      component={MainVideo}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

Use `calculateMetadata` when duration, dimensions, or props depend on input data. Validate parameterized composition props with the project's existing schema approach.

## Animation rules

Derive animation from `useCurrentFrame()` and `interpolate()`. Use `spring()` or `Easing` when appropriate. Always clamp interpolation where values should not continue outside their intended range.

```tsx
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const FadeIn = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, 1.5 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return <div style={{opacity}}>Hello</div>;
};
```

Do not use CSS transitions, CSS keyframe animations, or Tailwind animation classes for timeline motion; they are not driven by Remotion's render frame. Keep the composition deterministic: avoid wall-clock time, unseeded randomness, and state that changes independently of the frame.

## Timing and sequencing

Use `<Sequence from={...} durationInFrames={...}>` to delay or bound a scene. Use `layout="none"` when the sequence should not create an absolute-fill wrapper. Derive time values from `fps` rather than scattering unexplained frame counts.

## Assets and media

Place local assets in `public/` and reference them with `staticFile()`. Use Remotion components for render-safe media:

```tsx
import {Img, staticFile} from 'remotion';
import {Audio, Video} from '@remotion/media';

export const Media = () => (
  <>
    <Img src={staticFile('logo.png')} />
    <Video src={staticFile('clip.mp4')} />
    <Audio src={staticFile('music.mp3')} />
  </>
);
```

Keep secrets and private media out of source control. Confirm licensing for fonts, music, images, footage, and Remotion itself before publishing commercial output.

## Preview and verification

Run the project's existing checks first. For a new default project, use:

```bash
npm run lint
npm run dev
```

Use Remotion Studio to inspect composition registration, timing, text wrapping, safe margins, and asset loading. For a fast render check, render one representative frame:

```bash
npx remotion still MainVideo out/smoke-frame.png --frame=30 --scale=0.25
```

For a complete output, render the intended composition:

```bash
npx remotion render MainVideo out/final.mp4
```

Verify that the output file exists, has the expected dimensions and duration, and contains no missing media or blank frames. Report the exact checks run and any skipped visual or audio review.

## Task-specific guidance

- Captions: keep word timing in data, render from the current frame, and check readability at delivery resolution.
- Audio: use Remotion media APIs for timing, trimming, volume, and playback rate.
- Data-driven video: separate validated input data from reusable visual components.
- Long videos: divide scenes into components and keep timing constants centralized.
- Remote media: handle loading failures and ensure the render environment can reach the URL.
- Existing projects: follow their established composition IDs, formatting, and package versions unless a migration is explicitly requested.

Official documentation: https://www.remotion.dev/docs/
