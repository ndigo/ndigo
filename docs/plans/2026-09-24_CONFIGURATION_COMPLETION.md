# 2026-09-24 Configuration Completion — refresh scope, secrets, config server

**Status:** ✅ **Implemented 2026-09-25** — all four waves landed, ratified
by [AD-29](../decisions/2026-09-25_AD29_CONFIGURATION_REFRESH_SECRETS_CONFIG_SERVER.md):
**Wave 1** refresh event + `@refreshScope` scope + boot rebind; **Wave 2**
at-rest secrets (`{cipher:...}` markers, `AESGCMCipher`, scheme registry +
capability gate, `builder.secrets(...)`); **Wave 3** remote config source
(`builder.configServer(...)`, ETag/304-gated poll → refresh → rebind,
secrets × remote composition); **Wave 4** docs + status (this header, guide
03, plans README, gap-analysis §3 row → IMPLEMENTED, feature-assessment
status row). Demo gates: `ndigo-api` `/api/config/*`, `/api/config.json`,
`/api/config/secrets`. Working-session notes (as-built):

- The decryption seam sits on the **resolver** (`ResolverOptions.
  secretDecryptor`, `#decrypt` after placeholder resolution), not a
  registry-level `DecryptingPropertySource` wrapper — the index copies raw
  source values and key-path AAD requires the caller's key, which only the
  resolver sees; the plan's public surface (`builder.secrets`, marker
  format, capability gate, key-path AAD) is preserved.
- **A real precedence bug was found and fixed**: `defaults` registered
  before files/boot, so `defaults` outranked builder properties and
  `application` outranked `boot` in the live chain, contradicting
  PrecedenceDoc. `_prepareEnvironment` now registers `defaults` LAST and
  `boot` inserts ABOVE `systemEnvironment` via `addBefore`; the precedence
  spec gained a real-boot order-assertion regression pin.
- The "no cipher → fails loudly" plan wording was corrected to match the
  documented contract: markers pass through with NO decryptor (raw binding,
  same as local sources), and fail loud when a WIRED cipher doesn't know the
  scheme.

