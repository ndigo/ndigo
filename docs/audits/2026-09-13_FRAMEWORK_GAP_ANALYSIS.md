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

| Gap                                   | Industry equivalent                                                                                 | BlueJS state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scheduled tasks / background jobs** | Spring `@Scheduled`/Quartz, NestJS `@nestjs/schedule`, ASP.NET `IHostedService`, AdonisJS scheduler | **IMPLEMENTED 2026-09-13 (AD-20)** — `@scheduled` decorator, smart-lifecycle auto-discovery, single-flight engine — see [plan](../plans/2026-09-13_SCHEDULING.md) and [guide](../guides/05-scheduling.md).                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Database migrations**               | Flyway/Liquibase, TypeORM migrations, EF Core Migrations, Drizzle Kit, AdonisJS migrations          | **IMPLEMENTED 2026-09-26 (AD-30)** — `DrizzleMigrator`: journaled (`_blue_migrations`), versioned, forward-only runner over `@blue/orm-drizzle`, baseline DDL generated from entity metadata (`createTableStatements`), one transaction-free pass per migration (SQLite implicit-commit semantics documented) — see [plan](../plans/2026-09-26_ORM_COMPLETION.md) and [AD-30](../decisions/2026-09-26_AD30_ORM_MIGRATIONS.md). Closes ORM audit M3.                                                                                                                                                                                        |
| **Server-side caching abstraction**   | Spring `@Cacheable`, ASP.NET `IMemoryCache`/`IDistributedCache` + response caching                  | **IMPLEMENTED 2026-09-17 (AD-24)** — `@blue/cache`: `Cache`/`MemoryCache` (TTL, LRU/FIFO eviction), `CacheManager` bean (zero-wiring node auto-config), `memoize` (client, single-flight), `@cached` decorator (no-AOP wrapper) — see [plan](../plans/2026-09-17_CACHING.md).                                                                                                                                                                                                                                                                                                                                                              |
| **Rate limiting**                     | `@nestjs/throttler`, ASP.NET built-in rate limiter, Bucket4j                                        | **IMPLEMENTED 2026-09-27 (AD-33 Wave 3)** — `@rateLimit` decorator + fixed-window limiter, 429/`Retry-After`, default-on metadata-gated interceptor, `NodeRequest.remoteAddress` keying — real client IP behind trusted proxies since 2026-09-28 (AD-37); demo login limited 5/min — see [plan](../plans/2026-09-26_AUTH_COMPLETION.md). Closes SEC-6 (rate limiting part).                                                                                                                                                                                                                                                                |
| **Security headers**                  | Helmet; Spring/ASP.NET header middleware (CSP, HSTS, X-Frame-Options, nosniff)                      | **IMPLEMENTED** (`SecurityHeadersInterceptor`, default-on in `NodeAutoConfiguration`) — CSP/HSTS/X-Frame-Options/nosniff corrections with permissive-by-default CSP `connect-src` documented (D1). Rate limiting itself is implemented — see the row above (AD-33 Wave 3: `@rateLimit`, fixed window, 429/`Retry-After`, default-on metadata-gated interceptor; trusted-proxy client-IP keying since AD-37), closing SEC-6.                                                                                                                                                                                                                |
| **Multipart / file upload**           | Spring `MultipartFile`, NestJS `FileInterceptor`, ASP.NET `IFormFile`                               | **IMPLEMENTED 2026-09-22 (AD-26)** — `MultipartFile` + streaming busboy parser (`parseMultipart`, threshold-to-disk), `fileValue()` binding via `@parameters`, limits → 413, filename sanitization — see [plan](../plans/2026-09-22_MULTIPART_FILE_UPLOAD.md) and [guide](../guides/08-multipart-and-file-upload.md).                                                                                                                                                                                                                                                                                                                      |
| **OpenAPI / API docs**                | springdoc-openapi, `@nestjs/swagger`, Swashbuckle                                                   | **IMPLEMENTED 2026-09-28 (AD-35)** — `@blue/openapi`: spec generation from dispatch metadata (`OpenAPISpecGenerator` over `getHandlerMethods()`), Zod→JSON-Schema via zod-native `toJSONSchema` (the D-3 seam), `@apiDocs` metadata; served at `/v3/api-docs` + Swagger UI at `/swagger-ui/` (assets from `swagger-ui-dist`, no CDN, optional `accessGuard`) — see [plan](../plans/2026-09-28_OPENAPI_AND_MANAGEMENT_HARDENING.md), [AD-35](../decisions/2026-09-28_AD35_OPENAPI_DOCS.md), [guide 13](../guides/13-openapi-and-api-docs.md). Typed-client generation deferred post-1.0 (ecosystem generators consume the served document). |

