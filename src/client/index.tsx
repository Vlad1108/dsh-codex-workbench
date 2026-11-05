/** Browser UI for Codex authorization and usage. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-models/client'
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { ProviderCardExtrasOwnerProps } from '@deepseek-ai/dsh-client-ui-settings-models/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { brandString } from '@deepseek-ai/dsh-brand'
import { CodexQuota } from './CodexQuota.tsx'
import { CodexSignIn } from './CodexSignIn.tsx'
import { operations } from './operations.ts'
import { en, zh } from './locales.ts'
import { styleText as quotaStyles } from './CodexQuota.module.css'
import { styleText as settingsStyles } from './ModelsSection.module.css'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'codex-workbench': keyof typeof en }
}

export const inject = ['slots', 'locale', 'modelDirectories', 'sessions', 'remote', 'remote.session']

export function apply(ctx: Context): void {
  ctx.effect(() => {
    const style = document.createElement('style')
    style.textContent = quotaStyles + '\n' + settingsStyles
    document.head.append(style)
    return () => style.remove()
  }, 'codex-workbench: styles')
  ctx.effect(() => ctx.locale.register('codex-workbench', { en, zh }), 'codex-workbench: translations')
  const t = ctx.locale.bind('codex-workbench')
  const Card = ({ provider }: ProviderCardExtrasOwnerProps) => provider.provider === 'openai-codex'
    ? <CodexSignIn operations={operations} t={t} /> : null
  ctx.slots.inject('settings.models.provider-card', () => ctx.slots.register({
    name: 'settings.models.provider-card', key: 'llm-pi-ai',
  }, Card))
  ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
    name: 'conversation.input.right',
    id: 'codex-workbench-quota',
    locale: 'codex-workbench',
    inject: sessionId => ({
      directory: ctx.modelDirectories.directoryFor(brandString<SessionId>(sessionId)).store,
      loadQuota: operations.quota, redeemReset: operations.reset, hooks: { locale: ctx.locale },
    }),
  }, CodexQuota))
}
