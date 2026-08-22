# Architecture and behavior

## Integration model

The package has three DeepSeek Harness roles:

1. Its manifest declares a `dsh.bundle.patch`, making it an installable profile bundle.
2. Its Cordis plugin registers one provider with the existing `ctx.skills` service.
3. Its separate tools plugin registers five structured operations with `ctx.tools` and executes through `ctx.subprocess`.

The bundle patch inserts the same package as an ordinary Loader row. Harness mounts that row after the base bundle, so the skill registry already exists when the plugin's `apply()` function runs.

```text
dsh profile
  -> @deepseek-ai/dsh-base
       -> ctx.skills registry
  -> @chenjie1129/dsh-remotion-video-plugin bundle
       -> remotion-video-plugin Loader row
            -> remotion-video provider
                 -> remotion-video skill body
       -> remotion-video-tools Loader row
            -> doctor / compositions / still / video / probe tools
                 -> managed subprocess seam
```

The provider returns immutable catalog metadata and loads `assets/remotion-video.md` only when Harness requests the complete skill. Disposing the Cordis plugin removes the provider registration through the registry lifecycle.

## Capability boundary

The skill row contributes instructions. The tools row contributes a narrow renderer and metadata probe over the public Harness tool and subprocess seams. Consequently:

- filesystem changes stay within the configured Harness filesystem policy;
- package installation still uses the profile's ordinary shell capability;
- rendering uses only a verified project-local Remotion executable and fixed argument arrays;
- project, entry, output, props, frame, scale, codec, and concurrency inputs are bounded before execution;
- output paths stay inside the session workspace and symlink escapes fail closed;
- command output, process lifetime, cancellation, and teardown stay owned by `ctx.subprocess`;
- approval requirements remain owned by the active permission preset;
- model and tool activity remains part of the ordinary Harness session record;
- Remotion and media licensing remain deployment and user responsibilities.

The plugin does not introduce credentials, an independent network client, persistence, telemetry, a model provider, or a UI package. Remotion itself may access project-declared remote assets or download its supported browser when the deployment has not configured one; those effects remain visible project/runtime responsibilities.

## Skill precedence

The packaged candidate uses rank `600`, matching Harness's public bundled-skill rank. Project, custom filesystem, and user skill roots can override it according to the Harness registry's lower-rank-wins policy. This lets a project replace the general instructions with a repository-specific `remotion-video` skill without forking the plugin. The numeric value avoids loading a second copy of the host skill-registry package solely to read a constant.

## Compatibility

The runtime uses only the public Cordis `Context` type and public `@deepseek-ai/dsh-skill` provider types; both imports are erased by TypeScript. They remain optional peers to document the host APIs expected by the plugin without asking pnpm to install duplicate Harness internals into a profile. The skill API range is intentionally limited to the currently tested pre-`0.2` Harness API because DeepSeek Harness is still a developer preview.
