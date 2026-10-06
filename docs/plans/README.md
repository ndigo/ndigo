# Plans

Implementation plans for features and technical specifications.

Every implemented plan has its **decision recorded** in
[docs/decisions/README.md](../decisions/README.md) (ADR index, AD-01..AD-67).

## Completed Plans

### 2026-10-05 - TOON Support (opt-in authoring format)

Opt-in, decode-only TOON support (AD-66): inert `MediaTypes.TEXT_TOON`
token in `@blue/core`; `application.toon` / `application-{profile}.toon`
config files in `StandardConfigFileLoader` (`format: 'auto' | 'json' |
'toon'`, JSON wins collisions, `required:` covers the format pair) — the
`@toon-format/toon` decoder is an optional peer loaded lazily, and
everything downstream (merge, secrets, zod, binding) sees the plain JSON
model. Wire/storage/config-server surfaces stay permanently JSON. Phase 3
(`fromConfig`) deferred until a consumer asks.

[Read plan](2026-10-05_TOON_SUPPORT.md)

---

### 2026-10-04 - Resilience: Retry and Circuit Breaking

New isomorphic package `@blue/resilience` (AD-43): annotation-driven
`@retry(...)` / `@circuitBreaker(...)` policy interceptors on the
`@blue/proxy` chain, plain-function backoffs (`fixedBackoff`,
`exponentialBackoff`), per-method circuit cells with half-open probes, and
standalone weaving via `interceptMethods(instance, interceptors)`.

[Read plan](2026-10-04_RETRY_AND_CIRCUIT_BREAKER.md)

---

### 2026-10-03 - Shared Persistence and Distributed Backends

Dependency-ordered persistence roadmap, complete: durable LibSQL sessions
(Phase 1), awaitable cache cutover + `@blue/redis` cache (Phase 2), cross-node
WebSocket/STOMP fan-out (Phase 3), distributed scheduling deferred with
evidence (Phase 4, AD-41), backend-matrix review closed (Phase 5). Memory
remains the default everywhere; external backends are opt-in.

[Read roadmap](2026-10-01_SHARED_PERSISTENCE_ROADMAP.md)

---

### 2026-10-03 - Method Interception (`@blue/proxy`)

Container-managed method interception on JavaScript `Proxy` (AD-42): the new
`@blue/proxy` package — annotation keys (`methodAnnotation`), the
`MethodInterceptor` chain (`invokeChain`; `next()` re-entry added with
AD-43), and weaving via `InitializationAwareProcessor` (`interception(...)`).
No AspectJ pointcut language; existing method decorators stay as they are.

[Read plan](2026-10-03_METHOD_INTERCEPTION.md)

---

### 2026-09-29 - DTO / Object Mapping

Model-to-model projection as schema targets in `ConversionService` (AD-38):
`convert(value, schema)` is the single verb — fail-fast projection with
`z.infer` typing, entity-derived DTO schemas, and `@apiDocs({ responses })`
response documentation (closing AD-35's response-schema follow-up at the
explicit-contract level). No new mapper package.

[Read plan](2026-09-29_DTO_MAPPING.md)

---

### 2026-09-28 - OpenAPI Docs + Management Hardening

The last Tier-1 gap row closes: `@blue/openapi` generates a spec from
dispatch metadata (zod-native `toJSONSchema`) and serves it at
`/v3/api-docs` with Swagger UI at `/swagger-ui/` (no CDN, optional guard);
management hardening adds `/health` redaction and documents the bind posture
(SEC-5). AD-35/AD-36.

[Read plan](2026-09-28_OPENAPI_AND_MANAGEMENT_HARDENING.md)

---

### 2026-09-28 - Trusted-Proxy Client-IP Resolution

`TrustedProxySet` (IP/CIDR allowlist, empty = trust nobody) plus a
peer-gated rightmost-first `X-Forwarded-For` walk resolving
`NodeRequest.remoteAddress` — spoofed leftmost values never win; the rate
limiter keys on the real client (AD-37).

[Read plan](2026-09-28_TRUSTED_PROXY.md)

---

### 2026-09-27 - TypeScript-Native Layer

