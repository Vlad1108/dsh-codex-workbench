import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { CodexQuota, CodexSignInAttemptId, CodexStatus, ModelsOperations } from './operations.ts'
import type { en } from './locales.ts'
import styles from './ModelsSection.module.css'

interface Props {
  operations: NonNullable<ModelsOperations['codex']>
  t: (key: keyof typeof en) => string
}

/** Browser sign-in for the Codex model provider. */
export function CodexSignIn({ operations, t }: Props): ReactNode {
  const [view, setView] = useState<CodexStatus>()
  const [failed, setFailed] = useState(false)
  const [manual, setManual] = useState('')
  const [quota, setQuota] = useState<CodexQuota>()
  const [quotaFailed, setQuotaFailed] = useState(false)
  const [quotaRevision, setQuotaRevision] = useState(0)
  const popup = useRef<Window | null>(null)
  const navigated = useRef(false)
  const mounted = useRef(true)
  const attempt = useRef<CodexSignInAttemptId | undefined>(undefined)
  const revision = useRef(0)
  const active = view?.phase === 'starting' || view?.phase === 'waiting'

  useEffect(() => {
    if (!view?.configured) { setQuota(undefined); setQuotaFailed(false); return }
    let live = true
    void operations.quota().then(value => { if (live) { setQuota(value); setQuotaFailed(false) } })
      .catch(() => { if (live) setQuotaFailed(true) })
    return () => { live = false }
  }, [operations, view?.configured, quotaRevision])

  useEffect(() => {
    mounted.current = true
    let live = true
    const current = revision.current
    void operations.status().then((value) => { if (live && revision.current === current) setView(value) })
      .catch(() => { if (live && revision.current === current) setFailed(true) })
    return () => {
      live = false
      mounted.current = false
      popup.current?.close()
      if (attempt.current !== undefined) void operations.cancel(attempt.current).catch(() => undefined)
    }
  }, [operations])

  useEffect(() => {
    if (!active) return
    let live = true
    const current = revision.current
    const timer = setTimeout(() => {
      void operations.status().then((value) => { if (live && revision.current === current) setView(value) })
        .catch(() => { if (live && revision.current === current) setFailed(true) })
    }, 800)
    return () => { live = false; clearTimeout(timer) }
  }, [active, operations, view])

  useEffect(() => {
    attempt.current = active ? view.id : undefined
    if (view?.url && !navigated.current) {
      const url = new URL(view.url)
      if (url.protocol === 'https:' && url.hostname === 'auth.openai.com') {
        navigated.current = true
        popup.current?.location.replace(url.href)
      }
    }
    if (view && !['starting', 'waiting'].includes(view.phase)) {
      if (view.phase !== 'succeeded' || !navigated.current) popup.current?.close()
      popup.current = null
    }
  }, [active, view])

  const start = (): void => {
    revision.current++
    setFailed(false)
    navigated.current = false
    popup.current = window.open('about:blank', '_blank')
    if (popup.current) popup.current.opener = null
    void operations.start().then((value) => {
      if (!mounted.current) {
        if (value.id !== undefined) void operations.cancel(value.id).catch(() => undefined)
        return
      }
      setView(value)
    }).catch(() => {
      popup.current?.close()
      popup.current = null
      setFailed(true)
    })
  }

  return <div className={styles['field']}>
    <button type="button" className={styles['secondaryButton']} disabled={active} onClick={start}>
      {t('codexSignIn')}
    </button>
    {view?.configured ? <p className={styles['savedNotice']}>{t('accountSignedIn')}</p> : null}
    {view?.configured ? <div className={styles['field']}>
      <span className={styles['fieldLabel']}>{t('codexQuota')}</span>
      {quota?.limits.map(limit => <div key={limit.name}>
        <span>{limit.name}</span>
        {limit.windows.map(window => <p className={styles['advancedHint']} key={window.windowSeconds}>
          {window.windowSeconds % 86400 === 0 ? `${window.windowSeconds / 86400}d`
            : window.windowSeconds % 3600 === 0 ? `${window.windowSeconds / 3600}h` : `${Math.ceil(window.windowSeconds / 60)}m`}
          {' · '}{Math.round(100 - window.usedPercent)}%
          {window.resetAt === undefined ? null : ` · ${t('codexQuotaReset')}: ${new Date(window.resetAt * 1000).toLocaleString()}`}
        </p>)}
      </div>)}
      {quota && quota.limits.length === 0 ? <p className={styles['advancedHint']}>{t('codexQuotaEmpty')}</p> : null}
      {quotaFailed ? <p className={styles['error']}>{t('codexQuotaFailed')}</p> : null}
      <button type="button" className={styles['secondaryButton']} onClick={() => { setQuotaRevision(value => value + 1) }}>{t('codexQuotaRefresh')}</button>
    </div> : null}
    {active ? <p className={styles['advancedHint']}>{t('codexWaiting')}</p> : null}
    {active && view.url ? <a href={view.url} target="_blank" rel="noopener noreferrer">{t('codexOpen')}</a> : null}
    {active && view.prompt && view.id ? <>
      <label className={styles['fieldLabel']} htmlFor="codex-manual">{t('codexManual')}</label>
      <input id="codex-manual" className={styles['input']} value={manual} onChange={(event) => { setManual(event.target.value) }} />
      <button type="button" className={styles['secondaryButton']} disabled={!manual.trim()} onClick={() => {
        revision.current++
        const id = view.id
        if (id !== undefined) void operations.answer(id, manual.trim()).then(setView).catch(() => { setFailed(true) })
        setManual('')
      }}>{t('codexSubmit')}</button>
    </> : null}
    {active && view.id ? <button type="button" className={styles['secondaryButton']} onClick={() => {
      revision.current++
      popup.current?.close()
      popup.current = null
      const id = view.id
      if (id !== undefined) void operations.cancel(id).then(setView).catch(() => { setFailed(true) })
    }}>{t('cancel')}</button> : null}
    {failed || view?.phase === 'failed' ? <p className={styles['error']}>{t('codexFailed')}</p> : null}
  </div>
}
