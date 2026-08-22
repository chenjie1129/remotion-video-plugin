import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { describe, expect, it } from 'vitest'
import * as RemotionVideoPlugin from '../src/index.js'

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
})
