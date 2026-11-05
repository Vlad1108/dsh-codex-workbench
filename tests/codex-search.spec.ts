import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import WebRuntime from '@deepseek-ai/dsh-web'
import type { AuthContext, CredentialStore } from '@earendil-works/pi-ai'
import { CodexSearchProvider, mapCodexSearch } from '../src/codex-search.ts'

const token = `header.${Buffer.from(JSON.stringify({ 'https://api.openai.com/auth': { chatgpt_account_id: 'account' } })).toString('base64url')}.signature`
const authContext: AuthContext = { env: async () => undefined, fileExists: async () => false }
const credentialStore = (signedIn: boolean): CredentialStore => ({
  read: async () => signedIn ? { type: 'oauth', access: token, refresh: 'refresh', expires: Date.now() + 3600000 } : undefined,
  list: async () => [],
  modify: async () => undefined,
  delete: async () => {},
})
const provider = (signedIn = true): CodexSearchProvider => new CodexSearchProvider(
  { credentials: credentialStore(signedIn), authContext },
  () => ({ model: 'gpt-5.6-sol', mode: 'live', contextSize: 'medium', maxOutputTokens: 10000 }),
)

afterEach(() => vi.unstubAllGlobals())

describe('Codex web search', () => {
  it('uses the existing OAuth token and returns citations', async () => {
    const request = vi.fn(async (_url: string | URL | Request, _options?: RequestInit) => new Response(JSON.stringify({ output: 'Answer', results: [
      { type: 'text_result', url: 'https://example.com/', title: 'Example', snippet: 'Description' },
    ] }), { status: 200 }))
    vi.stubGlobal('fetch', request)
    const result = await provider().search({ query: 'example search' })
    expect(result).toEqual({ content: 'Answer', sources: [{ url: 'https://example.com/', title: 'Example', snippet: 'Description' }], truncated: false })
    const [url, options] = request.mock.calls[0]!
    expect(url).toBe('https://chatgpt.com/backend-api/codex/alpha/search')
    expect(options?.headers).toMatchObject({ authorization: `Bearer ${token}`, 'chatgpt-account-id': 'account' })
    expect(JSON.parse(String(options?.body))).toMatchObject({ commands: { search_query: [{ q: 'example search' }] }, settings: { external_web_access: true } })
  })

  it('reports missing credentials before making a request', async () => {
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    await expect(provider(false).search({ query: 'example' })).rejects.toMatchObject({ code: 'WEB_PROVIDER_CREDENTIAL_MISSING' })
    expect(request).not.toHaveBeenCalled()
  })

  it('registers with the web service and withdraws on disposal', async () => {
    const ctx = new Context()
    const web = ctx.plugin(WebRuntime, { searchProvider: 'openai-codex' })
    await web
    const plugin = ctx.plugin({ inject: ['web'], apply(child: Context) { child.web.registerSearchProvider(provider(false)) } })
    await plugin
    await expect(ctx.web.search({ query: 'example' })).rejects.toMatchObject({ code: 'WEB_PROVIDER_CREDENTIAL_MISSING' })
    await plugin.dispose()
    await expect(ctx.web.search({ query: 'example' })).rejects.toMatchObject({ code: 'WEB_PROVIDER_CONFIGURED_MISSING' })
    await web.dispose()
  })

  it('does not dispatch an already-cancelled search', async () => {
    const signal = AbortSignal.abort('cancelled')
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    await expect(provider().search({ query: 'example' }, signal)).rejects.toMatchObject({ code: 'WEB_ABORTED' })
    expect(request).not.toHaveBeenCalled()
  })

  it('reports service errors without exposing response contents', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('private detail', { status: 403 })))
    await expect(provider().search({ query: 'example' })).rejects.toMatchObject({ code: 'WEB_PROVIDER_CREDENTIAL_MISSING', message: expect.not.stringContaining('private detail') })
  })

  it('ignores unsupported and duplicate citations and rejects malformed responses', () => {
    expect(mapCodexSearch({ output: '', results: [{ type: 'text_result', url: 'javascript:bad' }, { type: 'text_result', url: 'https://example.com' }, { type: 'text_result', url: 'https://example.com' }] }).sources).toHaveLength(1)
    expect(() => mapCodexSearch({ results: [] })).toThrow('invalid response')
  })
})