Decisions confirmed by the owner 2026-09-25: v1 ships **rung 1 only**
(secrets), **extension point only** (Vault/runtime delivery), **config
classes only** (`@refreshScope` coverage), **static header via env**
(config-server auth), **remote values decrypt too** (secrets × remote
composition), **follow-up ADR** (Emitter↔Signals unification, D-9).
**Scope:** The Configuration row of the Framework Gap Analysis (gap
analysis `docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md` §3): closes the
three missing pieces — secret encryption/decryption, live entry rebind
(`@RefreshScope` equivalent), and config-server integration. Builds directly
on the AD-11..17 environment stack.
**Companion docs:**
[Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §3
("Configuration" row),
[AD-11..17](../decisions/2026-09-08_AD11_ENVIRONMENT_PROPERTY_SOURCES.md)
(environment phases 0–6 — the stack this completes),
[AD-16](../decisions/archive/2026-09-08_AD16_ENVIRONMENT_OBSERVABILITY.md) (refresh
semantics, the contract this extends),
[AD-20](../decisions/2026-09-13_AD20_SCHEDULING.md) (auto-config entry
pattern), [AD-24](../decisions/2026-09-17_AD24_CACHING.md) (managed-entry +
demo-gate pattern), [AD-09](../decisions/2026-09-05_AD09_SERVER_PUSH.md)
(`streamToSignal` — the Emitter↔Signals bridge), Feature Assessment
`docs/reference/2026-09-01_FEATURE_ASSESSMENT.md` (status refresh).

---

## 1. Problem

The gap analysis §3 Configuration row:

> **Configuration** | Property sources, profiles, placeholders, typed binding,
> validation, origins/customizers, refresh (AD-11..17) | No secret
> encryption/decryption, no live entry rebind (`@RefreshScope` equivalent), no
> config-server integration.

Three verifiable gaps:

1. **Secrets.** Everything resolvable by the environment is plaintext —
   `application.json`, `.env`, `systemEnvironment`. No at-rest encryption, no
   cipher stage anywhere between source and `@configurationProperties`
   binding.
2. **Live rebind.** `AbstractEnvironment.refresh()` (AD-16 D3, minimal) clears
   the placeholder cache and rebuilds the index — nothing more. Bound
   `@configurationProperties` instances and scoped entries are boot-time
   snapshots; nobody observes an environment refresh, so dynamic config
   cannot reach running entries.
3. **Config server.** All sources are local and synchronous. There is no
   remote/async source, no polling, no change signal. The last
   Spring-Cloud-Config-tier capability is absent.

### 1.1 Goal and threat model — secrets (what this defends, what it cannot)

The goal of the secrets work is **one specific defense**: make config
artifacts safe to store in less-trusted places. Ciphertext goes in the file
(repo, container, backup, log dump, support paste); the key lives in a more
privileged channel (env var, secret store, KMS). The separation of key from
ciphertext **is** the security; the cipher is the mechanism.

In-scope adversary: **read-only access to stored artifacts** — a leaked repo,
backup tape, CI artifact, a `.env`/`application.json` pasted into a ticket or
log. At-rest encryption defeats that adversary: the artifact yields no
secret.

**Explicitly out of scope** (documented, not silently accepted):

- **Full host compromise** — an attacker who can read both the config file
  _and_ the key's channel (same host, same principal) defeats value
  encryption. Defense requires rung 4 (KMS envelope) or rung 5 (runtime
  delivery) from D-3 — those are adapters behind the same contract, not v1.
- **Code execution in the process** — anything inside the app can call
  `decrypt`. Never treat the cipher as an app-level access control.
- **Plaintext in memory/logs/errors** — ciphertext is only as good as the
  app's own hygiene: decrypted values must never reach logs or error text
  (R-2, D-5).

Two properties the scheme gets _for free_ from GCM and must not lose:

- **Integrity**: a tampered ciphertext fails auth → `IllegalStateError` at
  bind/lookup. Plaintext config fails silently; encrypted config fails loud.
  This is a security improvement, not just a veneer.
- **Compliance story**: a documented AES-256-GCM at-rest scheme satisfies
  "data at rest encrypted" requirements (PCI/HIPAA/SOC2 framing) for config
  values.

Honest ceiling, stated once here and in the guide: with the key in an env var
on the same host, the guarantee is _artifact-level_ confidentiality, not
host-level. The marker's version prefix is the documented migration seam up
the ladder (D-3).

## 2. Current state (verified 2026-09-24)

- `AbstractEnvironment.refresh()` → `#propertyResolver.refresh()` (cache +
  index). `NodeEnvironment.refresh()` re-snapshots `systemEnvironment` first
  (`node-environment.ts:63-66`). **No event, no listener** — environments are
  not emitters; `customizer.spec.ts:111-113` pins that refresh does NOT
  re-apply customizers (footgun-guard to preserve).
- **`Emitter` already exists in ndigo-context** (`event-emitter.ts`:
  `AsEventEmitter` mixin, `Emitter` class; `Application extends Emitter`,
  emits `'started'`). Adding the mixin to `AbstractEnvironment` is a
  one-line surface change; hot lookup paths are untouched (emit only inside
  `refresh()`).
- **Scopes exist in ndigo-factory** (`scope.ts`): `KnownScope =
  'singleton' | 'prototype' | 'route' | 'hash'`, `defineScope`/`getScope`/
  `hasScope`, decorators `singletonScope`/`prototypeScope`/`hashScope`, and
  per-scope classes (`SingletonScope`, `HashScope`, …). Spring's
  `@RefreshScope` _is_ a scope in Spring — the port is `scope('refresh')` +
  a `RefreshScope` class whose cache clears on the environment refresh
  event. Naming matches the existing camelCase scope decorators exactly.
- **`PrecedenceDoc`** (`ndigo-boot/src/precedence.ts`, AD-13 D6) is the
  canonical ordered source-name list, integration-tested: `commandLine > boot
    > systemEnvironment > dotenv > application-{profile} > application >
    > defaults`. Any new named source MUST update it + its spec (documented
    > contract).
- **Boot binding** (`application.ts:_prepareContext`): after
  `context.refresh()`, each `@configurationProperties` class is resolved via
  `resolveConfigurationProperties` and registered under its camelCase name
  with `context.setValue`. One-shot, no rebind path.
- **Seam precedents:** AD-13's `readFile` injection (`StandardConfigFileLoader`
    - `node-file-reader.ts`, boot stays isomorphic) and its
      `optional:`/`required:` file convention; `TtlContentSource`
      (`ndigo-content/src/async.ts`) TTL pattern; AD-24's demo-gate counter test
      (`cached-report`); AD-20's `NodeAutoConfiguration` `@entry` entries.
