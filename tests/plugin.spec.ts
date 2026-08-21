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
})
