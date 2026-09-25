# AD-29: Configuration completion — refresh scope, secret at-rest encryption, config server

**Date:** 2026-09-25
**Status:** Accepted — decisions D-1..D-9 ratified; Waves 1–3 landed (see
[plan](../plans/2026-09-24_CONFIGURATION_COMPLETION.md)), Wave 4 (docs +
status refresh; this ADR) closes the row.

## Background

The Framework Gap Analysis's Configuration row (§3) recorded three missing
capabilities over the AD-11..17 environment stack: no secret
encryption/decryption, no live bean rebind (`@RefreshScope` equivalent), and
no config-server integration. This ADR ratifies the decisions that closed
all three (plan `docs/plans/2026-09-24_CONFIGURATION_COMPLETION.md`, owner
decisions confirmed 2026-09-25).

## Decisions

### D-1 — `AbstractEnvironment` is an emitter; `refresh()` emits `config:refresh`

`AbstractEnvironment` gains `AsEventEmitter`. `refresh()` rebuilds the
lookup index, then emits `'config:refresh'` (exported
`CONFIG_REFRESH_EVENT`) — listeners read fresh state. AD-16 D3 holds
unchanged: refresh never re-runs customizers (existing spec pins it). The
event is additive and opt-in; hot lookup paths are untouched.

### D-2 — `@refreshScope` is a scope (`scope('refresh')`); coverage: config classes only

`KnownScope` gains `'refresh'`; `RefreshScope` caches one instance per name
and its `clear()` runs registered destruction callbacks before discarding
(the `SingletonScope.registerDestructionCallback` mechanism) so
`@destroyable`/`@closeable` values tear down properly. The owning context
wires the registered scope to `config:refresh` in `setEnvironment` (and the
lazy-environment getter), detaching a previous subscription when the
environment is replaced. Boot re-runs `resolveConfigurationProperties` +
`setValue` for `@refreshScope`-marked `@configurationProperties` classes on
every refresh; unmarked classes keep the boot-time snapshot (identity
asserted by spec). **Owner-confirmed coverage: config classes only** —
`@entry` method results are NOT re-run in v1; the extension path is the
`@scheduled`-style method metadata + the same rebind listener, later if a
consumer needs it.

### D-3 — The implementation ladder; rung 1 ships, adapters are documented shapes

The real axis is where the key lives and who can read it, not "thin vs
deps". Rungs 1–4 solve the SAME problem (at-rest value confidentiality)
behind one contract with escalating threat-model ceilings: (1) `node:crypto`
AES-256-GCM with a raw 32-byte key in env — **v1, the reference
implementation**; (2) JWE (public-key write-without-read); (3) age
(hardware passkeys); (4) KMS envelope (host-compromise resistance). Rung 5
(runtime delivery, Vault) is a DIFFERENT problem class (delivery, not
protection) → it belongs on the property-source shape, not the cipher
contract. **Owner-confirmed: v1 = rung 1 only; rungs 2–4 documented shapes
behind the marker seam; rung 5 documented as the `vault://` URL + custom
`fetch` extension point (no Vault-specific code ships).** SOPS/age at the
file layer is rejected (whole-file ≠ property values).

### D-4 — Marker format, key discipline, AAD, nonces

- Marker: `{scheme[:version]:payload}` — `{cipher:v1:<base64url(iv|tag|ct)>}`
  (12-byte IV, 16-byte tag, AES-256-GCM). Shared `parseSecretMarker` is the
  single grammar; unknown scheme/version fail loud, never plaintext fallback.
- Key: `BLUE_SECRET_KEY` is base64 of EXACTLY 32 bytes, enforced at
  construction (fail at startup, not first decrypt); passphrases rejected
  outright (no KDF footgun).
- **Key-path AAD**: the resolver passes the property key (`db.password`) as
  GCM additional authenticated data — ciphertext moved between key paths
  fails auth at lookup.
- Nonce: fresh random 96-bit IV per encryption; collision bound documented
  (p ≈ n²/2⁹⁷, negligible at config-file scale).

### D-5 — The decryption seam is the resolver (as-built); wiring via `builder.secrets(...)`

**As-built deviation from the plan's `DecryptingPropertySource` wrapper:**
the seam sits on the **property resolver** (`ResolverOptions.
secretDecryptor`), applied after placeholder resolution and before
conversion (`#decrypt`). Two structural reasons: the lookup index copies raw
source _values_ at build (a source-level wrapper's `getProperty` never runs
in the hot path), and key-path AAD requires the caller's key — which only
the resolver sees. The plan's public surface is preserved:
`ApplicationBuilder.secrets({ cipher })` → `SecretSchemeRegistry` →
`AbstractEnvironment.applySecretDecryptor` (replace-not-mutate; idempotent),
applied after customizers so every source — including the remote
config-server source — is covered ("remote values decrypt too",
owner-confirmed). The capability gate runs at wiring: an AAD-less adapter is
refused loudly; pluggability never downgrades the threat model.