- **Crypto posture:** zero crypto deps in-tree; `jose` is a dependency of
  the auth packages only (never `ndigo-context`). `node:crypto` is the
  platform standard (Node ≥ 22 per the i18n note; `Intl` precedent AD-19
  D3 — "use platform standard APIs directly").
- **Fetch:** Node 22 has global `fetch` — a remote source needs only a
  feature-detected default + an injectable seam for tests.

## 3. Decisions

### D-1 — Environment refresh emits an event; AD-16 D3 holds unchanged

`AbstractEnvironment` gains `AsEventEmitter`; `refresh()` emits
`'config:refresh'` **after** the index rebuild, with no payload (listeners
read fresh state). Event name: `config:refresh` (the environment's domain,
distinct from the context's lifecycle events `context:prepare` /
`context:refresh` / `context:close`).

- Listeners are opt-in; **no customizer re-run** (the AD-16 D3 double-apply
  footgun guard stays — existing spec pins it, unchanged).
- Emit iterates a snapshot of listeners (mutation during emit is safe).
- Hot path untouched: `refresh()` is not a per-request path.

### D-2 — `@refreshScope` is a scope: `scope('refresh')` (Spring-exact)

- `KnownScope` gains `'refresh'`; new `RefreshScope` class in `scope.ts`:
  registers with the context's environment refresh event at creation; when it
  fires, its instance cache clears → next `getValue` recreates the instance
  from its factory (mirrors `HashScope`'s "one instance per key" bookkeeping,
  but the key set is wholesale-cleared on the event).
- New decorator export **`refreshScope`** — `scope('refresh')` convenience in
  the existing `singletonScope`/`prototypeScope`/`hashScope` family.
- `@refreshScope` on a **`@configurationProperties` class** additionally
  re-binds: Wave 1's boot rebind listener (architecture table) re-runs
  `resolveConfigurationProperties` and `setValue`s the fresh instance. This
  is the missing "live entry rebind".
- **Coverage (owner-confirmed 2026-09-25): config classes only.** `@entry`
  method results (eager stored instances) are NOT re-run in Wave 1 — they'd
  need method-level spec metadata (the `@scheduled` model). Documented as the
  extension path: same rebind listener pattern, `schedule:`-style metadata,
  later if a consumer needs it.

### D-3 — Secrets: the implementation ladder (real axis: where the key lives)

Security posture (AD-19: "own the contract, wrap the ecosystem standard, use
platform standard APIs directly") sets the shape: one `SecretCipher`
contract, one versioned marker syntax, and a **ladder of backends** behind
it. The earlier "thin wrapper vs deps" framing missed the real axis — the
options differ in _where the key lives and who can read it_:

| #                                                                                 | Scheme                                                                         | Defeats (beyond artifact leaks) | Key location                                                                               | Cost                                                                                      | Verdict |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------- |
| **1. Minimal correct primitive** — AES-256-GCM, raw 32-byte key, versioned marker | artifact/repo/backup leaks; tamper (integrity)                                 | env var (same host)             | zero deps, `node:crypto`; **~250 lines + KAT spec** (AAD, nonces, versioning — not "thin") | **v1, the reference implementation**                                                      |
| **2. `jose` JWE compact**                                                         | same + **public-key mode**: CI/devs encrypt _for prod_ without holding the key | private JWK (per-deployment)    | 1 dep on ndigo-context (already in auth pkgs)                                              | **documented adapter** — the concrete "next backend" (D-4 seam)                           |
| **3. `age-encryption`** (TyPage, audited, official port)                          | potentially hardware passkeys (WebAuthn PRF) as key material                   | age identity / passkey          | 1 dep; value-level integration is ours                                                     | **documented adapter** — hardware-key story                                               |
| **4. KMS envelope** — DEK in file, KEK in AWS/GCP/Azure/Vault-transit             | **host compromise**: key never at rest in plaintext; audit + ACLs              | KMS (hardware boundary)         | network dep at boot, SDK, cloud lock-in                                                    | **documented adapter** — the migration ceiling                                            |
| **5. Runtime delivery** — Vault/Secrets Manager, no ciphertext at all             | strongest; short-TTL creds                                                     | secret store                    | infra dependency; overlaps the config-server row (Wave 3)                                  | **fold into Wave 3** — same shape as `RemotePropertySource`, a `vault://` fetcher; not v1 |
| **6. SOPS/age at the file layer**                                                 | whole-file workflows                                                           | CLI/ops                         | external binaries, not a property-value story                                              | **rejected** — solves a different problem                                                 |

Packaging: v1 ships rung 1 only; rungs 2–4 are _documented backend shapes_ the
`SecretCipher` contract and the `v1` version prefix keep open (the marker's
version slot is the migration seam). Rung 5 is explicitly parked on Wave 3's
remote-source shape rather than built as a separate mechanism.

**Taxonomy — same problem, different ceilings, one contract.** Rungs 1–4 all
solve _at-rest value confidentiality_; they share one interface shape
(`encrypt`/`decrypt` over values) and differ only in threat-model ceiling
(key location) and operations (who can write). Rung 5 is a **different
problem class** (delivery, not protection — no value in the artifact) and
gets a different abstraction: `RemotePropertySource` (Wave 3), not
`SecretCipher`. This mirrors Spring's own split (`StringEncryptor`/Jasypt
for at-rest values; Config-Server/Vault as `PropertySource` implementations
for delivery).

