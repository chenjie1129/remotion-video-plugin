# Security policy

## Supported versions

Security fixes are applied to the latest release while the plugin remains pre-1.0.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do not open a public issue containing credentials, private media, or exploit details.

## Security model

The plugin only contributes a local skill body to DeepSeek Harness. It does not execute commands, persist data, or communicate with a service by itself. Actions suggested by the skill are still performed through the active Harness tools, sandbox, filesystem policy, and approval configuration.

Treat third-party Remotion projects, npm packages, media files, and remote URLs as untrusted input. Review package scripts and licensing before installation or publication, and never commit API keys or private media.
