# Data story blueprint

Use for an animated report, KPI update, ranking, or chart-based explainer.

## Input contract

```ts
type DataStoryProps = {
  title: string;
  subtitle?: string;
  series: Array<{label: string; value: number; color?: string}>;
  unit?: string;
  source?: string;
};
```

Validate finite numeric values and define behavior for empty, negative, and equal-value data. Derive the chart scale from the complete validated dataset so axes do not move while bars animate.

## Scene plan

1. State the question or headline.
2. Introduce axes and labels.
3. Animate values with one shared progress signal.
4. Highlight the main comparison.
5. Hold the final state with source and unit visible.

Test the smallest and largest permitted values, long labels, mixed Chinese/Latin text, and a dataset whose values are all zero. Probe the final frame to ensure labels and sources remain visible.

Default output: 1920×1080, 30 fps, 8–15 seconds, H.264 MP4.
