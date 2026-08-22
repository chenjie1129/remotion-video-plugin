import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { describe, expect, it } from 'vitest'
import * as RemotionVideoPlugin from '../src/index.js'
import { apply as applyRemotionTools } from '../src/tools-plugin.js'

interface CapturedTool {
  name: string
  parameters: Record<string, unknown>
  output: {
    schema: unknown
    render(args: unknown, value: unknown): unknown[]
    presentationMeta?(args: unknown, value: unknown): unknown
  }
  execute(args: unknown, exec: { signal: AbortSignal }): Promise<unknown>
  presentCall?(args: unknown): unknown
  presentResult?(args: unknown, result: { content: unknown[]; isError: boolean; meta?: unknown }): unknown
}

function toolHarness(stdout = ''): {
  context: Context
  tools: CapturedTool[]
  spawns: Array<{ argv: readonly string[]; cwd: string; env?: NodeJS.ProcessEnv }>
} {
  const tools: CapturedTool[] = []
  const spawns: Array<{ argv: readonly string[]; cwd: string; env?: NodeJS.ProcessEnv }> = []
  const reader = (text: string) => ({ readFrom: () => ({ text, lossy: false }) })
  const context = {
    tools: {
      register(tool: CapturedTool) {
        tools.push(tool)
        return () => undefined
      },
    },
    subprocess: {
      resolveExecutable: (command: string) => Promise.resolve(command),
      spawn(spec: { argv: readonly string[]; cwd: string; env?: NodeJS.ProcessEnv }) {
        spawns.push(spec)
        return {
          done: Promise.resolve({ exitCode: 0, signal: null }),
          collected: { stdout: reader(stdout), stderr: reader('') },
        }
      },
    },
  } as unknown as Context
  return { context, tools, spawns }
}

function findTool(tools: CapturedTool[], name: string): CapturedTool {
  const tool = tools.find(candidate => candidate.name === name)
  if (!tool) throw new Error(`missing captured tool ${name}`)
  return tool
}

