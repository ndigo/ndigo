# 2026-10-05 TOON support — opt-in authoring format (not a JSON replacement)

**Status:** Phases 0–1 landed 2026-10-05 (owner-confirmed dependency shape);
Phase 2 (docs) landed with the guide section below; Phase 3 (`fromConfig`)
deferred until a consumer asks. The pin advanced to `4.4.0` (spec v4.4) on
2026-10-31 via the October dependency train (#36). Ratified by
[ADR-66](../decisions/2026-10-05_AD66_TOON_OPTIN_SUPPORT.md).

**Context:** [TOON](https://github.com/toon-format/toon) (Token-Oriented
Object Notation, spec v4.1, 2026-07-26) is a line-oriented, indentation-based
**encoding of the JSON data model** — lossless `encode`/`decode` round-trip,
deterministic output, four structural forms (inline, list, tabular, keyed
tabular). Purpose-built for LLM prompts/token economy. Reference SDK
`@toon-format/toon@4.1.1`: ESM-only, **zero runtime dependencies**, 113 KB
unpacked, `sideEffects: false`, MIT, SLSA-provenance npm.

**Provisional status (spec §17–§19):** Working Draft; `text/toon` is a
_provisional_ media type, no IANA registration requested yet; community
spec, not standards-track; no formal patent review. Reserved structural
characters retain meaning across versions (§18).

## 1. Problem

ndigo config surface is JSON-only by design ([AD-13]'s "JSON only (boring,
structured, no YAML dep)"). JSON config files cannot carry comments, give
position-only parse errors, and repeat structure for uniform maps/tables.
TOON offers comments (full-line `#`), strict-mode diagnostics (declared
`[N]`/`{fields}` count and width checks), and deterministic grammar — at
zero token-efficiency relevance for config (config files are small, nested,
0% tabular-eligible: TOON ≈ +7% vs minified JSON on that profile in the
upstream benchmarks).

Question: which ndigo surfaces, if any, should gain opt-in TOON support
before 1.0 — without letting a Working-Draft format into internals, wire
contracts, or defaults?

## 2. Candidate surface & verdict

| Surface                                                                                      | Where                                               | Verdict                                                                                                                                                                                                                |
| :------------------------------------------------------------------------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MediaTypes` token (`text/toon`)                                                             | `@ndigo/core` `media-types.ts`                      | ✅ **Phase 0 — landed.** Inert, typed, zero-dep; negotiable only when a user composes it (view/interceptor). `getDefaultCharset()` already yields `utf-8` for `text/*` → `text/toon;charset=utf-8`, matching spec §17. |
| `application.json` config files                                                              | `@ndigo/boot` `StandardConfigFileLoader`            | ✅ **Phase 1 — landed.** Decode-only `.toon` variant feeding the same `JSONObject` merge pipeline. Opt-in, reversible, no default change.                                                                              |
| `ApplicationBuilder.fromConfig(url)`                                                         | `@ndigo/boot`                                       | 🟡 **Phase 3 — optional.** Auto-detect by URL extension / `format` option; single-shot bootstrap, low value.                                                                                                           |
| Config server wire format                                                                    | `@ndigo/context` `RemotePropertySource`             | ❌ Never — external contract; ETag/last-good/304 logic is JSON-shaped.                                                                                                                                                 |
| Wire formats (HTTP views, SSE, WebSocket/STOMP, mock-http)                                   | ndigo-view, ndigo-service, ndigo-socket, ndigo-test | ❌ Never — interop surface, IANA-registered media-types territory.                                                                                                                                                     |
| Storage (Redis codec envelope, LibSQL session/roles, cookies, local-storage resource loader) | ndigo-redis, ndigo-orm-drizzle, platform-web        | ❌ Never — existing data, no format migration.                                                                                                                                                                         |
| OIDC discovery/JWKS, `parseBody('application/json')`                                         | auth-client, platform-node                          | ❌ Never — external protocols.                                                                                                                                                                                         |
| Content-negotiation defaults (`.toon` path-extension mapping, default view)                  | ndigo-view                                          | ❌ Never — would make an unregistered type framework-negotiable globally.                                                                                                                                              |

Non-negotiable invariants (recheck on every phase): JSON remains the
default; **decode-only** (no encoder in framework internals); merge
semantics/precedence/zod schema validation untouched (TOON decodes to the
plain JSON model); no IANA-dependent behavior.

## 3. Phases

### Phase 0 — `MediaTypes.TEXT_TOON` (landed, 2026-10-05)

`export const TEXT_TOON = MediaType.registered('text', 'toon')` in
`packages/ndigo-core/src/media-types.ts` + pinning test in
`media-type.spec.ts` (registry identity, baseType, utf-8 default charset,
`text/*` negotiation match). 40/40 ndigo-core media-type tests green.
**No framework behavior change** — the token is material only when a user
composes it.

### Phase 1 — decode-only `.toon` config files (landed)

- `StandardConfigFileLoader.addLocation` probes `${fileName}.json` then
  `${fileName}.toon` (JSON wins on collision; formats never mix within one
  logical file). Profile variants and `NDIGO_CONFIG_IMPORT` files inherit the
  probing rule. Optional explicit override: `baseName` → `format: 'json' |
  'toon' | 'auto'` (default `auto`).
- Parse via `decode()` from `@toon-format/toon` (strict mode, default),
  producing a `JSONObject`; feed existing `mergeConfig` deep-merge and the
  `application` source slot — zero changes to precedence, binding, secrets
  markers (`{cipher:…}` stay strings), or zod schema validation.
- **Dependency shape (open question, recommendation):** optional
  `peerDependencies` + lazy dynamic import inside `loadFile` (Node-side only
  — `StandardConfigFileLoader` already no-ops without a reader) so users who
  never use TOON pay zero install/bundle cost; alternative is a direct
  dependency (simpler, +113 KB unpacked, tree-shaken only if ESM-imported
  statically — not, with dynamic import).
- Pin `@toon-format/toon` to an exact version; document `toon-spec: 4.1`.
- **Specs (new, pinned):**
    - SEC-1 parity: `.toon` doc with `__proto__`/`constructor` keys decodes to
      ordinary own entries; `wrapSource`/`mergeConfig` do not pollute (spec
      §15 mandates this for decoders; pin our consumption).
    - Behavior deltas vs `JSON.parse`: empty `.toon` → `{}` (JSON throws);
      full-line `#` comments stripped before structure; CRLF accepted; BOM
      stripped; `key: []` empty-array form; `application-{profile}.toon`
      stacking + arrays-replace merge identical to JSON path.
    - Duplicate sibling keys: strict-mode error in a single file (§14.3) vs
      cross-file scalars-override merge — document the distinction.
    - `doc:check` + `platform-boundary` (no node-platform dep) stay green.
- **Reject criteria:** if the spec's next minor/major breaks decode on any
  fixture, the phase dies without migration — rename files back to `.json`.

### Phase 2 — docs (proposal)

Guide entry ("Configuration in TOON") in
`docs/guides/03-environment-configuration.md`: when to choose `.toon`
(hand-authored files, maps/tables, comments needed), the provisional-status
caveat, and the "JSON default everywhere else" boundary. Update AD-13's
"JSON only" line to reference this plan.

### Phase 3 — `fromConfig` TOON (optional, gated on Phase 1 usage)

Auto-detect by URL extension or an explicit `format` option; decode →
existing `sources`/`profiles`/`properties` handling. Low value; skip unless
a consumer asks.

## 4. Acceptance criteria

- [x] P0: `MediaTypes.TEXT_TOON` exported; registry/charset/negotiation
      tests green; `doc:check` clean.
- [x] P1: `application.toon` + `application-{profile}.toon` load, merge, and
      validate identically to their JSON counterparts (27-loader-spec suite
      incl. SEC-1 parity, empty-doc, comments/CRLF/BOM, strict duplicates,
      shape guard, import files, seam); JSON path byte-identical behavior
      (123/123 ndigo-boot tests).
- [x] P1: no new runtime cost when TOON unused — optional peer + lazy
      dynamic import (literal specifier + `@vite-ignore`, allowlisted in
      `check-manifests.mjs`; manifest conformance green).
- [x] P2: guide section landed; AD-13 cross-reference added (ADR-66).

Phase 3 acceptance (when picked up): `fromConfig` TOON follows the same
decode-only contract with an explicit `format` option or URL-extension
detection.

## 5. Risks & rollback

- **Spec churn (Working Draft):** pin exact version; decode-only usage;
  conformance fixtures; removal = rename files + delete option. No wire or
  storage debt is ever created because the format never leaves the file
  layer.
- **Duplicate-format drift:** two authoring formats to document — contained
  by the verdict table's hard boundaries and Phase 0's inertness.
- **IANA registration later renames/assigns:** token constant survives
  (additive); nothing negotiates it by default; if the name changes, update
  one constant pre-1.0 at zero cost.
- **Rollback:** Phase 1 is a loader option + optional dep — revert is a
  one-file diff; Phase 0 is one line.

## 6. Companion docs

[ADR-66](../decisions/2026-10-05_AD66_TOON_OPTIN_SUPPORT.md) (decision),
[AD-13](../decisions/2026-09-08_AD13_ENVIRONMENT_STANDARD_SOURCES.md)
(JSON-only baseline this amends additively),
[spec v4.1 §17-19](https://github.com/toon-format/spec/blob/main/SPEC.md).

[AD-13]: ../decisions/2026-09-08_AD13_ENVIRONMENT_STANDARD_SOURCES.md
