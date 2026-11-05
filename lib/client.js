window.__ModuleLoader__.load({id:"dsh-codex-workbench",factory:(require)=>{const module={exports:{}};const exports=module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// node_modules/.pnpm/@deepseek-ai+dsh-brand@0.2.1-rc.5_@deepseek-ai+cordis@4.0.5/node_modules/@deepseek-ai/dsh-brand/lib/index.js
function brandString(value) {
  return value;
}

// src/client/CodexQuota.tsx
var import_react = require("react");
var import_react_dom = require("react-dom");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/CodexQuota.module.css
var CodexQuota_default = { "percent": "_4orqnW_percent", "window": "_4orqnW_window", "heading": "_4orqnW_heading", "buttons": "_4orqnW_buttons", "reset": "_4orqnW_reset", "message": "_4orqnW_message", "ringProgress": "_4orqnW_ringProgress", "row": "_4orqnW_row", "anchor": "_4orqnW_anchor", "ring": "_4orqnW_ring", "quota": "_4orqnW_quota", "actions": "_4orqnW_actions", "ringTrack": "_4orqnW_ringTrack", "panel": "_4orqnW_panel", "rows": "_4orqnW_rows" };
var styleText = "._4orqnW_anchor {\n  display: inline-flex;\n}\n\n._4orqnW_quota {\n  border-radius: var(--dsw-radius-sm);\n  color: var(--dsw-alias-label-primary);\n  white-space: nowrap;\n  cursor: pointer;\n  background: none;\n  border: 0;\n  align-items: center;\n  gap: 6px;\n  padding: 4px;\n  font-size: 12px;\n  line-height: 20px;\n  display: inline-flex;\n}\n\n._4orqnW_ring {\n  fill: none;\n  stroke-width: 2.5px;\n  flex: none;\n  width: 16px;\n  height: 16px;\n}\n\n._4orqnW_ringTrack {\n  stroke: var(--dsw-alias-label-dimmed);\n}\n\n._4orqnW_ringProgress {\n  stroke: var(--dsw-alias-label-tertiary);\n  stroke-linecap: round;\n  transform-origin: center;\n  transform: rotate(-90deg);\n}\n\n._4orqnW_panel {\n  z-index: 1100;\n  box-sizing: border-box;\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dsw-specific-menu);\n  width: min(224px, 100vw - 24px);\n  backdrop-filter: var(--dsw-menu-backdrop-filter);\n  --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);\n  box-shadow: var(--dsw-elevation-prominent);\n  color: var(--dsw-alias-label-secondary);\n  padding: 12px 16px;\n  font-size: 13px;\n  line-height: 20px;\n  position: fixed;\n}\n\n._4orqnW_heading {\n  color: var(--dsw-alias-label-primary);\n  align-items: center;\n  gap: 8px;\n  display: flex;\n}\n\n._4orqnW_rows {\n  gap: 4px;\n  margin-top: 10px;\n  display: grid;\n}\n\n._4orqnW_row {\n  grid-template-columns: minmax(0, 1fr) auto auto;\n  align-items: baseline;\n  gap: 12px;\n  display: grid;\n}\n\n._4orqnW_window {\n  color: var(--dsw-alias-label-primary);\n  font-weight: 500;\n}\n\n._4orqnW_percent, ._4orqnW_reset {\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n\n._4orqnW_message {\n  margin: 10px 0 0;\n}\n\n._4orqnW_actions {\n  border-top: 1px solid var(--dsw-alias-border-l1);\n  margin-top: 10px;\n  padding-top: 10px;\n}\n\n._4orqnW_actions p {\n  margin: 0 0 8px;\n}\n\n._4orqnW_actions p:last-child {\n  margin-bottom: 0;\n}\n\n._4orqnW_actions button {\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: var(--dsw-radius-sm);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  cursor: pointer;\n  background: none;\n  padding: 4px 8px;\n}\n\n._4orqnW_actions button:disabled {\n  opacity: .6;\n  cursor: default;\n}\n\n._4orqnW_buttons {\n  flex-wrap: wrap;\n  gap: 8px;\n  display: flex;\n}\n\n._4orqnW_quota:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));\n}\n\n@media (hover: hover) {\n  ._4orqnW_quota:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n  }\n}\n";

// src/client/CodexQuota.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function windowLabel(seconds) {
  if (seconds % 86400 === 0) return `${seconds / 86400}d`;
  if (seconds % 3600 === 0) return `${seconds / 3600}h`;
  return `${Math.ceil(seconds / 60)}m`;
}
function dateLocale(locale) {
  try {
    return Intl.getCanonicalLocales(locale)[0] ?? "en";
  } catch (error) {
    if (error instanceof RangeError) return "en";
    throw error;
  }
}
function resetLabel(seconds, duration, fallback, locale) {
  if (seconds === void 0) return fallback;
  const date = new Date(seconds * 1e3);
  const now = /* @__PURE__ */ new Date();
  const sameDay = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  if (duration < 86400) {
    return sameDay ? date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" }) : date.toLocaleString(locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}
function CodexQuota({ directory, loadQuota, redeemReset, useLocale, t }) {
  const locale = dateLocale(useLocale((snapshot) => snapshot.active));
  const state = (0, import_react.useSyncExternalStore)((fn) => directory.subscribe(fn), () => directory.getSnapshot());
  const eligible = state.current?.provider === "openai-codex";
  const [quota, setQuota] = (0, import_react.useState)();
  const [error, setError] = (0, import_react.useState)(false);
  const [refresh, setRefresh] = (0, import_react.useState)(0);
  const [hovered, setHovered] = (0, import_react.useState)(false);
  const [focused, setFocused] = (0, import_react.useState)(false);
  const [pinned, setPinned] = (0, import_react.useState)(false);
  const [confirm, setConfirm] = (0, import_react.useState)(false);
  const [resetBusy, setResetBusy] = (0, import_react.useState)(false);
  const [resetMessage, setResetMessage] = (0, import_react.useState)();
  const [pendingReset, setPendingReset] = (0, import_react.useState)(false);
  const anchor = (0, import_react.useRef)(null);
  const panel = (0, import_react.useRef)(null);
  const suppressFocusOpen = (0, import_react.useRef)(false);
  const closeTimer = (0, import_react.useRef)(void 0);
  const panelId = (0, import_react.useId)();
  const resetOwner = quota?.resetCredits?.owner;
  const storageKey = resetOwner === void 0 ? void 0 : `dsh-codex-reset:${resetOwner}`;
  const open = eligible && (hovered || focused || pinned);
  const close = (0, import_react.useCallback)(() => {
    setHovered(false);
    setFocused(false);
    setPinned(false);
    setConfirm(false);
  }, []);
  const cancelClose = () => {
    if (closeTimer.current !== void 0) clearTimeout(closeTimer.current);
  };
  const queueClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setHovered(false);
    }, 150);
  };
  const position = (0, import_dsh_client_ui_primitives.useAnchoredPosition)({ open, anchorRef: anchor, panelRef: panel, side: "top", align: "end", gap: 8, margin: 12 });
  (0, import_dsh_client_ui_primitives.useDismissOnOutsidePointer)(anchor, open, close, panel);
  (0, import_react.useEffect)(() => () => {
    if (closeTimer.current !== void 0) clearTimeout(closeTimer.current);
  }, []);
  (0, import_react.useEffect)(() => {
    if (!pinned || panel.current === null || panel.current.contains(document.activeElement)) return;
    panel.current.querySelector("button:not(:disabled)")?.focus();
  }, [pinned]);
  (0, import_react.useEffect)(() => {
    if (storageKey === void 0) {
      setPendingReset(false);
      return;
    }
    try {
      setPendingReset(localStorage.getItem(storageKey) !== null);
    } catch {
      setResetMessage("storage");
    }
  }, [storageKey]);
  (0, import_react.useEffect)(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (event.key !== "Escape") return;
      const restore = panel.current?.contains(document.activeElement) ?? false;
      close();
      if (restore) {
        suppressFocusOpen.current = true;
        anchor.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
    };
  }, [close, open]);
  (0, import_react.useEffect)(() => {
    if (!eligible) {
      setQuota(void 0);
      setError(false);
      close();
      return;
    }
    let active = true;
    let running = false;
    const load = () => {
      if (running) return;
      running = true;
      void loadQuota().then((value) => {
        if (active) {
          setQuota(value);
          setError(false);
        }
      }).catch(() => {
        if (active) setError(true);
      }).finally(() => {
        running = false;
      });
    };
    load();
    const timer = window.setInterval(load, 6e4);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [close, eligible, loadQuota, refresh]);
  if (!eligible) return null;
  const windows = quota?.limits.find((limit) => limit.name === "Codex")?.windows ?? [];
  const primary = windows.find((window2) => window2.windowSeconds === 18e3) ?? windows.find((window2) => window2.windowSeconds === 604800) ?? windows[0];
  const remaining = primary === void 0 ? void 0 : Math.round(100 - primary.usedPercent);
  const details = windows.map((window2) => t("quota.window", {
    window: windowLabel(window2.windowSeconds),
    percent: Math.round(100 - window2.usedPercent),
    reset: window2.resetAt === void 0 ? t("quota.resetUnknown") : new Date(window2.resetAt * 1e3).toLocaleString(locale)
  })).join(" \u2022 ");
  const label = error ? t("quota.error") : quota === void 0 ? t("quota.loading") : windows.length === 0 ? t("quota.empty") : t("quota.summary", { details });
  const applyReset = async () => {
    if (resetBusy || storageKey === void 0 || resetOwner === void 0) return;
    let key;
    try {
      key = localStorage.getItem(storageKey) ?? crypto.randomUUID();
      localStorage.setItem(storageKey, key);
    } catch {
      setResetMessage("storage");
      return;
    }
    setPendingReset(true);
    setResetBusy(true);
    setConfirm(false);
    try {
      const outcome = await redeemReset(key, resetOwner);
      if (outcome !== "reset" && outcome !== "nothing_to_reset" && outcome !== "no_credit" && outcome !== "already_redeemed") throw new Error("Unknown reset outcome");
      localStorage.removeItem(storageKey);
      setPendingReset(false);
      setResetMessage(outcome === "reset" ? "done" : outcome === "nothing_to_reset" ? "nothing" : outcome === "no_credit" ? "noCredit" : "redeemed");
      setRefresh((value) => value + 1);
    } catch {
      setResetMessage("unknown");
    } finally {
      setResetBusy(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "span",
    {
      ref: anchor,
      className: CodexQuota_default.anchor,
      onPointerEnter: (event) => {
        if (event.pointerType !== "touch") {
          cancelClose();
          setHovered(true);
        }
      },
      onPointerLeave: queueClose,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: CodexQuota_default.quota,
            "aria-label": label,
            "aria-haspopup": "dialog",
            "aria-expanded": open,
            "aria-controls": open ? panelId : void 0,
            onFocus: (event) => {
              if (suppressFocusOpen.current) {
                suppressFocusOpen.current = false;
                return;
              }
              if (event.currentTarget.matches(":focus-visible")) setFocused(true);
            },
            onBlur: () => {
              setFocused(false);
            },
            onClick: () => {
              setPinned((value) => !value);
              setRefresh((value) => value + 1);
            },
            children: primary === void 0 ? error ? "!" : "\u2026" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { className: CodexQuota_default.ring, viewBox: "0 0 20 20", "aria-hidden": "true", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: CodexQuota_default.ringTrack, cx: "10", cy: "10", r: "8" }),
                remaining !== void 0 && remaining > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "circle",
                  {
                    className: CodexQuota_default.ringProgress,
                    cx: "10",
                    cy: "10",
                    r: "8",
                    pathLength: "100",
                    strokeDasharray: `${remaining} 100`
                  }
                ) : null
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                windowLabel(primary.windowSeconds),
                " ",
                remaining,
                "%"
              ] })
            ] })
          }
        ),
        open && (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            id: panelId,
            ref: panel,
            className: CodexQuota_default.panel,
            role: "dialog",
            "aria-label": t("quota.title"),
            style: position ?? { visibility: "hidden", left: 0, top: 0 },
            onFocus: () => setPinned(true),
            onPointerEnter: (event) => {
              if (event.pointerType !== "touch") {
                cancelClose();
                setHovered(true);
              }
            },
            onPointerLeave: queueClose,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: CodexQuota_default.heading, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconGaugeOutlineRegular, { size: 16 }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("quota.title") })
              ] }),
              windows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: CodexQuota_default.rows, children: windows.map((window2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: CodexQuota_default.row, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: CodexQuota_default.window, children: window2.windowSeconds === 604800 ? t("quota.weekly") : windowLabel(window2.windowSeconds) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: CodexQuota_default.percent, children: [
                  Math.round(100 - window2.usedPercent),
                  "%"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: CodexQuota_default.reset, children: resetLabel(window2.resetAt, window2.windowSeconds, t("quota.resetUnknown"), locale) })
              ] }, window2.windowSeconds)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: CodexQuota_default.message, children: error ? t("quota.error") : quota === void 0 ? t("quota.loading") : t("quota.empty") }),
              error && windows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: CodexQuota_default.message, children: t("quota.error") }) : null,
              quota?.resetCredits !== void 0 && (quota.resetCredits.available > 0 || pendingReset) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: CodexQuota_default.actions, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("reset.available", { count: quota.resetCredits.available }) }),
                pendingReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  !resetBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "status", children: t("reset.unknown") }) : null,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: resetBusy, onClick: () => {
                    void applyReset();
                  }, children: resetBusy ? t("reset.pending") : t("reset.retry") })
                ] }) : confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("reset.confirmText") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: CodexQuota_default.buttons, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setConfirm(false), children: t("cancel") }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: resetBusy, onClick: () => {
                      void applyReset();
                    }, children: resetBusy ? t("reset.pending") : t("reset.confirm") })
                  ] })
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
                  setResetMessage(void 0);
                  setConfirm(true);
                  setPinned(true);
                }, children: t("reset.action") })
              ] }) : null,
              resetMessage !== void 0 && resetMessage !== "unknown" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: CodexQuota_default.message, role: "status", children: t(`reset.${resetMessage}`) }) : null
            ]
          }
        ), document.body)
      ]
    }
  );
}