**Interface contract — user picks the implementation; pluggability is
security-preserving.** The Spring approach is adopted: one `SecretCipher`
contract, implementations chosen by wiring (`builder.secrets({ cipher: new
JweCipher(…) })`), zero changes elsewhere. Two consequences:

1. **The marker dispatches by scheme.** JWE/age emit their _native_ formats
   (`eyJ…`, age armor) — wrapping them in our envelope would kill the interop
   that justifies them. Marker's first segment is the scheme id
   (`cipher:v1:…` native, `jwe:…`, `age:…`, `kms:v1:…`); a registered scheme
   registry dispatches decrypt. Mixed-scheme rotation works (old `cipher:v1`
   values + new `jwe` values in one deployment).
2. **Guarantees ride the interface, not the implementation.** Every
   implementation MUST provide: authenticated encryption, fail-loud on
   tamper/wrong key/unknown scheme, no plaintext fallback, masked errors,
   AAD binding. An adapter that cannot honor the full set (compact JWE and
   age have no AAD slot) is **refused at wiring by a capability gate** —
   never silently wired with a weaker guarantee.

**V1 surface (owner-confirmed 2026-09-25): rung 1 only; extension points,
not shipped adapters.** Rungs 2–4 (JWE, age, KMS envelope) are _documented
backend shapes_, not code in this wave — they ride the D-4 seam when a
consumer needs them. Runtime delivery (rung 5) is likewise **extension
point only**: Wave 3's `RemotePropertySource` already accepts a `fetch` seam
— a `vault://` URL + custom fetcher is the documented integration shape,
with no Vault-specific code or dependency in the plan.

Why not a dependency for v1 (rung 2/3): zero supply-chain surface is the
repo's standing doctrine (AD-19 D3 `Intl` precedent — platform standard
APIs directly); `node:crypto` AES-256-GCM is the platform standard and
`jose`/`age` add nothing to the v1 threat model. Revisit triggers recorded
for each rung: public-key write-without-read (JWE), hardware-backed keys
(age passkeys), host-compromise resistance (KMS).

### D-4 — Cipher contract, marker format, key source, crypto discipline

- `SecretCipher` interface in `ndigo-context`:
  `encrypt(plain: string, aad?: string): string; decrypt(token: string,
  aad?: string): string`. Native token payload:
  `cipher:v1:<base64url(iv | tag | ct)>` (12-byte IV, 16-byte tag,
  AES-256-GCM). `scheme: string` identifies the implementation for marker
  dispatch (D-3); `capabilities: { aad: boolean }` gates wiring (an adapter
  without AAD support is refused by `DecryptingPropertySource`, never wired
  silently).
- **AAD (additional authenticated data).** `DecryptingPropertySource` passes
  the **key path** (`db.password`) as AAD, so a ciphertext moved from one key
  to another fails auth at lookup instead of silently decrypting under the
  wrong context. Binds the ciphertext to its semantic location.
- **Key discipline — raw key, enforced shape, never a passphrase.**
  `NDIGO_SECRET_KEY` is base64 of exactly 32 bytes (AES-256). Construction
  with a malformed/wrong-length key → immediate `IllegalStateError` (fail at
  startup, not at first decrypt). **Passphrases are rejected outright** —
  no KDF (PBKDF2/Argon2) footgun, no weak-entropy surface; a raw 256-bit key
  is the only accepted shape. Env absent → cipher absent; the **first**
  `{cipher:` value encountered at lookup throws `IllegalStateError` naming
  the env var (no silent plaintext passthrough of what claims to be a
  secret).
