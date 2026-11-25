# Annotation, Advice & Transformer — Decorator Inventory

Internal reference for maintainers. This is the full mechanism classification
for every decorator in the tree; the published
[Annotation, Advice & Transformer](./annotation-and-transformer-model.md) page
keeps representative examples. The consumption seams, executor internals, and
naming rules are in
[annotation-and-transformer-model-design-notes.md](./annotation-and-transformer-model-design-notes.md).
This file is not published as a concept page.

"Declaration-only" means the decorator writes metadata and returns the target
unchanged.

## Declaration-only

| Package                    | Decorators                                                                                                                                                                                                                                                                 |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ndigo/core`              | `@sharedDependency`, `@whenProperty`, `@whenProfile`, `@whenNode`, `@whenBrowser`, `@whenMissingEntry`                                                                                                                                                                     |
| `@ndigo/flags`             | `@whenFeature`                                                                                                                                                                                                                                                             |
| `@ndigo/context`           | `@configuration`, `@environment`, `@entry`, `@property`, `@defaultValue`, `@propertySource`, `@nestedConfig`                                                                                                                                                               |
| `@ndigo/factory`           | `@scope`                                                                                                                                                                                                                                                                   |
| `@ndigo/boot`              | `@configurationProperties`                                                                                                                                                                                                                                                 |
| `@ndigo/dispatcher`        | `@routeMapping` (`@publicMapping`/`@privateMapping`), `@getMapping`, `@postMapping`, `@putMapping`, `@deleteMapping`, `@patchMapping`, `@queryMapping`, `@socketMapping`, `@stompMapping`, `@toolMapping`, `@parameters`, `@validatedBy`, `@errorHandler`, `@errorMapping` |
| `@ndigo/openapi`           | `@apiDocs`                                                                                                                                                                                                                                                                 |
| `@ndigo/orm`               | `@entity`, `@column`, `@primaryColumn`, `@generatedColumn`, `@oneToMany`, `@manyToOne`, `@manyToMany`, `@oneToOne`, `@prePersist`, `@postLoad`, `@preUpdate`, `@postRemove`                                                                                                |
| `@ndigo/auth-core`         | `@authenticated`, `@authorized`, `@authorizedScopes`                                                                                                                                                                                                                       |
| `@ndigo/service`           | `@service`, `@getCall`, `@postCall`, `@putCall`, `@deleteCall`, `@patchCall`, `@queryCall`                                                                                                                                                                                 |
| `@ndigo/scheduler`         | `@scheduled`                                                                                                                                                                                                                                                               |
| `@ndigo/jobs`              | `@jobHandler`                                                                                                                                                                                                                                                              |
| `@ndigo/resilience`        | `@retry`, `@circuitBreaker` (declaration half — see below)                                                                                                                                                                                                                 |
| `@ndigo/platform-node`     | `@rateLimit` (policy SPI in `@ndigo/rate-limit`)                                                                                                                                                                                                                           |
| `@ndigo/view-webcomponent` | `@ViewMapping`, `@TagMapping`                                                                                                                                                                                                                                              |
| `@ndigo/signals`           | `@signal`, `@computed`, `@effect` (see the note below)                                                                                                                                                                                                                     |

## Declaration + advice

The decorator itself is declaration-only; the capability pairs it with advice
that ships in the same package.

| Package             | Declarations                | Shipped advice                                  | Pipeline |
| :------------------ | :-------------------------- | :---------------------------------------------- | :------- |
| `@ndigo/resilience` | `@retry`, `@circuitBreaker` | `RetryInterceptor`, `CircuitBreakerInterceptor` | Method   |
| `@ndigo/cache`      | `@cached`                   | `CachedInterceptor`                             | Method   |
| `@ndigo/telemetry`  | `@traced`, `@counted`       | `TracedInterceptor`, `CountedInterceptor`       | Method   |
| `@ndigo/orm`        | `@transactional`            | `TransactionalInterceptor`                      | Method   |
| (application)       | any `methodAnnotation`      | any `MethodInterceptor`                         | Method   |

A declaration-only policy becomes advice the moment a rule selects it. The
table classifies the shipped capability; the pairing is application code.

`TracedInterceptor` and `CountedInterceptor` stay synchronous on purpose:
marking them `async` would make every advised method return a promise the type
system cannot see. `TransactionalInterceptor` joins an open boundary instead of
nesting, because both transaction managers reject an already-active transaction.

## Member transformer

| Package          | Decorators          | Why the replacement stays at definition time     |
| :--------------- | :------------------ | :----------------------------------------------- |
| `@ndigo/signals` | `@reactive` (class) | Rewrites accessors before field initializers run |

`@reactive` is not a hybrid: it returns a subclass and reads the per-instance
signal declarations from `Symbol.for('ndigo.signals.pending')`; it writes no
`Symbol.metadata`. No shipped decorator is a true hybrid after the migration,
though a custom decorator may write metadata and return a replacement.

## Notes

- **Every declaration-only decorator is consumed by exactly one seam.** A
  **processor** runs per instance as the container creates it; a **lifecycle**
  component scans the whole graph on refresh. The design notes list which
  capability uses which, and why the choice is forced.
- **`@signal` / `@computed` / `@effect`** are declaration-only, but their
  declarations do not live in `Symbol.metadata`. Two different facts are in
  play: _which_ members are reactive is a class-level fact and could live on the
  metadata record, while _the initial value_ is per instance and cannot — the
  record is per class. The construction handoff (the initial value, and the
  bound `@effect` methods) therefore lives on the instance itself, under the
  registered `Symbol.for('ndigo.signals.pending')`, non-enumerable and deleted
  once `@reactive` has drained it. The post-construction registries
  (`signalMap`, `computedMap`, `effectDisposers`) stay invisible `WeakMap`s
  because they answer "which signals does this instance have" for its whole
  life.
- **`@retry` / `@circuitBreaker`** keys live in the `resilience:` namespace —
  the namespace names the declaring package, never the consumer.
- **`@rateLimit`** is declaration-only with two consumers: the platform HTTP
  pipeline for request limits and method advice for call limits. One
  declaration, two pipelines.
- **`@errorHandler`** is declaration-only but its decorator is also a utility
  object (`errorHandler.has(...)`). The metadata is the contract; the helper
  methods are convenience.
- **`@ViewMapping` / `@TagMapping`** are PascalCase today, and STYLE_GUIDE
  §3.17 records no exception for them. The JSDoc in the package already says
  `@tagMapping` in places. Tracked as a separate rename.
