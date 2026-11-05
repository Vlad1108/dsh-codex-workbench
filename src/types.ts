import type { Branded } from '@deepseek-ai/dsh-brand'

/** Identity of one authorization attempt. */
export type CodexSignInAttemptId = Branded<'CodexSignInAttemptId'>

/** Browser-visible Codex authorization status, excluding credentials. */
export interface CodexSignInView {
  /** Whether a Codex credential record is stored. */
  configured: boolean
  /** Current attempt, absent before the first sign-in. */
  id?: CodexSignInAttemptId
  /** Current attempt's state. */
  phase: 'idle' | 'starting' | 'waiting' | 'succeeded' | 'failed' | 'cancelled'
  /** Browser authorization URL while the attempt waits for the user. */
  url?: string
  /** Whether the attempt accepts a manually copied callback. */
  prompt?: boolean
}

/** One usage window reported by the Codex subscription. */
export interface CodexQuotaWindow {
  /** Percentage already consumed, between zero and one hundred. */
  usedPercent: number
  /** Duration of this limit window in seconds. */
  windowSeconds: number
  /** Unix timestamp in seconds at which the window resets, when supplied. */
  resetAt?: number
}

/** One named Codex usage limit. */
export interface CodexQuotaLimit {
  /** Provider-supplied name of this limit. */
  name: string
  /** Short and long windows supplied for this limit. */
  windows: CodexQuotaWindow[]
}

/** Subscription usage without credentials or account identifiers. */
export interface CodexQuotaView {
  /** Available limits, including the primary Codex limit. */
  limits: CodexQuotaLimit[]
  /** Reset credits and how many currently apply to the account. */
  resetCredits?: { available: number, applicable: number, owner?: string }
}

/** Result of asking OpenAI to use one saved reset. */
export type CodexResetOutcome = 'reset' | 'nothing_to_reset' | 'no_credit' | 'already_redeemed'
