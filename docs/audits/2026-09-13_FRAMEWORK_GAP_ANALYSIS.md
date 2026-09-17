# Framework Gap Analysis — BlueJS vs. Enterprise Web Frameworks

**Date:** 2026-09-13
**Scope:** All framework packages (`packages/blue-*`) + demo apps, benchmarked against
Spring Boot, NestJS, ASP.NET Core, Micronaut/Quarkus, and AdonisJS for feature
completeness and maturity.
**Method:** Graft graph orientation, source review of package indexes and key
surfaces (`blue-content`, `blue-auth-*`, `blue-orm*`, `blue-management`,
`blue-platform-node`, `blue-http`), recent ADRs (3, 7–18), the framework
assessment audit (`2026-09-05_FRAMEWORK_ASSESSMENT.md`), and the repository
remediation plan (`docs/plans/2026-09-04_REPOSITORY_REMEDIATION.md`).
**Status:** Baseline — supersedes the older package-maturity tables where they
conflict with the current repository state.

---

## Executive Summary

BlueJS's core web stack (core → factory/context → router/dispatcher → view →
platform adapters) is complete and coherent; the recent wave of work (OIDC
PKCE fail-closed, CSRF, CORS split, request limits, RFC 9457 problem+json,
SSE, WebSockets, environment/config phases 0–6, Drizzle ORM completion,
`@blue/host` AD-18) closed most of the externally reachable gaps flagged in
the 2026-09-04 remediation plan.

The remaining gaps versus enterprise frameworks concentrate in the
**operational surface**: scheduled work, data evolution (migrations),
server-side caching, rate limiting, security headers, uploads, API
documentation, and session persistence. The single largest **functional**
gap is **Content / i18n**: the repo has a sound content-_resolution_ layer
(`@blue/content` sources, themes, Accept-Language negotiation, a dispatcher
`LanguageResolver` strategy) but no message _formatting_, no locale-aware
date/number formatting, and no client-side reactivity or SSR-safety story.

This audit records (a) the full gap inventory, (b) the incomplete-feature
list with evidence, and (c) a proposed direction for the Content/i18n gap
that follows the repo's established pattern: **own the contract, wrap the
ecosystem standard, use platform standard APIs (`Intl`) directly.**

---

## 1. Current Feature Inventory (verified)

| Area             | What exists                                                                                                                                                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation       | `blue-core` (primitives, radix tree, media types, `ConversionService` + built-in converters), `blue-util`, `blue-factory` (DI, scopes, lifecycle, entry processors, aware mixins)                                                                                     |
| Context          | `blue-context`: application context, event emitter/gateway, context hierarchy, feature mount manager, environment (property sources, profiles, placeholders, typed lookup, CLI args, validation, observability — AD-11..17)                                           |
| Boot             | `blue-boot`: `ApplicationBuilder`, profiles, typed config binding (`@configurationProperties`), config-file loader                                                                                                                                                    |
| Reactive         | `blue-signals`: `signal`/`computed`/`effect` + decorators (re-exports `@preact/signals-core`)                                                                                                                                                                         |
| HTTP client      | `blue-http`: fetch-based, interceptors (timeout, retry, cache, content-type, status, not-ok, error-normalization, trace-header, app-reset, transform), body transformers, WHATWG-aligned parsers                                                                      |
| Routing/dispatch | `blue-router` (routes, partitions, routing registry, interceptor chain), `blue-dispatcher` (radix handler mapping, argument resolvers, `@parameters`, `validatedBody`/`validatedQuery`, Zod-backed binding, interceptors, RFC 9457 errors, language/theme strategies) |
| Views            | `blue-view` (JSON/CSV/text/octet-stream/producer views, content negotiation, island views, view mapping), `blue-view-ejs`, `blue-view-webcomponent` (Web Components, hydration, islands)                                                                              |
| Service          | `blue-service`: typed service registry, `Service.call`, `streamCall` (SSE client), request-id correlation, telemetry hooks                                                                                                                                            |
| Platform         | `blue-platform-node`: managed HTTP server, node dispatcher, static files, cookies, CSRF, CORS, SSE, `@socketMapping` (RFC 6455), graceful shutdown, request limits, problem+json; `blue-platform-web`: browser glue, argument resolvers, offline queueing             |
| Data             | `blue-orm`: entities, relations, lifecycle hooks, `@transactional`, in-memory + `blue-orm-drizzle` (all five contracts), Zod-derived schemas                                                                                                                          |
| Management       | `blue-management`: `/health`, `/metrics`, health registry, telemetry indicator                                                                                                                                                                                        |
| Auth             | `blue-auth-core` (principal, registry, session), `blue-auth-client` (OIDC authorization-code + PKCE + nonce, fail-closed), `blue-auth-server` (JWT via `jose`, `AuthRouteGuard` with 401/403 denials, explicit scheme selection)                                      |
| Telemetry        | OpenTelemetry traces/metrics/logging; node + web instrumentations (HTTP server, dispatcher, router, SSE, view resolution, service client)                                                                                                                             |
| Micro frontends  | `blue-host` `HostManager` (AD-18, one-call feature registration), shared dependency registry                                                                                                                                                                          |
| Tooling          | `blue-test` (MockHTTP/BrowserMockClient), `blue-oxlint-plugin`, `blue-generators`, CI lanes (audit, format, manifest, strict types)                                                                                                                                   |