TypeScript layer for Spring-heritage surfaces (AD-34): token-first bean
handles (`@entry(TOKEN)`, typed handler resolution, framework + demo
migration, `no-string-registry-lookup` oxlint rule), typed context and
environment events (`ContextEvents`/`EnvironmentEvents` overlays),
Zod-schema-bound configuration (`@configurationProperties` schema mode +
`typedConfig`, `propertyKeys` typed paths), and typed DSL builders
(`Profile` expressions, `queryParamCondition`/`matrixParamCondition`
conditions, `ContextToken` cache stores). SpEL, `@Primary`/`@Qualifier`
strings and predicate-form mapping tables remain rejected.

[Read full plan](2026-09-27_TYPESCRIPT_NATIVE_LAYER.md)

---

### 2026-09-26 - Telemetry Completion

Trace sampling (presets + ratio, parent-based), exporter ergonomics
(headers/timeouts/compression/console fallback/disable), and log↔trace
correlation — the gap-analysis Telemetry row flipped to implemented (AD-32).

[Read plan](2026-09-26_TELEMETRY_COMPLETION.md)

---

### 2026-09-26 - ORM Completion

Migrations (`DrizzleMigrator`: journaled, versioned, forward-only over
`@blue/orm-drizzle`, AD-30), pagination/sorting, explicit-opt-in relation
fetch (AD-31), and derived-query expansion beyond equality — closing the
Framework Gap Analysis ORM rows.

[Read plan](2026-09-26_ORM_COMPLETION.md)

---

### 2026-09-26 - Auth Completion

Credentials (scrypt with timing equalization), server-side sessions
(fixation-safe rotation, HttpOnly cookies), default rate limiting, and JWT
refresh/revocation (AD-33, superseding the credentials/sessions subset of
AD-56) — the gap-analysis Auth and rate-limiting rows close.

[Read plan](2026-09-26_AUTH_COMPLETION.md)

---

### 2026-09-25 - Configuration Completion

Closes the Framework Gap Analysis Configuration row (AD-29): live rebind
(`config:refresh` event, `@refreshScope` scope, boot rebind listener),
at-rest secret encryption (`{cipher:...}` markers, `AESGCMCipher`
AES-256-GCM via `node:crypto`, key-path AAD, scheme registry with a wiring
capability gate, `builder.secrets(...)`), and the remote config source
(`RemotePropertySource` — ETag/body-text change gating, `optional` failure
semantics, `builder.configServer(...)`, poll → refresh → rebind loop).
Also fixed a real precedence bug (`defaults` now truly lowest; `boot` above
`systemEnvironment`) pinned by a real-boot order-assertion spec.

[Read full plan](2026-09-24_CONFIGURATION_COMPLETION.md)

---

### 2026-09-24 - Static Files

Static HTTP semantics (AD-28): strong ETag + conditional GET (304),
single-range 206/416, `Cache-Control`, precompressed `.br`/`.gz` variants,
directory index/listing, SPA history fallback, dispatcher HEAD→GET — on top
of greedy `{*name}`/`**` route segments. Demo gates in blue-island.

[Read full plan](2026-09-24_STATIC_FILES.md)

---

### 2026-09-23 - Argument Binding

Unified argument-binding surface (AD-27): `dataBinderValue(source, Target?)`
whole-source data binding — the `@ModelAttribute` equivalent (flat form
fields → nested DTO instances + Zod validate/whitelist), `requestPart` for
multipart JSON parts, matrix array parity, dotted reads on nested-capable
sources, and the D-4 binding renames (hard break, no aliases). Missing
required params now throw `MissingParameterError` → 400.

[Read full plan](2026-09-23_ARGUMENT_BINDING.md)

---

### 2026-09-22 - Multipart / File Upload

Tier-1 gap closed: streaming busboy parser with threshold-to-disk,
`MultipartFile` contract + `@file`/`fileValue()` binding, per-file/total
limits → 413, and filename sanitization (AD-26).

[Read plan](2026-09-22_MULTIPART_FILE_UPLOAD.md)

---

### 2026-09-18 - Security Headers

`SecurityHeadersInterceptor` wraps Helmet and is prepended by
`NodeAutoConfiguration`, so every default Node response carries CSP, HSTS,
frame/referrer/sniffing controls and no `X-Powered-By` (AD-25; the CSP
`connect-src` default was later hardened to `'self'` by SEC-4).

