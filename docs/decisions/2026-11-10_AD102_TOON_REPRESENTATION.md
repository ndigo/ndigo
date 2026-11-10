# AD-102: TOON as an opt-in representation — `@ndigo/view-toon`, the prompt encoder, and a narrowed D-3

**Date:** 2026-11-10
**Status:** Accepted — supersedes **AD-66 D-3 in part** (the "no TOON in HTTP
views" clause and the absolute `.toon` extension-mapping ban, both narrowed to
_framework defaults_). AD-66 D-1, D-2, and D-4 remain in force unchanged, as do
every other D-3 boundary: storage, SSE, WebSocket/STOMP, mock-http, external
protocols, config-server transport, content-negotiation _defaults_, and
`fromConfig` defaults. Closes the D-8 aspiration in the agent-integration plan —
TOON is now a negotiated representation, selected like `text/csv`, never a
default.

## Context

AD-66 (2026-10-05) ratified TOON as an opt-in _authoring_ format and wrote its
boundaries as permanent: D-3 banned TOON from "wire formats (HTTP views, …)"
outright, banned `.toon` extension mapping absolutely, and phased the encoder
out of scope entirely. Three of those clauses have since priced out:

1. **The consumer the Phase 3 gate waited for exists.** FromConfig landed
   (#351, AD-66 Phase 3) and the framework's own agent tooling composes
   LLM-facing material from model data; the encoder is a requirement, not a
   nicety.
2. **A2UI set the representation precedent.** AD-101 treats
   `application/a2ui+json` as a first-class negotiated representation served by
   `A2UIView` beside JSON. A2UI is a draft protocol with no IANA registration —
   the exact risk profile AD-66 D-3 excluded TOON for. The inconsistency is now
   the record, not the risk.
3. **`@toon-format/toon` matured on a pinned track.** The October dependency
   train (#36) advanced the pin to 4.4.0 (spec v4.4); the decode conformance
   fixtures held, and the version discipline that AD-66 D-4 priced is working
   as designed.

The cost of leaving AD-66 D-3 as written is that agents composing token-economy
payloads must hand-roll an encoder, and the D-8 claim ("A2UI, MCP Apps, and
TOON are all view representations selected by content negotiation") stays
aspirational while two of its three subjects are shipped.

## Decision

**D-1 — `@ndigo/view-toon` owns the representation.** A dedicated
`view-*` package — the same shape as `@ndigo/view-ejs` and
`@ndigo/view-webcomponent` — shipping:

| Export                                          | Role                                                                                          |
| :---------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `ToonView`                                      | `AbstractSerializingView` over `text/toon;charset=utf-8` (spec §17's text/\* default charset) |
| `toonViewResolver(viewName = 'toon', options?)` | serves `ToonView` for one logical view name — the `a2uiViewResolver` shape                    |
| `encodeToon(value, options?)`                   | the synchronous prompt-composition encoder (in-process, no wire)                              |

**D-2 — Dependency shape: regular, static, dedicated.** `@toon-format/toon` is
a regular pinned dependency (`catalog:`, exact 4.4.0) of `@ndigo/view-toon`,
statically imported. `ToonView.serialize` therefore stays synchronous, and a
wire surface fails at _install_ time — a missing optional peer would instead
turn a correctly configured route into a request-time 500. Boot's optional-peer
shape stays as-is: it is the general-purpose package where zero-cost matters;
this package exists only for consumers who already chose TOON.

**D-3 — Opt-in per route; the default never moves.** TOON may appear in HTTP
responses only as an _explicitly composed_ representation: an app registers
`toonViewResolver` beside its JSON resolver, and — only if it wants the
extension — adds a `'toon'` entry to its **own** path-extension map. The
prohibited half of the original clause survives verbatim as framework defaults:
the platform's negotiation wiring registers nothing for `.toon`, no fixed
strategy selects TOON, and clients with no preference keep receiving JSON
(resolver registration order carries that guarantee). SSE, WebSocket/STOMP,
mock-http, storage, external protocols, config-server transport, and MCP
results/schemas remain outside TOON's reach in full.

**D-4 — The Working-Draft risk is priced higher, not ignored.** A spec break is
now _user-visible_ for opted-in routes — the rationale for the original
absolute ban. Mitigations, none new: exact-version pin, conformance fixtures
(round-trip through the same SDK's `decode`, the spec's referee), JSON as the
fallback representation every route keeps, and rollback = uninstall the
package and delete the resolver from the route. No storage or wire _contract_
is created: nothing outside an opt-in route parses `text/toon`.

**D-5 — Where TOON should be the default is documentation, not behavior.**
`encodeToon` is the recommended encoding for in-process prompt composition of
uniform tabular data ≥2 KB; guide 09 states the boundary (TOON is neutral-to-
worse on small nested payloads) and gates the recommendation on the measured
profile, so it cannot calcify into a cargo-cult default.

## Consequences

Positive: D-8 in the agent-integration plan is true rather than aspirational;
agent-facing surfaces gain a token-economy representation without touching a
single existing default; the encoder costs nothing for non-consumers (a
package install, not a framework dep); rollback is a package uninstall.

Negative and accepted: two view technologies now carry real external
dependencies (`view-ejs`: EJS; `view-toon`: the TOON SDK) while the core view
package stays dependency-free — the asymmetry is the point, and is why this is
a separate package rather than a `@ndigo/view` peer. A route that opts in can
serve a Working-Draft media type at `text/toon;charset=utf-8`; the
`[experimental]` label in the docs and the JSON fallback are the mitigations.
`text/toon` remains unregistered with IANA; if the provisional name changes,
the constant and this package are the entire rename surface pre-1.0.

## Notes

- **Numbering:** AD-96 through AD-101 were consumed by the agent-integration
  decision set recorded the same day; the next free number is 102, and the
  in-issue references (#348) were filed as "AD-96" before that range was
  visible on `main`.
- **Companion records:** [ADR-66](2026-10-05_AD66_TOON_OPTIN_SUPPORT.md)
  (amended authoring-format decision),
  [AD-101](2026-11-10_AD101_A2UI_ADOPTION.md) (the A2UI adoption this record
  aligns the representation policy with),
  [spec v4.4 §17–§19](https://github.com/toon-format/spec/blob/main/SPEC.md).
