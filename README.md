# Remotion Video Plugin for DeepSeek Harness

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/ci.yml)
[![Integration](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/integration.yml/badge.svg)](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/integration.yml)
[![npm](https://img.shields.io/npm/v/@chenjie1129/dsh-remotion-video-plugin.svg)](https://www.npmjs.com/package/@chenjie1129/dsh-remotion-video-plugin)
[![License: MIT](https://img.shields.io/badge/license-MIT-53d7ff.svg)](LICENSE)

Give DeepSeek Harness a structured Remotion workflow and five workspace-confined tools for diagnosing projects, discovering compositions, rendering stills and videos, and verifying output metadata.

[![12-second Remotion Video Plugin demo](.github/assets/remotion-video-plugin-demo.gif)](.github/assets/remotion-video-plugin-demo.mp4)

**[Watch the 12-second MP4](.github/assets/remotion-video-plugin-demo.mp4)** · [Reproduce the proof](docs/DEMO.md)

## Install

After `0.4.0` is published to npm, install the immutable version into the DeepSeek Harness Web profile:

```bash
dsh plugin --profile web add @chenjie1129/dsh-remotion-video-plugin@0.4.0
dsh web
```

Until npm publication is verified, use the pinned GitHub release tag:

```bash
dsh plugin --profile web add github:chenjie1129/remotion-video-plugin#v0.4.0
dsh web
```

Start a standard-agent session and ask:

> Create a 15-second 16:9 product-launch video. Diagnose the project, use frame-driven animation, render a representative still, then render and verify the MP4.

## What version 0.4 includes

- A user- and model-invocable `remotion-video` skill with eight focused rule modules.
- Product-launch, vertical-captioned, and data-story blueprints.
- Ten bilingual model-to-render evaluation cases.
- Five tools registered through the real Harness tool and managed-subprocess seams.
- Artifact cards with workspace-relative paths, byte sizes, SHA-256 digests, and normalized media facts.
- Node 22/24 checks, real Harness/Remotion integration CI, and npm trusted-publishing automation.

| Tool | Purpose | Writes files |
| --- | --- | --- |
| `remotion_doctor` | Diagnose package, entry point, CLI, ffprobe, and browser readiness | No |
| `remotion_list_compositions` | Return registered composition IDs | No |
| `remotion_render_still` | Render a PNG or JPEG frame | Yes |
| `remotion_render_video` | Render and metadata-probe a video | Yes |
| `remotion_probe_output` | Return normalized media metadata | No |

The skill and executable tools are separate Cordis rows, so an operator can disable either capability without editing the other.

## Proof and release status

The repository includes three distinct evidence levels:

| Evidence | What it proves | Current record |
| --- | --- | --- |
| Unit and contract checks | Skill lifecycle, bundle rows, routed resources, eval cases, tool schemas, argv safety, path rejection, artifact presentation | [Test source](tests/plugin.spec.ts) |
| Real Harness probe | Tool registry mount, managed subprocess execution, project doctor, bundled ffprobe, and checked-in MP4 metadata | [Smoke results](docs/SMOKE_TEST_RESULTS.md) |
| Browser-backed integration | Composition discovery plus a fresh still and video rendered through all five tools | [Integration workflow](.github/workflows/integration.yml) |

The checked-in demo is a real H.264 render at 1280×720, 30 fps, and about 12 seconds. A release is not declared fully proven until the browser-backed integration workflow passes for the release commit. Probe-only success is deliberately not presented as a render-tool pass.

## Requirements and safety boundary

- Node.js `^22.19.0` or `>=24.0.0`.
- DeepSeek Harness host packages before `0.2.0`: `dsh-skill`, `dsh-tools`, and `dsh-subprocess`.
- A trusted Remotion project with its own project-local Remotion dependencies.
- Chrome/Chromium configured by the operator, or Remotion's supported browser acquisition.

Rendering executes the selected project's JavaScript and installed dependencies. Tool paths are confined to the active session workspace, commands use fixed argument arrays, output replacement is opt-in, process output and props are bounded, and cancellation reaches the managed process tree. The plugin itself collects no telemetry, stores no credentials, and uploads no media; project code, remote assets, or Remotion browser acquisition may still use the network. See [Security](SECURITY.md) and [Tool contract](docs/TOOLS.md).

## Verify, configure, or remove

Inspect the composed profile:

```bash
dsh --profile web --dump-config
```

It should contain both `remotion-video-plugin` and `remotion-video-tools`. A trusted browser can be configured on the tools row:

```yaml
- id: remotion-video-tools
  name: '@chenjie1129/dsh-remotion-video-plugin/tools'
  config:
    browserExecutable: /absolute/path/to/chrome-or-chromium
    browserMode: chrome-for-testing
```

Remove both rows by uninstalling the bundle, then restart Harness:

```bash
dsh plugin --profile web remove @chenjie1129/dsh-remotion-video-plugin
```

## Development and release

```bash
npm ci
npm run check
npm run release:verify
npm run test:e2e -- --probe-only
```

Rendering changes must also pass the full `npm run test:e2e` command with a real Harness checkout and approved browser. See [Compatibility](docs/COMPATIBILITY.md), [Smoke test](docs/SMOKE_TEST.md), [Release procedure](docs/RELEASING.md), [Contributing](CONTRIBUTING.md), and [Changelog](CHANGELOG.md).

## Project status and license

This is an independent community plugin, not an official DeepSeek or Remotion project. The plugin is MIT licensed. Remotion has separate license terms; users are responsible for checking them for their team and usage model.
