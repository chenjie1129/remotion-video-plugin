# Changelog

## 0.4.0 - 2026-08-22

- Added contract coverage and release documentation for generic Harness call/result cards, artifact paths, SHA-256 digests, and normalized media facts.
- Added Node 22/24 CI, a real Harness/Remotion integration workflow, release verification, and npm trusted-publishing automation.
- Added an explicit compatibility matrix, release procedure, expanded threat model, and synchronized English and Simplified Chinese documentation.
- Made the npm package the versioned installation channel while retaining pinned GitHub and release-tarball options.
- Required the npm publisher to check out an exact semver tag backed by a non-draft GitHub release.
- Made media probing fall back to `r_frame_rate` when ffprobe's average frame rate is missing or unusable.

## 0.3.0 - 2026-08-22

- Added workspace-confined `remotion_doctor`, `remotion_list_compositions`, `remotion_render_still`, `remotion_render_video`, and `remotion_probe_output` Harness tools.
- Routed every command through Harness's managed subprocess seam with fixed argument arrays, credential scrubbing, bounded output, cancellation, and timeouts.
- Added structured artifact hashes and media metadata to render results.
- Kept the skill provider and executable tools in separate Cordis rows so each lifecycle remains independently reversible.

## 0.2.0 - 2026-08-22

- Replaced the single long-form skill with a focused router and eight task-specific Remotion references.
- Added product-launch, vertical-caption, and data-story blueprints.
- Added a ten-case bilingual model-to-render evaluation contract and automated validation.
- Made still inspection, final rendering, and metadata evidence explicit completion gates.

## 0.1.0 - 2026-08-21

- Add the standalone DeepSeek Harness bundle and Cordis plugin.
- Register the model- and user-invocable `remotion-video` skill.
- Add Remotion scaffolding, animation, media, preview, rendering, and verification guidance.
- Add provider lifecycle tests, CI, architecture documentation, smoke-test instructions, and security guidance.
- Add a reproducible Remotion demo project, rendered MP4, animated preview, poster, and social-preview artwork.
- Add English and Simplified Chinese quick starts, example prompts, and proof links.
- Validate the demo source in CI without runtime downloads or service credentials.