describe('Remotion Video Plugin', () => {
  it('registers, loads, and disposes the remotion-video skill', async () => {
    const ctx = new Context()
    await ctx.plugin(SkillRegistry)
    const fiber = await ctx.plugin(RemotionVideoPlugin)
    const resourcePath = fileURLToPath(new URL('../assets/', import.meta.url))

    expect(await ctx.skills.list()).toEqual([{
      name: 'remotion-video',
      description: 'Create, preview, and render programmatic videos with Remotion. Use for video compositions, motion graphics, animated slideshows, captions, and data-driven video projects.',
      invocation: { modelInvocable: true, userInvocable: true },
      provider: 'remotion-video-plugin',
      source: 'custom',
      resourceBase: { kind: 'directory', path: resourcePath },
    }])

    const loaded = await ctx.skills.get('remotion-video')
    expect(loaded?.content).toContain('useCurrentFrame()')
    expect(loaded?.content).toContain('npx remotion render')
    expect(loaded?.content).toContain('Do not use CSS transitions')
    expect(loaded?.content).toContain('rules/rendering.md')
    expect(loaded?.content).toContain('templates/product-launch.md')
    expect(loaded?.resourceBase).toEqual({ kind: 'directory', path: resourcePath })

    await fiber.dispose()
    expect(await ctx.skills.list()).toEqual([])
  })

  it('ships a Harness bundle that mounts the plugin package', async () => {
    const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
      dsh?: { bundle?: { patch?: string } }
    }
    const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')

    expect(manifest.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    expect(patch).toContain("name: '@chenjie1129/dsh-remotion-video-plugin'")
    expect(patch).toContain("name: '@chenjie1129/dsh-remotion-video-plugin/tools'")
  })

  it('ships every routed rule, reusable blueprint, and evaluation case', async () => {
    const skill = await readFile(new URL('../assets/remotion-video.md', import.meta.url), 'utf8')
    const references = [...skill.matchAll(/\]\((rules|templates)\/([^)]+\.md)\)/g)]
      .map(match => `${match[1]}/${match[2]}`)

    expect(references).toHaveLength(11)
    await Promise.all(references.map(async (reference) => {
      const content = await readFile(new URL(`../assets/${reference}`, import.meta.url), 'utf8')
      expect(content.startsWith('# ')).toBe(true)
      expect(content.length).toBeGreaterThan(300)
    }))

    const suite = JSON.parse(await readFile(new URL('../evaluations/cases.json', import.meta.url), 'utf8')) as {
      version: number
      cases: Array<{ id: string; stillFrames: number[] }>
    }
    expect(suite.version).toBe(1)
    expect(suite.cases).toHaveLength(10)
    expect(new Set(suite.cases.map(testCase => testCase.id)).size).toBe(10)
    expect(suite.cases.every(testCase => testCase.stillFrames.length > 0)).toBe(true)
  })

  it('registers five structured Remotion workflow tools and diagnoses the demo', async () => {
    const harness = toolHarness()
    applyRemotionTools(harness.context)

    expect(harness.tools.map(tool => tool.name)).toEqual([
      'remotion_doctor',
      'remotion_list_compositions',
      'remotion_render_still',
      'remotion_render_video',
      'remotion_probe_output',
    ])
    expect(harness.tools.every(tool => typeof tool.output.schema === 'object')).toBe(true)

    const doctor = findTool(harness.tools, 'remotion_doctor')
    const result = await doctor.execute({ project_path: 'demo' }, { signal: new AbortController().signal }) as {
      status: string
      remotionVersion: string
      checks: Array<{ name: string; status: string }>
    }
    expect(result.status).toBe('ready')
    expect(result.remotionVersion).toMatch(/^4\./)
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'local Remotion CLI', status: 'pass' }),
      expect.objectContaining({ name: 'bundled ffprobe', status: 'pass' }),
    ]))
    expect(harness.spawns).toHaveLength(0)
  })

  it('runs composition discovery with a fixed argv array and scrub-safe explicit environment', async () => {
    const harness = toolHarness('DemoPoster RemotionVideoPluginDemo SocialPreview\n')
    applyRemotionTools(harness.context)
    const list = findTool(harness.tools, 'remotion_list_compositions')

    const result = await list.execute({ project_path: 'demo' }, { signal: new AbortController().signal }) as {
      compositions: string[]
    }
    expect(result.compositions).toEqual(['DemoPoster', 'RemotionVideoPluginDemo', 'SocialPreview'])
    expect(harness.spawns).toHaveLength(1)
    expect(harness.spawns[0]?.argv).toEqual(expect.arrayContaining(['compositions', '--quiet']))
    expect(harness.spawns[0]?.env).toEqual({ CI: '1', NO_COLOR: '1' })
    expect(harness.spawns[0]?.argv.some(value => value.includes(';') || value.includes('&&'))).toBe(false)
  })

  it('rejects output traversal and malformed model arguments before spawning', async () => {
    const harness = toolHarness()
    applyRemotionTools(harness.context)
    const still = findTool(harness.tools, 'remotion_render_still')

    await expect(still.execute({
      project_path: 'demo',
      composition_id: 'DemoPoster',
      output_path: '../../../outside.png',
    }, { signal: new AbortController().signal })).rejects.toThrow('escapes the session workspace')
    await expect(still.execute({
      project_path: 'demo',
      composition_id: ['not-a-string'],
      output_path: 'out/frame.png',
    }, { signal: new AbortController().signal })).rejects.toThrow('composition_id must be a string')
    expect(harness.spawns).toHaveLength(0)
  })

  it('presents render calls and verified artifacts without exposing absolute paths', () => {
    const harness = toolHarness()
    applyRemotionTools(harness.context)
    const still = findTool(harness.tools, 'remotion_render_still')
    const video = findTool(harness.tools, 'remotion_render_video')
    const artifact = {
      path: 'demo/out/launch.mp4',
      sizeBytes: 2_148_862,
      sha256: 'a'.repeat(64),
      kind: 'video',
    }

    expect(still.presentCall?.({
      composition_id: 'Launch',
      output_path: 'out/poster.png',
      frame: 90,
    })).toEqual({
      card: 'generic',
      title: 'Render still Launch',
      kind: 'execute',
      rawInput: { frame: 90, output: 'out/poster.png' },
      locations: [{ path: 'out/poster.png' }],
    })
    expect(video.output.presentationMeta?.({}, { artifact })).toEqual({
      path: 'demo/out/launch.mp4',
      kind: 'video',
      sizeBytes: 2_148_862,
    })
    expect(video.presentResult?.({}, {
      content: [],
      isError: false,
      meta: { path: artifact.path, kind: artifact.kind, sizeBytes: artifact.sizeBytes },
    })).toEqual({
      card: 'generic',
      title: 'Rendered video demo/out/launch.mp4',
      content: [{ type: 'text', text: '2148862 bytes; metadata verified' }],
    })
    expect(JSON.stringify(video.presentResult?.({}, {
      content: [],
      isError: false,
      meta: { path: artifact.path, kind: artifact.kind, sizeBytes: artifact.sizeBytes },
    }))).not.toContain(process.cwd())
  })
})
