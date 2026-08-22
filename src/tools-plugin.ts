/**
 * Workspace-confined Remotion execution tools for DeepSeek Harness.
 *
 * @module @chenjie1129/dsh-remotion-video-plugin/tools
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineRemotionTool, type HarnessContext } from './host-contracts.js'
import {
  browserArguments,
  inspectArtifact,
  inspectProject,
  normalizeToolsConfig,
  parseCompositionIds,
  prepareOutput,
  probeMedia,
  propsArgument,
  requireCompositionId,
  resolveEntryPoint,
  runManaged,
  type Artifact,
  type MediaProbe,
  type ToolsConfig,
} from './remotion-runtime.js'

export type { ToolsConfig } from './remotion-runtime.js'

export const name = 'remotion-video-tools'
export const inject = ['tools', 'subprocess']

const nullableInteger = { oneOf: [{ type: 'integer' }, { type: 'null' }] } as const
const nullableNumber = { oneOf: [{ type: 'number' }, { type: 'null' }] } as const

const artifactSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    path: { type: 'string', required: true },
    sizeBytes: { type: 'integer', required: true },
    sha256: { type: 'string', required: true },
    kind: { type: 'string', required: true, enum: ['image', 'video'] },
  },
} as const

const probeSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    path: { type: 'string', required: true },
    format: { type: 'string', required: true },
    durationSeconds: { type: 'number', required: true },
    sizeBytes: { type: 'integer', required: true },
    streams: {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          type: { type: 'string', required: true },
          codec: { type: 'string', required: true },
          width: { ...nullableInteger, required: true },
          height: { ...nullableInteger, required: true },
          fps: { ...nullableNumber, required: true },
          sampleRate: { ...nullableInteger, required: true },
          channels: { ...nullableInteger, required: true },
        },
      },
    },
  },
} as const

interface DoctorCheck {
  name: string
  status: 'pass' | 'warn' | 'fail'
  detail: string
}

interface DoctorResult {
  status: 'ready' | 'needs-setup'
  projectPath: string
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown'
  packageName: string | null
  remotionVersion: string | null
  entryPoint: string | null
  checks: DoctorCheck[]
}

interface CompositionsResult {
  projectPath: string
  entryPoint: string
  compositions: string[]
  durationMs: number
}

interface StillResult {
  compositionId: string
  frame: number
  durationMs: number
  artifact: Artifact
}

interface VideoResult {
  compositionId: string
  codec: 'h264' | 'vp9' | 'prores' | 'gif'
  durationMs: number
  artifact: Artifact
  probe: MediaProbe
}

function artifactText(artifact: { path: string; sizeBytes: number; sha256: string }): string {
  return `${artifact.path} (${artifact.sizeBytes} bytes, sha256 ${artifact.sha256})`
}

function artifactMeta(value: unknown): { path: string; kind: string; sizeBytes: number } | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  return typeof record.path === 'string' && typeof record.kind === 'string' && typeof record.sizeBytes === 'number'
    ? { path: record.path, kind: record.kind, sizeBytes: record.sizeBytes }
    : undefined
}

function projectPathParameter(): { type: 'string'; description: string } {
  return { type: 'string', description: 'Remotion project directory relative to the session workspace. Defaults to the workspace root.' }
}

function entryPointParameter(): { type: 'string'; description: string } {
  return { type: 'string', description: 'Entry point relative to the project. Defaults to a conventional src/index file.' }
}

function propsParameter(): { type: 'string'; description: string } {
  return { type: 'string', description: 'Optional composition props encoded as one JSON object. Size is bounded by plugin configuration.' }
}

function optionalString(args: Record<string, unknown>, name: string): string | undefined {
  const value = args[name]
  if (value === undefined) return undefined
  if (typeof value !== 'string') throw new Error(`${name} must be a string`)
  return value
}

function requiredString(args: Record<string, unknown>, name: string): string {
  const value = optionalString(args, name)
  if (value === undefined || value.length === 0) throw new Error(`${name} is required`)
  return value
}

function optionalInteger(args: Record<string, unknown>, name: string): number | undefined {
  const value = args[name]
  if (value === undefined) return undefined
  if (!Number.isInteger(value)) throw new Error(`${name} must be an integer`)
  return value as number
}

function optionalNumber(args: Record<string, unknown>, name: string): number | undefined {
  const value = args[name]
  if (value === undefined) return undefined
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${name} must be a finite number`)
  return value
}

function optionalBoolean(args: Record<string, unknown>, name: string): boolean | undefined {
  const value = args[name]
  if (value === undefined) return undefined
  if (typeof value !== 'boolean') throw new Error(`${name} must be a boolean`)
  return value
}

function displayArg(args: Record<string, unknown>, name: string, fallback: string): string {
  return typeof args[name] === 'string' ? args[name] : fallback
}

/** Register the five safe Remotion workflow tools. */
export function apply(baseCtx: Context, rawConfig: ToolsConfig = {}): void {
  const ctx = baseCtx as HarnessContext
  const config = normalizeToolsConfig(rawConfig)

  ctx.tools.register(defineRemotionTool<DoctorResult>({
    name: 'remotion_doctor',
    description: 'Inspect a Remotion project without changing it. Reports package manager, versions, entry point, local CLI, bundled ffprobe, browser configuration, and whether rendering tools are ready.',
    parameters: { project_path: projectPathParameter(), entry_point: entryPointParameter() },
    timeoutMs: 30_000,
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', required: true, enum: ['ready', 'needs-setup'] },
          projectPath: { type: 'string', required: true },
          packageManager: { type: 'string', required: true, enum: ['npm', 'pnpm', 'yarn', 'bun', 'unknown'] },
          packageName: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          remotionVersion: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          entryPoint: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          checks: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string', required: true },
                status: { type: 'string', required: true, enum: ['pass', 'warn', 'fail'] },
                detail: { type: 'string', required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: `${value.status === 'ready' ? 'Remotion project is ready.' : 'Remotion project needs setup.'}\n${value.checks.map(check => `- ${check.status}: ${check.name} — ${check.detail}`).join('\n')}`,
      }],
    },
    async execute(args, exec) {
      const project = await inspectProject(exec, optionalString(args, 'project_path'))
      const requestedEntry = optionalString(args, 'entry_point')
      const checks: DoctorCheck[] = []
      const packageName = typeof project.packageJson?.name === 'string' ? project.packageJson.name : null
      checks.push(project.packageJson === undefined
        ? { name: 'package.json', status: 'fail', detail: 'No readable package.json was found.' }
        : { name: 'package.json', status: 'pass', detail: packageName ?? 'Package manifest is readable.' })
      checks.push(project.remotionVersion === undefined
        ? { name: 'remotion dependency', status: 'fail', detail: 'The package does not declare remotion.' }
        : { name: 'remotion dependency', status: 'pass', detail: project.remotionVersion })
      checks.push(project.remotionBin === undefined
        ? { name: 'local Remotion CLI', status: 'fail', detail: 'node_modules/.bin/remotion is missing; install project dependencies.' }
        : { name: 'local Remotion CLI', status: 'pass', detail: 'A project-local executable is available.' })
      let entryPoint: string | null = null
      try {
        entryPoint = (await resolveEntryPoint(project, requestedEntry)).relative
        checks.push({ name: 'entry point', status: 'pass', detail: entryPoint })
      } catch (error: unknown) {
        checks.push({ name: 'entry point', status: 'fail', detail: error instanceof Error ? error.message : String(error) })
      }
      checks.push(project.ffprobeBin === undefined
        ? { name: 'bundled ffprobe', status: 'fail', detail: 'No Remotion compositor ffprobe binary was found.' }
        : { name: 'bundled ffprobe', status: 'pass', detail: 'Media metadata probing is available.' })
      if (config.browserExecutable === undefined) {
        checks.push({ name: 'browser', status: 'warn', detail: 'No trusted browserExecutable is configured; Remotion may download its supported browser.' })
      } else {
        try {
          await ctx.subprocess.resolveExecutable(config.browserExecutable, undefined, exec.signal)
          checks.push({ name: 'browser', status: 'pass', detail: 'The configured browser executable is available.' })
        } catch (error: unknown) {
          checks.push({ name: 'browser', status: 'fail', detail: error instanceof Error ? error.message : String(error) })
        }
      }
      return {
        status: checks.some(check => check.status === 'fail') ? 'needs-setup' as const : 'ready' as const,
        projectPath: project.projectPath,
        packageManager: project.packageManager,
        packageName,
        remotionVersion: project.remotionVersion ?? null,
        entryPoint,
        checks,
      }
    },
    presentCall: args => ({ card: 'generic', title: 'Check Remotion project', kind: 'read', rawInput: displayArg(args, 'project_path', '.') }),
  }))

  ctx.tools.register(defineRemotionTool<CompositionsResult>({
    name: 'remotion_list_compositions',
    description: 'Run the project-local Remotion CLI through the managed Harness subprocess service and return the registered composition IDs.',
    parameters: {
      project_path: projectPathParameter(),
      entry_point: entryPointParameter(),
      props_json: propsParameter(),
    },
    timeoutMs: 180_000,
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          projectPath: { type: 'string', required: true },
          entryPoint: { type: 'string', required: true },
          compositions: { type: 'array', required: true, items: { type: 'string' } },
          durationMs: { type: 'integer', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Compositions: ${value.compositions.join(', ')}` }],
    },
    async execute(args, exec) {
      const project = await inspectProject(exec, optionalString(args, 'project_path'))
      if (project.remotionBin === undefined) throw new Error('local Remotion CLI is missing; run remotion_doctor')
      const entry = await resolveEntryPoint(project, optionalString(args, 'entry_point'))
      const run = await runManaged(ctx, exec, config, project.project, [
        project.remotionBin,
        'compositions',
        entry.absolute,
        '--quiet',
        ...propsArgument(optionalString(args, 'props_json'), config.maxPropsBytes),
        ...await browserArguments(ctx, exec, config),
      ])
      return {
        projectPath: project.projectPath,
        entryPoint: entry.relative,
        compositions: parseCompositionIds(run.stdout),
        durationMs: run.durationMs,
      }
    },
    presentCall: args => ({ card: 'generic', title: 'List Remotion compositions', kind: 'read', rawInput: displayArg(args, 'project_path', '.') }),
  }))

  ctx.tools.register(defineRemotionTool<StillResult>({
    name: 'remotion_render_still',
    description: 'Render one PNG or JPEG frame with the project-local Remotion CLI. Output must stay in the session workspace; replacement is opt-in.',
    parameters: {
      project_path: projectPathParameter(),
      entry_point: entryPointParameter(),
      composition_id: { type: 'string', required: true, description: 'Exact registered composition ID.' },
      output_path: { type: 'string', required: true, description: 'PNG or JPEG path relative to the Remotion project.' },
      frame: { type: 'integer', description: 'Zero-based frame number. Defaults to 0.' },
      scale: { type: 'number', description: 'Render scale from 0.1 through 2. Defaults to 1.' },
      props_json: propsParameter(),
      overwrite: { type: 'boolean', description: 'Allow replacement of an existing regular file. Defaults to false.' },
    },
    timeoutMs: 300_000,
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          compositionId: { type: 'string', required: true },
          frame: { type: 'integer', required: true },
          durationMs: { type: 'integer', required: true },
          artifact: { ...artifactSchema, required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Rendered still: ${artifactText(value.artifact)}` }],
      presentationMeta: (_args, value) => ({ path: value.artifact.path, kind: value.artifact.kind, sizeBytes: value.artifact.sizeBytes }),
    },
    async execute(args, exec) {
      const project = await inspectProject(exec, optionalString(args, 'project_path'))
      if (project.remotionBin === undefined) throw new Error('local Remotion CLI is missing; run remotion_doctor')
      const entry = await resolveEntryPoint(project, optionalString(args, 'entry_point'))
      const compositionId = requireCompositionId(requiredString(args, 'composition_id'))
      const frame = optionalInteger(args, 'frame') ?? 0
      if (!Number.isInteger(frame) || frame < 0 || frame > 10_000_000) throw new Error('frame must be an integer between 0 and 10000000')
      const scale = optionalNumber(args, 'scale') ?? 1
      if (!Number.isFinite(scale) || scale < 0.1 || scale > 2) throw new Error('scale must be between 0.1 and 2')
      const outputPath = requiredString(args, 'output_path')
      const overwrite = optionalBoolean(args, 'overwrite') ?? false
      const output = await prepareOutput(project, outputPath, ['.png', '.jpg', '.jpeg'], overwrite)
      const run = await runManaged(ctx, exec, config, project.project, [
        project.remotionBin,
        'still',
        entry.absolute,
        compositionId,
        output.absolute,
        `--frame=${frame}`,
        `--scale=${scale}`,
        '--quiet',
        ...overwrite ? ['--overwrite'] : [],
        ...propsArgument(optionalString(args, 'props_json'), config.maxPropsBytes),
        ...await browserArguments(ctx, exec, config),
      ])
      return {
        compositionId,
        frame,
        durationMs: run.durationMs,
        artifact: await inspectArtifact(project, output.absolute, 'image'),
      }
    },
    presentCall: args => ({
      card: 'generic',
      title: `Render still ${displayArg(args, 'composition_id', '(unknown)')}`,
      kind: 'execute',
      rawInput: { frame: typeof args.frame === 'number' ? args.frame : 0, output: displayArg(args, 'output_path', '(unset)') },
      locations: [{ path: displayArg(args, 'output_path', '(unset)') }],
    }),
    presentResult: (_args, result) => {
      const artifact = artifactMeta(result.meta)
      return artifact === undefined || result.isError
        ? undefined
        : { card: 'generic', title: `Rendered still ${artifact.path}`, content: [{ type: 'text', text: `${artifact.sizeBytes} bytes` }] }
    },
  }))

  ctx.tools.register(defineRemotionTool<VideoResult>({
    name: 'remotion_render_video',
    description: 'Render and metadata-probe a video with the project-local Remotion CLI. Uses fixed codec arguments, bounded concurrency, workspace-confined output, and opt-in replacement.',
    parameters: {
      project_path: projectPathParameter(),
      entry_point: entryPointParameter(),
      composition_id: { type: 'string', required: true, description: 'Exact registered composition ID.' },
      output_path: { type: 'string', required: true, description: 'Output path relative to the Remotion project; extension must match the codec.' },
      codec: { type: 'string', enum: ['h264', 'vp9', 'prores', 'gif'], description: 'Video codec. Defaults to h264.' },
      concurrency: { type: 'integer', description: 'Renderer concurrency from 1 through 16. Defaults to 2.' },
      props_json: propsParameter(),
      overwrite: { type: 'boolean', description: 'Allow replacement of an existing regular file. Defaults to false.' },
    },
    timeoutMs: 900_000,
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          compositionId: { type: 'string', required: true },
          codec: { type: 'string', required: true, enum: ['h264', 'vp9', 'prores', 'gif'] },
          durationMs: { type: 'integer', required: true },
          artifact: { ...artifactSchema, required: true },
          probe: { ...probeSchema, required: true },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: `Rendered and verified video: ${artifactText(value.artifact)}\nFormat: ${value.probe.format}; duration: ${value.probe.durationSeconds}s; streams: ${value.probe.streams.map(stream => `${stream.type}/${stream.codec}`).join(', ')}`,
      }],
      presentationMeta: (_args, value) => ({ path: value.artifact.path, kind: value.artifact.kind, sizeBytes: value.artifact.sizeBytes }),
    },
    async execute(args, exec) {
      const project = await inspectProject(exec, optionalString(args, 'project_path'))
      if (project.remotionBin === undefined) throw new Error('local Remotion CLI is missing; run remotion_doctor')
      const entry = await resolveEntryPoint(project, optionalString(args, 'entry_point'))
      const compositionId = requireCompositionId(requiredString(args, 'composition_id'))
      const requestedCodec = optionalString(args, 'codec') ?? 'h264'
      if (!['h264', 'vp9', 'prores', 'gif'].includes(requestedCodec)) throw new Error('codec must be h264, vp9, prores, or gif')
      const codec = requestedCodec as 'h264' | 'vp9' | 'prores' | 'gif'
      const extensions = { h264: ['.mp4'], vp9: ['.webm'], prores: ['.mov'], gif: ['.gif'] } as const
      const concurrency = optionalInteger(args, 'concurrency') ?? 2
      if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) throw new Error('concurrency must be an integer between 1 and 16')
      const outputPath = requiredString(args, 'output_path')
      const overwrite = optionalBoolean(args, 'overwrite') ?? false
      const output = await prepareOutput(project, outputPath, extensions[codec], overwrite)
      const run = await runManaged(ctx, exec, config, project.project, [
        project.remotionBin,
        'render',
        entry.absolute,
        compositionId,
        output.absolute,
        `--codec=${codec}`,
        `--concurrency=${concurrency}`,
        '--quiet',
        ...overwrite ? ['--overwrite'] : [],
        ...propsArgument(optionalString(args, 'props_json'), config.maxPropsBytes),
        ...await browserArguments(ctx, exec, config),
      ])
      const artifact = await inspectArtifact(project, output.absolute, 'video')
      return {
        compositionId,
        codec,
        durationMs: run.durationMs,
        artifact,
        probe: await probeMedia(ctx, exec, config, project, artifact.path),
      }
    },
    presentCall: args => ({
      card: 'generic',
      title: `Render video ${displayArg(args, 'composition_id', '(unknown)')}`,
      kind: 'execute',
      rawInput: { codec: displayArg(args, 'codec', 'h264'), output: displayArg(args, 'output_path', '(unset)') },
      locations: [{ path: displayArg(args, 'output_path', '(unset)') }],
    }),
    presentResult: (_args, result) => {
      const artifact = artifactMeta(result.meta)
      return artifact === undefined || result.isError
        ? undefined
        : { card: 'generic', title: `Rendered video ${artifact.path}`, content: [{ type: 'text', text: `${artifact.sizeBytes} bytes; metadata verified` }] }
    },
  }))

  ctx.tools.register(defineRemotionTool<MediaProbe>({
    name: 'remotion_probe_output',
    description: 'Probe a workspace media file with the Remotion project\'s bundled ffprobe and return normalized duration, format, dimensions, frame rate, codecs, and audio facts.',
    parameters: {
      project_path: projectPathParameter(),
      input_path: { type: 'string', required: true, description: 'Existing media file relative to the session workspace.' },
    },
    timeoutMs: 30_000,
    output: {
      schema: probeSchema,
      render: (_args, value) => [{
        type: 'text',
        text: `${value.path}: ${value.format}, ${value.durationSeconds}s, ${value.sizeBytes} bytes\n${value.streams.map(stream => `${stream.type}: ${stream.codec}${stream.width === null ? '' : ` ${stream.width}x${stream.height}`}${stream.fps === null ? '' : ` ${stream.fps} fps`}`).join('\n')}`,
      }],
    },
    async execute(args, exec) {
      const project = await inspectProject(exec, optionalString(args, 'project_path'))
      return probeMedia(ctx, exec, config, project, requiredString(args, 'input_path'))
    },
    presentCall: args => {
      const path = displayArg(args, 'input_path', '(unset)')
      return { card: 'generic', title: `Probe media ${path}`, kind: 'read', rawInput: path, locations: [{ path }] }
    },
    presentResult: (_args, result) => result.isError ? undefined : { card: 'generic', title: 'Verified media metadata' },
  }))
}