[Read plan](2026-09-18_SECURITY_HEADERS.md)

---

### 2026-09-17 - Caching

`@blue/cache`: `Cache`/`MemoryCache` (TTL + LRU/FIFO eviction), `CacheManager`
bean (zero-wiring node auto-config), `memoize` (client-side, single-flight),
`@cached` decorator (no-AOP wrapper, graceful degradation) — demo gates in
blue-api (`/api/cached-report` counter) and blue-views (client memoize).

[Read full plan](2026-09-17_CACHING.md)

---

### 2026-09-13 - Scheduling

`@scheduled` decorator, ScheduleRegistry + TaskScheduler engine, croner
seam, Node-only guardrails, zero-config discovery, per-run OTel spans —
Phase 4 demo gate in blue-api.

[Read full plan](2026-09-13_SCHEDULING.md)

---

### 2026-09-13 - Content/i18n

Content/i18n completion: `MessageSource` contract, i18next adapter
(`@blue/content-i18next`), Intl formatters, locale flow (server +
client), EJS/island integration, and both demo gates.

[Read full plan](2026-09-13_CONTENT_I18N.md)

---

### 2026-06-08 - TypeScript 6.0 Migration Remediation

Post-migration fix-up, all four waves landed: restored `@blue/domain`
property delegation and `RouteHandlerAdapter.supports()`, replaced
type-lie casts with runtime checks, stabilized widened return types across
consumers, and refactored the `@blue/validate` constraints.

[Read plan](2026-06-08_TS6_REMEDIATION.md)

---

### 2026-03-22 - View Event Architecture

Hardened the Spring MVC-inspired view/event contracts with explicit event-bridge interfaces, router refresh contract, lifecycle cleanup, and legacy Bridge removal.

[Read full plan](2026-03-22_VIEW_EVENT_ARCHITECTURE.md)

---

### 2026-03-24 - Scale 2 Context + Routing Architecture

Multi-context/site architecture with hierarchical shell/feature contexts, route partitioning, event gateway isolation, and per-feature telemetry.

[Read full plan](2026-03-24_SCALE2_CONTEXT_ROUTING_ARCHITECTURE.md)

---

### 2026-02-08 - RegExp Naming Convention Standardization

Standardized all UPPER_SNAKE_CASE RegExp constants to camelCase with Rule suffix across @blue/validate, @blue/http, and @blue/platform-web packages.

[Read full plan](2026-02-08_REGEX_NAMING_CONVENTION.md)

---

## Implemented Plans (decision recorded)

### 2026-09-15/16 — WebSocket & STOMP wave

[Session registry & broadcast](2026-09-15_WEBSOCKET_BROADCAST.md),
[isomorphic client](2026-09-15_WEBSOCKET_CLIENT.md), and
[STOMP 1.2 protocol layer](2026-09-16_STOMP.md) — ratified by
[AD-21](../decisions/2026-09-15_AD21_WEBSOCKET_SESSION_REGISTRY.md),
[AD-22](../decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md),
[AD-23](../decisions/2026-09-16_AD23_STOMP.md).

### Pre-ADR era (records backfilled as AD-44..AD-65)

