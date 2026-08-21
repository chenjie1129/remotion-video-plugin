/**
 * Remotion Video Plugin for DeepSeek Harness.
 *
 * @module @chenjie1129/dsh-remotion-video-plugin
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import type { SkillCandidate, SkillDefinition, SkillProvider } from '@deepseek-ai/dsh-skill'

const PROVIDER_NAME = 'remotion-video-plugin'
const SKILL_NAME = 'remotion-video'
// Matches the public Harness packaged-skill rank without loading a second
// copy of the host registry package at runtime.
const PACKAGED_SKILL_RANK = 600
const SKILL_BODY_URL = new URL('../assets/remotion-video.md', import.meta.url)
const RESOURCE_BASE = {
  kind: 'directory',
  path: fileURLToPath(new URL('../assets/', import.meta.url)),
} as const
const INVOCATION = { modelInvocable: true, userInvocable: true } as const
const DESCRIPTION = 'Create, preview, and render programmatic videos with Remotion. Use for video compositions, motion graphics, animated slideshows, captions, and data-driven video projects.'

const CANDIDATE: SkillCandidate = {
  name: SKILL_NAME,
  description: DESCRIPTION,
  invocation: INVOCATION,
  provider: PROVIDER_NAME,
  source: 'custom',
  resourceBase: RESOURCE_BASE,
  rank: PACKAGED_SKILL_RANK,
  locator: SKILL_BODY_URL,
}

const provider: SkillProvider = {
  name: PROVIDER_NAME,
  list: () => Promise.resolve([CANDIDATE]),
  async get(_candidate): Promise<SkillDefinition> {
    return {
      name: CANDIDATE.name,
      description: CANDIDATE.description,
      invocation: CANDIDATE.invocation,
      provider: CANDIDATE.provider,
      source: CANDIDATE.source,
      resourceBase: RESOURCE_BASE,
      content: await readFile(SKILL_BODY_URL, 'utf8'),
    }
  },
}

/** Cordis plugin name used in Loader diagnostics. */
export const name = 'remotion-video-plugin'

/** The Harness skill registry must be available before this plugin mounts. */
export const inject = ['skills']

/** Register the packaged Remotion skill provider. */
export function apply(ctx: Context): void {
  ctx.skills.registerProvider(() => provider)
}
