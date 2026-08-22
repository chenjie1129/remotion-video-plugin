import type { Context } from '@deepseek-ai/cordis'

export interface ToolExecutionContext {
  signal: AbortSignal
  agent?: {
    session: {
      header: {
        cwd: string
      }
    }
  }
}

interface CollectedRead {
  text: string
  lossy: boolean
}

interface CollectedReader {
  readFrom(offset: number): CollectedRead
}

interface SubprocessHandle {
  done: Promise<{ exitCode: number | null; signal: NodeJS.Signals | null }>
  collected: {
    stdout?: CollectedReader
    stderr?: CollectedReader
  }
}

export interface SubprocessSpawnSpec {
  argv: readonly string[]
  cwd: string
  stdio: {
    stdin: 'ignore'
    stdout: { maxBytes: number }
    stderr: { maxBytes: number }
  }
  graceMs: number
  signal?: AbortSignal
  env?: NodeJS.ProcessEnv
}

interface SubprocessRuntime {
  resolveExecutable(command: string, env?: Readonly<Record<string, string>>, signal?: AbortSignal): Promise<string>
  spawn(spec: SubprocessSpawnSpec): SubprocessHandle
}

interface ToolResult {
  content: unknown[]
  isError: boolean
  meta?: unknown
}

interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
  output: {
    schema: unknown
    render(args: unknown, value: unknown): unknown[]
    presentationMeta?(args: unknown, value: unknown): unknown
  }
  execute(args: unknown, exec: ToolExecutionContext): Promise<unknown>
  timeoutMs?: number
  presentCall?(args: unknown): unknown
  presentResult?(args: unknown, result: ToolResult): unknown
}

interface ToolRegistry {
  register(definition: ToolDefinition): () => void
}

export type HarnessContext = Context & {
  tools: ToolRegistry
  subprocess: SubprocessRuntime
}

interface ToolOptions<Value> {
  name: string
  description: string
  parameters: Record<string, unknown>
  output: {
    schema: unknown
    render(args: Record<string, unknown>, value: Value): unknown[]
    presentationMeta?(args: Record<string, unknown>, value: Value): unknown
  }
  execute(args: Record<string, unknown>, exec: ToolExecutionContext): Promise<Value>
  timeoutMs?: number
  presentCall?(args: Record<string, unknown>): unknown
  presentResult?(args: Record<string, unknown>, result: ToolResult): unknown
}

function argumentRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('tool arguments must be a JSON object')
  }
  return value as Record<string, unknown>
}

function schemaRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`${label} must be an object`)
  return value as Record<string, unknown>
}

/** Convert the Harness author DSL's per-property `required: true` into raw JSON Schema arrays. */
function rawSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(rawSchema)
  if (typeof value !== 'object' || value === null) return value
  const source = value as Record<string, unknown>
  const result: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(source)) {
    if (key === 'required') continue
    if (key === 'properties') {
      const properties = schemaRecord(child, 'schema properties')
      const converted: Record<string, unknown> = {}
      const required: string[] = []
      for (const [propertyName, propertySchema] of Object.entries(properties)) {
        const record = schemaRecord(propertySchema, `schema property ${propertyName}`)
        if (record.required === true) required.push(propertyName)
        converted[propertyName] = rawSchema(record)
      }
      result.properties = converted
      if (required.length > 0) result.required = required
      continue
    }
    result[key] = rawSchema(child)
  }
  return result
}

/**
 * Define the public Harness ToolDefinition shape without loading another copy
 * of the host registry package. Raw tool definitions validate their own input;
 * this wrapper enforces the root object and each tool validates its fields.
 */
export function defineRemotionTool<Value>(options: ToolOptions<Value>): ToolDefinition {
  return {
    ...options,
    parameters: rawSchema({ type: 'object', properties: options.parameters }) as Record<string, unknown>,
    output: {
      schema: rawSchema(options.output.schema),
      render: (args, value) => options.output.render(argumentRecord(args), value as Value),
      ...options.output.presentationMeta === undefined ? {} : {
        presentationMeta: (args: unknown, value: unknown) => options.output.presentationMeta?.(argumentRecord(args), value as Value),
      },
    },
    execute: (args, exec) => options.execute(argumentRecord(args), exec),
    ...options.presentCall === undefined ? {} : {
      presentCall: (args: unknown) => options.presentCall?.(argumentRecord(args)),
    },
    ...options.presentResult === undefined ? {} : {
      presentResult: (args: unknown, result: ToolResult) => options.presentResult?.(argumentRecord(args), result),
    },
  }
}
