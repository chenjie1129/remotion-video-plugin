# Media, audio, and captions

Put publishable local assets under `public/` and reference them with `staticFile()`. Use Remotion media components so loading and timing participate in rendering:

```tsx
import {Audio, Video} from '@remotion/media';
import {Img, staticFile} from 'remotion';

export const Media = () => <>
  <Img src={staticFile('logo.png')} />
  <Video src={staticFile('clip.mp4')} />
  <Audio src={staticFile('music.mp3')} volume={0.25} />
</>;
```

Keep caption timing as data. Determine active cues from the current frame, preserve meaningful line breaks, and check contrast, safe margins, and reading speed at delivery resolution. For word-level highlighting, keep word timestamps monotonic and render only the active phrase window.

For audio, define trimming, volume, playback rate, and fades explicitly. Inspect the final file for an audio stream when audio is expected, and listen to at least the beginning, one transition, and the ending.

Remote media introduces availability and reproducibility risk. Prefer local licensed assets for release builds. If a remote URL is required, handle failures, set deterministic fallbacks, and confirm the rendering environment may access it.

Never commit private footage, credentials, signed URLs, or licensed assets whose redistribution terms do not permit repository publication.
