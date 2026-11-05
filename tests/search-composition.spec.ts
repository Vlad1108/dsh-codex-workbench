import { readFile } from 'node:fs/promises'
import { applyEntryPatches, type PatchOptions } from '@deepseek-ai/cordis-plugin-include'
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import { load } from 'js-yaml'
import { describe, expect, it, vi } from 'vitest'

const base: EntryOptions[] = [
  { id: 'web', name: '@deepseek-ai/dsh-web', config: { searchProvider: 'deepseek-official', fetchProvider: 'http' } },
  { id: 'unrelated', name: 'unrelated', config: { enabled: true } },
]
const warn = vi.fn()
const bundle = load(await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')) as PatchOptions[]

describe('search provider composition', () => {
  it('selects Codex search on installation without changing other entries', () => {
    const entries = applyEntryPatches(base, bundle, warn)
    expect(entries.find(entry => entry.id === 'web')?.config).toEqual({ searchProvider: 'openai-codex', fetchProvider: 'http' })
    expect(entries.find(entry => entry.id === 'dsh-codex-workbench')).toBeDefined()
    expect(entries.find(entry => entry.id === 'unrelated')).toEqual(base[1])
    expect(warn).not.toHaveBeenCalled()
  })

  it('lets the profile retain its chosen providers', () => {
    const entries = applyEntryPatches(base, [...bundle, {
      id: 'web', config: { searchProvider: 'other-search', fetchProvider: 'other-fetch' },
    }], warn)
    expect(entries.find(entry => entry.id === 'web')?.config).toEqual({ searchProvider: 'other-search', fetchProvider: 'other-fetch' })
  })

  it('leaves the base unchanged so removing the bundle restores it', () => {
    applyEntryPatches(base, bundle, warn)
    expect(applyEntryPatches(base, [], warn).find(entry => entry.id === 'web')?.config)
      .toEqual({ searchProvider: 'deepseek-official', fetchProvider: 'http' })
  })
})
