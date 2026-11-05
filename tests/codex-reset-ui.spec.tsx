// @vitest-environment jsdom
import React from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CodexQuota } from '../src/client/CodexQuota.tsx'
import { en } from '../src/client/locales.ts'

vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  IconGaugeOutlineRegular: () => null,
  useAnchoredPosition: () => ({ left: 0, top: 0 }),
  useDismissOnOutsidePointer: () => undefined,
}))

const owner = 'a'.repeat(64)
const directory = { subscribe: () => () => {}, getSnapshot: () => state }
const state = { current: { provider: 'openai-codex' } }
const t = (key: keyof typeof en, values?: Record<string, string | number>) =>
  en[key].replace(/\{(\w+)\}/g, (_, name: string) => String(values?.[name] ?? ''))
const useLocale = (select: (snapshot: { active: string }) => string) => select({ active: 'en' })
const quota = (applicable: number, available = 2) => ({
  limits: [{ name: 'Codex', windows: [{ usedPercent: 75, windowSeconds: 18000 }] }],
  resetCredits: { available, applicable, owner },
})

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

it('warns when OpenAI reports no applicable resets', async () => {
  const redeemReset = vi.fn()
  render(<CodexQuota directory={directory} loadQuota={async () => quota(0)} redeemReset={redeemReset} useLocale={useLocale} t={t} />)
  fireEvent.click(await screen.findByRole('button', { name: /Codex quota remaining/ }))
  expect(await screen.findByText('Saved resets: 2')).toBeTruthy()
  expect(screen.getByText('OpenAI reports no applicable resets; the request may be declined.')).toBeTruthy()
  expect(screen.getByText('Use a reset')).toBeTruthy()
  expect(redeemReset).not.toHaveBeenCalled()
})

it('requires confirmation and retries the same request after an unknown result', async () => {
  const redeemReset = vi.fn().mockRejectedValueOnce(new Error('connection lost')).mockResolvedValueOnce('reset')
  render(<CodexQuota directory={directory} loadQuota={async () => quota(1)} redeemReset={redeemReset} useLocale={useLocale} t={t} />)
  fireEvent.click(await screen.findByRole('button', { name: /Codex quota remaining/ }))
  fireEvent.click(await screen.findByText('Use a reset'))
  expect(redeemReset).not.toHaveBeenCalled()
  fireEvent.click(screen.getByText('Confirm reset'))
  expect(await screen.findByText('The result is unknown. Retry the same request before using another reset.')).toBeTruthy()
  const savedKey = localStorage.getItem(`dsh-codex-reset:${owner}`)
  expect(savedKey).toBeTruthy()
  fireEvent.click(screen.getByText('Retry same request'))
  await waitFor(() => expect(redeemReset).toHaveBeenCalledTimes(2))
  expect(redeemReset.mock.calls).toEqual([[savedKey, owner], [savedKey, owner]])
  await waitFor(() => expect(localStorage.getItem(`dsh-codex-reset:${owner}`)).toBeNull())
})

it('retains an unknown request when no credits remain after reloading', async () => {
  localStorage.setItem(`dsh-codex-reset:${owner}`, '75256c51-cc9c-48e0-bd5f-1a2dcb93df1f')
  render(<CodexQuota directory={directory} loadQuota={async () => quota(0, 0)} redeemReset={vi.fn()} useLocale={useLocale} t={t} />)
  fireEvent.click(await screen.findByRole('button', { name: /Codex quota remaining/ }))
  expect(await screen.findByText('Retry same request')).toBeTruthy()
})