---

## 2. Gaps — Features Missing Entirely

### 2.1 Tier 1 — enterprise must-haves

| Gap                                   | Industry equivalent                                                                                 | BlueJS state                                                                                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scheduled tasks / background jobs** | Spring `@Scheduled`/Quartz, NestJS `@nestjs/schedule`, ASP.NET `IHostedService`, AdonisJS scheduler | **IMPLEMENTED 2026-09-13 (AD-20)** — `@scheduled` decorator, smart-lifecycle auto-discovery, single-flight engine — see [plan](../plans/2026-09-13_SCHEDULING.md) and [guide](../guides/05-scheduling.md). |
| **Database migrations**               | Flyway/Liquibase, TypeORM migrations, EF Core Migrations, Drizzle Kit, AdonisJS migrations          | None — schema is _derived_ from entity metadata but cannot evolve an existing database. Last open ORM gap from `2026-09-05` audit (M3).                                                                    |
| **Server-side caching abstraction**   | Spring `@Cacheable`, ASP.NET `IMemoryCache`/`IDistributedCache` + response caching                  | Only client-side HTTP caching (`cache-interceptor`, `if-modified-interceptor`). No server cache-aside, TTL store, or cache annotations.                                                                    |
| **Rate limiting**                     | `@nestjs/throttler`, ASP.NET built-in rate limiter, Bucket4j                                        | Nothing — named missing in remediation SEC-6; not landed.                                                                                                                                                  |
| **Security headers**                  | Helmet; Spring/ASP.NET header middleware (CSP, HSTS, X-Frame-Options, nosniff)                      | Nothing — SEC-6; not landed. (CSRF itself is covered.)                                                                                                                                                     |
| **Multipart / file upload**           | Spring `MultipartFile`, NestJS `FileInterceptor`, ASP.NET `IFormFile`                               | Server cannot accept uploads — `MULTIPART_FORM_DATA` constant and client `FormData` transformer exist, but the Node body resolver has no multipart parser.                                                 |
| **OpenAPI / API docs**                | springdoc-openapi, `@nestjs/swagger`, Swashbuckle                                                   | Nothing — no spec generation, no Swagger UI, no typed-client generation.                                                                                                                                   |

### 2.2 Tier 2 — significant

| Gap                                     | Notes                                                                                                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Message-broker / outbox integration** | Spring Kafka/RabbitMQ, NestJS microservices. BlueJS has in-process `EventEmitter`/event gateway only. Defensible deferral.                                |
| **Trusted-proxy / client-IP handling**  | No `X-Forwarded-For` support; cannot resolve real client IP behind a proxy.                                                                               |
| **DTO/object mapping**                  | `ConversionService` covers String↔typed binding; no model-to-model projection (Spring `BeanUtils`, class-transformer).                                    |
| **Server-side session store**           | `Session`/`DefaultSession` + `@session` resolver exist; no backing store (Redis/JDBC/cookie), no TTL, no cross-restart persistence. Audit M4, still open. |

### 2.3 Tier 3 — defensible deferrals

