# Rendering and acceptance gates

Run the repository's lint and type checks first. Then use this evidence ladder:

1. List compositions and confirm the target ID.
2. Render one or more representative stills, including a dense frame and a transition boundary.
3. Visually inspect layout, text wrapping, safe margins, colors, and missing assets.
4. Render the final deliverable.
5. Probe the file and confirm format, dimensions, frame rate, duration, video codec, and expected audio streams.
6. Review the beginning, a middle transition, and the ending in a real player.

Prefer a local project CLI and explicit entry point:

```bash
npx remotion compositions src/index.ts
npx remotion still src/index.ts MainVideo out/check.png --frame=90 --scale=0.5
npx remotion render src/index.ts MainVideo out/final.mp4 --codec=h264
ffprobe -v error -show_format -show_streams -of json out/final.mp4
```

Do not overwrite an existing deliverable unless the user approved replacement. Keep temporary renders separate from final output. Report skipped checks and why they were skipped.

Pass criteria must be observable: a non-empty artifact exists, metadata matches the request, no render error occurred, and visual or audio review was performed when the task required it.