- [2026-02-07 HTTP Transform Pipeline](2026-02-07_HTTP_TRANSFORM_PIPELINE.md) — body transform pipeline — [AD-49](../decisions/2026-02-07_AD49_HTTP_TRANSFORM_PIPELINE.md)
- [2026-03-08 Validate Design](2026-03-08_VALIDATE_DESIGN.md) — superseded by AD-07 — [AD-52](../decisions/2026-03-08_AD52_VALIDATION_ARCHITECTURE_DESIGN.md)
- [2026-03-30 ORM MVP](2026-03-30_ORM_MVP.md) — [AD-55](../decisions/2026-03-30_AD55_ORM_MVP.md)
- [2026-05-28 Auth & ORM Post-MVP](2026-05-28_AUTH_DESIGN.md) — [AD-56](../decisions/2026-05-28_AD56_AUTH_ORM_POST_MVP.md)
- [2026-06-02 Native-First Refactor](2026-06-02_NATIVE_FIRST_REFACTOR.md) — [AD-57](../decisions/2026-06-02_AD57_NATIVE_FIRST_REFACTOR.md)
- [2026-08-12/19 OXC Evaluation & Migration](2026-08-19_OXC_EVALUATION_AND_MIGRATION_PLAN.md) — oxlint/oxfmt adoption — [AD-58](../decisions/2026-08-19_AD58_OXC_TOOLCHAIN_MIGRATION.md); earlier research: [2026-08-12 evaluation](2026-08-12_OXC_EVALUATION.md) (toolchain audit + phased-adoption recommendation), [2026-08-19 migration plan](2026-08-19_OXC_MIGRATION.md) (proposed ESLint/Prettier replacement, folded into AD-58)
- [2026-09-01 Signals](2026-09-01_SIGNALS.md) — [AD-59](../decisions/2026-09-01_AD59_SIGNALS_MODERNIZATION.md)
- [2026-09-03 Node Platform Foundation](2026-09-03_NODE_PLATFORM_FOUNDATION.md) — [AD-60](../decisions/2026-09-03_AD60_NODE_PLATFORM_FOUNDATION.md)
- [2026-09-03 RouteRegistry](2026-09-03_ROUTE_REGISTRY.md) — [AD-61](../decisions/2026-09-03_AD61_ROUTE_REGISTRY.md)
- [2026-09-03 Shared Dependency Contract](2026-09-03_SHARED_DEPENDENCY_CONTRACT.md) — [AD-62](../decisions/2026-09-03_AD62_SHARED_DEPENDENCY_CONTRACT.md)
- [2026-09-04 Test Harness](2026-09-04_BLUE_TEST_HARNESS.md) — [AD-63](../decisions/2026-09-04_AD63_BLUE_TEST_HARNESS.md)
- [2026-09-04 Package Separation](2026-09-04_PACKAGE_SEPARATION.md) — [AD-64](../decisions/2026-09-04_AD64_PLATFORM_SEPARATION.md)
- [2026-09-06 View Resolution Strategy](2026-09-06_VIEW_RESOLUTION_STRATEGY.md) — [AD-65](../decisions/2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md)
- [2026-09-06 Telemetry Gaps](2026-09-06_TELEMETRY_GAPS.md) — folded into [AD-32](../decisions/2026-09-26_AD32_TELEMETRY_COMPLETION.md)
- [2026-09-08 Environment Phases 0–6](2026-09-08_ENVIRONMENT_PHASE0.md) — [P1](2026-09-08_ENVIRONMENT_PHASE1.md) (placeholders, typed lookup, CLI args), [P2](2026-09-08_ENVIRONMENT_PHASE2.md) (config files, `.env`, browser sources, precedence), [P3](2026-09-08_ENVIRONMENT_PHASE3.md) (profile defaults/expressions/activation), [P4](2026-09-08_ENVIRONMENT_PHASE4.md) (typed binding v2), [P5](2026-09-08_ENVIRONMENT_PHASE5.md) (origins, customizers, refresh), [P6](2026-09-08_ENVIRONMENT_PHASE6.md) (zod validation) — [AD-11](../decisions/2026-09-08_AD11_ENVIRONMENT_PROPERTY_SOURCES.md)–[AD-17](../decisions/2026-09-08_AD17_ENVIRONMENT_VALIDATION.md)

## Completed Reviews

