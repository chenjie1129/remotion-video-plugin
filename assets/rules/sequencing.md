# Sequencing, scenes, and transitions

Use `<Sequence>` to delay or bound a scene. Use `layout="none"` when no absolute-fill wrapper is wanted. Components inside a sequence receive a frame starting at zero, which makes scene-local animation easier to reason about.

Prefer a timing map:

```ts
export const timing = {
  intro: {from: 0, duration: 60},
  feature: {from: 45, duration: 180},
  outro: {from: 210, duration: 90},
} as const;
```

Use `<Series>` for strictly consecutive scenes and Remotion transitions for intentional overlaps. When adding a transition, account for its overlap in the total duration; do not merely concatenate scene durations.

Pacing checks:

- Keep readable text on screen long enough for its language and density.
- Avoid starting every element at the same frame; use small deliberate offsets.
- Inspect the exact cut frames before and after every transition.
- Ensure the first and final frames are intentional, not blank leftovers.
- Keep transition styles consistent unless a change communicates hierarchy.
