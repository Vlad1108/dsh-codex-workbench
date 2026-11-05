import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import AuthorizationService from '@deepseek-ai/dsh-authorization'
import LocalCredentialProvider from '@deepseek-ai/dsh-credentials-local'
import { credentialKey } from '@deepseek-ai/dsh-credentials'
import { CodexSignIn } from '../src/codex-sign-in.ts'

const roots: Context[] = []
const dirs: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => root.fiber.dispose()))
  await Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

it('starts browser login and stores the grant only after the callback', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-codex-web-'))
  dirs.push(dir)
  const ctx = new Context()
  roots.push(ctx)
  await ctx.plugin(LocalCredentialProvider, { path: join(dir, '.credentials.yaml'), watch: false })
  await ctx.plugin(AuthorizationService)
  const key = credentialKey('llm-pi-ai', 'openai-codex')
  let ready!: () => void
  const prompted = new Promise<void>((resolve) => { ready = resolve })
  let done!: () => void
  const finished = new Promise<void>((resolve) => { done = resolve })
  ctx.authorization.registerFlow({
    key, label: 'Codex', methods: [{ id: 'oauth', label: 'OAuth' }],
    async run(session) {
      expect(await session.prompt({ kind: 'select', message: 'Method', options: [{ id: 'browser', label: 'Browser' }] })).toBe('browser')
      session.notify({ message: 'Sign in', url: 'https://auth.openai.com/oauth/authorize' })
      const answer = session.prompt({ kind: 'text', message: 'Code' })
      ready()
      expect(await answer).toBe('test-callback')
      await session.commit({ kind: 'grant', payload: { token: 'test-secret' } })
      done()
    },
  })
  const login = new CodexSignIn(ctx, { quotaTimeoutMs: () => 15000 })
  const start = await login.start()
  await prompted
  const waiting = await login.state()
  expect(waiting).toMatchObject({ id: start.id, phase: 'waiting', configured: false, prompt: true })
  expect(waiting.url).toBe('https://auth.openai.com/oauth/authorize')
  await login.answer(start.id!, 'test-callback')
  await finished
  await expect.poll(async () => (await login.state()).phase).toBe('succeeded')
  expect(await login.state()).toMatchObject({ configured: true, phase: 'succeeded' })
  expect(await ctx.credentials.readRecord(key)).toEqual({ kind: 'grant', payload: { token: 'test-secret' } })
})