- [2026-10-06_COMPREHENSIVE_REVIEW_AND_MITIGATION.md](2026-10-06_COMPREHENSIVE_REVIEW_AND_MITIGATION.md) - Second full-repository sweep (39 packages, 7 apps, docs, tooling, CI; 16 slices) at `96337f24`: all gates green, 5 Block / 28 High / 71 Medium / 63 Low / 12 Nit new findings (incl. a passwordless-account auth bypass, a telemetry remote process-crash, a view-name path traversal, a render-hang, and a fresh-checkout CI e2e failure), plus 10 inventory-reconciliation items and 13 framework gaps — remediation waves proposed, not yet executed
- [2026-10-06_CODE_REVIEW_AND_MITIGATION.md](2026-10-06_CODE_REVIEW_AND_MITIGATION.md) - Full-repository review (42 packages, 7 apps, docs, tooling, hygiene) with remediation waves (1 Block build-breaker + 4 architecture findings + 18 Must Fix, ~60 Should Fix, remainder Optional/Nit/FYI)
- [2026-10-04_CODE_REVIEW_AND_MITIGATION.md](2026-10-04_CODE_REVIEW_AND_MITIGATION.md) - Review of the AD-42/AD-43 wave (blue-proxy, blue-resilience) and recent committed features with remediation plan (2 Must Fix, 3 Should Fix, 1 Block, 8 Medium, 10 Nit/FYI)
- [2026-09-29_CODE_REVIEW_AND_MITIGATION.md](2026-09-29_CODE_REVIEW_AND_MITIGATION.md) - Post-AD-38 comprehensive sweep (35 packages, 7 apps; 11 review slices) with Waves 1–6 remediation
- [2026-09-28_CODE_REVIEW_AND_MITIGATION.md](2026-09-28_CODE_REVIEW_AND_MITIGATION.md) - Review of the Wave 6 / AD-34 / AD-35-36 / AD-37 wave with remediation plan (2 Must Fix, 22 Should Fix, 16 Optional)
- [2026-09-27_CODE_REVIEW_AND_MITIGATION.md](2026-09-27_CODE_REVIEW_AND_MITIGATION.md) - Review of the AD-30..33 wave (ORM, telemetry, auth) with Waves 1–4 remediation
- [2026-09-25_CODE_REVIEW_AND_MITIGATION.md](2026-09-25_CODE_REVIEW_AND_MITIGATION.md) - Review of the AD-26..29 wave (multipart, argument binding, static files, config) with Waves 1–4 remediation
- [2026-09-18_CODE_REVIEW_AND_MITIGATION.md](2026-09-18_CODE_REVIEW_AND_MITIGATION.md) - Architecture, security, and quality review with remediation plan
- [2026-09-17_REVIEW_AND_REMEDIATION.md](2026-09-17_REVIEW_AND_REMEDIATION.md) - Review of the WebSocket/STOMP wave with repository gate remediation
- [2026-09-08_REVIEW_AND_REMEDIATION.md](2026-09-08_REVIEW_AND_REMEDIATION.md) - Repository-wide review (gates, security, architecture) with remediation plan — every item landed 2026-09-09

## Historical Roadmaps

- [2026-05-27_FEATURE_COMPLETENESS_ROADMAP.md](2026-05-27_FEATURE_COMPLETENESS_ROADMAP.md) - Full 10-wave framework feature completeness roadmap — decisions mined into AD-01..AD-06; all waves shipped
- [2026-05-29_WAVE10_CHECKPOINT.md](2026-05-29_WAVE10_CHECKPOINT.md) - Wave 10 — 1.0 checkpoint of the 10-wave feature-completeness roadmap (package matrix, API stability commitment)
- [2026-05-29_WAVE11_PLAN.md](2026-05-29_WAVE11_PLAN.md) - Wave 11 follow-on: benchmark coverage, hot-path native replacements, API hardening
- [2026-06-18_CLIENT_FIRST_ROADMAP.md](2026-06-18_CLIENT_FIRST_ROADMAP.md) - Client-first roadmap (10 waves, 6–12 month horizon; all waves complete) — legacy ports, runtime stabilization, 1.0 checkpoint
- [2026-06-18_WAVE_4_SERVICE_BOUNDARY.md](2026-06-18_WAVE_4_SERVICE_BOUNDARY.md) - Wave 4 spec of the client-first roadmap: legacy service interceptors ported into `@blue/http`/`@blue/platform-web`; `@blue/service` registry + telemetry hooks
- [2026-03-08_PACKAGE_ROADMAP.md](2026-03-08_PACKAGE_ROADMAP.md) - Package scope roadmap — completed ✅ (delivered package set)
- [2026-09-04_REPOSITORY_REMEDIATION.md](2026-09-04_REPOSITORY_REMEDIATION.md) - Comprehensive remediation plan — proposed; superseded by the weekly review series

## Archived Plans

