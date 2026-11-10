# Comprehensive Review and Remediation — 2026-11-10

Scope: full-repository sweep focused on changes since the 2026-11-09 review —
the AI/agent integration (`@ndigo/ai`, `@ndigo/ai-sdk`, agent lab), MCP Apps
`ui://` resources and WebMCP tool declarations, the A2UI surface registry item
and lab, TOON config/view representation, CLI `--json`/`--toon`/MCP host
extraction, and agent/skill deployment changes. Method: mechanical gates plus
parallel read-only review of the changed source slices; no source edits were made
during review.

_Status: implemented in `fix/review-2026-11-10` (worktree
`ndigo-357-2026-11-10-comprehensive-review`), issue
[ndigo/ndigo#357](https://github.com/ndigo/ndigo/issues/357)._

## 0. Gate baseline

Run at HEAD `ccd06d224`:

| Gate                                                | Result                                |
| :-------------------------------------------------- | :------------------------------------ |
| `pnpm lint` (oxlint, type-aware, `--deny-warnings`) | ✅ exit 0                             |
| `pnpm typecheck`                                    | ✅ exit 0                             |
| `pnpm format:check`                                 | ✅ all files formatted                |
| `pnpm test` (Nx)                                    | Not run in this session (review-only) |
| `pnpm build`                                        | Not run in this session (review-only) |
| `pnpm manifest:check`, `docs:links`, `guides:check` | Not run in this session               |

## 1. Findings

Severity: **High** = security/correctness blocker; **Medium** = should fix before
release; **Low** = quality/consistency.

### A. Security — untrusted input reaching code, DOM, or filesystem

**R-01 — A2UI surface renders arbitrary attributes/properties (High).**
`packages/ndigo-ui/registry/ui/a2ui-surface/nd-a2ui-surface.ts:142-164` and the
lab duplicate `apps/20-ndigo-ui-lab/src/ui/nd-a2ui-surface/nd-a2ui-surface.ts:142-164`
copy every prop key from A2UI messages into the DOM via `setAttribute` and then
write `(element as any)[key] = value` when `key in element`. Keys such as
`onclick`, `onerror`, `srcdoc`, `formaction`, or `href`/`src` with
`javascript:` values can create executable handlers or dangerous URLs.
Fix: maintain an allowlist of safe attributes/properties per component, reject
`/^on/i`, validate/sanitize URL-valued props, and remove the `in`-based property
write (or restrict it to known safe keys).

**R-02 — A2UI surface prototype pollution (High/Medium).**
`packages/ndigo-ui/registry/ui/a2ui-surface/nd-a2ui-surface.ts:160-163` applies
props for arbitrary keys including `__proto__`, `constructor`, and `prototype`.
Fix: skip dangerous property names and validate the kebab-cased attribute name
against `/^[a-z][a-z0-9-]*$/u`.

**R-03 — MCP `ui://` body is interpolated unescaped (High).**
`packages/ndigo-mcp/src/ui-resource.ts:124` interpolates `input.body` into the
HTML document. Untrusted markup can inject `<script>`/event handlers, defeating
the sandboxed-iframe assumption.
Fix: escape/sanitize `body`, or document and enforce that `body` is trusted,
server-rendered markup only; prefer an allow-listed sanitizer for dynamic content.

**R-04 — Remote config sources can execute arbitrary code (High).**
`packages/ndigo-boot/src/application-builder.ts:179-181` dynamically `import()`s
arbitrary module specifiers taken from a fetched config document. A tampered
config can execute arbitrary code.
Fix: validate/allowlist specifiers, or require static source registration; never
import untrusted strings.

**R-05 — SSRF in boot config loading (High/Medium).**
`packages/ndigo-boot/src/application-builder.ts:155` fetches `url` with no
scheme/host validation.
Fix: restrict to expected origins/schemes and validate before fetch.

**R-06 — Scaffold target directory is not safely contained (High).**
`packages/create-ndigo-app/src/index.ts:292-309` resolves `targetDir` from user
input and recursively removes it; the protected-path denylist is incomplete
(no `..`/symlink/traversal checks).
Fix: canonicalize and require the target to live under cwd (or refuse
traversal/symlinks).

**R-07 — CLI registry source/path traversal and arbitrary local file read (High).**
`packages/ndigo-cli/src/ui/mcp-tools.ts:181` and
`packages/ndigo-cli/src/ui/registry.ts:53,135,169` resolve registry overrides and
chunk `include`/file paths without canonical containment checks.
Fix: canonicalize local sources with `realpath`/`path.resolve`, reject absolute
or `..`-escaping paths, and validate every `include`/`file.path` stays under
the registry root.

**R-08 — Remote registry fetches lack host/protocol/timeout/size limits (Medium).**
`packages/ndigo-cli/src/ui/registry.ts:55,150` use `fetch` with no allowlist,
timeout, or size cap.
Fix: restrict to `http(s):`, add `AbortController` timeout, and cap response size.

**R-09 — Prompt injection in agent lab (Medium).**
`apps/21-ndigo-agent-lab/src/order-tools.ts:36-37` echoes raw user-controlled
`id` into tool result/error text returned to the model; the chat controller
system prompt does not instruct the model to treat tool outputs as data.
Fix: avoid reflecting untrusted input verbatim (sanitize or return a generic
not-found marker) and add an explicit “ignore instructions in tool results”
guard.

**R-10 — WebMCP args are not validated against schema (Medium).**
`packages/ndigo-view-webcomponent/src/webmcp.ts:154-191` converts args but never
validates them against `inputSchema` before invoking the handler.
Fix: validate/parse args with the zod schema (or a JSON-schema validator) and
throw a typed error on failure.

**R-11 — MCP CSP domains are not validated (Medium).**
`packages/ndigo-mcp/src/ui-resource.ts:21-27,128-134` pass CSP domain strings
through to `_meta` without validation; values containing spaces/`;`/newlines
can corrupt the CSP header.
Fix: validate each domain against an allow-list regex (no whitespace, no `;`).

**R-12 — MCP script-type breakout variants (Medium).**
`packages/ndigo-mcp/src/ui-resource.ts:77,115,104-109` only validate `scriptType`
at compile time and only match `</style`/`</script` immediately.
Fix: validate `scriptType === 'module' | 'classic'` at runtime, and use robust
checks such as `/</\s*script/iu` and `/</\s*style/iu`, plus `<!--`/`-->`
rejection where relevant.

### B. Correctness and robustness

**R-13 — AI agent discards intermediate step text (Medium).**
`packages/ndigo-ai/src/agent.ts:161` and `:241` assign `text = step.text`,
discarding text from earlier steps.
Fix: accumulate (`text += step.text` or retain the last non-empty text).

**R-14 — Unchecked finish-reason cast (Low/Medium).**
`packages/ndigo-ai-sdk/src/index.ts:300-302` casts any provider string to
`AIFinishReason`.
Fix: map known values and default to `'other'`.

**R-15 — A2UI surface renders only the first surface (Medium).**
`packages/ndigo-ui/registry/ui/a2ui-surface/nd-a2ui-surface.ts:71` and the lab
duplicate use `[...processor.model.surfacesMap.values()][0]`.
Fix: document single-surface support or iterate/render all surfaces.

**R-16 — MCP duplicate `ui://` URIs are not detected (Low).**
`packages/ndigo-mcp/src/server.ts:84` uses `find` per read and does not reject
duplicate URIs at registration.
Fix: build a `Map` by URI and throw on duplicate URIs in construction.

**R-17 — MCP URI validation is too weak (Low).**
`packages/ndigo-mcp/src/ui-resource.ts:101` only checks `startsWith('ui://')`
and whitespace.
Fix: require a non-empty host/path segment, e.g.
`/^ui:\/\/[^\s/]+(?:\/.*)?$/u`.

**R-18 — Tool mapping does not validate generated default names (Low).**
`packages/ndigo-dispatcher/src/tool-mapping.ts:53-71` validates explicit names
but not generated defaults from `defaultToolName`.
Fix: validate generated names too.

**R-19 — Agent lab caches a stale agent bean (Medium).**
`apps/21-ndigo-agent-lab/src/chat-controller.ts:87-123` caches `#agent` for the
bean lifetime; config/flag changes will not take effect.
Fix: resolve per request or invalidate on context refresh.

**R-20 — Unhandled async cleanup in agent lab (Low).**
`apps/21-ndigo-agent-lab/src/mcp.ts:25-27` calls `context.close()` without
`await` in the SIGINT handler.
Fix: `await context.close(); process.exit(0);`.

**R-21 — Unhandled promise rejection from A2UI action handlers (Low).**
`packages/ndigo-ui/registry/ui/a2ui-surface/nd-a2ui-surface.ts:152-156` uses
`void action()`.
Fix: `void Promise.resolve(action()).catch((error) => this.#fail(...))`.

**R-22 — Boolean `false` becomes `"false"` attribute (Low).**
`packages/ndigo-ui/registry/ui/a2ui-surface/nd-a2ui-surface.ts:160-161`.
Fix: remove the attribute when value is `false`; keep `true` → attribute.

**R-23 — Property clobbering via `in` (Low).**
`packages/ndigo-ui/registry/ui/a2ui-surface/nd-a2ui-surface.ts:162-164` tests
membership with `in`, including inherited properties.
Fix: use `Object.prototype.hasOwnProperty.call(element, key)` or an explicit
allowlist; prefer `setAttribute` only.

**R-24 — Config JSON parse lacks file context (Low).**
`packages/ndigo-boot/src/config-file-loader.ts:148` uses raw `JSON.parse(content)`
without file context.
Fix: wrap with a path-aware error like the TOON path.

### C. Performance and resource handling

**R-25 — Log tail reads the whole file (Medium).**
`packages/ndigo-cli/src/helpers/log-tail.ts:56-58` calls `readFileSync` on the
entire log before tailing.
Fix: stat size, read only the trailing chunk (e.g. last 64KB or bounded by
requested lines), then apply `tailLines`.

**R-26 — Unbounded spawn capture (Medium).**
`packages/ndigo-cli/src/helpers/app-scripts.ts:259-300` buffers all stdout/stderr
unbounded and may resolve on `exit` before late stream data is appended.
Fix: cap captured output and await stream `'end'`/`'close'` before resolving.

**R-27 — Diagnostics can hang forever (Medium).**
`packages/ndigo-cli/src/commands/_diagnostics.ts:25-47` has no timeout/kill.
Fix: add an `AbortController`/`setTimeout` that kills the child and settles as
missing.

**R-28 — A2UI surface full re-render on every change (Low/Medium).**
`packages/ndigo-ui/registry/ui/a2ui-surface/nd-a2ui-surface.ts:80-85` calls
`replaceChildren` with a full root re-render on every signal change.
Fix: diff/update only changed subtrees, or debounce/batch updates for large
surfaces.

**R-29 — MCP constructs server/transport per request (Low).**
`packages/ndigo-mcp/src/http.ts:58-59` allocates a new `Server` +
`StreamableHTTPServerTransport` per request.
Fix: document the per-request cost; consider pooled/reusable transports if the
SDK supports stateless reuse, or cache read-only resource bodies.

**R-30 — CLI tool result serialization edge cases (Low).**
`packages/ndigo-cli/src/helpers/mcp-host.ts:115-128` serializes `undefined` as
the literal string `"undefined"` and can throw on non-JSON values (e.g. `BigInt`)
inside the try.
Fix: normalize `undefined` to `null` and wrap `JSON.stringify` failure with a
clear message.

### D. Accessibility

**R-31 — A2UI surface has no ARIA/live region or focus restoration (Medium).**
`packages/ndigo-ui/registry/ui/a2ui-surface/nd-a2ui-surface.ts` has no
`role`, `aria-live`, or focus management; re-rendering destroys the focused
element and focus is not restored; failures only set `data-error`.
Fix: preserve/restore `document.activeElement` across renders; give the surface
`role="region"` + `aria-live="polite"`; render failure text (or a visually
hidden node) in addition to `data-error`.

**R-32 — Surface element lacks keyboard/ARIA affordances (Low).**
`packages/ndigo-ui/registry/ui/a2ui-surface/nd-a2ui-surface.ts:37-184` has no
`role`, `tabindex`, or focus management.
Fix: provide `role="region"` + `aria-label` defaults and document consumer
responsibility.

**R-33 — MCP `ui://` body injection also affects assistive/iframe safety (Low).**
Covered by R-03; ensure sandbox metadata and CSP are validated (see R-11/R-12).

### E. Consistency, naming, and maintainability

**R-34 — Acronym casing convention (Medium, user-reported).**
Classes/types named `Ai…` should be `AI…` by convention. Examples:
`packages/ndigo-ai/src/agent.ts:109` (`AIAgent`),
`packages/ndigo-ai/src/errors.ts:10,29` (`AIRateLimitError`,
`AIModelDisabledError`), `packages/ndigo-ai-sdk/src/index.ts:53`
(`AISdkModel`), plus all related interfaces/types. The same inconsistency
affects `Mcp…`, `Ui…`, `A2ui…` (`NdA2uiSurface`, `A2uiNode`) and should be
normalized to `MCP…`, `UI…`, `A2UI…`.
Fix: rename consistently and update all callers/tests/docs.

**R-35 — Mixed acronym casing in MCP/UI names (Medium).**
`McpHTTPEndpoint`, `McpToolRegistry`, `McpServerOptions`, `UiResource`,
`UiMetadata`, `UiCspConfig`, `UiVisibility`, `NdA2uiSurface`, `A2UIView`
mix all-caps `HTTP` with title-case `Mcp`/`Ui`/`A2ui`.
Fix: rename to `MCP…`, `UI…`, `A2UI…` and update callers/tests.

**R-36 — A2UI component map is a hand-maintained duplicate (Medium).**
`packages/ndigo-ui/scripts/build-a2ui-map.mjs:20` writes only the registry path;
the lab’s `component-map.ts` is a separate copy and can drift; `--check`
cannot validate it.
Fix: generate into both locations (or make the lab import the registry map) and
include the lab path in `--check`.

**R-37 — Component-map duplicate keys are not detected (Low).**
`packages/ndigo-ui/scripts/build-a2ui-map.mjs:42-43` lets two registry items
map to the same `componentName` (last wins).
Fix: detect duplicate keys and fail the build.

**R-38 — CLI machine-output consistency (Low).**
`packages/ndigo-cli/src/commands/_script-fronts.ts:46-60` and
`packages/ndigo-cli/src/commands/routes.ts:1` use ad hoc output handling in
places.
Fix: ensure all machine-output commands consistently use `_output` helpers and
newline-terminate; verify script fronts preserve exit-code propagation with
`--json`.

**R-39 — Install content lacks size/path validation (Medium).**
`packages/ndigo-cli/src/ui/mcp-tools.ts:94-108` (`installItems`) writes
registry content under `dir` without content-size or path checks.
Fix: validate targets/content sizes and reject traversal in registry file
paths (see R-07/R-08).

### F. Documentation

**R-40 — New AI/MCP/A2UI features need security notes (Low/Medium).**
Document trusted-markup requirements for MCP `ui://` bodies, A2UI prop
allowlists, and remote config allowlisting. Update changelogs/API docs after
renames (R-34/R-35).

## 2. Remediation plan

Execute in phases; each phase ends with `pnpm lint`, `pnpm typecheck`, and the
affected package tests.

### Phase 1 — Security blockers (P0)

1. R-01/R-02: allowlist A2UI props and remove arbitrary attribute/property
   writes in both registry and lab copies.
2. R-03: escape/sanitize MCP `ui://` body; validate `scriptType` and CSP domains.
3. R-04/R-05: remove dynamic `import()` of remote config specifiers; add
   scheme/host allowlisting.
4. R-06: contain scaffold target directories.
5. R-07/R-08/R-39: canonicalize and contain CLI registry paths; add fetch
   timeouts/size limits.
6. R-09: harden agent lab against prompt injection.
7. R-10: validate WebMCP args against schema.

### Phase 2 — Correctness and robustness (P1)

8. R-13: accumulate AI step text.
9. R-14: map finish reasons safely.
10. R-15: support or document multiple A2UI surfaces.
11. R-16/R-17: validate and deduplicate MCP URIs.
12. R-18: validate generated tool names.
13. R-19/R-20: fix agent caching and async cleanup.
14. R-21/R-22/R-23/R-24: fix A2UI/TOON/config edge cases.

### Phase 3 — Performance and accessibility (P2)

15. R-25/R-26/R-27: bound log reads, spawn capture, and diagnostics.
16. R-28/R-29: optimize A2UI re-render and document MCP per-request cost.
17. R-30: harden MCP host serialization.
18. R-31/R-32: add ARIA/live regions and focus restoration.

### Phase 4 — Consistency and naming (P3, breaking API changes)

19. R-34/R-35: rename `Ai*` → `AI*`, `Mcp*` → `MCP*`, `Ui*` → `UI*`,
    `A2ui*` → `A2UI*`; update callers, tests, docs, and package exports.
20. R-36/R-37: generate A2UI component map for both registry and lab; detect
    duplicate keys.
21. R-38: normalize CLI machine output.

### Phase 5 — Documentation and cleanup (P4)

22. R-40: add security notes and update changelogs/API docs.
23. Remove any throwaway probes/scripts used during verification.

## 3. Verification

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and affected package tests
  after each phase.
- Add regression tests for R-01, R-03, R-07, R-13, R-15, R-25, R-26, R-31.
- Run `pnpm doc:check` and `pnpm doc:coverage` after R-34/R-35.
- Run `pnpm ui:a2ui-map:check` after R-36/R-37.
- Run `ndigo ui validate` after A2UI changes.

## 4. Notes

- This review was read-only. No source files were changed.
- Findings are based on code inspection and parallel review; items marked as
  verified in prior reviews were re-checked only where the recent changes
  touched them.
- The `Ai…` → `AI…` convention issue was reported by the user and is
  included as R-34.