Multi-tenancy, job queues (Batch/Bull), Testcontainers-style test
infrastructure, feature-flag framework, gRPC. Not MVP blockers; enterprise
adopters will ask about them at 1.0.

---

## 3. Features Present but Incomplete

| Feature                  | What exists                                                                                                                                             | What's missing                                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content / i18n**       | `ContentSource` key lookup + fallback, static/composite/priority/TTL/negotiating sources, themes, dispatcher `LanguageResolver` (Navigator default)     | Message formatting (params/plurals/ICU), locale-aware date/number formatting, client reactivity + persistence, SSR-safe formatting. **IMPLEMENTED 2026-09-13 (AD-19)** — see [plan](../plans/2026-09-13_CONTENT_I18N.md) and [guide](../guides/04-i18n-and-content.md). |
| **WebSockets**           | `@socketMapping` (RFC 6455), echo/room demos, socket session                                                                                            | No cross-node pub/sub, no message history. **CLOSED 2026-09-15/16 (AD-21..23)** — broadcast/rooms/heartbeat (AD-21), client + reconnect (AD-22), STOMP broker + client (AD-23); SockJS deliberately never.                                                              |
| **ORM**                  | All five contracts + Drizzle adapter, relations, lifecycle hooks, `@transactional`, Zod-derived schemas                                                 | No pagination/sorting API, no migrations, no lazy loading / relation fetch semantics, `DerivedQueryRepository` thin.                                                                                                                                                    |
| **Management endpoints** | `/health`, `/metrics` auto-registered                                                                                                                   | Unprotected by default (auto-configuration JSDoc tells callers to add a guard); no bind-address separation, no redaction policy (SEC-5 acknowledged, not resolved).                                                                                                     |
| **Auth**                 | OIDC authorization-code + PKCE + nonce (fail-closed), JWT, `@authenticated`/`@authorized`, `AuthRouteGuard` 401/403 denials, explicit scheme selection  | No credential/password auth or first-party user store, no refresh-token flow, no revocation, no server session auth.                                                                                                                                                    |
| **Static files**         | `StaticFileView` + hardened `StaticResourceResolver`                                                                                                    | No Range requests, ETag/conditional GET, cache headers, gzip/brotli, SPA history-mode fallback, or directory-listing control.                                                                                                                                           |
| **Argument binding**     | body/header/query/path/cookie/session/state/model/bind resolvers, `withConversion`, `validatedBody`/`validatedQuery`, matrix params in route conditions | No `@ModelAttribute` form-binding decorator (form-urlencoded parses to a raw `Record`), no `@matrixVariable` resolver, no `@requestPart` (blocked by multipart gap).                                                                                                    |
| **Configuration**        | Property sources, profiles, placeholders, typed binding, validation, origins/customizers, refresh (AD-11..17)                                           | No secret encryption/decryption, no live bean rebind (`@RefreshScope` equivalent), no config-server integration.                                                                                                                                                        |
| **Telemetry**            | OTel traces/metrics/logging; broad instrumentation set                                                                                                  | No trace-sampling config, no exporter ergonomics beyond SDK defaults, no exposed log↔trace correlation tooling.                                                                                                                                                         |

---

## 4. Content / i18n — the biggest gap

**Status:** IMPLEMENTED 2026-09-13 via AD-19 (decision) +
[docs/plans/2026-09-13_CONTENT_I18N.md](../plans/2026-09-13_CONTENT_I18N.md)
(spec + phases 1–4, all landed). This section is retained as the design
record; §4.2–4.5 describe the implemented shape.

### 4.1 Current state (verified)

`@blue/content` is a content-_resolution_ layer, not an i18n layer:

- `ContentSource.getContent(key, language)` — raw string lookup with
  key-fallback; `StaticContentSource`, `CompositeContentSource`,
  `PriorityContentSource`, `TtlContentSource` (async + TTL cache),
  `NegotiatingContentSource` (parses `Accept-Language`, region-subtag
  stripping, default-language fallback).
- `Theme`/`ThemeSource`/`ThemeResolver` — named themes bundle a content
  source.
