# Codex Workbench for DeepSeek Harness

Codex Workbench adds ChatGPT sign-in and subscription quota display to DSH Web. It uses the existing `openai-codex` provider in DSH 0.2.1-rc.5, so each user signs in with their own account.

## Setup

Install the bundle and restart DSH Web:

```sh
dsh plugin --profile web add github:Vlad1108/dsh-codex-workbench
```

Open **Settings → Models**, add the **openai-codex** provider, select **Sign in with ChatGPT**, complete the browser login, and apply the provider settings. The model picker uses the catalog supplied by DSH.

The composer shows the remaining five-hour quota beside the active Codex model, or the weekly quota when the account has no five-hour window. Hover or tap it to see the available windows and reset times. Clicking also refreshes the values.

Models absent from the bundled catalog can be added through DSH's model settings.

## Web search

The bundle registers and selects the `openai-codex` search provider and selects `http` for fetching pages. After signing in, `web_search` uses Codex when that tool is enabled for the agent. The selection applies to the whole profile, including when another model is active. Disabling the bundle removes its selection.

An existing profile or home `cordis.patch.yml` entry for `web` takes precedence over the bundle. A later bundle may also replace it. To choose another provider, set both `searchProvider` and `fetchProvider` in the profile's `web` entry; DSH replaces that entry's whole configuration. Upgrading from 0.1.1 enables Codex search and HTTP fetching where no later configuration overrides the bundle.

The bundle's configuration provides `searchModel`, `searchMode` (`cached`, `indexed`, or `live`), `searchContextSize`, `searchMaxOutputTokens`, and `quotaTimeoutMs`.

## Privacy and compatibility

Credentials remain in DSH's credential store and are never sent to the browser. Sign-in, model requests, quota, and search use OpenAI endpoints. Quota and search use endpoints that may change independently of this plugin. No telemetry is added by this bundle.

This version targets DSH 0.2.1-rc.5 and the Web interface. Use one Codex integration at a time; a second plugin registering the same search provider will conflict.

## Development

Run `pnpm install --ignore-workspace`, `node build.mjs`, `node node_modules/typescript/bin/tsc --noEmit`, and `node node_modules/vitest/vitest.mjs run --config vitest.config.ts`. The built `lib/` files are included so DSH can install the GitHub package without a build step.

MIT licensed; the extracted DSH code retains its original license.
