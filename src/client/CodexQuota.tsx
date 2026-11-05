/** Subscription usage shown beside the active Codex model. */
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { IconGaugeOutlineRegular, useAnchoredPosition, useDismissOnOutsidePointer } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { HostObservable, InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { LocaleSnapshot } from '@deepseek-ai/dsh-client-locale/client'
import type { CodexQuotaView, CodexResetOutcome } from '../types.ts'
import type { ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import css from './CodexQuota.module.css'

type Quota = CodexQuotaView

/** Data supplied by the model-selection plugin. */
export interface CodexQuotaInjected {
  directory: SnapshotStore<ModelDirectoryState>
  loadQuota: () => Promise<Quota>
  redeemReset: (key: string, owner: string) => Promise<CodexResetOutcome>
  hooks: { locale: HostObservable<LocaleSnapshot> }
}

function windowLabel(seconds: number): string {
  if (seconds % 86400 === 0) return `${seconds / 86400}d`
  if (seconds % 3600 === 0) return `${seconds / 3600}h`
  return `${Math.ceil(seconds / 60)}m`
}

function dateLocale(locale: string): string {
  try { return Intl.getCanonicalLocales(locale)[0] ?? 'en' } catch (error) {
    if (error instanceof RangeError) return 'en'
    throw error
  }
}

function resetLabel(seconds: number | undefined, duration: number, fallback: string, locale: string): string {
  if (seconds === undefined) return fallback
  const date = new Date(seconds * 1000)
  const now = new Date()
  const sameDay = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
  if (duration < 86400) {
    return sameDay ? date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
      : date.toLocaleString(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

/** Display and refresh quota only for a selected Codex model. */
export function CodexQuota({ directory, loadQuota, redeemReset, useLocale, t }: InjectFace<CodexQuotaInjected> & PropsLocale<'codex-workbench'>) {
  const locale = dateLocale(useLocale(snapshot => snapshot.active))
  const state = useSyncExternalStore(fn => directory.subscribe(fn), () => directory.getSnapshot())
  const eligible = state.current?.provider === 'openai-codex'
  const [quota, setQuota] = useState<Quota>()
  const [error, setError] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)
  const [resetMessage, setResetMessage] = useState<'unknown' | 'storage' | 'done' | 'nothing' | 'noCredit' | 'redeemed'>()
  const [pendingReset, setPendingReset] = useState(false)
  const anchor = useRef<HTMLSpanElement | null>(null)
  const panel = useRef<HTMLDivElement | null>(null)
  const suppressFocusOpen = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const panelId = useId()
  const resetOwner = quota?.resetCredits?.owner
  const storageKey = resetOwner === undefined ? undefined : `dsh-codex-reset:${resetOwner}`
  const open = eligible && (hovered || focused || pinned)
  const close = useCallback(() => { setHovered(false); setFocused(false); setPinned(false); setConfirm(false) }, [])
  const cancelClose = (): void => { if (closeTimer.current !== undefined) clearTimeout(closeTimer.current) }
  const queueClose = (): void => { cancelClose(); closeTimer.current = setTimeout(() => { setHovered(false) }, 150) }
  const position = useAnchoredPosition({ open, anchorRef: anchor, panelRef: panel, side: 'top', align: 'end', gap: 8, margin: 12 })
  useDismissOnOutsidePointer(anchor, open, close, panel)
  useEffect(() => () => { if (closeTimer.current !== undefined) clearTimeout(closeTimer.current) }, [])
  useEffect(() => {
    if (!pinned || panel.current === null || panel.current.contains(document.activeElement)) return
    panel.current.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
  }, [pinned])
  useEffect(() => {
    if (storageKey === undefined) { setPendingReset(false); return }
    try { setPendingReset(localStorage.getItem(storageKey) !== null) } catch { setResetMessage('storage') }
  }, [storageKey])
  useEffect(() => {
    if (!open) return
    const dismiss = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      const restore = panel.current?.contains(document.activeElement) ?? false
      close()
      if (restore) { suppressFocusOpen.current = true; anchor.current?.querySelector('button')?.focus() }
    }
    document.addEventListener('keydown', dismiss)
    return () => { document.removeEventListener('keydown', dismiss) }
  }, [close, open])
  useEffect(() => {
    if (!eligible) { setQuota(undefined); setError(false); close(); return }
    let active = true
    let running = false
    const load = (): void => {
      if (running) return
      running = true
      void loadQuota().then(value => { if (active) { setQuota(value); setError(false) } })
        .catch(() => { if (active) setError(true) })
        .finally(() => { running = false })
    }
    load()
    const timer = window.setInterval(load, 60000)
    return () => { active = false; window.clearInterval(timer) }
  }, [close, eligible, loadQuota, refresh])
  if (!eligible) return null
  const windows = quota?.limits.find(limit => limit.name === 'Codex')?.windows ?? []
  const primary = windows.find(window => window.windowSeconds === 18000)
    ?? windows.find(window => window.windowSeconds === 604800)
    ?? windows[0]
  const remaining = primary === undefined ? undefined : Math.round(100 - primary.usedPercent)
  const details = windows.map(window => t('quota.window', {
    window: windowLabel(window.windowSeconds),
    percent: Math.round(100 - window.usedPercent),
    reset: window.resetAt === undefined ? t('quota.resetUnknown') : new Date(window.resetAt * 1000).toLocaleString(locale),
  })).join(' • ')
  const label = error ? t('quota.error') : quota === undefined ? t('quota.loading')
    : windows.length === 0 ? t('quota.empty') : t('quota.summary', { details })
  const applyReset = async (): Promise<void> => {
    if (resetBusy || storageKey === undefined || resetOwner === undefined) return
    let key: string
    try {
      key = localStorage.getItem(storageKey) ?? crypto.randomUUID()
      localStorage.setItem(storageKey, key)
    } catch { setResetMessage('storage'); return }
    setPendingReset(true)
    setResetBusy(true)
    setConfirm(false)
    try {
      const outcome = await redeemReset(key, resetOwner)
      if (outcome !== 'reset' && outcome !== 'nothing_to_reset' && outcome !== 'no_credit' && outcome !== 'already_redeemed') throw new Error('Unknown reset outcome')
      localStorage.removeItem(storageKey)
      setPendingReset(false)
      setResetMessage(outcome === 'reset' ? 'done' : outcome === 'nothing_to_reset' ? 'nothing' : outcome === 'no_credit' ? 'noCredit' : 'redeemed')
      setRefresh(value => value + 1)
    } catch { setResetMessage('unknown') } finally { setResetBusy(false) }
  }
  return <span ref={anchor} className={css.anchor}
    onPointerEnter={event => { if (event.pointerType !== 'touch') { cancelClose(); setHovered(true) } }}
    onPointerLeave={queueClose}
  >
    <button type="button" className={css.quota} aria-label={label} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? panelId : undefined}
      onFocus={event => {
        if (suppressFocusOpen.current) { suppressFocusOpen.current = false; return }
        if (event.currentTarget.matches(':focus-visible')) setFocused(true)
      }}
      onBlur={() => { setFocused(false) }}
      onClick={() => { setPinned(value => !value); setRefresh(value => value + 1) }}
    >{primary === undefined ? (error ? '!' : '…') : <>
      <svg className={css.ring} viewBox="0 0 20 20" aria-hidden="true">
        <circle className={css.ringTrack} cx="10" cy="10" r="8" />
        {remaining !== undefined && remaining > 0 ? <circle className={css.ringProgress}
          cx="10" cy="10" r="8" pathLength="100" strokeDasharray={`${remaining} 100`} /> : null}
      </svg>
      <span>{windowLabel(primary.windowSeconds)} {remaining}%</span>
    </>}</button>
    {open && createPortal(<div id={panelId} ref={panel} className={css.panel} role="dialog" aria-label={t('quota.title')}
      style={position ?? { visibility: 'hidden', left: 0, top: 0 }}
      onFocus={() => setPinned(true)}
      onPointerEnter={event => { if (event.pointerType !== 'touch') { cancelClose(); setHovered(true) } }}
      onPointerLeave={queueClose}
    >
      <div className={css.heading}><IconGaugeOutlineRegular size={16} /><span>{t('quota.title')}</span></div>
      {windows.length > 0 ? <div className={css.rows}>{windows.map(window => <div className={css.row} key={window.windowSeconds}>
        <span className={css.window}>{window.windowSeconds === 604800 ? t('quota.weekly') : windowLabel(window.windowSeconds)}</span>
        <span className={css.percent}>{Math.round(100 - window.usedPercent)}%</span>
        <span className={css.reset}>{resetLabel(window.resetAt, window.windowSeconds, t('quota.resetUnknown'), locale)}</span>
      </div>)}</div> : <p className={css.message}>{error ? t('quota.error') : quota === undefined ? t('quota.loading') : t('quota.empty')}</p>}
      {error && windows.length > 0 ? <p className={css.message}>{t('quota.error')}</p> : null}
      {quota?.resetCredits !== undefined && (quota.resetCredits.available > 0 || pendingReset) ? <div className={css.actions}>
        <p>{t('reset.available', { count: quota.resetCredits.available })}</p>
        {pendingReset ? <>
          {!resetBusy ? <p role="status">{t('reset.unknown')}</p> : null}
          <button type="button" disabled={resetBusy} onClick={() => { void applyReset() }}>{resetBusy ? t('reset.pending') : t('reset.retry')}</button>
        </> : confirm ? <>
          <p>{t('reset.confirmText')}</p>
          <div className={css.buttons}>
            <button type="button" onClick={() => setConfirm(false)}>{t('cancel')}</button>
            <button type="button" disabled={resetBusy} onClick={() => { void applyReset() }}>{resetBusy ? t('reset.pending') : t('reset.confirm')}</button>
          </div>
        </> : <button type="button" onClick={() => { setResetMessage(undefined); setConfirm(true); setPinned(true) }}>{t('reset.action')}</button>}
      </div> : null}
      {resetMessage !== undefined && resetMessage !== 'unknown' ? <p className={css.message} role="status">{t(`reset.${resetMessage}`)}</p> : null}
    </div>, document.body)}
  </span>
}