- `blue-dispatcher` carries a `LanguageResolver` strategy
  (`AsLanguageResolverStrategy`) with `NavigatorLanguageResolver('en-US')`
  as the default, plus a parallel `ThemeResolverStrategy` (fixed/context
  theme name resolution). The resolved language currently feeds **view-name
  resolution only** (`_resolveViewName(viewName, language)`) — it is not
  wired to content lookup, templates, or formatting, and neither strategy
  reaches a `ContentSource` directly.

Missing entirely: message formatting (interpolation, plurals, contexts),
locale-aware number/date/relative/list formatting, locale persistence
(cookie/localStorage), reactive locale switching on the client, lazy
locale loading beyond `TtlContentSource`, SSR hydration-safety rules, RTL.

### 4.2 The industry pattern: contract + platform standard

Spring does not implement a formatting engine. It owns the **contract**
(`MessageSource`, `LocaleResolver`, `FormatterRegistry`) and delegates
engines to the platform standard: Java `ResourceBundle` for resource
storage and `MessageFormat` (ICU-derived) for formatting. ASP.NET does the
same with `IStringLocalizer` over `CultureInfo`/`ResourceManager`.
AdonisJS (closest JS analogue) owns the contract and delegates to
`@formatjs/intl` (ICU MessageFormat).

The JS platform standard is `Intl` — `Intl.DateTimeFormat`,
`Intl.NumberFormat`, `Intl.RelativeTimeFormat`, `Intl.PluralRules`,
`Intl.ListFormat` — fully available in Node ≥22 and all modern browsers
(no data downloads; engines ship CLDR). Message _translation_ (keys,
interpolation, plurals, contexts, fallback chains, lazy loading) is not in
`Intl`; the de-facto standards are **i18next** (largest JS ecosystem:
react-i18next, http backend, language detectors, resource JSON) and
**ICU MessageFormat** via `@formatjs/intl` (the standards-aligned option;
`Intl.MessageFormat` is a TC39 Stage-3 proposal).

### 4.3 Implement vs. wrap — the decision split

BlueJS has already settled this question three times: `blue-signals`
re-exports `@preact/signals-core`; validation replaced a home-grown system
with **Zod** (AD-7); telemetry wraps **OpenTelemetry**. Reinventing plural
rules, ICU syntax, or a resource loader would violate the repo's own
pattern. The split:

| Layer                                            | Decision                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BlueJS-owned — implement (small, high value)** | `MessageSource` contract (`getMessage(key, args?, locale)` over `ContentSource`); `LocaleResolver` strategy family (fixed / cookie / localStorage / accept-header / navigator) extending the existing `LanguageResolver`; reactive locale signal (client); thin `Intl` formatter wrappers (cached instances, explicit locale + timeZone, injectable); dispatcher/view/template wiring; SSR-safety rules. |
| **Wrapped ecosystem standard — adapt**           | i18next as the reference `MessageSource` implementation: resource storage, interpolation, plurals, contexts, fallback chains, lazy loading, detectors. Contract stays open so an ICU/formatjs backend can be a second implementation.                                                                                                                                                                    |
| **Used directly — never implement**              | `Intl.*` for all date/number/relative/list/plural-category formatting; plural-rule tables, ICU parsing, locale data, resource formats, fallback algorithms.                                                                                                                                                                                                                                              |

### 4.4 Proposed BlueJS surface

- `@blue/content`: `MessageSource` interface + `I18nextMessageSource`
  adapter (and optionally `FormatJSMessageSource`) + `MessageSourceAware`
  mixin; `LocaleResolver` family; `AsLocaleResolverStrategy` mirroring the
  dispatcher strategy pattern.
- `@blue/core`: `DateTimeFormatter`, `NumberFormatter`,
  `RelativeTimeFormatter`, `ListFormatter` — thin `Intl` wrappers (next to
  `converter.ts`; formatting is conversion-adjacent and `ConversionService`
  already lives there). Cached per-locale instances, explicit
  `locale`/`timeZone` parameters, never ambient server defaults.
- `@blue/platform-web`: `CookieLocaleResolver`/`LocalStorageLocaleResolver`,
  locale signal, reactive re-render on change.
- `@blue/platform-node`: `AcceptLanguageLocaleResolver` (reuse
  `parseAcceptLanguage`) as the server default; wire locale into the
  request context.
