# Guide 43 — Live Configuration, Secrets & Remote Config

Configuration is more than the boot-time source chain: entries can rebind on
`config:refresh`, secret values can stay encrypted at rest, and a remote config
server can update a running app. This guide covers those three surfaces; the
source precedence, profiles, binding, and validation pipeline lives in
[guide 03](03-environment-configuration.md).

**Audience:** Node application developers and operators · **Prerequisites:** [Guide 03](03-environment-configuration.md) · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)

## What you'll learn

- Opt a configuration class into live rebinding with `@refreshScope`.
- Understand what refreshes and what keeps its boot-time snapshot.
- Store secrets as `{cipher:...}` values with a separate `NDIGO_SECRET_KEY`.
- Add a remote JSON config source with ETag polling.
- Shut polling down with the context.

## 1. Live rebind — `@refreshScope`

Configuration is no longer a boot-time snapshot: environments emit
`config:refresh` after every `refresh`, and entries opt in to re-binding on
it. Mark a `@configurationProperties` class:

```ts
import { refreshScope, configurationProperties, property } from '@ndigo/context';

@refreshScope // re-binds on every environment refresh
@configurationProperties('server')
class ServerConfig {
    @property('port', Number) @defaultValue('8080') port!: number;
}
```

- `@refreshScope` = a scope (`scope('refresh')`): its cached instance is
  discarded on `config:refresh`; the next `getValue` re-creates from the
  factory.
- The boot rebind listener re-runs `resolveConfigurationProperties` +
  `setValue` for refresh-scoped classes — `getValue('serverConfig')` returns
  the fresh snapshot; unmarked classes keep the boot-time instance
  (snapshot identity).
- Scope-level entries (constructor-registered classes) clear their caches on
  the event too.
- **Freshness is on re-fetch, not on the reference**: an entry that captured
  a config object in its constructor keeps the old object until it
  re-looks up. No proxy machinery (repo posture) — documented, deliberate.
- Coverage is config classes only in v1 ; `@entry` method
  results are not re-run.

#### Refresh snapshot semantics

`config:refresh` re-binds the opt-in surface only — it does **not**
re-inject consumers. After a refresh:

- singleton entries and consumers that captured a value **at construction**
  keep the **old** value for their lifetime;
- only `@refreshScope` entries and re-bound `@configurationProperties` names
  see the new values (from their next lookup);
- an entry that injects the environment / property accessor (or reads
  `environment.getPropertyAs(...)` at call time) always observes the
  current source state.

The recommended consumer pattern is therefore to **inject the environment
(or another property accessor) rather than the value**: reads at call time
see fresh state after any number of refreshes, while captured values go
stale the moment a refresh lands. Dependency re-injection of captured
values is a designed follow-up (plan ARC-3) — v1 consumers must re-look-up
or read through the environment.

Implementation note: `@refreshScope` is realized by **two listeners** —
the context's scope-clear (`RefreshScope.clear` on `config:refresh`) and
boot's config-class rebind (`resolveConfigurationProperties` + `setValue`)
— whose relative order is their subscription order.

## 2. At-rest secrets — `{cipher:...}` values and `NDIGO_SECRET_KEY`

Encrypted config values keep secrets out of repos/backups/logs: the
**ciphertext** lives in the file, the **key** lives in a separate channel.
This defends read-only access to stored artifacts (repo leak, backup, paste)
— it does NOT defend against full host compromise (documented threat model,
).

```json
{ "db": { "password": "{cipher:v1:…}" } }
```

```ts
// Node bootstrap: key + decryptor wiring
const app = new ApplicationBuilder([/* configurations */]);
app.secrets(AESGCMCipher.fromEnvironment()); // reads NDIGO_SECRET_KEY
```

- `NDIGO_SECRET_KEY` is base64 of **exactly 32 bytes** (AES-256); malformed
  or wrong length fails at construction, never a passive field. Passphrases
  are rejected.
- Values resolve to plaintext at every lookup and in
  `@configurationProperties` binding; the key path (`db.password`) is bound
  as GCM AAD — moving a ciphertext between keys fails auth at lookup.
- Fail-loud everywhere: wrong key, tampered value, or an unknown
  marker scheme throws; decrypted values never reach error text or logs.
- The marker's `scheme` segment is the dispatch key — a deployment can mix
  schemes (old `cipher:v1` + future `jwe:` values) during migration; an
  adapter whose capabilities can't honor key-path AAD is refused at wiring.
- With no decryptor wired, markers pass through as raw text (local binding
  does not fail) — the two-channel posture is deployer-driven, not
  enforced; wires are the signal.

## 3. Config server — remote sources and the poll loop

Fetch a plain JSON document over HTTPS and make it a named source — changes
merge live and rebind refresh-scoped entries:

```ts
builder.configServer({
    url: 'https://config.internal/ndigo-api.json', // https enforced
    pollMs: 30_000, // 0/absent = fetch once
    headers: { Authorization: `Bearer ${process.env.NDIGO_CONFIG_SERVER_TOKEN}` },
    optional: false, // fail boot when unreachable
});
```

- Precedence slot: `commandLine > boot > systemEnvironment > configServer >
   dotenv > application-{profile} > application > defaults` (documented
  chain, pinned by a real-boot order spec; the `dotenv` entry is a reserved
  slot — nothing reads `.env`, see §1).
- **Change detection**: ETag/`If-None-Match` (304 → nothing happens) or
  body-text comparison. A real change replaces the source in place and
  fires `environment.refresh` → `config:refresh` → `@refreshScope` entries
  rebind. No change → no event → no rebinding.
- `optional: true` (default): a dead server at boot warns and proceeds on
  local sources; later poll failures keep last-good. `optional: false`
  fails startup loudly naming the URL.
- `{cipher:...}` values inside a fetched document decrypt when `secrets(...)`
  is also wired.
- Lifecycle: polling starts after boot succeeds and stops when the returned
  context closes.
- Runtime delivery (e.g. Vault): use a custom `fetch` seam with a
  `vault://`-style URL — documented extension point, no Vault-specific
  code in v1 .

## See also

- [Guide 03 — Environment & Configuration](03-environment-configuration.md) — the boot-time pipeline
- [Guide 04 — Dependency Injection, Scopes & Lifecycle](04-dependency-injection-and-lifecycle.md) — the refresh scope
- [Guide 28 — Security Hardening](28-security-hardening.md) — secret delivery and production posture
- [Environment API](../reference/2026-09-08_ENVIRONMENT_API.md) — the full surface
- — refresh, secrets, and config server
