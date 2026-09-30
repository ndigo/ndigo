# AD-39: Async by default — no `-Async` suffix

**Date:** 2026-09-30
**Status:** Ratified — implemented in `2026-09-30_ASYNC_BY_DEFAULT` changeset.
**Closes:** the naming drift identified in the `@blue/content` `ContentSource`
sync/async split (`AsyncContentSource`, `getContentAsync`).

## Background

BlueJS inherits a Spring-like sync-by-default framing. Spring's
`ContentSource` methods are synchronous, so the Blue port kept
`getContent(key, language): string` synchronous and later added an async twin
interface (`AsyncContentSource extends ContentSource`) with a
`getContentAsync` method for loaders that cannot resolve content in-memory
(`TtlContentSource`).

JavaScript/TypeScript are async by default: `Promise` values and `async/await`
are native, and a method that can be awaited needs no name-level marker. The
`-Async` suffix is a Java-era artifact that:

- **doubles the API surface** — every async capability needs a second
  interface + method pair (`AsyncContentSource` + `getContentAsync`), and
  every caller must know which variant a source implements;
- **inverts the default** — the sync method (the Spring leftover) is the
  "base" contract, so a loader-backed source exposes a degraded sync path
  (TTL's sync `getContent` returned the key itself before any load) beside
  the real one;
- **contradicts the ecosystem** — Node's own convention is the reverse
  (`readFile` async by default, `readFileSync` for the sync twin); standard
  JS libraries never name async members `loadAsync`.

## Decisions

### D-1 — Methods are async by default; never suffix with `Async`

Members do what their name says (`load`, `getContent`, `getMessage`) and
carry async-ness in the return type (`Promise<T>`). An `async` keyword is
allowed when convenient but is not a naming signal. The STYLE_GUIDE
(§3.13 Special Patterns → Async Methods) is updated accordingly and steers
reviewers away from `-Async` suffixes.

### D-2 — When a sync twin is required, suffix it `*Sync`

If a call path cannot await (sync template engines, hot loops, DI seams
that predate async), the **sync variant is the exception and gets the
explicit name**: Node's `readFileSync` pattern. Never the reverse.

### D-3 — `@blue/content` contracts are async by convention

`ContentSource.getContent` and `MessageSource.getMessage` now return
`Promise<string>`. Implementations that are synchronous under the hood
(`StaticContentSource`, `I18nextMessageSource` over i18next) are `async`
methods returning immediately — per the ask, "async by default even if the
implementation is just returning static content". Removed: `AsyncContentSource`
interface, `getContentAsync`, and `AsyncContentLoader` (renamed `ContentLoader`);
`TtlContentSource` exposes a single `getContent` that loads on cache miss.

### D-4 — Composition paths thread the await

`GenericApplicationContext.getContent`/`getMessage` become async
(`ApplicationContext` extends `ContentSource` + `MessageSource`), demo
controllers await content, and the EJS view layer renders templates in
async mode (`ejs` `async: true`) so locale helpers are used as
`<%= await t('key') %>`. `MessageSource` consumers (i18next adapter,
locale switcher) follow.

### D-5 — Existing `-Async` member names are renamed on touch

The telemetry patch helper `_patchAsync` becomes `_patch` (the sync
`_patchSync` keeps its explicit name).

## Consequences

- A single content/message method per contract; callers always `await`.
- Breaking change for any external consumer of the sync `ContentSource`
  method or of `AsyncContentSource`/`getContentAsync` — removed entirely
  rather than deprecated (this repo's clean-cutover rule; blocks are
  pre-1.0).
- EJS templates that use async helpers must `await` them (`async: true`
  engine mode).

## References

- [STYLE_GUIDE.md](../../STYLE_GUIDE.md) §3.13 Special Patterns → Async Methods
- [`@blue/content`](../../packages/blue-content/README.md)
- [`@blue/view-ejs`](../../packages/blue-view-ejs/README.md)
