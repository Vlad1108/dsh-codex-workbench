// src/index.ts
import Schema from "@deepseek-ai/schemastery";
import { brandString as brandString2 } from "@deepseek-ai/dsh-brand";

// src/auth.ts
import { homedir } from "node:os";
import { access } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import {
  credentialKey,
  credentialKeyId,
  credentialKeyScope,
  credentialRef,
  isCredentialKeySegment,
  isCredentialRefName
} from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { LlmError } from "@deepseek-ai/dsh-llm";
var RECORD_SCOPE = "llm-pi-ai";
function recordKeyFor(providerId) {
  return credentialKey(RECORD_SCOPE, providerId);
}
function jsonImage(value) {
  if (Array.isArray(value)) return value.map((entry) => entry === void 0 ? null : jsonImage(entry));
  if (typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
    const image = {};
    for (const [key, member] of Object.entries(value)) {
      if (member !== void 0) image[key] = jsonImage(member);
    }
    return image;
  }
  return value;
}
function toPiCredential(record2) {
  if (record2 === void 0) return void 0;
  if (record2.kind === "api-key") {
    return {
      type: "api_key",
      ...record2.key === void 0 ? {} : { key: record2.key },
      ...record2.env === void 0 ? {} : { env: { ...record2.env } }
    };
  }
  return record2.payload;
}
function toRecord(credential) {
  if (credential.type === "api_key") {
    return {
      kind: "api-key",
      ...credential.key === void 0 ? {} : { key: credential.key },
      ...credential.env === void 0 ? {} : { env: { ...credential.env } }
    };
  }
  return { kind: "grant", payload: jsonImage(credential) };
}
function writableStore(ctx) {
  const credentials = ctx.get("credentials");
  if (credentials === void 0) {
    throw new LlmError(
      "llm-pi-ai: this composition mounts no credentials service, so there is nowhere to store the credential a sign-in produces; mount one (dsh-credentials-local) to sign in",
      "NO_CREDENTIAL_STORE"
    );
  }
  return credentials;
}
function credentialStoreFrom(ctx) {
  return {
    async read(providerId) {
      const credentials = ctx.get("credentials");
      if (credentials === void 0) return void 0;
      if (!isCredentialKeySegment(providerId)) return void 0;
      return toPiCredential(await credentials.readRecord(recordKeyFor(providerId)));
    },
    async list() {
      const stored = await ctx.get("credentials")?.listRecords() ?? [];
      const mine = [];
      for (const entry of stored) {
        if (credentialKeyScope(entry.key) !== RECORD_SCOPE) continue;
        mine.push({
          providerId: credentialKeyId(entry.key),
          type: entry.kind === "api-key" ? "api_key" : "oauth"
        });
      }
      return mine;
    },
    async modify(providerId, mutate) {
      if (!isCredentialKeySegment(providerId)) {
        throw new LlmError(
          `llm-pi-ai: provider id "${providerId}" cannot address a stored credential record (a record id is a lowercase hyphenated identifier); authenticate this route through apiKeyEnv instead of a stored credential`,
          "UNSTORABLE_PROVIDER_ID"
        );
      }
      const stored = await writableStore(ctx).modifyRecord(recordKeyFor(providerId), async (current) => {
        const next = await mutate(toPiCredential(current));
        return next === void 0 ? void 0 : toRecord(next);
      });
      return toPiCredential(stored);
    },
    // `async` so a missing service reaches the caller as a rejection: pi-ai's
    // store contract is promise-returning, and a synchronous throw would
    // escape the `ModelsError` wrapper every other storage failure gets.
    async delete(providerId) {
      if (!isCredentialKeySegment(providerId)) return;
      await writableStore(ctx).deleteRecord(recordKeyFor(providerId));
    }
  };
}
function authContextFrom(ctx) {
  return {
    async env(name2) {
      if (isCredentialRefName(name2)) {
        const credentials = ctx.get("credentials");
        const hit = await credentials?.resolve(credentialRef(name2));
        if (hit !== void 0) return hit.value;
      }
      return launchEnvironmentOf(ctx).get(name2)?.value;
    },
    async fileExists(path) {
      const expanded = path.startsWith("~/") || path === "~" ? resolvePath(homedir(), path.slice(1).replace(/^\//, "")) : path;
      try {
        await access(expanded);
        return true;
      } catch {
        return false;
      }
    }
  };
}

// src/codex-search.ts
import { randomUUID } from "node:crypto";
import { createModels } from "@earendil-works/pi-ai";
import { openaiCodexProvider } from "@earendil-works/pi-ai/providers/openai-codex";
import { WebError } from "@deepseek-ai/dsh-web";
function object(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function accountId(access2) {
  try {
    const claim = JSON.parse(Buffer.from(access2.split(".")[1] ?? "", "base64url").toString("utf8"));
    const auth = object(claim) ? claim["https://api.openai.com/auth"] : void 0;
    const id = object(auth) ? auth.chatgpt_account_id : void 0;
    if (typeof id === "string" && id.length > 0) return id;
  } catch (error) {
    throw new WebError("Codex search credentials are invalid; sign in again in Models settings", "WEB_PROVIDER_CREDENTIAL_MISSING", { cause: error });
  }
  throw new WebError("Codex search credentials have no account id; sign in again in Models settings", "WEB_PROVIDER_CREDENTIAL_MISSING");
}
function abortable(work, signal) {
  if (signal === void 0) return work;
  if (signal.aborted) return Promise.reject(new WebError("Codex search cancelled", "WEB_ABORTED", { cause: signal.reason }));
  return new Promise((resolve, reject) => {
    const cancel = () => reject(new WebError("Codex search cancelled", "WEB_ABORTED", { cause: signal.reason }));
    signal.addEventListener("abort", cancel, { once: true });
    void work.then(
      (value) => {
        signal.removeEventListener("abort", cancel);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", cancel);
        reject(error);
      }
    );
  });
}
async function readResponse(response) {
  if (response.body === null) throw new Error("empty response");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    for (; ; ) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 5e6) {
        await reader.cancel();
        throw new Error("response exceeds 5 MB");
      }
      text += decoder.decode(part.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}
function mapCodexSearch(value) {
  if (!object(value) || typeof value.output !== "string" || value.results !== void 0 && !Array.isArray(value.results)) {
    throw new WebError("Codex search returned an invalid response", "WEB_PROVIDER_ERROR");
  }
  const sources = [];
  const seen = /* @__PURE__ */ new Set();
  for (const result of value.results ?? []) {
    if (!object(result) || result.type !== "text_result" || typeof result.url !== "string") continue;
    let url;
    try {
      url = new URL(result.url);
    } catch {
      continue;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:" || seen.has(result.url)) continue;
    seen.add(result.url);
    sources.push({
      url: result.url,
      ...typeof result.title === "string" ? { title: result.title } : {},
      ...typeof result.snippet === "string" ? { snippet: result.snippet } : {}
    });
  }
  return { ...value.output ? { content: value.output } : {}, sources, truncated: false };
}
var CodexSearchProvider = class {
  /** @param auth - Existing pi-ai credential adapters. @param options - Live search configuration. */
  constructor(auth, options) {
    this.options = options;
    this.models = createModels(auth);
    this.models.setProvider(openaiCodexProvider());
  }
  options;
  id = "openai-codex";
  models;
  available() {
    return true;
  }
  /** @param request - Search query. @param signal - Cancellation. @returns Search answer and citations. */
  async search(request, signal) {
    if (signal?.aborted) throw new WebError("Codex search cancelled", "WEB_ABORTED", { cause: signal.reason });
    let access2;
    try {
      access2 = (await abortable(this.models.getAuth("openai-codex", signal === void 0 ? {} : { signal }), signal))?.auth.apiKey;
    } catch (error) {
      if (signal?.aborted) throw new WebError("Codex search cancelled", "WEB_ABORTED", { cause: signal.reason });
      throw new WebError("Codex search authentication failed; sign in again in Models settings", "WEB_PROVIDER_CREDENTIAL_MISSING", { cause: error });
    }
    if (signal?.aborted) throw new WebError("Codex search cancelled", "WEB_ABORTED", { cause: signal.reason });
    if (!access2) throw new WebError("Sign in to OpenAI Codex in Models settings to use search", "WEB_PROVIDER_CREDENTIAL_MISSING");
    const config = this.options();
    const externalWebAccess = config.mode === "live" ? true : config.mode === "indexed" ? "indexed" : false;
    let response;
    try {
      response = await fetch("https://chatgpt.com/backend-api/codex/alpha/search", {
        method: "POST",
        redirect: "error",
        ...signal === void 0 ? {} : { signal },
        headers: { authorization: `Bearer ${access2}`, "chatgpt-account-id": accountId(access2), "content-type": "application/json", accept: "application/json", originator: "deepseek-harness" },
        body: JSON.stringify({
          id: randomUUID(),
          model: config.model,
          input: [{ type: "message", role: "user", content: [{ type: "input_text", text: request.query }] }],
          commands: { search_query: [{ q: request.query }] },
          settings: { search_context_size: config.contextSize, allowed_callers: ["direct"], external_web_access: externalWebAccess },
          max_output_tokens: config.maxOutputTokens
        })
      });
    } catch (error) {
      if (error instanceof WebError) throw error;
      if (signal?.aborted) throw new WebError("Codex search cancelled", "WEB_ABORTED", { cause: signal.reason });
      throw new WebError("Codex search request failed", "WEB_PROVIDER_ERROR", { cause: error });
    }
    if (!response.ok) {
      const authFailure = response.status === 401 || response.status === 403;
      throw new WebError(`Codex search failed (HTTP ${response.status})${authFailure ? "; check account access or sign in again" : ""}`, authFailure ? "WEB_PROVIDER_CREDENTIAL_MISSING" : "WEB_PROVIDER_ERROR");
    }
    let data;
    try {
      data = await readResponse(response);
    } catch (error) {
      if (signal?.aborted) throw new WebError("Codex search cancelled", "WEB_ABORTED", { cause: signal.reason });
      throw new WebError("Codex search returned invalid JSON", "WEB_PROVIDER_ERROR", { cause: error });
    }
    return mapCodexSearch(data);
  }
};

// src/codex-sign-in.ts
import { randomUUID as randomUUID2 } from "node:crypto";
import { brandString } from "@deepseek-ai/dsh-brand";
import { credentialKey as credentialKey2 } from "@deepseek-ai/dsh-credentials";

// src/codex-quota.ts
import { createModels as createModels2 } from "@earendil-works/pi-ai";
import { createHash } from "node:crypto";
import { openaiCodexProvider as openaiCodexProvider2 } from "@earendil-works/pi-ai/providers/openai-codex";
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function abortable2(operation, signal) {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise((resolve, reject) => {
    const cancel = () => reject(signal.reason);
    signal.addEventListener("abort", cancel, { once: true });
    void operation.then(
      (value) => {
        signal.removeEventListener("abort", cancel);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", cancel);
        reject(error);
      }
    );
  });
}
function parseWindow(value) {
  if (value === void 0 || value === null) return void 0;
  if (!isRecord(value)) throw new Error("Invalid Codex quota window");
  const used = value.used_percent;
  const duration = value.limit_window_seconds;
  const reset = value.reset_at;
  if (typeof used !== "number" || !Number.isFinite(used) || used < 0 || used > 100 || typeof duration !== "number" || !Number.isSafeInteger(duration) || duration <= 0 || reset !== void 0 && reset !== null && (typeof reset !== "number" || !Number.isSafeInteger(reset) || reset <= 0 || reset > 864e10)) {
    throw new Error("Invalid Codex quota values");
  }
  return { usedPercent: used, windowSeconds: duration, ...typeof reset === "number" ? { resetAt: reset } : {} };
}
function parseLimit(name2, value) {
  if (value === void 0 || value === null) return void 0;
  if (!isRecord(value)) throw new Error("Invalid Codex quota limit");
  const windows = [parseWindow(value.primary_window), parseWindow(value.secondary_window)].filter((item) => item !== void 0);
  return windows.length === 0 ? void 0 : { name: name2, windows };
}
function parseCodexQuota(value) {
  if (!isRecord(value)) throw new Error("Invalid Codex quota response");
  const limits = [];
  const primary = parseLimit("Codex", value.rate_limit);
  if (primary !== void 0) limits.push(primary);
  const extra = value.additional_rate_limits;
  if (extra !== void 0 && extra !== null && !Array.isArray(extra)) throw new Error("Invalid additional Codex limits");
  for (const item of extra ?? []) {
    if (!isRecord(item) || typeof item.metered_feature !== "string") throw new Error("Invalid additional Codex limit");
    const name2 = typeof item.limit_name === "string" && item.limit_name.length > 0 ? item.limit_name : item.metered_feature;
    const limit = parseLimit(name2, item.rate_limit);
    if (limit !== void 0) limits.push(limit);
  }
  const credits = value.rate_limit_reset_credits;
  if (credits === void 0 || credits === null) return { limits };
  if (!isRecord(credits) || !Number.isSafeInteger(credits.available_count) || !Number.isSafeInteger(credits.applicable_available_count) || typeof credits.available_count !== "number" || typeof credits.applicable_available_count !== "number" || credits.available_count < 0 || credits.applicable_available_count < 0 || credits.applicable_available_count > credits.available_count) {
    throw new Error("Invalid Codex reset credits");
  }
  return { limits, resetCredits: { available: credits.available_count, applicable: credits.applicable_available_count } };
}
async function authorizedRequest(auth, timeoutMs, ownerSignal, path, init, expectedOwner) {
  const models = createModels2(auth);
  models.setProvider(openaiCodexProvider2());
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = ownerSignal === void 0 ? timeout : AbortSignal.any([timeout, ownerSignal]);
  const access2 = (await abortable2(models.getAuth("openai-codex", { signal }), signal))?.auth.apiKey;
  const credential = await abortable2(auth.credentials.read("openai-codex"), signal);
  const accountId2 = credential?.type === "oauth" ? credential.accountId : void 0;
  if (!access2 || typeof accountId2 !== "string" || !accountId2) throw new Error("Codex sign-in required");
  if (credential?.type !== "oauth" || credential.access !== access2) throw new Error("Codex sign-in changed while loading quota");
  const owner = createHash("sha256").update(accountId2).digest("hex");
  if (expectedOwner !== void 0 && expectedOwner !== owner) throw new Error("Codex account changed");
  const response = await fetch(`https://chatgpt.com/backend-api/wham/${path}`, {
    ...init,
    redirect: "error",
    signal,
    headers: { authorization: `Bearer ${access2}`, "chatgpt-account-id": accountId2, accept: "application/json", "cache-control": "no-store", ...init.headers }
  });
  return { response, owner };
}
async function readCodexQuota(auth, timeoutMs, ownerSignal) {
  const { response, owner } = await authorizedRequest(auth, timeoutMs, ownerSignal, "usage", { method: "GET" });
  if (!response.ok) throw new Error(`Codex quota request failed (HTTP ${response.status})`);
  const value = await response.json();
  const quota = parseCodexQuota(value);
  if (quota.resetCredits !== void 0) quota.resetCredits.owner = owner;
  return quota;
}
async function redeemCodexReset(auth, timeoutMs, key, owner, ownerSignal) {
  const { response } = await authorizedRequest(auth, timeoutMs, ownerSignal, "rate-limit-reset-credits/consume", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ redeem_request_id: key })
  }, owner);
  if (!response.ok) throw new Error("Codex reset outcome unavailable");
  const value = await response.json();
  if (!isRecord(value)) throw new Error("Codex reset outcome unavailable");
  switch (value.code) {
    case "reset":
    case "nothing_to_reset":
    case "no_credit":
    case "already_redeemed":
      return value.code;
    default:
      throw new Error("Codex reset outcome unavailable");
  }
}

// src/codex-sign-in.ts
var KEY = credentialKey2("llm-pi-ai", "openai-codex");
var CodexSignIn = class {
  /**
   * @param ctx - Host context providing authorization and credentials.
   * @param options - Live quota timeout.
   */
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
    ctx.effect(() => () => {
      this.attempt?.controller.abort();
      this.lifetime.abort();
    }, "codex-sign-in: cancel on disposal");
  }
  ctx;
  options;
  attempt;
  quotaPending;
  resetPending;
  lifetime = new AbortController();
  /**
   * Read the stored-credential and current attempt state.
   * @returns State without credential values.
   */
  async state() {
    const configured = (await this.ctx.credentials.describeRecord(KEY)).configured;
    const attempt = this.attempt;
    return attempt === void 0 ? { configured, phase: "idle" } : {
      configured,
      id: attempt.id,
      phase: attempt.phase,
      ...attempt.url === void 0 ? {} : { url: attempt.url },
      ...attempt.answer === void 0 ? {} : { prompt: true }
    };
  }
  /** @returns Current subscription limits without exposing account credentials. */
  async quota() {
    if (this.quotaPending !== void 0) return this.quotaPending;
    const pending = readCodexQuota({ credentials: credentialStoreFrom(this.ctx), authContext: authContextFrom(this.ctx) }, this.options.quotaTimeoutMs(), this.lifetime.signal).catch(() => {
      throw new Error("Codex quota unavailable; check the connection or sign in again");
    });
    this.quotaPending = pending;
    try {
      return await pending;
    } finally {
      if (this.quotaPending === pending) this.quotaPending = void 0;
    }
  }
  /** Redeem one reset; concurrent calls must use the same idempotency key. */
  async reset(key, owner) {
    if (this.resetPending !== void 0) {
      if (this.resetPending.key !== key) throw new Error("Another reset is in progress");
      return this.resetPending.result;
    }
    const result = redeemCodexReset({ credentials: credentialStoreFrom(this.ctx), authContext: authContextFrom(this.ctx) }, this.options.quotaTimeoutMs(), key, owner, this.lifetime.signal);
    this.resetPending = { key, result };
    try {
      return await result;
    } finally {
      if (this.resetPending?.result === result) this.resetPending = void 0;
    }
  }
  /**
   * Start a browser sign-in or reuse the attempt already running.
   * @returns The active or newly started attempt.
   */
  async start() {
    if (this.attempt?.phase === "starting" || this.attempt?.phase === "waiting") return this.state();
    const attempt = { id: brandString(randomUUID2()), controller: new AbortController(), phase: "starting" };
    this.attempt = attempt;
    void this.ctx.authorization.begin({
      key: KEY,
      method: "oauth",
      signal: attempt.controller.signal,
      interaction: {
        notify: (notice) => {
          if (this.attempt !== attempt || notice.url === void 0) return;
          const url = new URL(notice.url);
          if (url.protocol !== "https:" || url.hostname !== "auth.openai.com") {
            attempt.controller.abort();
            return;
          }
          attempt.url = url.href;
          attempt.phase = "waiting";
        },
        prompt: (prompt) => {
          if (prompt.kind === "select") {
            const browser = prompt.options.find((option) => option.id === "browser");
            return browser === void 0 ? Promise.reject(new Error("Browser sign-in unavailable")) : Promise.resolve(browser.id);
          }
          if (prompt.kind !== "text") return Promise.reject(new Error("Unsupported sign-in prompt"));
          return new Promise((resolve, reject) => {
            const signal = prompt.signal === void 0 ? attempt.controller.signal : AbortSignal.any([prompt.signal, attempt.controller.signal]);
            const cancel = () => {
              delete attempt.answer;
              reject(new Error("Prompt cancelled"));
            };
            if (signal.aborted) {
              cancel();
              return;
            }
            signal.addEventListener("abort", cancel, { once: true });
            attempt.answer = (value) => {
              delete attempt.answer;
              signal.removeEventListener("abort", cancel);
              resolve(value);
            };
          });
        }
      }
    }).then((outcome) => {
      if (this.attempt !== attempt) return;
      attempt.phase = outcome.status === "authorized" ? "succeeded" : "cancelled";
      delete attempt.url;
      delete attempt.answer;
    }).catch(() => {
      if (this.attempt !== attempt) return;
      attempt.phase = "failed";
      delete attempt.url;
      delete attempt.answer;
    });
    return this.state();
  }
  /**
   * Submit a manually copied callback to the active attempt.
   * @param id - Active attempt.
   * @param value - Callback URL or code.
   * @returns Current state.
   * @throws When the attempt or its prompt is unavailable.
   */
  async answer(id, value) {
    if (this.attempt?.id !== id || this.attempt.answer === void 0) throw new Error("Sign-in prompt is unavailable");
    this.attempt.answer(value);
    return this.state();
  }
  /**
   * Withdraw an active sign-in attempt.
   * @param id - Attempt to cancel; a stale identity has no effect.
   * @returns Current state.
   */
  async cancel(id) {
    if (this.attempt?.id === id) this.attempt.controller.abort();
    return this.state();
  }
};