### 2.2 Tier 2 — significant

| Gap                                     | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Message-broker / outbox integration** | Spring Kafka/RabbitMQ, NestJS microservices. BlueJS has in-process `EventEmitter`/event gateway only. Defensible deferral.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Trusted-proxy / client-IP handling**  | **IMPLEMENTED 2026-09-28 (AD-37)** — `TrustedProxySet` allowlist (IP/CIDR, default empty = trust nobody; fails loud on malformed config) + peer-gated rightmost-first `X-Forwarded-For` chain walk (first non-trusted valid IP wins; spoofed leftmost values can never win); `NodeRequest.remoteAddress` resolves through it, so the rate limiter (SEC-6) keys on the real client; `BLUE_TRUSTED_PROXIES` env + `trustedProxies` option; header read via `@blue/http` headers module; RFC 7239 `Forwarded` / `X-Forwarded-Proto`-Host recorded as extension/deferral — see [plan](../plans/2026-09-28_TRUSTED_PROXY.md) and [AD-37](../decisions/2026-09-28_AD37_TRUSTED_PROXY.md).                                                                                                                                   |
| **DTO/object mapping**                  | **IMPLEMENTED 2026-09-29 (AD-38)** — schema targets in `ConversionService`: `convert(value, schema)` is contract-enforced, fail-fast projection (`z.infer` typed); arrays via `schema.array()`; leaf conversions unchanged with source-aware lookup; zero-wiring `CONVERSION_SERVICE` bean. DTO schemas derived from entity metadata; the same DTO schema documents responses via `@apiDocs({ responses })` (zod-native `toJSONSchema`, closing AD-35's response-schema follow-up at the explicit level) — see [plan](../plans/2026-09-29_DTO_MAPPING.md) and [guide 14](../guides/14-dto-conversion.md). Transform outputs are documented via an explicit contract schema piped as the conversion target (zod cannot serialize transforms to JSON Schema). No conventions/reflection — the schema is the conversion. |
| **Server-side session store**           | `Session`/`DefaultSession` + `@session` resolver exist — **IMPLEMENTED 2026-09-27 (AD-33 Wave 2)**: `SessionStore` contract (`kind`, create/get/rotate/delete, TTL on read) + `InMemorySessionStore` reference, HttpOnly cookie sessions with fixation rotation; M4 narrows to "persistent backend" (Redis/LibSQL via the contract, `QueueMessageStore` precedent) — see [plan](../plans/2026-09-26_AUTH_COMPLETION.md).                                                                                                                                                                                                                                                                                                                                                                                              |

### 2.3 Tier 3 — defensible deferrals

Multi-tenancy, job queues (Batch/Bull), Testcontainers-style test
infrastructure, feature-flag framework, gRPC. Not MVP blockers; enterprise
adopters will ask about them at 1.0.

---

## 3. Features Present but Incomplete

| Feature                  | What exists                                                                                                                                                                                                                                                                                                                                                                                                                                               | What's missing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content / i18n**       | `ContentSource` key lookup + fallback, static/composite/priority/TTL/negotiating sources, themes, dispatcher `LanguageResolver` (Navigator default)                                                                                                                                                                                                                                                                                                       | Message formatting (params/plurals/ICU), locale-aware date/number formatting, client reactivity + persistence, SSR-safe formatting. **IMPLEMENTED 2026-09-13 (AD-19)** — see [plan](../plans/2026-09-13_CONTENT_I18N.md) and [guide](../guides/04-i18n-and-content.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **WebSockets**           | `@socketMapping` (RFC 6455), echo/room demos, socket session                                                                                                                                                                                                                                                                                                                                                                                              | No cross-node pub/sub, no message history. **CLOSED 2026-09-15/16 (AD-21..23)** — broadcast/rooms/heartbeat (AD-21), client + reconnect (AD-22), STOMP broker + client (AD-23); SockJS deliberately never.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **ORM**                  | All five contracts + Drizzle adapter, relations, lifecycle hooks, `@transactional`, Zod-derived schemas                                                                                                                                                                                                                                                                                                                                                   | ~~No pagination/sorting API, no migrations, no lazy loading / relation fetch semantics, `DerivedQueryRepository` thin~~ — **IMPLEMENTED 2026-09-26** (ORM completion plan): migrations (AD-30), pagination/sorting (`PageRequest`/`Page`, allowlisted SQL ordering), relation fetch (AD-31 — explicit join-column metadata, eager `{ relations }` / `loadRelation`), derived-query enrichment (`OrderBy`/`First`/`TopN`, drizzle mapping) — see [plan](../plans/2026-09-26_ORM_COMPLETION.md). Many-to-many fetch + JOIN-loading remain out of scope (documented). …                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Management endpoints** | `/health`, `/metrics` auto-registered                                                                                                                                                                                                                                                                                                                                                                                                                     | Unprotected by default (auto-configuration JSDoc tells callers to add a guard); no bind-address separation, no redaction policy (SEC-5) — **CLOSED 2026-09-28 (AD-36)**: `redactHealthErrors` default-on (thrown indicator errors → stable `unavailable` marker), bind posture documented + verified (`HTTPServerOptions.host`, loopback default); dedicated management listener deferred post-1.0. Guard guidance: guide 11 §8.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Auth**                 | OIDC authorization-code + PKCE + nonce (fail-closed), JWT, `@authenticated`/`@authorized`, `AuthRouteGuard` 401/403 denials, explicit scheme selection                                                                                                                                                                                                                                                                                                    | **IMPLEMENTED 2026-09-27 (AD-33)** — credential/password auth (`CredentialsAuthAdapter`: scrypt verify via `PasswordEncoder`, one generic denial, dummy-hash timing equalization), first-party user store contract (`UserStore`, app-owned), opaque cookie server sessions + fixation rotation (`SessionStore`), JWT refresh + revocation (`ver`-claim + `tokenVersion` bumps, version-advancing rotation, optional short-TTL cache), login rate limiting; argon2id deliberately deferred (additive) — see [plan](../plans/2026-09-26_AUTH_COMPLETION.md), [AD-33](../decisions/2026-09-26_AD33_AUTH_CREDENTIALS_AND_SESSIONS.md), [guide](../guides/11-authentication-and-sessions.md).                                                                                                                                                                                                                                                                                                                    |
| **Static files**         | `StaticFileView` + hardened `StaticResourceResolver`, `StaticController` catch-all (`/static/{*file}`) over `StaticResourceHandler`                                                                                                                                                                                                                                                                                                                       | ~~No Range requests, ETag/conditional GET, cache headers, gzip/brotli, SPA history-mode fallback, or directory-listing control~~ — **IMPLEMENTED 2026-09-24 (AD-28)**. Strong ETag + `If-None-Match`/`If-Modified-Since` → 304, `Last-Modified`; single-range 206/416 with `Content-Range`; `Cache-Control` (configurable); precompressed `.br`/`.gz` variants with `Accept-Encoding` negotiation + `Vary`; directory index/listing (opt-in, escaped HTML); SPA history-mode fallback (HTML-accepting GET only); HEAD via the dispatcher GET fallback. Enabling routing addition: greedy segments `{*name}`/`**` (radix, D-1); `routeValue('route')` now binds the Route.                                                                                                                                                                                                                                                                                                                                   |
| **Argument binding**     | Per-source resolvers for body/header/query/path/cookie/request-session/history-state/session-storage/local-storage/attribute/socket-session, `dataBinderValue` whole-source form binding into DTO instances (the `@ModelAttribute` equivalent), `requestPart` for multipart JSON parts, `withConversion`, `validatedBody`/`validatedQuery`, matrix params (repeats → arrays) in route conditions; missing required params → `MissingParameterError` (400) | ~~No `@ModelAttribute` form-binding decorator, no `@matrixVariable` resolver, no `@requestPart`~~ — **IMPLEMENTED 2026-09-24 (AD-27)**. Form/model binding via `dataBinderValue('body')` + Zod; `requestPart` over the AD-26 multipart context; matrix array parity. Remaining v1 notes (documented, not bugs): form+query are separate sources (Spring combines them), no per-field `BindingResult` aggregation (Zod `convert` hook is the validation surface), `@ModelAttribute`-style automatic view-model population is intentionally absent (views feed via `route.data`). The `ROUTE` type is untouched; `modelValue` was removed (subsumed by `dataBinderValue('query')`).                                                                                                                                                                                                                                                                                                                           |
| **Configuration**        | Property sources, profiles, placeholders, typed binding, validation, origins/customizers, `config:refresh` event, `@refreshScope` scope + boot rebind, `{cipher:...}` at-rest secrets, remote config source (AD-11..17, AD-29)                                                                                                                                                                                                                            | ~~No secret encryption/decryption, no live bean rebind (`@RefreshScope` equivalent), no config-server integration~~ — **IMPLEMENTED 2026-09-25 (AD-29)**. `@refreshScope` scope caches clear on `config:refresh` (environments are emitters); boot re-binds marked `@configurationProperties`. `{cipher:...}` values decrypt at lookup via `AESGCMCipher` (AES-256-GCM, key-path AAD, `BLUE_SECRET_KEY`) behind a scheme registry with a wiring capability gate. `RemotePropertySource` fetches JSON over HTTPS with ETag/304 gating, `optional` failure semantics, poll → refresh → rebind loop; `PrecedenceDoc` gained the `configServer` slot + a real-boot order-assertion pin (a genuine defaults/boot precedence bug was fixed). Emitter↔Signals unification tracked as a follow-up ADR (D-9). See [plan](../plans/2026-09-24_CONFIGURATION_COMPLETION.md), [AD-29](../decisions/2026-09-25_AD29_CONFIGURATION_REFRESH_SECRETS_CONFIG_SERVER.md), [guide](../guides/03-environment-configuration.md). |
| **Telemetry**            | OTel traces/metrics/logging; broad instrumentation set                                                                                                                                                                                                                                                                                                                                                                                                    | ~~No trace-sampling config, no exporter ergonomics beyond SDK defaults, no exposed log↔trace correlation tooling~~ — **IMPLEMENTED 2026-09-26 (AD-32)**. `sampler` presets (`always`/`off`/`{ ratio }`/raw, parent-based) + `currentTraceContext()` in `@blue/telemetry`; per-signal exporter specs (`{ url?, headers?, console? }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 'console' | 'none'`) with console dev default + URL validation in `@blue/telemetry-node` — see [plan](../plans/2026-09-26_TELEMETRY_COMPLETION.md), [AD-32](../decisions/2026-09-26_AD32_TELEMETRY_COMPLETION.md), [guide](../guides/10-telemetry.md). … |

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

1. **Scheduling + migrations** — ✅ **IMPLEMENTED 2026-09-13/26** — Scheduling (AD-20) and migrations (`DrizzleMigrator`, AD-30) landed; the "do not pass the 1.0 checkpoint without them" constraint is now met.
2. **Content/i18n completion (§4)** — the largest functional gap; contract +
   i18next adapter + Intl wrappers + locale strategy family, per the split
   above.
3. **Rate limiting + security headers** — ✅ **IMPLEMENTED 2026-09-27 (AD-33 Wave 3)** — `@rateLimit` + fixed-window limiter + 429/`Retry-After`, default-on metadata-gated interceptor; security headers landed earlier (D1).
4. **Server-side caching abstraction** — ✅ **IMPLEMENTED 2026-09-17 (AD-24)** — `@blue/cache`: `@cached` decorator + in-memory store in the signals/ORM style, plus client `memoize`.
5. **Multipart** — ✅ **IMPLEMENTED 2026-09-22 (AD-26)** — `MultipartFile` + streaming busboy parser + `fileValue()` binding; OpenAPI followed in the docs wave (**AD-35**, 2026-09-28).
6. **Completion pass** — management access policy: guard guidance + default-deny recommendation documented (guide 11 §8; bind-address separation + redaction ✅ (AD-36)); session store ✅ (AD-33 Wave 2 — contract + in-memory reference; persistent backends deferred); static-file ETag/Range/compression ✅ (AD-28), WebSocket broadcast ✅ (AD-21..23); trusted-proxy client-IP ✅ (AD-37) — rate-limit keying, session/auth, and any handler reading `remoteAddress` now see the resolved client behind configured proxies.

None of this blocks the core dispatch/view/ORM path, which is complete and
well-tested. The gaps concentrate in the operational surface and Content.

---

## References

- Framework assessment: `docs/audits/2026-09-05_FRAMEWORK_ASSESSMENT.md`
- Remediation plan: `docs/plans/2026-09-04_REPOSITORY_REMEDIATION.md`
- ADRs: `docs/decisions/` (3, 7–20, 24, 26–29)
- Architecture roadmap: `docs/reference/2026-03-08_ARCHITECTURE_ROADMAP.md`
- Content/i18n (implemented): AD-19, `docs/plans/2026-09-13_CONTENT_I18N.md`,
  `docs/guides/04-i18n-and-content.md`
- Configuration (implemented): AD-29, `docs/plans/2026-09-24_CONFIGURATION_COMPLETION.md`,
  `docs/guides/03-environment-configuration.md`
- Auth (implemented): AD-33, `docs/plans/2026-09-26_AUTH_COMPLETION.md`,
  `docs/guides/11-authentication-and-sessions.md`
- OpenAPI + management hardening (implemented): AD-35/AD-36,
  `docs/plans/2026-09-28_OPENAPI_AND_MANAGEMENT_HARDENING.md`,
  `docs/guides/13-openapi-and-api-docs.md`
- Trusted-proxy client-IP (implemented): AD-37,
  `docs/plans/2026-09-28_TRUSTED_PROXY.md`
- DTO/object mapping (implemented): AD-38,
  `docs/plans/2026-09-29_DTO_MAPPING.md`, `docs/guides/14-dto-conversion.md`
