# Security policy

## Supported versions

Security fixes are applied to the latest release while the plugin remains pre-1.0.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do not open a public issue containing credentials, private media, or exploit details.

## Security model

The package has two independently removable Harness rows:

- the skill row contributes local Remotion guidance and does not execute commands;
- the tools row can inspect a project, invoke its project-local Remotion CLI, write render artifacts, and probe media through Harness's managed subprocess service.

Tool arguments use fixed arrays rather than shell strings. Project, entry-point, input, and output paths are confined to the active session workspace after real-path and symlink checks. Existing artifacts are preserved unless `overwrite: true` is explicit. Output streams and JSON props are bounded, process cancellation is forwarded, and results expose workspace-relative paths, byte sizes, and SHA-256 digests rather than credentials.

Rendering executes the selected Remotion project's JavaScript and dependency code. Only render trusted workspaces. Harness policy and sandboxing remain the final authority; this plugin does not bypass either one.

The plugin itself does not collect telemetry, store credentials, upload media, or call an application service. Remotion or project code may access remote assets, and Remotion may download a supported browser when a trusted `browserExecutable` is not configured. Review those network and data flows before rendering confidential media.

Treat third-party Remotion projects, npm packages, media files, and remote URLs as untrusted input. Review package scripts and licensing before installation or publication, and never commit API keys or private media.
