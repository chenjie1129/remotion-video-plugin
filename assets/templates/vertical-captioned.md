# Captioned vertical short blueprint

Use for a 9:16 social video with a primary clip, voiceover or dialogue, and readable captions.

## Input contract

```ts
type CaptionedShortProps = {
  title: string;
  videoSrc: string;
  captions: Array<{startMs: number; endMs: number; text: string}>;
  callToAction?: string;
};
```

Validate monotonic caption times and keep the final cue within the video duration. Render active captions from the current frame, not from playback events.

Keep captions inside a mobile-safe central region, normally no lower than 12% from the bottom. Limit visible text to two or three short lines and check the longest Chinese and English cue. Use a high-contrast backing treatment that does not cover essential footage.

Inspect the first caption, the longest caption, a cue boundary, and the final call to action. Probe the final output for both video and audio streams when the source contains sound.

Default output: 1080×1920, 30 fps, duration derived from input, H.264 MP4.