// src/client/CodexSignIn.tsx
var import_react2 = require("react");

// src/client/ModelsSection.module.css
var ModelsSection_default = { "modelCatalogTitle": "rGVdmW_modelCatalogTitle", "modelInputChoices": "rGVdmW_modelInputChoices", "editorRoute": "rGVdmW_editorRoute", "addModelButton": "rGVdmW_addModelButton", "accountStatus": "rGVdmW_accountStatus", "editor": "rGVdmW_editor", "field": "rGVdmW_field", "keyToggle": "rGVdmW_keyToggle", "fetchDialog": "rGVdmW_fetchDialog", "linkButton": "rGVdmW_linkButton", "modelField": "rGVdmW_modelField", "title": "rGVdmW_title", "notice": "rGVdmW_notice", "modelEntry": "rGVdmW_modelEntry", "rowName": "rGVdmW_rowName", "rowActions": "rGVdmW_rowActions", "credentialDot": "rGVdmW_credentialDot", "rowIdentity": "rGVdmW_rowIdentity", "addCard": "rGVdmW_addCard", "customizedSummary": "rGVdmW_customizedSummary", "modelReasoning": "rGVdmW_modelReasoning", "modelReasoningHead": "rGVdmW_modelReasoningHead", "candidateLabel": "rGVdmW_candidateLabel", "helpButton": "rGVdmW_helpButton", "modelCatalog": "rGVdmW_modelCatalog", "iconButtonDanger": "rGVdmW_iconButtonDanger", "input": "rGVdmW_input", "candidateId": "rGVdmW_candidateId", "intro": "rGVdmW_intro", "addBlock": "rGVdmW_addBlock", "modelReasoningRow": "rGVdmW_modelReasoningRow", "candidateToolbar": "rGVdmW_candidateToolbar", "modelAdvanced": "rGVdmW_modelAdvanced", "keyInputFilled": "rGVdmW_keyInputFilled", "addActions": "rGVdmW_addActions", "candidateEmpty": "rGVdmW_candidateEmpty", "dangerButton": "rGVdmW_dangerButton", "rowTag": "rGVdmW_rowTag", "modelListHead": "rGVdmW_modelListHead", "savedNotice": "rGVdmW_savedNotice", "credentialDotConfigured": "rGVdmW_credentialDotConfigured", "rowHead": "rGVdmW_rowHead", "modelReasoningValueInput": "rGVdmW_modelReasoningValueInput", "setupCard": "rGVdmW_setupCard", "keyInput": "rGVdmW_keyInput", "error": "rGVdmW_error", "candidateList": "rGVdmW_candidateList", "modelCatalogHeading": "rGVdmW_modelCatalogHeading", "primaryButton": "rGVdmW_primaryButton", "modelEmpty": "rGVdmW_modelEmpty", "addPanel": "rGVdmW_addPanel", "modelReasoningLabel": "rGVdmW_modelReasoningLabel", "selectInput": "rGVdmW_selectInput", "editorHeader": "rGVdmW_editorHeader", "hiddenLabel": "rGVdmW_hiddenLabel", "switchThumb": "rGVdmW_switchThumb", "candidate": "rGVdmW_candidate", "advancedHint": "rGVdmW_advancedHint", "secondaryButton": "rGVdmW_secondaryButton", "editorTitle": "rGVdmW_editorTitle", "customized": "rGVdmW_customized", "addModes": "rGVdmW_addModes", "customizedBody": "rGVdmW_customizedBody", "rows": "rGVdmW_rows", "fieldLabel": "rGVdmW_fieldLabel", "credentialDotMissing": "rGVdmW_credentialDotMissing", "iconButton": "rGVdmW_iconButton", "modelInputTypes": "rGVdmW_modelInputTypes", "section": "rGVdmW_section", "modelCatalogMeta": "rGVdmW_modelCatalogMeta", "modelRow": "rGVdmW_modelRow", "deleteConfirm": "rGVdmW_deleteConfirm", "modelList": "rGVdmW_modelList", "rowCard": "rGVdmW_rowCard", "modelFieldLabel": "rGVdmW_modelFieldLabel", "addButton": "rGVdmW_addButton", "editorActions": "rGVdmW_editorActions", "deleteDialog": "rGVdmW_deleteDialog", "candidateSearch": "rGVdmW_candidateSearch" };
var styleText2 = `.rGVdmW_section {
  max-width: 720px;
  color: var(--dsw-alias-label-primary);
  flex-direction: column;
  gap: 12px;
  display: flex;
}

.rGVdmW_title {
  color: var(--dsw-alias-label-primary);
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}

.rGVdmW_intro {
  color: var(--dsw-alias-label-tertiary);
  margin: 0;
  font-size: 14px;
  line-height: 22px;
}

.rGVdmW_notice {
  color: var(--dsw-alias-state-warn-label);
  margin: 0;
  font-size: 12px;
  line-height: 18px;
}

.rGVdmW_savedNotice {
  color: var(--dsw-alias-state-success-primary);
  margin: 0;
  font-size: 12px;
  line-height: 18px;
}

.rGVdmW_rows {
  flex-direction: column;
  gap: 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
}

.rGVdmW_rowCard {
  border: .5px solid var(--dsw-alias-settings-card-stroke);
  background: var(--dsw-alias-settings-card-fill);
  border-radius: var(--dsw-radius-xl);
  flex-direction: column;
  gap: 12px;
  padding: 12px 14px;
  display: flex;
}

.rGVdmW_rowHead {
  align-items: center;
  gap: 10px;
  display: flex;
}

.rGVdmW_rowIdentity {
  align-items: center;
  gap: 6px;
  min-width: 0;
  display: inline-flex;
}

.rGVdmW_rowName {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

.rGVdmW_rowTag {
  border: .5px solid var(--dsw-alias-border-l3);
  border-radius: var(--dsw-radius-xs);
  color: var(--dsw-alias-label-secondary);
  flex: none;
  padding: 1px 6px;
  font-size: 11px;
  line-height: 16px;
}

.rGVdmW_credentialDot {
  box-sizing: border-box;
  corner-shape: round;
  border-radius: 50%;
  flex: none;
  width: 8px;
  height: 8px;
  display: inline-block;
}

.rGVdmW_credentialDotConfigured {
  background: var(--dsw-alias-state-success-primary);
}

.rGVdmW_credentialDotMissing {
  background: var(--dsw-alias-state-error-primary);
}

.rGVdmW_accountStatus {
  color: var(--dsw-alias-state-success-primary);
  flex: none;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  line-height: 20px;
  display: inline-flex;
}

.rGVdmW_rowActions {
  align-items: center;
  gap: 4px;
  margin-left: auto;
  display: inline-flex;
}

.rGVdmW_primaryButton, .rGVdmW_secondaryButton, .rGVdmW_addButton {
  box-sizing: border-box;
  border-radius: var(--dsw-radius-md);
  height: 36px;
  font: inherit;
  cursor: pointer;
  border: none;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 0 14px;
  font-size: 14px;
  line-height: 22px;
  display: inline-flex;
}

.rGVdmW_primaryButton {
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground);
}

.rGVdmW_primaryButton:hover:not(:disabled) {
  background: var(--dsw-alias-button-primary-hover);
}

.rGVdmW_secondaryButton, .rGVdmW_addButton {
  border: .5px solid var(--dsw-alias-border-l3);
  color: var(--dsw-alias-label-primary);
  background: none;
}

.rGVdmW_secondaryButton:hover:not(:disabled), .rGVdmW_addButton:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
}

.rGVdmW_secondaryButton:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-solid);
}

.rGVdmW_dangerButton {
  box-sizing: border-box;
  border-radius: var(--dsw-radius-md);
  height: 36px;
  color: var(--dsw-alias-state-error-primary);
  font: inherit;
  cursor: pointer;
  background: none;
  border: none;
  justify-content: center;
  align-items: center;
  padding: 0 14px;
  font-size: 14px;
  line-height: 22px;
  display: inline-flex;
}

.rGVdmW_dangerButton:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-danger);
}

.rGVdmW_rowActions .rGVdmW_secondaryButton, .rGVdmW_rowActions .rGVdmW_dangerButton {
  border-radius: var(--dsw-radius-sm);
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  line-height: 18px;
}

.rGVdmW_primaryButton:disabled, .rGVdmW_secondaryButton:disabled, .rGVdmW_dangerButton:disabled, .rGVdmW_addButton:disabled, .rGVdmW_linkButton:disabled, .rGVdmW_addModelButton:disabled {
  opacity: .4;
  cursor: default;
}

.rGVdmW_primaryButton:focus-visible, .rGVdmW_secondaryButton:focus-visible, .rGVdmW_dangerButton:focus-visible, .rGVdmW_addButton:focus-visible, .rGVdmW_linkButton:focus-visible, .rGVdmW_addModelButton:focus-visible, .rGVdmW_iconButton:focus-visible, .rGVdmW_customizedSummary:focus-visible {
  box-shadow: 0 0 0 2px var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline: none;
}

.rGVdmW_editor {
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-bg-module-platform);
  flex-direction: column;
  gap: 14px;
  padding: 14px 16px;
  display: flex;
}

.rGVdmW_editorHeader {
  align-items: baseline;
  gap: 8px;
  display: flex;
}

.rGVdmW_editorTitle {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

.rGVdmW_editorRoute {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.rGVdmW_field {
  flex-direction: column;
  gap: 6px;
  display: flex;
}

.rGVdmW_fieldLabel {
  color: var(--dsw-alias-label-secondary);
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  display: inline-flex;
}

.rGVdmW_helpButton {
  border: .5px solid var(--dsw-alias-border-l3);
  corner-shape: round;
  width: 16px;
  height: 16px;
  color: var(--dsw-alias-label-tertiary);
  font: inherit;
  text-align: center;
  cursor: help;
  background: none;
  border-radius: 50%;
  padding: 0;
  font-size: 11px;
  line-height: 15px;
}

.rGVdmW_helpButton:hover, .rGVdmW_helpButton:focus-visible {
  color: var(--dsw-alias-label-primary);
  border-color: var(--dsw-alias-label-tertiary);
}

.rGVdmW_linkButton {
  box-sizing: border-box;
  border-radius: var(--dsw-radius-sm);
  height: 28px;
  color: var(--dsw-alias-label-tertiary);
  font: inherit;
  cursor: pointer;
  background: none;
  border: none;
  align-items: center;
  padding: 0 10px;
  font-size: 12px;
  line-height: 18px;
  display: inline-flex;
}

.rGVdmW_linkButton:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
}

.rGVdmW_advancedHint {
  color: var(--dsw-alias-label-tertiary);
  margin: 0;
  font-size: 12px;
  line-height: 18px;
}

.rGVdmW_editorActions {
  justify-content: flex-end;
  gap: 8px;
  display: flex;
}

.rGVdmW_addBlock {
  flex-direction: column;
  gap: 12px;
  display: flex;
}

.rGVdmW_addActions {
  display: flex;
}

.rGVdmW_addButton {
  border: 1px dashed var(--dsw-alias-border-l3);
  border-radius: var(--dsw-radius-lg);
  flex: 1 1 0;
  gap: 6px;
  min-width: 180px;
  height: 44px;
}

.rGVdmW_addModes {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  display: flex;
}

.rGVdmW_addPanel {
  flex-direction: column;
  gap: 14px;
  display: flex;
}

.rGVdmW_addPanel[hidden] {
  display: none;
}

.rGVdmW_addCard, .rGVdmW_setupCard {
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-bg-module-platform);
  flex-direction: column;
  gap: 14px;
  padding: 14px 16px;
  list-style: none;
  display: flex;
}

.rGVdmW_addCard .rGVdmW_editor, .rGVdmW_setupCard .rGVdmW_editor {
  background: none;
  padding: 0;
}

.rGVdmW_customized {
  border-top: .5px solid var(--dsw-alias-border-l2);
  padding-top: 10px;
}

.rGVdmW_customizedSummary {
  border-radius: var(--dsw-radius-sm);
  cursor: pointer;
  width: fit-content;
  color: var(--dsw-alias-label-secondary);
  align-items: center;
  gap: 6px;
  margin-left: -4px;
  padding: 2px 4px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  list-style: none;
  display: flex;
}

.rGVdmW_customizedSummary::-webkit-details-marker {
  display: none;
}

.rGVdmW_customizedSummary:before {
  content: "";
  border-bottom: 1.5px solid;
  border-right: 1.5px solid;
  width: 5px;
  height: 5px;
  transition: transform .12s;
  transform: rotate(-45deg) translate(-1px, -1px);
}

.rGVdmW_customized[open] > .rGVdmW_customizedSummary:before {
  transform: rotate(45deg) translate(-1px, -1px);
}

.rGVdmW_customizedSummary:hover {
  color: var(--dsw-alias-label-primary);
}

.rGVdmW_customizedBody {
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
  display: flex;
}

.rGVdmW_modelCatalog {
  border-top: .5px solid var(--dsw-alias-border-l2);
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  display: flex;
}

.rGVdmW_modelCatalogHeading {
  flex-direction: column;
  gap: 2px;
  display: flex;
}

.rGVdmW_modelCatalogTitle {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
}

.rGVdmW_modelCatalogMeta, .rGVdmW_modelEmpty {
  color: var(--dsw-alias-label-tertiary);
  margin: 0;
  font-size: 12px;
  line-height: 18px;
}

.rGVdmW_modelList {
  flex-direction: column;
  gap: 8px;
  display: flex;
}

.rGVdmW_modelListHead {
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  display: flex;
}

.rGVdmW_modelEntry {
  border: .5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-lg);
  padding: 6px;
}

.rGVdmW_modelRow {
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 6px;
  display: grid;
}

.rGVdmW_iconButton {
  box-sizing: border-box;
  border-radius: var(--dsw-radius-sm);
  width: 28px;
  height: 28px;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  background: none;
  border: none;
  justify-content: center;
  align-items: center;
  display: inline-flex;
}

.rGVdmW_iconButton:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.rGVdmW_iconButton:disabled {
  cursor: default;
  opacity: .4;
}

.rGVdmW_iconButtonDanger:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-danger);
  color: var(--dsw-alias-state-error-primary);
}

.rGVdmW_modelAdvanced {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 8px 4px 2px;
  display: grid;
}

.rGVdmW_modelField {
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  display: flex;
}

.rGVdmW_modelInputTypes {
  border: none;
  grid-column: 1 / -1;
  min-width: 0;
  margin: 0;
  padding: 0;
}

.rGVdmW_modelInputTypes legend {
  margin-bottom: 4px;
  padding: 0;
}

.rGVdmW_modelInputChoices {
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  min-height: 32px;
  display: flex;
}

.rGVdmW_modelFieldLabel {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.rGVdmW_modelReasoning {
  flex-direction: column;
  grid-column: 1 / -1;
  gap: 6px;
  min-width: 0;
  display: flex;
}

.rGVdmW_modelReasoningLabel {
  align-items: center;
  gap: 6px;
  display: inline-flex;
}

.rGVdmW_modelReasoningHead {
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  display: flex;
}

.rGVdmW_modelReasoningRow {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  display: grid;
}

.rGVdmW_modelReasoningRow .rGVdmW_selectInput {
  max-width: none;
}

.rGVdmW_modelReasoningValueInput {
  font-family: var(--ds-font-family-code);
  font-size: 13px;
}

.rGVdmW_modelEmpty {
  border: 1px dashed var(--dsw-alias-border-l3);
  border-radius: var(--dsw-radius-lg);
  text-align: center;
  padding: 12px;
}

.rGVdmW_addModelButton {
  box-sizing: border-box;
  border: .5px solid var(--dsw-alias-border-l3);
  border-radius: var(--dsw-radius-sm);
  height: 28px;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  cursor: pointer;
  background: none;
  align-self: flex-start;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  font-size: 12px;
  line-height: 18px;
  display: inline-flex;
}

.rGVdmW_addModelButton:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
}

.rGVdmW_input {
  box-sizing: border-box;
  border: .5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-md);
  width: 100%;
  height: 32px;
  font: inherit;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  padding: 0 10px;
  font-size: 14px;
  line-height: 22px;
}

select.rGVdmW_input {
  cursor: pointer;
  max-width: 240px;
}

.rGVdmW_input:focus {
  border-color: var(--dsw-alias-state-business-primary);
  outline: none;
}

.rGVdmW_input::placeholder {
  color: var(--dsw-alias-label-dimmed);
}

.rGVdmW_input:disabled {
  opacity: .6;
  cursor: default;
}

.rGVdmW_keyInput {
  position: relative;
}

.rGVdmW_keyInputFilled {
  padding-right: 40px;
}

.rGVdmW_keyToggle {
  border-radius: var(--dsw-radius-md);
  width: 32px;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  background: none;
  border: none;
  justify-content: center;
  align-items: center;
  padding: 0;
  display: inline-flex;
  position: absolute;
  inset: 1px 1px 1px auto;
}

.rGVdmW_keyToggle:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary);
}

.rGVdmW_keyToggle:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: -2px;
}

.rGVdmW_keyToggle:disabled {
  opacity: .6;
  cursor: default;
}

.rGVdmW_selectInput {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 12px 12px;
  padding-right: 32px;
}

.rGVdmW_error {
  color: var(--dsw-alias-state-error-primary);
  margin: 0;
  font-size: 12px;
  line-height: 18px;
}

.rGVdmW_deleteDialog {
  width: min(480px, 100%);
}

.rGVdmW_deleteConfirm:not(:disabled) {
  border-color: var(--dsw-alias-state-error-primary);
  color: var(--dsw-alias-state-error-primary);
}

.rGVdmW_deleteConfirm:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-danger);
}

.rGVdmW_hiddenLabel {
  clip: rect(0 0 0 0);
  white-space: nowrap;
  width: 1px;
  height: 1px;
  position: absolute;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .rGVdmW_customizedSummary:before, .rGVdmW_switchThumb {
    transition: none;
  }
}

.rGVdmW_fetchDialog {
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  max-width: 520px;
}

.rGVdmW_candidateToolbar {
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  display: flex;
}

.rGVdmW_candidateSearch {
  flex: 240px;
  min-width: 0;
}

.rGVdmW_candidateList {
  flex-direction: column;
  gap: 2px;
  max-height: 320px;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  overflow-y: auto;
}

.rGVdmW_candidate {
  border-radius: var(--dsw-radius-md);
}

.rGVdmW_candidateLabel {
  cursor: pointer;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  display: flex;
}

.rGVdmW_candidateId {
  min-width: 0;
  font-family: var(--ds-font-family-code);
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: auto;
  font-size: 13px;
  overflow: hidden;
}

.rGVdmW_candidateEmpty {
  color: var(--dsw-alias-label-secondary);
  text-align: center;
  margin: 24px 0;
  font-size: 13px;
  line-height: 20px;
}
`;

