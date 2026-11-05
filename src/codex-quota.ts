/** Read subscription usage using the existing Codex OAuth credential. */
import { createModels } from '@earendil-works/pi-ai'
import { openaiCodexProvider } from '@earendil-works/pi-ai/providers/openai-codex'
import type { AuthContext, CredentialStore } from '@earendil-works/pi-ai'
import type { CodexQuotaLimit, CodexQuotaView, CodexQuotaWindow } from './types.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function abortable<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(signal.reason)
  return new Promise<T>((resolve, reject) => {
    const cancel = (): void => reject(signal.reason)
    signal.addEventListener('abort', cancel, { once: true })
    void operation.then(
      value => { signal.removeEventListener('abort', cancel); resolve(value) },
      error => { signal.removeEventListener('abort', cancel); reject(error) },
    )
  })
}

function parseWindow(value: unknown): CodexQuotaWindow | undefined {
  if (value === undefined || value === null) return undefined
  if (!isRecord(value)) throw new Error('Invalid Codex quota window')
  const used = value.used_percent
  const duration = value.limit_window_seconds
  const reset = value.reset_at
  if (typeof used !== 'number' || !Number.isFinite(used) || used < 0 || used > 100
    || typeof duration !== 'number' || !Number.isSafeInteger(duration) || duration <= 0
    || (reset !== undefined && reset !== null && (typeof reset !== 'number' || !Number.isSafeInteger(reset) || reset <= 0 || reset > 8_640_000_000_000))) {
    throw new Error('Invalid Codex quota values')
  }
  return { usedPercent: used, windowSeconds: duration, ...(typeof reset === 'number' ? { resetAt: reset } : {}) }
}

function parseLimit(name: string, value: unknown): CodexQuotaLimit | undefined {
  if (value === undefined || value === null) return undefined
  if (!isRecord(value)) throw new Error('Invalid Codex quota limit')
  const windows = [parseWindow(value.primary_window), parseWindow(value.secondary_window)]
    .filter((item): item is CodexQuotaWindow => item !== undefined)
  return windows.length === 0 ? undefined : { name, windows }
}

/**
 * Convert the subscription response into non-secret usage windows.
 * @param value - Parsed response from the provider.
 * @returns Named quota windows available to the account.
 */
export function parseCodexQuota(value: unknown): CodexQuotaView {
  if (!isRecord(value)) throw new Error('Invalid Codex quota response')
  const limits: CodexQuotaLimit[] = []
  const primary = parseLimit('Codex', value.rate_limit)
  if (primary !== undefined) limits.push(primary)
  const extra = value.additional_rate_limits
  if (extra !== undefined && extra !== null && !Array.isArray(extra)) throw new Error('Invalid additional Codex limits')
  for (const item of extra ?? []) {
    if (!isRecord(item) || typeof item.metered_feature !== 'string') throw new Error('Invalid additional Codex limit')
    const name = typeof item.limit_name === 'string' && item.limit_name.length > 0 ? item.limit_name : item.metered_feature
    const limit = parseLimit(name, item.rate_limit)
    if (limit !== undefined) limits.push(limit)
  }
  return { limits }
}

/**
 * Request current subscription usage from the Codex account.
 * @param auth - Existing pi-ai credential adapters.
 * @param timeoutMs - Request timeout in milliseconds.
 * @param ownerSignal - Aborted when the owning controller is disposed.
 * @returns Quota data with credentials excluded.
 */
export async function readCodexQuota(auth: { credentials: CredentialStore, authContext: AuthContext }, timeoutMs: number, ownerSignal?: AbortSignal): Promise<CodexQuotaView> {
  const models = createModels(auth)
  models.setProvider(openaiCodexProvider())
  const timeout = AbortSignal.timeout(timeoutMs)
  const signal = ownerSignal === undefined ? timeout : AbortSignal.any([timeout, ownerSignal])
  const access = (await abortable(models.getAuth('openai-codex', { signal }), signal))?.auth.apiKey
  const credential = await abortable(auth.credentials.read('openai-codex'), signal)
  const accountId = credential?.type === 'oauth' ? credential.accountId : undefined
  if (!access || typeof accountId !== 'string' || !accountId) throw new Error('Codex sign-in required')
  if (credential?.type !== 'oauth' || credential.access !== access) throw new Error('Codex sign-in changed while loading quota')
  const response = await fetch('https://chatgpt.com/backend-api/wham/usage', {
    method: 'GET', redirect: 'error', signal,
    headers: { authorization: `Bearer ${access}`, 'chatgpt-account-id': accountId, accept: 'application/json', 'cache-control': 'no-store' },
  })
  if (!response.ok) throw new Error(`Codex quota request failed (HTTP ${response.status})`)
  const value: unknown = await response.json()
  return parseCodexQuota(value)
}
