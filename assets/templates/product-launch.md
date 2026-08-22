# Product launch blueprint

Use for a 16:9 product announcement, feature overview, or short landing-page video.

## Input contract

```ts
type ProductLaunchProps = {
  productName: string;
  headline: string;
  benefits: Array<{title: string; detail: string}>;
  accentColor: string;
  screenshots: string[];
  callToAction: string;
};
```

Validate strings and require one to three benefits. Keep asset paths relative to `public/`.

## Scene plan at 30 fps

| Scene | Frames | Purpose |
| --- | ---: | --- |
| Brand reveal | 0–59 | Product name and headline |
| Product proof | 45–224 | Screenshot or UI sequence with benefits |
| Summary | 210–299 | Benefits regroup and visual pause |
| Call to action | 285–359 | Clear final message and stable ending |

Use restrained spring entrances, one consistent transition family, and a layout-safe screenshot frame. Inspect frames 0, 45, 120, 224, 285, and 359 before the full render.

Default output: 1920×1080, 30 fps, 360 frames, H.264 MP4.