- [2026-01-30_PARSER_ENHANCEMENT.md](2026-01-30_PARSER_ENHANCEMENT.md) - @blue/parser Enhancement Plan
- [2026-02-01_DECORATOR_MIGRATION.md](2026-02-01_DECORATOR_MIGRATION.md) - Decorator Migration Plan: Legacy to TC39 Stage 3
- [2026-02-01_ESLINT_PLUGIN.md](2026-02-01_ESLINT_PLUGIN.md) - ESLint Plugin Implementation Plan
- [2026-02-01_FILE_REFACTORING.md](2026-02-01_FILE_REFACTORING.md) - File Size Refactoring Plan
- [2026-02-01_INTERNAL_FILE_NAMING_REVIEW.md](2026-02-01_INTERNAL_FILE_NAMING_REVIEW.md) - Internal File Naming Convention Review
- [2026-02-01_SESSION_SUMMARY.md](2026-02-01_SESSION_SUMMARY.md) - Decorator Migration Session Summary
- [2026-02-01_TC39_QUICK_REFERENCE.md](2026-02-01_TC39_QUICK_REFERENCE.md) - TC39 Decorator Quick Reference
- [2026-02-01_UTILITY_ORGANIZATION.md](2026-02-01_UTILITY_ORGANIZATION.md) - Utility Organization Implementation Plan
- [2026-02-03_QUERY_MATRIX_STRING_CONSOLIDATION.md](2026-02-03_QUERY_MATRIX_STRING_CONSOLIDATION.md) - Query String and Matrix String Consolidation Plan
- [2026-02-03_SESSION_CHECKPOINT.md](2026-02-03_SESSION_CHECKPOINT.md) - Conversation Summary
- [2026-02-03_URL_PARSING_DUPLICATION.md](2026-02-03_URL_PARSING_DUPLICATION.md) - URL Parsing Code Duplication Resolution Plan
- [2026-02-06_CONSOLIDATION_COMPLETE.md](2026-02-06_CONSOLIDATION_COMPLETE.md) - Query/Matrix String Consolidation - Project Complete
- [2026-02-06_HTTP_FEATURE_COMPARISON.md](2026-02-06_HTTP_FEATURE_COMPARISON.md) - HTTP Client Feature Comparison
- [2026-02-06_HTTP_FEATURE_MATRIX.md](2026-02-06_HTTP_FEATURE_MATRIX.md) - Quick Reference: HTTP Client Feature Matrix
- [2026-02-06_HTTP_FEATURE_SUMMARY.md](2026-02-06_HTTP_FEATURE_SUMMARY.md) - HTTP Feature Survey - Executive Summary
- [2026-02-06_SPRING_MVC_RESEARCH.md](2026-02-06_SPRING_MVC_RESEARCH.md) - Spring MVC Research Plan
- [2026-02-07_HTTP_TRANSFORMER_GENERICS.md](2026-02-07_HTTP_TRANSFORMER_GENERICS.md) - HTTPTransformer Generic Type Parameter Decision
- [2026-02-07_MEDIATYPE_LOCATION_ANALYSIS.md](2026-02-07_MEDIATYPE_LOCATION_ANALYSIS.md) - MediaType Location and Architecture Analysis
- [2026-02-07_REGEX_NAMING_CONVENTION.md](2026-02-07_REGEX_NAMING_CONVENTION.md) - RegExp Naming Convention Plan (draft; implemented by the 2026-02-08 pass — AD-50)
- [2026-02-07_TYPE_SAFE_ENUM_PATTERN.md](2026-02-07_TYPE_SAFE_ENUM_PATTERN.md) - Type-Safe Enum Pattern Documentation
- [2026-02-08_MEDIATYPE_ENHANCEMENT_SUMMARY.md](2026-02-08_MEDIATYPE_ENHANCEMENT_SUMMARY.md) - MediaType Enhancements - Implementation Complete
- [2026-02-11_SUBPATH_EXPORTS_ANALYSIS.md](2026-02-11_SUBPATH_EXPORTS_ANALYSIS.md) - Architectural Plan: Subpath Export Analysis

## Draft Plans

- _(none)_

---

_Naming convention: `YYYY-MM-DD_DESCRIPTION.md`_