- **Nonce policy.** Random 96-bit nonce per encryption. Collision bound
  documented: with 256-bit keys and fresh random nonces per value, the
  forgery/decryption risk under repeated AES-GCM nonce reuse is avoided by
  construction — reuse only becomes a practical concern at astronomically
  large value counts; the version prefix is the seam if a deterministic-nonce
  (counter/SIV) variant is ever wanted. No nonce ever reused across
  encryptions in the same key lifetime.
- **Version prefix (`v1`) is the rotation/migration seam** — a v2 keystore,
  a KMS envelope backend, or a JWE backend can coexist behind the same
  marker; unknown version → `IllegalStateError` (never "treat as plaintext").

### D-5 — `DecryptingPropertySource` (ndigo-context, seam-injected) + boot wiring

- `DecryptingPropertySource(name, source, { cipher })` wraps any source:
  string values matching `^{cipher:` decrypt at `getProperty` time; all other
  values and `hasProperty`/`containsProperty` pass through. Undecryptable
  token → `IllegalStateError` naming the keypath (fail-loud).
- Ordering: placeholders resolve first (`${...}`), **then** decryption — the
  marker payload is base64url and contains no `${`, so ordering is
  unambiguous; documented in the guide.
- Boot (isomorphic) applies decryption when a cipher is provided:
  `ApplicationBuilder.secrets({ cipher })`; `NodeApplication`-style wiring
  passes `AESGCMCipher.fromEnvironment()` when `NDIGO_SECRET_KEY` is set —
  mirroring the AD-13 `readFile` seam (boot stays isomorphic; the platform
  supplies the crypto).
- **Remote values decrypt too (owner-confirmed 2026-09-25).** The
  `DecryptingPropertySource` wraps the config-server source as well, so
  `{cipher:...}` markers inside a fetched document decrypt like any other
  value — defense in depth (config-server responses get cached, logged, and
  proxied more than local files). Ordering care: the remote source is sealed
  **after** registration (post `_configureEnvironment`), so the wrapper sees
  it; a `{cipher:` value in a fetched document with no cipher configured
  fails loudly (never plaintext passthrough).
- Values stay encrypted at rest; only lookup-time results are plaintext.
  Nothing decrypted is ever logged (see Risks R-2).

### D-6 — Config server: plain JSON-over-HTTPS remote source (own contract)

`RemotePropertySource(name, options)` in ndigo-context:

```ts
interface RemoteSourceOptions {
    url: string; // https required at fetch time (enforced)
    pollMs?: number; // 0/absent = fetch once at boot, no polling
    headers?: Record<string, string>;
    optional?: boolean; // default true — fetch failure warns, boot proceeds
    fetch?: typeof fetch; // injectable seam; defaults to globalThis.fetch
}
```

**Auth (owner-confirmed 2026-09-25): static header via env.** Token etc. is
provided through `headers` — sourced from env (`NDIGO_CONFIG_SERVER_TOKEN`)
or builder, **never** from `application.json` (the token header is itself a
secret; the file layer is exactly what the secrets work exists to protect).
Rotation = env rotation + re-poll. No token-provider callback seam in v1;
the `fetch` seam is the extension point if rotating tokens ever become a
real requirement.

- Response: a flat JSON object (nested values allowed — normal source
  semantics; values replace, arrays replace on merge — AD-13 D2 merge
  doctrine). No Spring-Cloud wire format, no Java-era assumptions — any
  HTTPS endpoint serving `{"key": value, ...}` works.
- **ETag/conditional fetch:** when the server returns `etag`, polls send
  `If-None-Match`; `304` → no re-merge, no refresh event. Without ETag,
  body digest comparison gates the change.
- **`optional` semantics mirror the file loader** (`optional:`/`required:`,
  AD-13 D2): default `optional: true` — boot proceeds on fetch failure
  (warn); `optional: false` fails boot loudly naming the URL.
- Lifecycle: `start()`/`stop()` own the polling interval (default
  `globalThis.setInterval`, seam-injectable); boot starts polling after the
  first load, stops it when the returned context closes (subscribes to
  `context:close`).

### D-7 — Precedence: `configServer` sits between `systemEnvironment` and `dotenv`

