# AD-66: TOON support as an opt-in authoring format

**Date:** 2026-10-05
**Status:** Superseded in part — D-3 superseded by AD-102 (2026-11-10)
files) landed 2026-10-05; **Phase 3 (`fromConfig`) landed 2026-11-10** (a
`.toon` address suffix decodes as TOON, an explicit `format` overrides it,
JSON stays the default; plan:
[2026-10-05_TOON_SUPPORT](../plans/2026-10-05_TOON_SUPPORT.md)).
**2026-11-10: D-3 superseded in part by
[AD-102](2026-11-10_AD102_TOON_REPRESENTATION.md)** — TOON became an opt-in
HTTP representation in the dedicated `@ndigo/view-toon` package; the "no
HTTP views" clause and the absolute `.toon` extension-mapping ban are
narrowed to _framework defaults_. D-1, D-2, D-4, and every other D-3
boundary (storage, SSE/WS/STOMP, external protocols, config-server,
negotiation and `fromConfig` defaults) remain current.

_Amendment (2026-11-07): the optional peer pin advanced from `4.1.1` to
`4.4.0` (spec v4.4, 2026-10-08) in the October dependency train (#36); the
decode-only contract and the boundaries above are unchanged._

_Phase 3 note (2026-11-10): `fromConfig` follows the address (a `.toon`
path suffix) rather than defaulting — D-3's "no `fromConfig` defaults"
boundary holds: extensionless or `.json` URLs stay JSON, and an explicit
`format` option is the caller's statement._

## Context

TOON ([toon-format/toon](https://github.com/toon-format/toon)) is a
line-oriented, indentation-based encoding of the JSON data model — lossless
`encode`/`decode` round-trip, deterministic, four structural forms
(inline/list/tabular/keyed-tabular). It is purpose-built for LLM prompts and
token economy; the reference TypeScript SDK (`@toon-format/toon@4.1.1`) is
ESM-only, zero-dependency, `sideEffects: false`, MIT, npm-provenance.

The format is **provisional**: spec v4.1 (2026-07-26) is a Working Draft;
`text/toon` is a provisional media type with §17 stating no IANA
registration is requested yet; §19 declares it a community specification,
not standards-track. v4 already carried breaking evolution (legacy `key[0]:`
headers replaced by `key: []`, still accepted on decode).

ndigo's config layer is JSON-only by explicit decision — AD-13: "JSON only
(boring, structured, no YAML dep)". ndigo is pre-1.0 (unreleased), so
additive options are inexpensive to introduce and cheap to remove.

## Decision

**Provide TOON as an opt-in authoring option on the configuration file
layer only. JSON remains the default and the wire/storage format
everywhere. No framework internals behavior changes; no IANA-dependent
behavior; decode-only usage of the format.**

- D-1 — `MediaTypes.TEXT_TOON` (Phase 0, landed): a registered `text/toon`
  token in `@ndigo/core`. Inert: nothing negotiates it by default; users may
  compose it in views/interceptors. `getDefaultCharset()` returns `utf-8`
  for all `text/*`, matching spec §17's "always UTF-8". Reversible with a
  one-line diff.
- D-2 — `.toon` config files (Phase 1, landed): `StandardConfigFileLoader`
  probes `application.json` then `application.toon` (JSON wins on
  collision; `require`d/`optional` location semantics cover the probed
  formats as a pair); profile variants and `NDIGO_CONFIG_IMPORT` inherit the
  rule (`format: 'auto' | 'json' | 'toon'`) — an imported path whose
  extension contradicts a non-`auto` format errors instead of silently
  parsing. Files decode (strict mode, spec §14) to `JSONObject` — with a
  root-object shape guard (JSON-looking `{`/`[`-leading documents error
  with a rename hint; previously they decoded to garbage) — and enter
  the existing `application` source deep-merge: precedence, binding,
  `{cipher:…}` secrets, and zod schema validation are untouched. Dependency
  shape (owner-confirmed): **optional peer** (`peerDependenciesMeta`),
  lazy dynamic import with a literal specifier + `@vite-ignore` (bundlers
  skip it for consumers without the peer; the manifest checker allowlists
  the peer for `@ndigo/boot`, and a `decodeToon` seam covers specs and
  alternate validators), exact-version-pinned (`4.1.1`), `toon-spec: 4.1`
  documented.
- D-3 — Boundaries (permanent; **superseded in part 2026-11-10 by
  [AD-102](2026-11-10_AD102_TOON_REPRESENTATION.md)** — the "no TOON in HTTP
  views" clause and this point's absolute `.toon` extension-mapping ban are
  narrowed to _framework defaults_): no TOON in wire formats (HTTP views, SSE,
  WebSocket/STOMP, mock-http), storage (Redis envelope, LibSQL columns,
  cookies, local-storage loader), OIDC/external protocols, config-server
  transport, `fromConfig` defaults, or content-negotiation defaults
  (`.toon` extension mapping, default views). These surfaces are interop or
  durability contracts; a Working-Draft format has no place there.
- D-4 — Pinning: the provisional status is accepted as a _priced_ risk, not
  ignored — exact version pin, decode-conformance fixtures (including
  `__proto__` own-entry safety, SEC-1 parity), and documented behavior
  deltas vs `JSON.parse` (empty doc → `{}`; `#` comments; CRLF; BOM;
  `key: []`). If the spec breaks decode, Phase 1 dies without migration.

## Rationale

- Comments, strict `[N]`/`{fields}` diagnostics, and deterministic grammar
  are real authoring wins for hand-edited config files that JSON cannot
  provide — the same itch YAML would scratch, without YAML's merge-key and
  type-coercion footguns (AD-13's "no YAML dep" stance is preserved; TOON
  decodes to the plain JSON model, so the property-source pipeline never
  sees a new type system).
- The JSON data model guarantee makes every use reversible: decode is the
  only direction, and rollback is a file rename. No wire or storage debt is
  possible, so the Working-Draft risk never compounds.
- Pre-1.0 timing: additive options now cost a pin + a spec; removing them
  before release costs one diff. Post-1.0, the same decision would carry
  compatibility weight — this ADR pre-records the boundary so the format
  cannot creep into defaults later.
- Token efficiency — TOON's raison d'être — is explicitly _not_ a driver
  here (ndigo has no LLM surface; config files are small, nested, ~0%
  tabular-eligible). The win is authoring ergonomics; the decision would
  not change if the format never gained a token advantage.

## Consequences

Positive: additive authoring option; zero default-cost (lazy optional dep);
deterministic alternatives for JSON's comment-less, position-error-parsing
files; pre-recorded creep boundary.

Negative: a second authoring format to document; a pinned Working-Draft
dependency in one package; two decode implementations in the config path
(JSON native, TOON via SDK) — contained by the verdict table's hard
boundaries.

## Revisit triggers

- Spec evolution breaks any pinned decode fixture → Phase 1 removed.
- IANA registers `text/toon` under a different token, or the media type
  changes meaning → update the constant pre-1.0; post-1.0, additive note.
- ndigo reaches 1.0 without TOON usage in the wild → drop Phases 1–3,
  keep or remove the token per ecosystem signal.
- A consumer needs TOON on a listed-forbidden surface → new ADR required;
  this ADR's boundary is not waivable by extension.

## Rejected alternatives

- **TOON as default config format** — Working Draft, larger than minified
  JSON on nested configs, ecosystem immature; AD-13's boring-JSON default
  stands.
- **Config-server wire / HTTP views in TOON** — external and interop
  contracts; unregistered media type is not negotiable by clients.
- **Encoder in framework internals** — would make ndigo a TOON producer
  for arbitrary models; no consumer exists; encode stays user-side via the
  SDK.
- **YAML adoption instead** — AD-13 rationale unchanged; TOON's
  determinism and JSON-model decode make it the safer of the two options if
  either is adopted.

## Companion docs

[Plan](../plans/2026-10-05_TOON_SUPPORT.md),
[AD-13](archive/2026-09-08_AD13_ENVIRONMENT_STANDARD_SOURCES.md)
(additively amended: "JSON only" → "JSON default; TOON optional per AD-66"),
[TOON spec v4.1](https://github.com/toon-format/spec/blob/main/SPEC.md)
(§2 data model, §9 forms, §14 strict mode, §15 security, §17 IANA, §19 IP).
