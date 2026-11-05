import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import { brandString } from '@deepseek-ai/dsh-brand'
import type {} from '@deepseek-ai/dsh-authorization'
import { credentialKey } from '@deepseek-ai/dsh-credentials'
import type { CodexQuotaView, CodexSignInAttemptId, CodexSignInView } from './types.ts'
import { authContextFrom, credentialStoreFrom } from './auth.ts'
import { readCodexQuota } from './codex-quota.ts'

interface Attempt {
  id: CodexSignInAttemptId
  controller: AbortController
  phase: CodexSignInView['phase']
  url?: string
  answer?: (value: string) => void
}

const KEY = credentialKey('llm-pi-ai', 'openai-codex')

/** Owns interactive Codex authorization for the lifetime of the controller. */
export class CodexSignIn {
  private attempt: Attempt | undefined
  private quotaPending: Promise<CodexQuotaView> | undefined
  private readonly lifetime = new AbortController()

  /**
   * @param ctx - Host context providing authorization and credentials.
   * @param options - Live quota timeout.
   */
  constructor(private readonly ctx: Context, private readonly options: { quotaTimeoutMs: () => number }) {
    ctx.effect(() => () => { this.attempt?.controller.abort(); this.lifetime.abort() }, 'codex-sign-in: cancel on disposal')
  }

  /**
   * Read the stored-credential and current attempt state.
   * @returns State without credential values.
   */
  async state(): Promise<CodexSignInView> {
    const configured = (await this.ctx.credentials.describeRecord(KEY)).configured
    const attempt = this.attempt
    return attempt === undefined ? { configured, phase: 'idle' } : {
      configured, id: attempt.id, phase: attempt.phase,
      ...attempt.url === undefined ? {} : { url: attempt.url },
      ...attempt.answer === undefined ? {} : { prompt: true },
    }
  }

  /** @returns Current subscription limits without exposing account credentials. */
  async quota(): Promise<CodexQuotaView> {
    if (this.quotaPending !== undefined) return this.quotaPending
    const pending = readCodexQuota({ credentials: credentialStoreFrom(this.ctx), authContext: authContextFrom(this.ctx) }, this.options.quotaTimeoutMs(), this.lifetime.signal)
      .catch(() => { throw new Error('Codex quota unavailable; check the connection or sign in again') })
    this.quotaPending = pending
    try { return await pending } finally { if (this.quotaPending === pending) this.quotaPending = undefined }
  }

  /**
   * Start a browser sign-in or reuse the attempt already running.
   * @returns The active or newly started attempt.
   */
  async start(): Promise<CodexSignInView> {
    if (this.attempt?.phase === 'starting' || this.attempt?.phase === 'waiting') return this.state()
    const attempt: Attempt = { id: brandString<CodexSignInAttemptId>(randomUUID()), controller: new AbortController(), phase: 'starting' }
    this.attempt = attempt
    void this.ctx.authorization.begin({
      key: KEY, method: 'oauth', signal: attempt.controller.signal,
      interaction: {
        notify: (notice) => {
          if (this.attempt !== attempt || notice.url === undefined) return
          const url = new URL(notice.url)
          if (url.protocol !== 'https:' || url.hostname !== 'auth.openai.com') {
            attempt.controller.abort()
            return
          }
          attempt.url = url.href
          attempt.phase = 'waiting'
        },
        prompt: (prompt) => {
          if (prompt.kind === 'select') {
            const browser = prompt.options.find(option => option.id === 'browser')
            return browser === undefined ? Promise.reject(new Error('Browser sign-in unavailable')) : Promise.resolve(browser.id)
          }
          if (prompt.kind !== 'text') return Promise.reject(new Error('Unsupported sign-in prompt'))
          return new Promise<string>((resolve, reject) => {
            const signal = prompt.signal === undefined
              ? attempt.controller.signal : AbortSignal.any([prompt.signal, attempt.controller.signal])
            const cancel = (): void => { delete attempt.answer; reject(new Error('Prompt cancelled')) }
            if (signal.aborted) { cancel(); return }
            signal.addEventListener('abort', cancel, { once: true })
            attempt.answer = (value) => {
              delete attempt.answer
              signal.removeEventListener('abort', cancel)
              resolve(value)
            }
          })
        },
      },
    }).then((outcome) => {
      if (this.attempt !== attempt) return
      attempt.phase = outcome.status === 'authorized' ? 'succeeded' : 'cancelled'
      delete attempt.url
      delete attempt.answer
    }).catch(() => {
      if (this.attempt !== attempt) return
      attempt.phase = 'failed'
      delete attempt.url
      delete attempt.answer
    })
    return this.state()
  }

  /**
   * Submit a manually copied callback to the active attempt.
   * @param id - Active attempt.
   * @param value - Callback URL or code.
   * @returns Current state.
   * @throws When the attempt or its prompt is unavailable.
   */
  async answer(id: CodexSignInAttemptId, value: string): Promise<CodexSignInView> {
    if (this.attempt?.id !== id || this.attempt.answer === undefined) throw new Error('Sign-in prompt is unavailable')
    this.attempt.answer(value)
    return this.state()
  }

  /**
   * Withdraw an active sign-in attempt.
   * @param id - Attempt to cancel; a stale identity has no effect.
   * @returns Current state.
   */
  async cancel(id: CodexSignInAttemptId): Promise<CodexSignInView> {
    if (this.attempt?.id === id) this.attempt.controller.abort()
    return this.state()
  }

}