### D-6 — Config server: plain JSON-over-HTTPS remote source (own contract)

`RemotePropertySource` (blue-context) fetches a flat JSON document over
HTTPS with ETag/`If-None-Match` change detection (304 → no re-merge, no
event) falling back to body-text comparison. `optional: true` default (boot
proceeds on failure); `optional: false` fails boot naming the URL; later
poll failures keep last-good. Auth: static headers, token sourced from env
(`BLUE_CONFIG_SERVER_TOKEN`) — never from `application.json` (the token
header is itself a secret). `fetch` + scheduler seams are injectable
(isomorphic default `globalThis.fetch`; https enforced on the default
path). Lifecycle: `start()`/`stop()`; boot starts polling after success,
stops on `context:close` and on boot failure.

### D-7 — Precedence slot + a real-order regression pin (pre-existing bug fixed)

Slot: `commandLine > boot > systemEnvironment > configServer > dotenv >
application-{profile} > application > defaults` — `PrecedenceDoc` updated.
**Found and fixed a pre-existing precedence bug**: `defaults` registered
before files/boot, so `defaults` outranked builder properties and
`application` outranked `boot` in the LIVE chain, contradicting the doc.
`_prepareEnvironment` now registers `defaults` LAST and `boot` inserts ABOVE
`systemEnvironment` via `addBefore`. The precedence spec gained a
**real-boot order-assertion regression pin** (not just the hand-built
registry) — this is the AD-13 D6 "doc and test cannot drift" enforcement.

### D-8 — The loop: poll → change → refresh → rebind

On a detected change the source `replace`s its own registry entry (position
preserved, version bumped) then calls `environment.refresh()` →
`config:refresh` → `@refreshScope` beans rebind. No change → no event → no
rebinding (no storms). Proven end-to-end by the boot full-loop spec.

### D-9 — Emitter↔Signals reconciliation is a follow-up ADR (owner-confirmed)

This wave uses the Emitter path (server, synchronous, zero deps). The
unification direction — a signal-backed environment (`refreshed` signal fed
from the event via `streamToSignal`, AD-9) so client-side reactive views
consume configuration changes without a server visit — ships as its **own
ADR when a client-side consumer exists**. Explicitly NOT this wave.

## Consequences

- New public surface: `CONFIG_REFRESH_EVENT`, `@refreshScope`/`RefreshScope`,
  `SecretCipher`/`SecretSchemeRegistry`/`parseSecretMarker`, `AESGCMCipher`
  (+ `BLUE_SECRET_KEY`), `RemotePropertySource`/`RemoteSourceOptions`/
  `RemoteSourceScheduler`, `ApplicationBuilder.secrets(...)`/`configServer(...)`.
- Behavior changes (pre-1.0, accepted): environments are emitters;
  `refresh()` emits `config:refresh` (no listeners → no-op); `defaults`
  precedence corrected (defaults now truly lowest; boot above env vars);
  `builder.secrets` decrypts `{cipher:...}` values at every lookup.
- Zero new runtime dependencies (`node:crypto` + `globalThis.fetch` are
  platform standards).
- Security posture: AEAD everywhere, key-path AAD binding, fail-loud on
  tamper/wrong-key/unknown-scheme, masking of decrypted values in error
  rendering, no plaintext fallback; artifact-level threat model documented
  (not host-compromise defense).

## Revisit triggers

1. **JWE backend** — a real public-key write-without-read need (CI/developers
   encrypt for prod without holding the key) → rung 2 adapter behind the
   scheme registry.
2. **Hardware-backed keys (age passkeys)** — rung 3.
3. **KMS envelope** — host-compromise resistance or rotation frequency → rung 4.
4. **Browser-side symmetric decrypt** — revisit `@noble/ciphers` (currently
   no client use-case; secrets are server-only per AD-13 boundary).
5. **Key rotation burden** — the `v1` prefix + AAD-binding make rotation
   mechanical; a multi-key keystore is the migration if frequency becomes
   a burden.
6. **`@entry`-method rebind** — `@scheduled`-style method metadata +
   rebind listener, if a consumer needs it.
7. **Vault/runtime delivery** — `vault://` URL + custom `fetch` fetcher
   (rung 5 extension point).
8. **Push-based config** — the repo has SSE/WebSocket/STOMP; a push channel
   is architecturally available (poll is v1).
9. **Emitter↔Signals unification** — D-9 follow-up ADR when a client-side
   consumer exists.
