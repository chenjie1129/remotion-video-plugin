# Animation and determinism

Use `useCurrentFrame()` for time and `useVideoConfig()` for `fps`. Derive animated values with `interpolate()`, `spring()`, or `Easing`; clamp values that must stop outside the intended interval.

```tsx
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const Reveal = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, 0.6 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return <div style={{opacity}}>Frame-driven</div>;
};
```

Rules:

- Do not use CSS transitions, CSS keyframes, or Tailwind animation classes for timeline motion.
- Avoid `Date.now()`, timers, mutable module state, and unseeded randomness.
- Use `random(seed)` when variation is required and keep the seed stable.
- Express timing in seconds multiplied by `fps`; centralize scene timings instead of scattering frame literals.
- Animate transform and opacity when possible. Expensive blur, shadow, and layout animation should be tested at delivery resolution.
- Keep hooks unconditional and React components pure so parallel frame rendering produces the same result.
