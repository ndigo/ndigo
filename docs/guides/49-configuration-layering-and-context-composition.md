# Guide 49 — Configuration Layering & Context Composition

Most Ndigo applications start with one context. As a codebase grows, three
different needs show up and are easy to confuse:

- **Deployment values** — dev, qa, ist, and prod need different databases,
  URLs, and flags.
- **Ownership layers** — a platform team provides defaults and contracts that
  application teams extend or override.
- **Lifecycle boundaries** — a shell owns shared infrastructure while features,
  plugins, or sibling applications own their own entries and teardown.

Ndigo already has a mechanism for each: profiles, property sources, and
parent/child contexts. This guide maps each need to the right one, shows the
composition patterns that work today, and calls out the boundary that is _not_
automatic — a child context inherits entry lookups, but not its parent's
environment.

**Audience:** application and platform architects, and developers composing
more than one context · **Prerequisites:** [Guide 03](03-environment-configuration.md),
[Guide 04](04-dependency-injection-and-lifecycle.md),
[Guide 31](31-micro-frontends.md) · **Reference app:**
[apps/06-ndigo-host-demo](https://github.com/ndigo/ndigo/tree/main/apps/06-ndigo-host-demo)
(feature composition) and
[apps/03-ndigo-todo-web](https://github.com/ndigo/ndigo/tree/main/apps/03-ndigo-todo-web)
(shell + features)

## What you'll learn

- Choose profiles, config layers, or context boundaries for the right problem.
- Reuse platform configuration through a package instead of a parent context.
- Layer static property sources without accidentally changing precedence.
- Compose parent/child contexts for entries and lifecycle, not for config.
- Run multiple applications in one process without sharing environments, and
  address cross-context events explicitly.

## 1. Three axes, not one

| Axis             | Question it answers                               | Mechanism                                         |
| ---------------- | ------------------------------------------------- | ------------------------------------------------- |
| Deployment value | Which values apply in _this_ deployment?          | Profiles + `application-{profile}` files          |
| Config layer     | Which team owns this value, and who may override? | Named property sources, a platform config package |
| Context boundary | Which lifecycle and DI owner owns these entries?  | Parent/child contexts                             |

> **Short rule:** a profile changes values, a config layer contributes values,
> and a context changes ownership and lifecycle. Do not use one to solve
> another problem.

## 2. Environments are profiles, not contexts

A dev, qa, ist, and prod deployment is the **same application** with different
values. Profiles select those values; they do not create separate containers.

### One artifact, many deployments

Use the standard config-file convention when the Node preset (or a configured
`StandardConfigFileLoader`) loads files:

```text
config/
  application.json          # shared defaults
  application-dev.json      # dev overrides
  application-qa.json       # qa overrides
  application-ist.json      # ist overrides
  application-prod.json     # prod overrides
```

`application.json` and the active profile's file deep-merge into one
`application` source: objects merge, scalars override, arrays replace. The
profile file wins. See [Guide 03](03-environment-configuration.md) for the full
precedence chain and the opt-in TOON variants.

```ts
import { runNodeApplication } from '@ndigo/platform-node';
import { AppConfiguration, PlatformConfiguration } from './configuration';

const app = await runNodeApplication([PlatformConfiguration, AppConfiguration], {
    profiles: ['prod'],
});
```

Profiles can also be activated with `--profiles.active=prod` or
`NDIGO_PROFILES_ACTIVE=prod`; the command line wins, then the environment, then
the programmatic list. Profile gates such as `@whenProfile('prod')` and
`acceptsProfiles('prod & !canary')` use the same effective set.

### Why not a context per environment?

Every context has its own lifecycle, entries, and teardown. An environment is a
value set, not a lifecycle boundary. A context per environment also tends to
become a build per environment, which defeats artifact promotion, and it hides
the source precedence the reader needs to understand.

If two deployments need genuinely different _entries_, use profile-gated
configuration classes or two applications — not one context per environment.

## 3. Platform configuration as a package

The normal enterprise "platform → application" pattern is **composition at
build time**, not a parent context at runtime. A platform package exports
configuration classes, defaults, and validation; the application registers them
alongside its own classes in one `ApplicationBuilder` or platform preset. There
is one environment, one lifecycle, and one precedence chain.

```ts
// @acme/platform-config
@configurationProperties('platform.db')
export class PlatformDatabaseConfig {
    @property('host') host!: string;
    @property('port', Number) @defaultValue('5432') port!: number;
}
```

```ts
// application
@configurationProperties('app')
export class AppConfig {
    @property('feature') feature!: string;
}

const app = await new ApplicationBuilder([PlatformDatabaseConfig, AppConfig])
    .profiles('prod')
    .defaults({ platform: { db: { port: 5432 } } })
    .run();
```

The Node preset loads `config/application*.json` by default; wiring
`ApplicationBuilder` directly requires `configFiles(new StandardConfigFileLoader(...))`
or a preset that does it for you.

Decorator metadata is inherited through the class chain, so a platform base
class can declare shared fields and the application can extend it:

```ts
@configurationProperties('platform.db')
export class ReadReplicaConfig extends PlatformDatabaseConfig {
    @property('replica.host') replicaHost!: string;
}
```

Both `platform.db.host` and `platform.db.replica.host` bind. The subclass owns
the additional fields; the platform still owns the base contract.

`builder.defaults(...)` is the **lowest-precedence** source, so application
files and profile variants override it — the right place for platform defaults.
If a platform value must not be overridden, validate it instead of relying on
precedence: make the property required in a Zod schema, or bind it through a
`@configurationProperties` class that fails loud when the value is missing or
invalid. A shared package plus a schema is a stronger contract than a hidden
parent environment.

## 4. Static layering with property sources

Sometimes the platform layer is already a built environment, or the application
needs a snapshot of another environment. The environment API supports named,
ordered layers directly.

```ts
import { StandardEnvironment } from '@ndigo/context';

const environment = new StandardEnvironment();
environment.getPropertySources().addLast('defaults', { server: { port: 3000 } });
environment.getPropertySources().addLast('platform', { server: { port: 8080 } });
environment.getPropertySources().addFirst('app', { server: { port: 9090 } });
```

Higher-precedence sources come first. `addBefore`/`addAfter` place a source
relative to a named anchor when order matters.

`environment.merge(other)` appends the other environment's sources to the
**end** of this environment's source list and copies its active and default
profiles:

```ts
import { NodeEnvironment } from '@ndigo/platform-node';
import { StandardEnvironment } from '@ndigo/context';

const platformEnvironment = new StandardEnvironment();
platformEnvironment.getPropertySources().addLast('platform', {
    region: 'eu-west-1',
    platform: { db: { host: 'db.internal' } },
});

const environment = new NodeEnvironment();
environment.merge(platformEnvironment);
```

`merge()` is a **snapshot**, not a live parent link. A later
`platformEnvironment.refresh()` does not update the merged environment; re-merge
or keep one environment when values must stay in sync.

Merged sources rank below every source already in the target environment —
including `systemEnvironment` and a `defaults` source if one was registered. If
platform values should sit above application defaults but below application
config, use the boot pipeline's `defaults` anchor:

```ts
// `defaults` is registered by the boot pipeline.
const sources = environment.getPropertySources();
sources.addBefore('defaults', 'platform', platformValues);
```

Use `originOf` to confirm which layer won. Origin tracking requires the flat
index — `{ index: 'flat' }`, for example `new NodeEnvironment([], { index: 'flat' })`
— and reports at top-level key granularity: `environment.originOf('server')`
returns `'app'`, `'platform'`, or `'defaults'`.

Secrets are copied as markers, not decrypted values. Apply the decryptor to the
environment that owns the key, or merge already-resolved values only when that
is deliberate. See [Guide 43](43-live-configuration-and-secrets.md).

## 5. Parent/child contexts: ownership, not config

A child context inherits **entry lookups** and **shared dependencies** from its
parent. It keeps its own values, entries, and lifecycle. It also gets its **own
environment** — it does not see the parent's property values.

```ts
import { createShellContext } from '@ndigo/context';

const shell = createShellContext({ name: 'site-shell' });
shell.setValue('platformDb', databasePool);

const feature = shell.newChild('catalog');
feature.setValue('catalogTitle', 'Catalog');

shell.hasValue('catalogTitle'); // false — values do not leak upward
feature.getValue('platformDb'); // resolves from the parent chain
feature.environment.getProperty('platform.db.host'); // undefined unless the child has it
```

`children` is plural because a shell normally hosts several features. A preserved
feature stays alive across navigations, so the shell may have multiple live
children at once; `close()` cascades through all of them.

### Config options for a child context

| Option                          | What it does                                                               | Trade-off                                       |
| ------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| Fresh environment (default)     | `parent.newChild(name)` creates a child with its own `StandardEnvironment` | Child does not see platform values              |
| Copy a snapshot                 | Build a `ConfigurableEnvironment`, `merge(...)`, then `setEnvironment`     | Static; later parent refreshes do not propagate |
| Share one environment           | `setEnvironment(shared)` on a constructed child                            | Child writes affect the parent; no isolation    |
| Pass resolved values as entries | Parent registers the value; child resolves the entry                       | Explicit and type-safe; no config coupling      |

`newChild` always creates a fresh environment. To copy or share one, construct
the child explicitly:

```ts
const featureEnvironment = new NodeEnvironment();
featureEnvironment.merge(platformEnvironment);

const feature = new GenericApplicationContext('catalog');
feature.setParent(shell);
feature.setEnvironment(featureEnvironment);
feature.refresh();
```

If the platform layer exists only to own entries (a pool, telemetry, a cache), the
shell example above is enough. It is DI and lifecycle inheritance; it does not
bring boot's config-file loading, profile activation, or
`@configurationProperties` binding into the child. If the application needs
those, boot it as its own application and compose the platform configuration
classes (section 3), or wire the child context manually and accept the extra
work.

`ApplicationBuilder.child()` and `ApplicationBuilder.parent()` are builder-side
configuration snapshots. They do not attach one runtime context to another and
do not make a child inherit the parent's environment. Do not use them as a
composition API.

### Events between parent and child

Events are addressed explicitly; there is no implicit tree-wide propagation in
the recommended model.

```ts
// local notification
context.emit('catalog:updated', productId);

// feature → the shared root channel
context.root.emit('site:feature-ready', { name: context.name });

// child → its direct owner
context.parent?.emit('site:feature-ready', { name: context.name });

// owner → all direct children
for (const child of shell.children) {
    child.emit('site:theme-changed', theme);
}
```

The root context is the application-wide channel. A feature that subscribes to
`root` must remove its listener when it closes — `on()` returns the emitter, not
a disposer. `ContextEventGateway` is the managed alternative: it relays an
allowlist of events and `destroy()` detaches every subscription.
[Guide 31](31-micro-frontends.md) covers the feature wiring.

Use events for notification, not durable work (that is jobs) or local derived
state (that is signals). If you need to visit more than one level, do the walk
explicitly in application code so the scope is visible.

## 6. Multiple applications in one process

"One for web and one for node" usually means **two runtimes or two deployables**,
not two contexts in one process. A browser bundle runs in a `BrowserEnvironment`;
a Node server runs in a `NodeEnvironment`. They are built and deployed
separately, so share a **config contract** — a package with the config classes,
schema, defaults, and profile conventions — not an environment instance.

```ts
// @acme/shared-config
@configurationProperties('api')
export class ApiConfig {
    @property('timeoutMs', Number) timeoutMs!: number;
}

export const sharedDefaults = { api: { timeoutMs: 5000 } };
```

```ts
// browser app
const web = await new ApplicationBuilder([ApiConfig]).environment(new BrowserEnvironment()).run();

// node app
const api = await new ApplicationBuilder([ApiConfig]).environment(new NodeEnvironment()).run();
```

Each runtime resolves its own sources (`localStorage`, cookies, and browser
defaults in the browser; `process.env`, files, and CLI on the server). Sharing
one environment object across the boundary is a category error.

For an API plus a worker, a tenant host, or a plugin runner, use either separate
applications — each `ApplicationBuilder.run()` returns its own context and
environment — or a platform root with child contexts. Boot in order and close in
reverse:

```ts
const api = await apiBuilder.run();
const worker = await workerBuilder.run();

try {
    // run the process
} finally {
    worker.close();
    api.close();
}
```

If both surfaces are HTTP endpoints in the same runtime, one context with two
dispatchers may be simpler than two contexts. Split only when ownership or
teardown genuinely differs.

## 7. Decision table

| Requirement                                         | Use                                                          | New machinery? |
| --------------------------------------------------- | ------------------------------------------------------------ | -------------- |
| dev / qa / ist / prod values                        | Profiles + `application-{profile}` files                     | No             |
| Platform defaults and typed contracts for one app   | Platform config package + one `ApplicationBuilder`           | No             |
| Static snapshot of another environment              | `merge()` or named sources                                   | No             |
| Platform-owned entries with app/feature lifecycles  | Parent/child contexts                                        | No             |
| Live inheritance of config values from a parent     | Not a supported context semantic today; use merge/compose    | Future work    |
| Shell + features with isolated lifecycle and events | `@ndigo/host` + child contexts + `ContextEventGateway`       | No             |
| Browser + Node deployment                           | Separate builds/processes + shared config package            | No             |
| Multiple apps in one process                        | Separate applications, or a platform root + child contexts   | No             |
| Cross-context notification                          | `root` channel, `parent`/`children`, or an allowlisted relay | No             |

## 8. Anti-patterns

- **A context per environment.** Use profiles; keep one artifact promotable.
- **A parent context as a config-inheritance mechanism.** Children do not inherit
  environment values; use a package or an explicit merge.
- **Mutating a parent environment from a child.** It defeats isolation and makes
  precedence depend on creation order.
- **Sharing a `BrowserEnvironment` with Node, or one environment object across
  runtimes.** Each runtime resolves different sources.
- **Assuming `ApplicationBuilder.child()`/`parent()` creates a runtime parent.**
  They are builder snapshots, not context composition.
- **Tree-wide event propagation as an architecture.** Address the root, a
  parent, or direct children; use a gateway when isolation is required.
- **Putting secrets in an inherited layer without a decryptor.** Merged markers
  stay encrypted until the owning environment applies its decryptor.

## See also

- [Guide 03 — Environment & Configuration](03-environment-configuration.md) — the
  precedence chain, profiles, binding, and validation for one environment.
- [Guide 04 — Dependency Injection, Scopes & Lifecycle](04-dependency-injection-and-lifecycle.md)
  — entry ownership, parent/child contexts, and close order.
- [Guide 31 — Micro Frontends with `@ndigo/host`](31-micro-frontends.md) — shell
  and feature composition, shared dependencies, and event relays.
- [Guide 43 — Live Configuration, Secrets & Remote Config](43-live-configuration-and-secrets.md)
  — refresh, at-rest secrets, and the remote config server.
- [Guide 38 — Deployment & Production Readiness](38-deployment-and-production-readiness.md)
  — environment promotion and operational concerns.
