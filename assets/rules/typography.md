# Typography and layout

Load fonts deterministically and wait for them before rendering. Prefer local font files for reproducible release builds; use a supported font-loading package when remote fonts are acceptable.

Treat text as variable input:

- Set maximum line counts and fit or truncate according to the product requirement.
- Measure important titles and labels rather than assuming English-length strings.
- Test the longest expected values and both supported languages.
- Keep essential content inside title-safe margins.
- Avoid tiny text that is readable in Studio but not on a phone or compressed output.

For Simplified Chinese, avoid arbitrary letter spacing, prohibit line starts with closing punctuation, and avoid leaving opening punctuation at the end of a line. Check mixed Chinese, Latin, and numeric baselines. Use an appropriate CJK font with known redistribution rights and verify the font is actually embedded or available in the render environment.

Inspect at least the smallest supported canvas, the densest copy, and a frame during motion. A source-level type check cannot detect clipping, overflow, or illegible contrast.