// src/client/CodexSignIn.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function CodexSignIn({ operations: operations2, t }) {
  const [view, setView] = (0, import_react2.useState)();
  const [failed, setFailed] = (0, import_react2.useState)(false);
  const [manual, setManual] = (0, import_react2.useState)("");
  const popup = (0, import_react2.useRef)(null);
  const navigated = (0, import_react2.useRef)(false);
  const mounted = (0, import_react2.useRef)(true);
  const attempt = (0, import_react2.useRef)(void 0);
  const revision = (0, import_react2.useRef)(0);
  const active = view?.phase === "starting" || view?.phase === "waiting";
  (0, import_react2.useEffect)(() => {
    mounted.current = true;
    let live = true;
    const current = revision.current;
    void operations2.status().then((value) => {
      if (live && revision.current === current) setView(value);
    }).catch(() => {
      if (live && revision.current === current) setFailed(true);
    });
    return () => {
      live = false;
      mounted.current = false;
      popup.current?.close();
      if (attempt.current !== void 0) void operations2.cancel(attempt.current).catch(() => void 0);
    };
  }, [operations2]);
  (0, import_react2.useEffect)(() => {
    if (!active) return;
    let live = true;
    const current = revision.current;
    const timer = setTimeout(() => {
      void operations2.status().then((value) => {
        if (live && revision.current === current) setView(value);
      }).catch(() => {
        if (live && revision.current === current) setFailed(true);
      });
    }, 800);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [active, operations2, view]);
  (0, import_react2.useEffect)(() => {
    attempt.current = active ? view.id : void 0;
    if (view?.url && !navigated.current) {
      const url = new URL(view.url);
      if (url.protocol === "https:" && url.hostname === "auth.openai.com") {
        navigated.current = true;
        popup.current?.location.replace(url.href);
      }
    }
    if (view && !["starting", "waiting"].includes(view.phase)) {
      if (view.phase !== "succeeded" || !navigated.current) popup.current?.close();
      popup.current = null;
    }
  }, [active, view]);
  const start = () => {
    revision.current++;
    setFailed(false);
    navigated.current = false;
    popup.current = window.open("about:blank", "_blank");
    if (popup.current) popup.current.opener = null;
    void operations2.start().then((value) => {
      if (!mounted.current) {
        if (value.id !== void 0) void operations2.cancel(value.id).catch(() => void 0);
        return;
      }
      setView(value);
    }).catch(() => {
      popup.current?.close();
      popup.current = null;
      setFailed(true);
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: ModelsSection_default["field"], children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: ModelsSection_default["secondaryButton"], disabled: active, onClick: start, children: t("codexSignIn") }),
    view?.configured ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: ModelsSection_default["savedNotice"], children: t("accountSignedIn") }) : null,
    active ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: ModelsSection_default["advancedHint"], children: t("codexWaiting") }) : null,
    active && view.url ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("a", { href: view.url, target: "_blank", rel: "noopener noreferrer", children: t("codexOpen") }) : null,
    active && view.prompt && view.id ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: ModelsSection_default["fieldLabel"], htmlFor: "codex-manual", children: t("codexManual") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("input", { id: "codex-manual", className: ModelsSection_default["input"], value: manual, onChange: (event) => {
        setManual(event.target.value);
      } }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: ModelsSection_default["secondaryButton"], disabled: !manual.trim(), onClick: () => {
        revision.current++;
        const id = view.id;
        if (id !== void 0) void operations2.answer(id, manual.trim()).then(setView).catch(() => {
          setFailed(true);
        });
        setManual("");
      }, children: t("codexSubmit") })
    ] }) : null,
    active && view.id ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: ModelsSection_default["secondaryButton"], onClick: () => {
      revision.current++;
      popup.current?.close();
      popup.current = null;
      const id = view.id;
      if (id !== void 0) void operations2.cancel(id).then(setView).catch(() => {
        setFailed(true);
      });
    }, children: t("cancel") }) : null,
    failed || view?.phase === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: ModelsSection_default["error"], children: t("codexFailed") }) : null
  ] });
}

