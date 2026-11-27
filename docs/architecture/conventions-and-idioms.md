# Conventions & Idioms

The durable idioms behind Ndigo code: the five nouns every application
uses, the naming rules that make intent visible, the module boundaries
that keep the framework portable, and the documentation habits that make
each package readable on its own. Read this page for the _why_; the
normative specifications live in the references at the end.

## The five nouns

Every Ndigo application is built from the same five nouns, whether it
runs on Node or in the browser:

- **Context** — the dependency container with a lifecycle. You register
  configuration and entries; the context creates them, injects their
  collaborators, and closes them in order.
- **Entry** — a registered component the context instantiates and wires.
  Entries are the unit of composition: one context, many entries.
- **Route** — a mapping from an HTTP path (or a view name) to a handler.
  Routes are declarative metadata, not imperative registration.
- **Handler** — the function that processes a request and returns a result.
  Handlers are thin: they validate, delegate to services, and shape the
  response.
- **View** — a renderable that produces a representation (HTML, JSON,
  a custom element). Views are framework-agnostic output.

The platform preset supplies the runtime — a socket and HTTP server on
Node, hash routing and DOM targets in the browser — but the five nouns
and their vocabulary are identical.

## Naming that carries meaning

Names are the primary documentation. Ndigo fixes a few forms so that a
reader can tell what a symbol _does_ before reading its body:

- **Predicates** use `is` for type or identity checks (`isString`,
  `isContextToken`) and `like` for structural, duck-typing checks
  (`likeController`, `likeFactory`). An `is*` asks "is this an instance
  of X?"; a `like*` asks "does this behave like X?".
- **Role suffixes** name responsibility: `*Handler` processes,
  `*Resolver` locates, `*Strategy` encapsulates an algorithm, `*Factory`
  creates, `*Registry` stores, `*Service` holds business logic,
  `*Controller` handles web requests, `*Adapter` adapts interfaces.
- **Decorators** are `camelCase` (`@routeMapping`, `@injectable`) so they
  are never confused with classes or types, which are `PascalCase`.
- **Acronyms** are all-uppercase in types (`HTTPTransformer`,
  `JSONParser`) and all-lowercase or all-uppercase in identifiers
  (`httpTransformer`, `myHTTPData`).
- **Interfaces and abstract classes** are description-first:
  `UserDataTransformer implements DataTransformer`; abstract classes carry
  the `Abstract` prefix.

The full rules — including property vs. method, method prefixes, and
type-safe enums — are in the [Style Guide](../../STYLE_GUIDE.md).

## Module boundaries

- **Public modules** are exported through `src/index.ts` and form the
  stable, documented API. Everything else is an implementation detail.
- **Internal modules** are prefixed with an underscore (`_util.ts`,
  `_parser.ts`) and are never imported across packages.
- **External dependencies** are imported through their designated
  integration layer (`@ndigo/ai-sdk`, `@ndigo/boot`, `@ndigo/signals`,
  `@ndigo/view-toon`), never directly. The layer is the only importer of
  the encapsulated library.
- **Factory functions** distinguish state: `create*` takes no global state
  into account; `get*` does.

## Errors and validation

- Use specific error classes (`IllegalStateError` from `@ndigo/core`)
  rather than generic `Error`.
- Validate at boot and fail loudly: missing required configuration or a
  conversion failure names the class and field and stops startup.
- Problem details (`application/problem+json`) are the standard error
  shape for HTTP responses.

## Documentation

- Names carry meaning; comments carry rationale. Document _why_, not
  _what_.
- Bare type assertions (`as any`, `as unknown as T`, `// @ts-ignore`)
  need a one-line reason; `// NOTE:` marks technical debt.
- Every package carries its own README and generated API reference so a
  developer who needs only `@ndigo/http` never opens the monorepo docs.
  The standard is defined in
  [Package Documentation](../../docs/guides/package-documentation.md).
- Demo applications follow the naming and layout rules in
  [Application Conventions](../../docs/guides/application-conventions.md).

## Where the full rules live

This page is the map, not the specification. For the normative rules:

- [Style Guide](../../STYLE_GUIDE.md) — naming, formatting, and code
  organization, in full.
- [Package Documentation](../../docs/guides/package-documentation.md) —
  the README standard, manifest metadata, and API generation.
- [Application Conventions](../../docs/guides/application-conventions.md) —
  demo app naming, pairing, and folder layout.
- [Design Principles](./design-principles.md) — SOLID, DRY/AHA, and the
  shared contract vocabulary.
  EOF
  echo "lines: $(wc -l < docs/architecture/conventions-and-idioms.md)"
