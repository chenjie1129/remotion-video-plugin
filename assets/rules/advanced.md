# Advanced content

Use advanced packages only when they materially support the requested design and match the project's Remotion version.

- Charts: animate data values from the current frame, keep scales stable, and label units. Validate empty, negative, and large inputs.
- GIF and animated images: use Remotion-aware components so playback is synchronized with the render timeline.
- Lottie: keep the animation JSON local when possible and map its progress to frame time.
- 3D: use Remotion's Three.js integration; fix camera, lighting, asset-loading, and random seeds for deterministic frames.
- Maps: prefer a licensed static map for simple scenes. For animated routes, cache data and verify tile or provider terms before publication.
- Canvas and WebGL effects: render HTML through supported Remotion components and test headless-browser compatibility.
- Transparent output: choose a codec and pixel format that preserve alpha, then probe the stream instead of trusting the filename.

Every additional package increases render and licensing risk. Pin compatible versions, keep effects reusable, and add a representative still to the acceptance checks.
