# Remotion workflow tools

Version 0.3 adds five model-facing Harness tools while keeping the original skill provider as a separate Cordis row.

| Tool | Effect | Default timeout |
| --- | --- | ---: |
| `remotion_doctor` | Reads project readiness and dependency facts | 30 seconds |
| `remotion_list_compositions` | Bundles the entry point and lists IDs | 3 minutes |
| `remotion_render_still` | Writes one PNG or JPEG | 5 minutes |
| `remotion_render_video` | Writes and probes one video | 15 minutes |
| `remotion_probe_output` | Reads normalized media metadata | 30 seconds |

The timeout values are tool metadata enforced when the Harness timeout policy is mounted. Every subprocess also receives the call's abort signal, so cancellation terminates the managed process tree.

## Safety contract

- Project paths must be relative to the session workspace and resolve inside it.
- Entry points must resolve inside the selected project.
- Output paths must stay inside the workspace. Existing symlinks and directory symlink escapes are rejected.
- Existing output is preserved unless `overwrite: true` is explicit.
- Only the project-local `node_modules/.bin/remotion` executable is accepted.
- Commands are argument arrays, never shell strings.
- Each output stream is bounded to 64 KiB by default and is not spilled to an agent-readable arbitrary path.
- Harness credentials and `DSH_*` variables are scrubbed by the host subprocess provider; the plugin explicitly forwards only `CI` and `NO_COLOR`, plus the bundled ffprobe library directory on macOS.
- Composition props must be one JSON object and are limited to 64 KiB by default.
- Frame, scale, codec, concurrency, extension, and composition ID have closed validation rules.

Rendering executes the selected Remotion project and therefore executes project code. Only render trusted workspaces.

## Trusted configuration

Users may override the tool row in their profile's `cordis.patch.yml`:

```yaml
- id: remotion-video-tools
  name: '@chenjie1129/dsh-remotion-video-plugin/tools'
  config:
    browserExecutable: /absolute/path/to/chrome-headless-shell
    browserMode: headless-shell
    maxOutputBytes: 65536
    maxPropsBytes: 65536
    graceMs: 2000
```

`browserExecutable` is deployment configuration, not a model argument. Use `browserMode: chrome-for-testing` for a full Chrome/Chromium binary. When no executable is configured, Remotion controls its supported browser acquisition.

## Artifact evidence

Still and video results include:

- workspace-relative artifact path;
- exact byte size;
- SHA-256 digest;
- render wall time;
- normalized ffprobe metadata for videos.

The tools also provide generic Harness call/result cards, execution/read categories, salient inputs, and file locations for clients that support tool presentation intents.

## Local integration proof

The full command mounts the real Harness tool registry and subprocess runtime, lists compositions, renders a still and video, and validates the final metadata:

```bash
DEEPSEEK_HARNESS_CHECKOUT=/path/to/deepseek-harness \
REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-or-chromium \
npm run test:e2e
```

When a browser cannot launch in the current sandbox, the narrower proof still mounts the real services and probes the checked-in real Remotion render:

```bash
npm run test:e2e -- --probe-only
```

The probe-only result is not equivalent to the full still/video tool render and must be reported as such.
