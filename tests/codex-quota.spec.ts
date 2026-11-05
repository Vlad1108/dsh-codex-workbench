import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AuthContext, CredentialStore } from '@earendil-works/pi-ai'
import { parseCodexQuota, readCodexQuota } from '../src/codex-quota.ts'

const credentials: CredentialStore = {
  read: async () => ({ type: 'oauth', access: 'private-token', refresh: 'private-refresh', expires: Date.now() + 3600000, accountId: 'account' }),
  list: async () => [], modify: async () => undefined, delete: async () => {},
}
const authContext: AuthContext = { env: async () => undefined, fileExists: async () => false }

afterEach(() => vi.unstubAllGlobals())

describe('Codex subscription quota', () => {
  it('returns usage windows without account or credential fields', async () => {
    const request = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(JSON.stringify({
      email: 'private@example.com', rate_limit: {
        primary_window: { used_percent: 25, limit_window_seconds: 18000, reset_at: 2000000000 },
        secondary_window: { used_percent: 80, limit_window_seconds: 604800, reset_at: 2000001000 },
      },
    }), { status: 200 }))
    vi.stubGlobal('fetch', request)
    const quota = await readCodexQuota({ credentials, authContext }, 15000)
    expect(quota).toEqual({ limits: [{ name: 'Codex', windows: [
      { usedPercent: 25, windowSeconds: 18000, resetAt: 2000000000 },
      { usedPercent: 80, windowSeconds: 604800, resetAt: 2000001000 },
    ] }] })
    expect(request.mock.calls[0]?.[1]?.headers).toMatchObject({ authorization: 'Bearer private-token', 'chatgpt-account-id': 'account' })
    expect(JSON.stringify(quota)).not.toContain('private')
  })

  it('rejects malformed windows instead of inventing quota', () => {
    expect(() => parseCodexQuota({ rate_limit: { primary_window: { used_percent: -1, limit_window_seconds: 18000 } } })).toThrow()
    expect(() => parseCodexQuota({ additional_rate_limits: {} })).toThrow()
  })

  it('reports a failed quota request without returning the response body', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('private response', { status: 403 })))
    await expect(readCodexQuota({ credentials, authContext }, 15000)).rejects.toThrow('HTTP 403')
  })

  it('cancels while credential resolution is pending without starting a request', async () => {
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    const controller = new AbortController()
    const pending = readCodexQuota({ credentials: { ...credentials, read: () => new Promise(() => {}) }, authContext }, 15000, controller.signal)
    controller.abort()
    await expect(pending).rejects.toBeDefined()
    expect(request).not.toHaveBeenCalled()
  })
})