New documented chain: \*\*`commandLine > boot > systemEnvironment > configServer

> dotenv > application-{profile} > application > defaults`\*\*.

- Env vars and CLI stay authoritative (12-factor: per-deploy externalized
  overrides win — AD-13's stated doctrine); remote config overrides static
  files (it IS the dynamic ops layer). Sources remain named and reorderable
  (P0 semantics) — a deployer who wants remote-over-env moves the source.
- `PrecedenceDoc` updated + the integration spec that asserts wired order
  equals documented order (AD-13 D6: doc and test cannot drift).

### D-8 — The loop: poll → change → `refresh()` → rebind

On a detected change (ETag/body digest), the source `replace`s its own
properties (registry mutation bumps the version → index rebuild + placeholder
cache clear per AD-12 D1), then calls `environment.refresh()` → emits
`config:refresh` → boot's listener (D-3) re-binds `@refreshScope`
`@configurationProperties` classes and refresh-scoped entries re-create. No
change → no event → no rebinding (no storms). Spring Cloud Config publishing
`RefreshScopeRefreshedEvent` on change — same shape, JS-native.

### D-9 — Emitter ↔ Signals reconciliation: follow-up ADR (confirmed)

The repo now has two reactive vocabularies: **Emitter** events (context
lifecycle, this wave's `config:refresh`) and **ndigo-signals**
(`signal`/`computed`/`effect`), bridged by `streamToSignal` (AD-09). This wave
uses the Emitter path on the server (synchronous, zero new deps). The future
direction is a **unification ADR** — a signal-backed environment (e.g. a
`refreshed` signal fed from the emitter event via `streamToSignal`) so
client-side reactive views consume configuration changes without a server
visit. **Owner-confirmed 2026-09-25: ships as its own ADR when a client-side
consumer exists — NOT this wave.**

## 4. Architecture

| Piece                                                                                | Home                                                                           | Notes                                                                                                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AsEventEmitter` on `AbstractEnvironment`; `refresh()` emits `config:refresh`        | `ndigo-context/src/environment.ts`                                             | after index rebuild; no hot-path cost                                                                                                                          |
| `RefreshScope` class + `KnownScope 'refresh'` + `refreshScope` decorator             | `ndigo-factory/src/scope.ts`                                                   | cache clear on event; next `getValue` recreates                                                                                                                |
| Boot rebind listener (`@refreshScope` config classes re-resolve + `setValue`)        | `ndigo-boot/src/application.ts`                                                | subscribes in `_prepareContext`; AD-16 D3 footgun guard intact                                                                                                 |
| `SecretCipher` contract + `DecryptingPropertySource`                                 | `ndigo-context/src/` (new `secret-cipher.ts`, `decrypting-property-source.ts`) | seam-injected cipher; **scheme-registry dispatch** (`cipher:`/`jwe:`/`age:`/`kms:`); key-path AAD binding; capability gate refuses AAD-less adapters at wiring |
| `AESGCMCipher` + `fromEnvironment()` (`NDIGO_SECRET_KEY`)                            | `ndigo-platform-node/src/` (new `aes-gcm-cipher.ts`)                           | `node:crypto` AES-256-GCM; scheme `cipher:v1`; base64url iv.tag.ct; ~250 lines + NIST KAT spec; raw 32-byte key enforced                                       |
| `ApplicationBuilder.secrets(...)` wiring                                             | `ndigo-boot/src/application.ts`                                                | wraps registered sources when cipher provided (AD-13 `readFile` seam pattern)                                                                                  |
| `RemotePropertySource` + `RemoteSourceOptions` + `start/stop`                        | `ndigo-context/src/` (new `remote-property-source.ts`)                         | ETag/If-None-Match; body-digest fallback; `optional` failure semantics                                                                                         |
| Boot config-server wiring (`builder.configServer({...})`, `NDIGO_CONFIG_SERVER_URL`) | `ndigo-boot/src/application.ts` + `_prepareEnvironment`                        | load aft. files, before CLI; start polling; stop on `context:close`                                                                                            |
| `PrecedenceDoc` + order-assertion spec                                               | `ndigo-boot/src/precedence.ts` + spec                                          | `configServer` slot; doc and test updated together (AD-13 D6)                                                                                                  |
| Demo gates                                                                           | `apps/ndigo-api`                                                               | `/config.json` self-served + `/api/config/*` rebind/secrets demos (AD-24 pattern)                                                                              |
| Docs + status                                                                        | guide 03, plans README, gap analysis §3, AD-29                                 | Configuration row → IMPLEMENTED; feature-assessment status refresh                                                                                             |

### API sketch

```ts
// Refresh scope (D-1/D-2)
environment.refresh();               // emits 'config:refresh'
environment.on?.('config:refresh', () => /* rebind consumers */);

@refreshScope
@configurationProperties('server')
class ServerConfig { /* rebinds on every environment.refresh() */ }

// Secrets (D-4/D-5)
const cipher = AESGCMCipher.fromEnvironment();  // NDIGO_SECRET_KEY (raw 32B base64)
builder.secrets({ cipher });
// application.json: { "db": { "password": "{cipher:v1:…}" } }
// key path "db.password" binds as AAD: swap ciphertext between keys → auth failure

// Config server (D-6..D-8)
builder.configServer({
    url: 'https://config.internal/ndigo-api.json',
    pollMs: 30_000,
    optional: true,
});
// PrecedenceDoc: commandLine > boot > systemEnvironment > configServer > dotenv > …
// change at the server → poll detects → refresh() → @refreshScope entries rebind
```

Package deps: **zero new runtime dependencies.** `node:crypto` and global
`fetch` are platform standards (Node ≥ 22); the fetch seam keeps specs
deterministic; `ndigo-context` stays browser-safe (no `node:` imports — the
cipher impl lives in ndigo-platform-node).

## 5. Risks

- **R-1 — Rebind storms.** Mitigation: ETag/body-digest gating (D-8) means a
  refresh event fires only on actual change; `pollMs` is the rate-limit;
  `@refreshScope` is per-class opt-in.
- **R-2 — Plaintext secrets in logs/errors.** Binding failure messages
  (AD-15 D4: class.field + attempted value) could echo a decrypted value.
  Mitigation: `DecryptingPropertySource` reports masked values
  (`{cipher:…}`) in error rendering; no code path logs resolved values
  (grep-verified in review gate). Decrypted values exist only in the bound
  instance.
- **R-3 — Key rotation.** v1 = single key; rotation is a redeploy of
  `NDIGO_SECRET_KEY` **plus re-encrypting values** (the marker version prefix
  and AAD-binding make this mechanical, but it is a real operational step —
  documented in the guide with a rotation recipe). A multi-key keystore /
  KMS envelope (D-3 rung 4) is the migration path if rotation frequency
  becomes a burden (revisit trigger).
- **R-7 — False confidence.** The main risk of adding encryption is
  _believing_ the residue is protected. Mitigations: the threat model is
  stated in §1.1 and the guide ("artifact-level, not host-level"); the
  intro section documents where the ceiling is; review gate checks that no
  code path treats the cipher as an access control.
- **R-8 — Crypto correctness.** The v1 primitive is ours, so its correctness
  is a product risk, not a supply-chain risk. Mitigations: NIST AES-GCM
  known-answer tests in the cipher spec, AAD-binding tests (ciphertext
  swapped between key paths must fail), nonce-uniqueness asserts, key-shape
  enforcement (fail-loud on malformed `NDIGO_SECRET_KEY`), and a review gate
  dedicated to the cipher module. (~250-line module + KAT spec — sized for
  a full audit, not a "thin" wrapper.)
- **R-4 — Customizer double-apply.** Preserved from AD-16: refresh never
  re-runs customizers; the new event is additive and opt-in. Existing spec
  pins this.
- **R-5 — Remote source availability at boot.** `optional: true` default
  means a dead config server degrades to file/env config, not a crash;
  `optional: false` is the loud opt-in. Documented in the guide.
- **R-6 — Emitter↔Signals drift.** Recorded (D-9) with `streamToSignal` as
  the bridge; unification is a tracked follow-up ADR, not silently deferred.

## 6. Sequencing

**Wave 1 — refresh event + scope + rebind.** `AsEventEmitter` on
`AbstractEnvironment`, `config:refresh` emit; `RefreshScope` + `refreshScope`;
boot rebind listener re-resolving `@refreshScope` config classes. Specs:
event fires once per refresh (and not on `getProperty`); unaffected classes
do NOT rebind; customizers-not-re-run spec still green; RefreshScope cache
clears on event (same-instance assertions pre/post); boot-level rebind
integration (new env values → fresh bound instance). Gates: package vitest +
`tsc -b`.

**Wave 2 — secrets.** `SecretCipher` contract + `DecryptingPropertySource`
(ndigo-context), `AESGCMCipher` (ndigo-platform-node), builder wiring, optional
ndigo-api demo (`/api/config/secrets` returns a decrypted demo value bound
from `application.json`). Specs: **NIST AES-256-GCM known-answer tests**
(encrypt deterministically with fixed IV/key → exact expected ciphertext;
decrypt the published vectors) — the correctness gate; round-trip
encrypt→decrypt; tampered token → error; wrong key → error; **AAD binding:
ciphertext created under key path A decrypts under A, fails under B**;
nonce-uniqueness assert (no two encryptions of the same plaintext share a
nonce/IV); non-marker passthrough; placeholders-then-decrypt ordering;
missing key + `{cipher` value → error naming `NDIGO_SECRET_KEY`; malformed
`NDIGO_SECRET_KEY` (wrong length/not base64) → immediate construction error;
unknown marker version → error (never plaintext fallback); bound config
class receives the decrypted value. Gates: package vitest + `tsc -b`.

**Wave 3 — config server.** `RemotePropertySource` (+ fetch seam, ETag,
body-digest, `optional`), boot wiring + `PrecedenceDoc` update + order
assertion spec, **full-loop integration spec**: stub HTTPS endpoint → changed
document → poll → refresh event → `@refreshScope` entry rebinds with the new
value (the wave's payoff spec); 304 → no event; `optional:false` fetch
failure fails boot; `context:close` stops polling (fake-timer spec);
**secrets × remote composition**: fetched document carrying `{cipher:…}`
values + cipher configured → decrypts; without cipher → fails loudly; static
auth header from `NDIGO_CONFIG_SERVER_TOKEN` sent on fetch; `vault://` +
custom `fetch` documented as the runtime-delivery extension point (no
Vault-specific code). Demo gates in ndigo-api (self-served `/config.json`,
`/api/config/*` reflecting live rebind). Gates: package vitest + `tsc -b`.

**Wave 4 — docs + status.** AD-29 (ratifies D-1..D-9; records the
Emitter↔Signals reconciliation note per D-9, revisit triggers incl. KMS
backend + noble/browser case + key rotation); guide 03 gains sections:
refresh/rebind, `{cipher:` secrets + `NDIGO_SECRET_KEY`, config-server source +
precedence; `docs/plans/README.md` entry; **status refresh:** gap analysis
§3 Configuration row → IMPLEMENTED (D-9 follow-up noted), feature-assessment
status row updated, plan status header. Final: `pnpm lint`,
`pnpm format:check`, changed-package `vitest run` + `tsc -b`, `graft build`.

## 7. Verification

- Refresh event: `config:refresh` emitted exactly once per `refresh()`;
  listeners see post-rebuild state; no event on plain lookups.
- Rebind: `@refreshScope` config class reflects new env values after
  `refresh()`; unmarked classes keep the boot-time instance (snapshot
  identity asserted).
- Cipher: NIST AES-256-GCM KATs (deterministic fixed-IV vectors); round-trip;
  tamper/wrong-key → `IllegalStateError`; **AAD binding** (same ciphertext,
  different key path → auth failure); nonce uniqueness across encryptions;
  non-marker passthrough; lazy key failure naming `NDIGO_SECRET_KEY` +
  malformed-key construction error; unknown version → error; error rendering
  masks decrypted values.
- Scheme dispatch: marker `cipher:v1:…` decrypts via `AESGCMCipher`;
  a second registered implementation (e.g. stub `jwe:` adapter) decrypts its
  own scheme; unknown/unregistered scheme → `IllegalStateError` (never
  plaintext fallback); AAD-less adapter refused at wiring (capability gate).
- Remote source: initial load merges into registry at the documented
  precedence slot (PrecedenceDoc spec); ETag 304 skips re-merge + event;
  change → exactly one `config:refresh`; body-digest path identical;
  `optional` false failure fails boot.
- Full loop: server doc change → poll → rebind → `getValue`
  (`serverConfig`) returns fresh values — end-to-end spec.
- Demo: ndigo-api `/api/config/*` counter/port reflects a live rebind and a
  decrypted secret.
- Repo gates: `pnpm lint` (`--deny-warnings`), `pnpm format:check`,
  changed-package `tsc -b`, changed-package `vitest run`, `graft build`.
