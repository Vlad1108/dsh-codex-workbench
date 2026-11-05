/** Host services for the Codex Workbench bundle. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-authorization'
import type {} from '@deepseek-ai/dsh-client-connection'
import type {} from '@deepseek-ai/dsh-web'
import Schema from '@deepseek-ai/schemastery'
import { brandString } from '@deepseek-ai/dsh-brand'
import { authContextFrom, credentialStoreFrom } from './auth.ts'
import { CodexSearchProvider } from './codex-search.ts'
import { CodexSignIn } from './codex-sign-in.ts'
import type { CodexSignInAttemptId } from './types.ts'

export const name = 'dsh-codex-workbench'
export const inject = ['authorization', 'credentials', 'connection']

export const Config = Schema.object({
  quotaTimeoutMs: Schema.number().min(1).max(2147483647).default(15000),
  searchModel: Schema.string().min(1).default('gpt-5.6-sol'),
  searchMode: Schema.union(['cached', 'indexed', 'live']).default('live'),
  searchContextSize: Schema.union(['low', 'medium', 'high']).default('medium'),
  searchMaxOutputTokens: Schema.number().min(1).default(10000),
})
export interface Config {
  quotaTimeoutMs: number
  searchModel: string
  searchMode: 'cached' | 'indexed' | 'live'
  searchContextSize: 'low' | 'medium' | 'high'
  searchMaxOutputTokens: number
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Mount authenticated Web operations and the optional search provider. */
export function apply(ctx: Context, config: Config): void {
  const signIn = new CodexSignIn(ctx, { quotaTimeoutMs: () => config.quotaTimeoutMs })
  ctx.effect(() => ctx.connection.fetch.register({
    path: '/api/dsh-codex-workbench',
    methods: ['POST'],
    requestBody: 'buffered',
    async fetch(request) {
      const reply = (status: number, value: object): Response => Response.json(value, {
        status, headers: { 'Cache-Control': 'no-store' },
      })
      let body: unknown
      try {
        const text = await request.text()
        if (text.length > 16384) return reply(413, { ok: false })
        body = JSON.parse(text)
      } catch {
        return reply(400, { ok: false })
      }
      if (!record(body) || typeof body.action !== 'string') return reply(400, { ok: false })
      try {
        switch (body.action) {
          case 'state': return reply(200, { ok: true, value: await signIn.state() })
          case 'quota': return reply(200, { ok: true, value: await signIn.quota() })
          case 'reset':
            if (typeof body.key !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.key)) return reply(400, { ok: false })
            if (typeof body.owner !== 'string' || !/^[0-9a-f]{64}$/.test(body.owner)) return reply(400, { ok: false })
            return reply(200, { ok: true, value: await signIn.reset(body.key, body.owner) })
          case 'start': return reply(200, { ok: true, value: await signIn.start() })
          case 'answer':
            if (typeof body.id !== 'string' || typeof body.value !== 'string' || body.value.length > 8192) return reply(400, { ok: false })
            return reply(200, { ok: true, value: await signIn.answer(brandString<CodexSignInAttemptId>(body.id), body.value) })
          case 'cancel':
            if (typeof body.id !== 'string') return reply(400, { ok: false })
            return reply(200, { ok: true, value: await signIn.cancel(brandString<CodexSignInAttemptId>(body.id)) })
          default: return reply(400, { ok: false })
        }
      } catch {
        return reply(502, { ok: false })
      }
    },
  }), 'codex-workbench: authenticated actions')
  ctx.inject(['web'], scope => {
    const auth = { credentials: credentialStoreFrom(scope), authContext: authContextFrom(scope) }
    scope.effect(() => scope.web.registerSearchProvider(new CodexSearchProvider(auth, () => ({
      model: config.searchModel, mode: config.searchMode,
      contextSize: config.searchContextSize, maxOutputTokens: config.searchMaxOutputTokens,
    }))), 'codex-workbench: search provider')
  })
}
