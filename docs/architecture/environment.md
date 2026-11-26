# Environment & Configuration

Ndigo resolves one typed, validated configuration for an application from
ordered property sources. The model is fail-loud: a missing key or a bad value
stops startup instead of surfacing later as a runtime surprise. Four building
blocks carry the model — property sources, profiles, typed configuration, and
validation — and the same rules apply on Node.js and in the browser.

> **One environment at a time.** The precedence chain below governs a single
> application context. Platform layers, multiple contexts, and several apps in
> one process compose through
> [Configuration Layering & Context Composition](../guides/configuration-layering-and-context-composition.md).

## Core Building Blocks

**Property sources.** Configuration is a named, ordered list of sources, and
higher sources win. Sources are captured when the environment is built, so a
later mutation cannot change a running configuration.

**Profiles.** Profiles select which sources and components are active. They
accept expressions such as `dev | (test & !ci)`, activate from the command
line, environment, or builder, and apply defaults only when nothing explicit
selects one. `application-{profile}.json` belongs to the same `application`
source as `application.json`.

**Typed configuration.** `@configurationProperties` binds a prefix to a class;
`@property(path, Type)` declares the runtime conversion target because
TypeScript types are
[erased at runtime](https://www.typescriptlang.org/docs/handbook/2/basic-types.html).
`@defaultValue` and `@nestedConfig` cover defaults and nested groups. Exact key
paths are the default; relaxed kebab/camel matching is opt-in per class.

**Validation.** `@environment` declares a Zod schema for the resolved values.
Independent shape violations aggregate into one boot-time report; a value that
cannot bind fails immediately.

```typescript
import { configuration, defaultValue, environment, property } from '@ndigo/context';
import { configurationProperties } from '@ndigo/boot';
import { z } from 'zod';

@configurationProperties('server')
class ServerConfig {
    @property('port', Number) @defaultValue('8080') port!: number;
}

@environment(z.object({ server: z.object({ port: z.coerce.number().min(1) }) }))
@configuration
class AppConfig {}
```

## Precedence Chain

Sources are ordered, and higher wins:

```text
CLI → boot properties → process environment → config server → .env*
     → application-{profile}.json → application.json → defaults
```

`*` `.env` is a reserved slot: Ndigo does not read `.env` files by default. A
custom source can fill the slot when an application needs one.

The doctrine is deployer-over-developer: an operator's runtime choice beats a
value baked into the artefact, and the command line is the most specific
operator channel. This follows the [Twelve-Factor][12factor] rule that
environment variables outrank checked-in configuration.

**Config files merge; they do not stack.** The base `application.json` and every
active `application-{profile}.json` deep-merge into one `application` source:
objects merge, scalars override, arrays replace, and later profile files
override earlier ones. The config server sits in its own slot above files and
below the process environment.

## Design Principles

1. **Fail loud everywhere.** Missing values, malformed profile expressions,
   conversion failures, and invalid environments raise. A typo fails at boot or
   in CI, not in production.
2. **Replace, never mutate.** Sources are captured and replaced or reordered as
   whole units. In-place edits that would shadow another source are unsupported,
   and the process environment is snapshotted.
3. **One conversion path.** Defaults, placeholders, and real values flow through
   the same conversion logic. One precedence chain and one schema per
   environment keep the contract unambiguous.
4. **Secure parsing, not evaluation.** Profile expressions and keys are parsed,
   never executed, so the stack is safe under a strict
   [Content Security Policy][csp] and clean for static scanners.

Default implementations are chosen by measurement rather than taste: when two
strategies are within noise, the one with better sustained behaviour wins and
the alternative stays available as an opt-in. Configuration and environment are
declared with standard JavaScript decorators, so the model stays legible to
language tooling.

## Security Posture

- **No code evaluation.** Profile expressions and keys are parsed; nothing in
  configuration is evaluated as code.
- **Captured, not linked.** Sources are captured when the environment is built,
  and the process environment is snapshotted, so later changes cannot alter a
  running application.
- **Explicit browser boundary.** Only values explicitly intended for the browser
  are exposed to browser code; anything in a client-visible source is public by
  definition.
- **Twelve-factor precedence.** Environment variables never lose to values in
  config files.

## How It Behaves

- **Refresh** rebuilds resolved values and clears caches without re-running
  customizers, so a refresh cannot double-apply.
  [Live Configuration & Secrets](../guides/live-configuration-and-secrets.md) covers live
  rebinding and encrypted secrets.
- **Profile groups** expand one level. A group can contain profile names, but a
  group name inside another group is not expanded further.
- **Provenance** — which source supplied a value — is optional and reported at
  top-level granularity; [Environment & Configuration](../guides/environment-configuration.md) documents the opt-in index.
- **Multi-context** layering is outside this chain; see
  [Config Layering & Contexts](../guides/configuration-layering-and-context-composition.md).

## Where to Go Next

- [Environment & Configuration](../guides/environment-configuration.md)
  — the practical walkthrough: sources, profiles, placeholders, binding, and
  validation.
- [Live Configuration, Secrets & Remote Config](../guides/live-configuration-and-secrets.md)
  — refresh, encrypted values, and the remote source.
- [Configuration Layering & Context Composition](../guides/configuration-layering-and-context-composition.md)
  — platform/application layers and multi-context setups.
- [Architecture Overview](../../ARCHITECTURE.md) — where configuration sits in
  the application lifecycle.
- [Security](./security.md) — the wider trust model.

[12factor]: https://12factor.net/config
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
