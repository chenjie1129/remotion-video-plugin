# Compositions and parameterization

Register each output through `<Composition>`. Use stable, descriptive IDs and explicit `width`, `height`, `fps`, and `durationInFrames`.

```tsx
<Composition
  id="ProductLaunch"
  component={ProductLaunch}
  width={1920}
  height={1080}
  fps={30}
  durationInFrames={360}
  schema={productLaunchSchema}
  defaultProps={productLaunchDefaults}
/>
```

Use a schema, normally Zod, for public input props. Keep defaults renderable without network access. Separate validated content data from reusable presentation components.

Use `calculateMetadata` when props determine dimensions, duration, or resolved data. Forward its `abortSignal` to network requests and return resolved props instead of refetching independently in every frame.

For several formats, register separate compositions that reuse the same scenes rather than placing aspect-ratio conditionals throughout the component tree. Use `<Still>` for poster and thumbnail outputs.

Before changing an existing composition, inspect its registration, default props, data contract, and downstream render commands. Do not rename a public composition ID unless the user requested a breaking change.