// src/client/operations.ts
async function call(action, parameters = {}) {
  const response = await fetch("/api/dsh-codex-workbench", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, ...parameters })
  });
  if (!response.ok) throw new Error("Codex operation failed");
  const data = await response.json();
  if (!data.ok) throw new Error("Codex operation failed");
  return data.value;
}
var operations = {
  status: () => call("state"),
  start: () => call("start"),
  cancel: (id) => call("cancel", { id }),
  answer: (id, value) => call("answer", { id, value }),
  quota: () => call("quota"),
  reset: (key, owner) => call("reset", { key, owner })
};

// src/client/locales.ts
var en = {
  accountSignedIn: "Signed in",
  codexSignIn: "Sign in with ChatGPT",
  codexWaiting: "Complete sign-in in the browser.",
  codexOpen: "Open sign-in page",
  codexFailed: "Sign-in failed. Try again.",
  codexManual: "If automatic sign-in does not finish, paste the redirect URL here.",
  codexSubmit: "Continue",
  cancel: "Cancel",
  "quota.loading": "Loading Codex quota",
  "quota.error": "Could not load Codex quota. Click to retry.",
  "quota.empty": "Codex did not provide quota information. Click to retry.",
  "quota.summary": "Codex quota remaining: {details}. Click to refresh.",
  "quota.window": "{window}: {percent}% remaining, resets {reset}",
  "quota.resetUnknown": "unknown",
  "quota.title": "Usage remaining",
  "quota.weekly": "Weekly",
  "reset.available": "Saved resets: {count}",
  "reset.action": "Use a reset",
  "reset.confirmText": "Use one saved reset? Eligible 5-hour and weekly limits will reset, and their renewal times may change.",
  "reset.confirm": "Confirm reset",
  "reset.pending": "Applying reset\u2026",
  "reset.unknown": "The result is unknown. Retry the same request before using another reset.",
  "reset.retry": "Retry same request",
  "reset.storage": "Cannot safely save this request in the browser. Check browser storage and try again.",
  "reset.done": "Reset applied. Quota is refreshing.",
  "reset.nothing": "No eligible usage to reset.",
  "reset.noCredit": "No applicable reset is available.",
  "reset.redeemed": "This request was already processed. Check the refreshed quota."
};
var zh = {
  accountSignedIn: "\u5DF2\u767B\u5F55",
  codexSignIn: "\u4F7F\u7528 ChatGPT \u767B\u5F55",
  codexWaiting: "\u8BF7\u5728\u6D4F\u89C8\u5668\u4E2D\u5B8C\u6210\u767B\u5F55\u3002",
  codexOpen: "\u6253\u5F00\u767B\u5F55\u9875\u9762",
  codexFailed: "\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002",
  codexManual: "\u5982\u679C\u81EA\u52A8\u767B\u5F55\u672A\u5B8C\u6210\uFF0C\u8BF7\u5728\u6B64\u7C98\u8D34\u91CD\u5B9A\u5411\u7F51\u5740\u3002",
  codexSubmit: "\u7EE7\u7EED",
  cancel: "\u53D6\u6D88",
  "quota.loading": "\u6B63\u5728\u52A0\u8F7D Codex \u989D\u5EA6",
  "quota.error": "\u65E0\u6CD5\u52A0\u8F7D Codex \u989D\u5EA6\uFF0C\u70B9\u51FB\u91CD\u8BD5",
  "quota.empty": "Codex \u672A\u63D0\u4F9B\u989D\u5EA6\u4FE1\u606F\uFF0C\u70B9\u51FB\u91CD\u8BD5",
  "quota.summary": "Codex \u5269\u4F59\u989D\u5EA6\uFF1A{details}\u3002\u70B9\u51FB\u5237\u65B0",
  "quota.window": "{window}\uFF1A\u5269\u4F59 {percent}%\uFF0C\u91CD\u7F6E\u65F6\u95F4 {reset}",
  "quota.resetUnknown": "\u672A\u77E5",
  "quota.title": "\u5269\u4F59\u989D\u5EA6",
  "quota.weekly": "\u6BCF\u5468",
  "reset.available": "\u53EF\u7528\u91CD\u7F6E\u6B21\u6570\uFF1A{count}",
  "reset.action": "\u4F7F\u7528\u4E00\u6B21\u91CD\u7F6E",
  "reset.confirmText": "\u4F7F\u7528\u4E00\u6B21\u5DF2\u4FDD\u5B58\u7684\u91CD\u7F6E\uFF1F\u7B26\u5408\u6761\u4EF6\u7684 5 \u5C0F\u65F6\u548C\u6BCF\u5468\u9650\u989D\u5C06\u91CD\u7F6E\uFF0C\u66F4\u65B0\u65F6\u95F4\u53EF\u80FD\u6539\u53D8\u3002",
  "reset.confirm": "\u786E\u8BA4\u91CD\u7F6E",
  "reset.pending": "\u6B63\u5728\u91CD\u7F6E\u2026",
  "reset.unknown": "\u7ED3\u679C\u672A\u77E5\u3002\u4F7F\u7528\u5176\u4ED6\u91CD\u7F6E\u4E4B\u524D\uFF0C\u8BF7\u91CD\u8BD5\u540C\u4E00\u8BF7\u6C42\u3002",
  "reset.retry": "\u91CD\u8BD5\u540C\u4E00\u8BF7\u6C42",
  "reset.storage": "\u65E0\u6CD5\u5728\u6D4F\u89C8\u5668\u4E2D\u5B89\u5168\u4FDD\u5B58\u8BF7\u6C42\u3002\u8BF7\u68C0\u67E5\u6D4F\u89C8\u5668\u5B58\u50A8\u540E\u91CD\u8BD5\u3002",
  "reset.done": "\u5DF2\u91CD\u7F6E\u3002\u6B63\u5728\u5237\u65B0\u9650\u989D\u3002",
  "reset.nothing": "\u6CA1\u6709\u7B26\u5408\u91CD\u7F6E\u6761\u4EF6\u7684\u4F7F\u7528\u91CF\u3002",
  "reset.noCredit": "\u6CA1\u6709\u53EF\u7528\u7684\u91CD\u7F6E\u6B21\u6570\u3002",
  "reset.redeemed": "\u6B64\u8BF7\u6C42\u5DF2\u5904\u7406\u3002\u8BF7\u67E5\u770B\u5237\u65B0\u540E\u7684\u9650\u989D\u3002"
};

// src/client/index.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var inject = ["slots", "locale", "modelDirectories", "sessions", "remote", "remote.session"];
function apply(ctx) {
  ctx.effect(() => {
    const style = document.createElement("style");
    style.textContent = styleText + "\n" + styleText2;
    document.head.append(style);
    return () => style.remove();
  }, "codex-workbench: styles");
  ctx.effect(() => ctx.locale.register("codex-workbench", { en, zh }), "codex-workbench: translations");
  const t = ctx.locale.bind("codex-workbench");
  const Card = ({ provider }) => provider.provider === "openai-codex" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CodexSignIn, { operations, t }) : null;
  ctx.slots.inject("settings.models.provider-card", () => ctx.slots.register({
    name: "settings.models.provider-card",
    key: "llm-pi-ai"
  }, Card));
  ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
    name: "conversation.input.right",
    id: "codex-workbench-quota",
    locale: "codex-workbench",
    inject: (sessionId) => ({
      directory: ctx.modelDirectories.directoryFor(brandString(sessionId)).store,
      loadQuota: operations.quota,
      redeemReset: operations.reset,
      hooks: { locale: ctx.locale }
    })
  }, CodexQuota));
}
return module.exports;}});