- `@blue/dispatcher`/views: flow the resolved locale to content/templates
  (today it only reaches view-name resolution); expose locale to handlers
  (`@locale` parameter) and islands.
- EJS/island integration: locale passed through the island contract so
  server and client render identical output.

### 4.5 The client-side angle (Spring never faced this)

Spring is server-only; BlueJS is isomorphic, which adds requirements:

1. **Locale detection & persistence** — browser `navigator.language(s)`
   (exists) vs. server `Accept-Language` (helper exists); a user override
   persisted in cookie/localStorage; strategy order explicit-user-choice
    > header/navigator > fixed default.
2. **Reactivity** — locale is state: a `locale` signal re-renders views and
   re-formats on switch. Spring's equivalent is a full page reload.
3. **SSR/hydration parity** — a server-rendered date in server-local
   timezone will not match the client's re-render → hydration mismatch on
   islands. Rule: formatters take explicit `locale` and `timeZone`; server
   renders with the request locale and a pinned timezone.
4. **Bundle strategy** — translation resources load lazily per locale
   (i18next http-backend / dynamic import; `TtlContentSource` already
   provides TTL caching for the sync/async seam). `Intl` needs no locale
   data downloads, so formatting adds no bundle weight.
5. **RTL** — view-layer `dir` handling derived from the resolved locale.
6. **Defaults** — no server locale/timezone may be baked into markup.

### 4.6 Open decisions

1. **Reference backend: i18next vs. ICU/formatjs.** i18next wins on
   ecosystem and lazy-loading maturity (and is the tool named in this
   conversation); ICU wins on standards alignment and AdonisJS parity. The
   contract supports both; the recommendation is **i18next first**, ICU as
   a documented alternative. **DECIDED — AD-19, D2:** i18next is the
   reference implementation in an adapter package; the contract stays open
   for an ICU backend.
2. Whether `MessageSource` composes `ContentSource` (theme/content-key
   hierarchy stays authoritative) or runs beside it. Recommendation:
   **compose** — a message is a formatted content key. **DECIDED — AD-19,
   D1.**
3. Whether formatters live in `blue-core` (proposed) or a new `blue-format`
   package. `blue-core` avoids a new package for four thin wrappers.
   **DECIDED — AD-19, D3:** formatters live in `blue-core` next to
   `converter.ts`.

**Decision record:** `docs/decisions/2026-09-13_AD19_CONTENT_I18N.md`.
**Implementation plan:** `docs/plans/2026-09-13_CONTENT_I18N.md`.

---

## 5. Recommended Sequencing

Priority-ordered (matches where BlueJS already has seams):

1. **Scheduling + migrations** — biggest enterprise-credibility win on the
   smallest surface; both slot into existing decorator/ORM patterns
   (`@scheduled`, drizzle migration runner). Do not pass the 1.0 checkpoint
   without them.
2. **Content/i18n completion (§4)** — the largest functional gap; contract +
   i18next adapter + Intl wrappers + locale strategy family, per the split
   above.
3. **Rate limiting + security headers** — interceptor-shaped, fit the
   `blue-platform-node` interceptor + auto-configuration machinery (SEC-6).
4. **Server-side caching abstraction** — `@cacheable` decorator + in-memory
   store in the signals/ORM style.
5. **Multipart + OpenAPI** — multipart first (small parser + `@requestPart`),
   then OpenAPI (Zod schema derivation already exists, so spec generation
   is tractable).
6. **Completion pass** — management access policy, static-file
   ETag/Range/compression, session store, WebSocket broadcast.

None of this blocks the core dispatch/view/ORM path, which is complete and
well-tested. The gaps concentrate in the operational surface and Content.

---

## References

- Framework assessment: `docs/audits/2026-09-05_FRAMEWORK_ASSESSMENT.md`
- Remediation plan: `docs/plans/2026-09-04_REPOSITORY_REMEDIATION.md`
- ADRs: `docs/decisions/` (3, 7–20)
- Architecture roadmap: `docs/reference/2026-03-08_ARCHITECTURE_ROADMAP.md`
- Content/i18n (implemented): AD-19, `docs/plans/2026-09-13_CONTENT_I18N.md`,
  `docs/guides/04-i18n-and-content.md`