// src/index.ts
var name = "dsh-codex-workbench";
var inject = ["authorization", "credentials", "connection"];
var Config = Schema.object({
  quotaTimeoutMs: Schema.number().min(1).max(2147483647).default(15e3),
  searchModel: Schema.string().min(1).default("gpt-5.6-sol"),
  searchMode: Schema.union(["cached", "indexed", "live"]).default("live"),
  searchContextSize: Schema.union(["low", "medium", "high"]).default("medium"),
  searchMaxOutputTokens: Schema.number().min(1).default(1e4)
});
function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function apply(ctx, config) {
  const signIn = new CodexSignIn(ctx, { quotaTimeoutMs: () => config.quotaTimeoutMs });
  ctx.effect(() => ctx.connection.fetch.register({
    path: "/api/dsh-codex-workbench",
    methods: ["POST"],
    requestBody: "buffered",
    async fetch(request) {
      const reply = (status, value) => Response.json(value, {
        status,
        headers: { "Cache-Control": "no-store" }
      });
      let body;
      try {
        const text = await request.text();
        if (text.length > 16384) return reply(413, { ok: false });
        body = JSON.parse(text);
      } catch {
        return reply(400, { ok: false });
      }
      if (!record(body) || typeof body.action !== "string") return reply(400, { ok: false });
      try {
        switch (body.action) {
          case "state":
            return reply(200, { ok: true, value: await signIn.state() });
          case "quota":
            return reply(200, { ok: true, value: await signIn.quota() });
          case "reset":
            if (typeof body.key !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.key)) return reply(400, { ok: false });
            if (typeof body.owner !== "string" || !/^[0-9a-f]{64}$/.test(body.owner)) return reply(400, { ok: false });
            return reply(200, { ok: true, value: await signIn.reset(body.key, body.owner) });
          case "start":
            return reply(200, { ok: true, value: await signIn.start() });
          case "answer":
            if (typeof body.id !== "string" || typeof body.value !== "string" || body.value.length > 8192) return reply(400, { ok: false });
            return reply(200, { ok: true, value: await signIn.answer(brandString2(body.id), body.value) });
          case "cancel":
            if (typeof body.id !== "string") return reply(400, { ok: false });
            return reply(200, { ok: true, value: await signIn.cancel(brandString2(body.id)) });
          default:
            return reply(400, { ok: false });
        }
      } catch {
        return reply(502, { ok: false });
      }
    }
  }), "codex-workbench: authenticated actions");
  ctx.inject(["web"], (scope) => {
    const auth = { credentials: credentialStoreFrom(scope), authContext: authContextFrom(scope) };
    scope.effect(() => scope.web.registerSearchProvider(new CodexSearchProvider(auth, () => ({
      model: config.searchModel,
      mode: config.searchMode,
      contextSize: config.searchContextSize,
      maxOutputTokens: config.searchMaxOutputTokens
    }))), "codex-workbench: search provider");
  });
}
export {
  Config,
  apply,
  inject,
  name
};
