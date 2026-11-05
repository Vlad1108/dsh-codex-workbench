/** Codex standalone search registered through the web provider service. */
import { randomUUID } from 'node:crypto'
import { createModels } from '@earendil-works/pi-ai'
import { openaiCodexProvider } from '@earendil-works/pi-ai/providers/openai-codex'
import type { AuthContext, CredentialStore } from '@earendil-works/pi-ai'
import { WebError } from '@deepseek-ai/dsh-web'
import type { WebSearchProvider, WebSearchRequest, WebSearchResult, WebSearchSource } from '@deepseek-ai/dsh-web'

interface SearchOptions {
  model: string
  mode: 'cached' | 'indexed' | 'live'
  contextSize: 'low' | 'medium' | 'high'
  maxOutputTokens: number
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function accountId(access: string): string {
  try {
    const claim: unknown = JSON.parse(Buffer.from(access.split('.')[1] ?? '', 'base64url').toString('utf8'))
    const auth = object(claim) ? claim['https://api.openai.com/auth'] : undefined
    const id = object(auth) ? auth.chatgpt_account_id : undefined
    if (typeof id === 'string' && id.length > 0) return id
  } catch (error) {
    throw new WebError('Codex search credentials are invalid; sign in again in Models settings', 'WEB_PROVIDER_CREDENTIAL_MISSING', { cause: error })
  }
  throw new WebError('Codex search credentials have no account id; sign in again in Models settings', 'WEB_PROVIDER_CREDENTIAL_MISSING')
}

function abortable<T>(work: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (signal === undefined) return work
  if (signal.aborted) return Promise.reject(new WebError('Codex search cancelled', 'WEB_ABORTED', { cause: signal.reason }))
  return new Promise<T>((resolve, reject) => {
    const cancel = (): void => reject(new WebError('Codex search cancelled', 'WEB_ABORTED', { cause: signal.reason }))
    signal.addEventListener('abort', cancel, { once: true })
    void work.then(
      value => { signal.removeEventListener('abort', cancel); resolve(value) },
      error => { signal.removeEventListener('abort', cancel); reject(error) },
    )
  })
}

async function readResponse(response: Response): Promise<unknown> {
  if (response.body === null) throw new Error('empty response')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let bytes = 0
  let text = ''
  try {
    for (;;) {
      const part = await reader.read()
      if (part.done) break
      bytes += part.value.byteLength
      if (bytes > 5_000_000) {
        await reader.cancel()
        throw new Error('response exceeds 5 MB')
      }
      text += decoder.decode(part.value, { stream: true })
    }
    return JSON.parse(text + decoder.decode())
  } finally {
    reader.releaseLock()
  }
}

/**
 * Convert the search service response into DSH citations.
 * @param value - Parsed response from Codex.
 * @returns The answer and its HTTP(S) citations.
 */
export function mapCodexSearch(value: unknown): WebSearchResult {
  if (!object(value) || typeof value.output !== 'string' || (value.results !== undefined && !Array.isArray(value.results))) {
    throw new WebError('Codex search returned an invalid response', 'WEB_PROVIDER_ERROR')
  }
  const sources: WebSearchSource[] = []
  const seen = new Set<string>()
  for (const result of value.results ?? []) {
    if (!object(result) || result.type !== 'text_result' || typeof result.url !== 'string') continue
    let url: URL
    try { url = new URL(result.url) } catch { continue }
    if ((url.protocol !== 'https:' && url.protocol !== 'http:') || seen.has(result.url)) continue
    seen.add(result.url)
    sources.push({
      url: result.url,
      ...(typeof result.title === 'string' ? { title: result.title } : {}),
      ...(typeof result.snippet === 'string' ? { snippet: result.snippet } : {}),
    })
  }
  return { ...(value.output ? { content: value.output } : {}), sources, truncated: false }
}

/** A Codex-backed web provider sharing the pi-ai credential store and refresh flow. */
export class CodexSearchProvider implements WebSearchProvider {
  readonly id = 'openai-codex'
  private readonly models

  /** @param auth - Existing pi-ai credential adapters. @param options - Live search configuration. */
  constructor(auth: { credentials: CredentialStore, authContext: AuthContext }, private readonly options: () => SearchOptions) {
    this.models = createModels(auth)
    this.models.setProvider(openaiCodexProvider())
  }

  available(): boolean { return true }

  /** @param request - Search query. @param signal - Cancellation. @returns Search answer and citations. */
  async search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult> {
    if (signal?.aborted) throw new WebError('Codex search cancelled', 'WEB_ABORTED', { cause: signal.reason })
    let access: string | undefined
    try { access = (await abortable(this.models.getAuth('openai-codex', signal === undefined ? {} : { signal }), signal))?.auth.apiKey }
    catch (error) {
      if (signal?.aborted) throw new WebError('Codex search cancelled', 'WEB_ABORTED', { cause: signal.reason })
      throw new WebError('Codex search authentication failed; sign in again in Models settings', 'WEB_PROVIDER_CREDENTIAL_MISSING', { cause: error })
    }
    if (signal?.aborted) throw new WebError('Codex search cancelled', 'WEB_ABORTED', { cause: signal.reason })
    if (!access) throw new WebError('Sign in to OpenAI Codex in Models settings to use search', 'WEB_PROVIDER_CREDENTIAL_MISSING')
    const config = this.options()
    const externalWebAccess = config.mode === 'live' ? true : config.mode === 'indexed' ? 'indexed' : false
    let response: Response
    try {
      response = await fetch('https://chatgpt.com/backend-api/codex/alpha/search', {
        method: 'POST', redirect: 'error', ...(signal === undefined ? {} : { signal }),
        headers: { authorization: `Bearer ${access}`, 'chatgpt-account-id': accountId(access), 'content-type': 'application/json', accept: 'application/json', originator: 'deepseek-harness' },
        body: JSON.stringify({
          id: randomUUID(), model: config.model,
          input: [{ type: 'message', role: 'user', content: [{ type: 'input_text', text: request.query }] }],
          commands: { search_query: [{ q: request.query }] },
          settings: { search_context_size: config.contextSize, allowed_callers: ['direct'], external_web_access: externalWebAccess },
          max_output_tokens: config.maxOutputTokens,
        }),
      })
    } catch (error) {
      if (error instanceof WebError) throw error
      if (signal?.aborted) throw new WebError('Codex search cancelled', 'WEB_ABORTED', { cause: signal.reason })
      throw new WebError('Codex search request failed', 'WEB_PROVIDER_ERROR', { cause: error })
    }
    if (!response.ok) {
      const authFailure = response.status === 401 || response.status === 403
      throw new WebError(`Codex search failed (HTTP ${response.status})${authFailure ? '; check account access or sign in again' : ''}`, authFailure ? 'WEB_PROVIDER_CREDENTIAL_MISSING' : 'WEB_PROVIDER_ERROR')
    }
    let data: unknown
    try { data = await readResponse(response) }
    catch (error) {
      if (signal?.aborted) throw new WebError('Codex search cancelled', 'WEB_ABORTED', { cause: signal.reason })
      throw new WebError('Codex search returned invalid JSON', 'WEB_PROVIDER_ERROR', { cause: error })
    }
    return mapCodexSearch(data)
  }
}
