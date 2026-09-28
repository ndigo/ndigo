# AD-36: Management endpoint hardening — redaction + bind posture (SEC-5)

**Date:** 2026-09-28
**Status:** Ratified — implementation in [`docs/plans/2026-09-28_OPENAPI_AND_MANAGEMENT_HARDENING.md`](../plans/2026-09-28_OPENAPI_AND_MANAGEMENT_HARDENING.md)
**Closes:** the remaining SEC-5 items (bind-address separation + response
redaction) named in [`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md`](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md)
§3/§5 and in the AD-33 wave docs.

## Background

SEC-5 (`docs/plans/2026-09-04_REPOSITORY_REMEDIATION.md`) originally covered
the whole management surface: access policy, bind-address, path, redaction,
authorization. The AD-33 wave closed access (`ManagementAutoConfiguration
{ accessGuard }` + scoped guard wrapper) and documented the authorization
posture in guide 11 §8 (default-deny recommendation, `AuthRouteGuard` fit).
Two items remain open:

1. **Response redaction** — `HealthRegistry.checkAll()` attaches the raw
   indicator exception message to `/health` results
   (`details: { error: error.message }`). Indicator internals (filesystem
   paths, host details, library names) leak to any anonymous caller when the
   endpoints run open.
2. **Bind-address separation** — management routes share the application
   listener; there is no way to serve `/health` + `/metrics` on a private
   interface apart from the whole application.

## Decisions

### D-1 — Redaction on by default: no indicator error text on `/health`

`ManagementAutoConfigurationOptions` gains `redactHealthErrors: boolean`
**(default `true`)**. When redaction is on, `/health` replaces an indicator's
thrown error with a non-revealing marker instead of the message:

```jsonc
// redacted
{ "name": "telemetry", "result": { "status": "DOWN", "details": { "error": "unavailable" } } }
// unredacted (redactHealthErrors: false — the pre-AD-36 shape)
{ "name": "telemetry", "result": { "status": "DOWN", "details": { "error": "read /opt/app/metrics: EACCES" } } }
```

Safe default per the repo's rule (conservative defaults, additive opt-out):
the health registry keeps the full error locally; only the wire shape is
redacted. The marker constant (`'unavailable'`) is exported so monitors can
match on it. `redactHealthErrors: false` restores the pre-AD-36 shape for
teams that deliberately expose detail behind a guard.

### D-2 — Bind-address separation: document the single-listener posture; dedicated management listener is post-1.0

The honest options were: (a) a second listener with its own dispatch stack
(~the size of `ManagementAutoConfiguration` itself — new machinery, new
failure modes, a second set of limits/shutdown semantics), or (b) the
application server's existing `host` binding plus network-boundary path
splitting. Decision: **(b)**, documented — and the single listener's bind
controls are **verified by regression test** (the server binds the configured
host; loopback default is already the factory default).

The documented posture (guide 11 §8, management README):

- Bind the whole server to a private interface (`HTTPServerOptions.host` —
  default `127.0.0.1`) or firewall the management paths at the network
  boundary (reverse proxy routing `/health|/metrics` to an internal
  listener).
- Do not expose `/health`/`/metrics` on a public interface without the
  `accessGuard` (the AD-33 recommendation unchanged).

A dedicated management listener (Spring `management.server.port` equivalent)
is recorded as the post-1.0 follow-up: it requires a second dispatch stack on
the platform and is not on the 1.0 critical path now that guard + redaction
are in place. All decisions that would make that follow-up cheap (the
mapping collection pattern, options-via-subclass, this ADR) are already in
place.

### D-3 — No path rewrite

SEC-5's original "path" item (endpoint path configurability) is not picked
up: the gap analysis narrowed the open set to bind-address + redaction, and
path prefixes are a reverse-proxy concern (guide 11 §8 covers them). Noted
here so the item is deliberately closed, not forgotten.

## Risks

- Redaction hides genuinely useful operator diagnostics from `/health`
  consumers. Mitigated: the marker is stable and machine-matchable; statuses
  and indicator names are unchanged; opt-out is one option.
- Documentation-only for bind separation reads as "unfixed" in audits.
  Mitigated: this ADR _decides_ the posture, the binding behavior gets a
  regression test, and the post-1.0 follow-up is recorded with its shape.

## Verification

- `@blue/management` specs: `/health` with a throwing indicator returns
  `status: 'DOWN'` with the redacted marker (default) and with the real
  message (`redactHealthErrors: false`); success payloads unchanged.
- `@blue/platform-node`: host-binding regression (server binds the supplied
  host/port; loopback default assertion).
- Docs: guide 11 §8 rewritten to the decided posture; management README +
  JSDoc updated; gap-analysis row flipped to closed.
