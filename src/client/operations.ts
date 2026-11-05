import type { CodexQuotaView, CodexSignInAttemptId, CodexSignInView } from '../types.ts'

export type CodexStatus = CodexSignInView
export type { CodexSignInAttemptId }
export type CodexQuota = CodexQuotaView
export interface ModelsOperations {
  codex?: {
    status(): Promise<CodexStatus>
    start(): Promise<CodexStatus>
    cancel(id: CodexSignInAttemptId): Promise<CodexStatus>
    answer(id: CodexSignInAttemptId, value: string): Promise<CodexStatus>
    quota(): Promise<CodexQuota>
  }
}
async function call<T>(action: string, parameters: object = {}): Promise<T> {
  const response = await fetch('/api/dsh-codex-workbench', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action, ...parameters }),
  })
  if (!response.ok) throw new Error('Codex operation failed')
  const data = await response.json() as { ok: boolean, value: T }
  if (!data.ok) throw new Error('Codex operation failed')
  return data.value
}

export const operations: NonNullable<ModelsOperations['codex']> = {
  status: () => call('state'),
  start: () => call('start'),
  cancel: id => call('cancel', { id }),
  answer: (id, value) => call('answer', { id, value }),
  quota: () => call('quota'),
}
