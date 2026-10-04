# Plans

### 2026-10-01 - Shared Persistence and Distributed Backends

Roadmap for durable sessions, Redis-backed shared cache, cross-node
WebSocket/STOMP pub-sub, and a separately scoped decision on persisted or
distributed scheduling; staged around shared backend lifecycle dependencies.

[Read full roadmap](2026-10-01_SHARED_PERSISTENCE_ROADMAP.md)

---

Implementation plans for features and technical specifications.

## Completed Plans

### 2026-10-03 - Shared Persistence and Distributed Backends

Dependency-ordered persistence roadmap, complete: durable LibSQL sessions
(Phase 1), awaitable cache cutover + `@blue/redis` cache (Phase 2), cross-node
WebSocket/STOMP fan-out (Phase 3), distributed scheduling deferred with
evidence (Phase 4, AD-41), backend-matrix review closed (Phase 5). Memory
remains the default everywhere; external backends are opt-in.

[Read roadmap](2026-10-01_SHARED_PERSISTENCE_ROADMAP.md)

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

## Active Plans

- [2026-10-04_CODE_REVIEW_AND_MITIGATION.md](2026-10-04_CODE_REVIEW_AND_MITIGATION.md) - Review of the AD-42/AD-43 wave (blue-proxy, blue-resilience) and recent committed features with remediation plan (2 Must Fix, 3 Should Fix, 1 Block, 8 Medium, 10 Nit/FYI)
- [2026-09-28_CODE_REVIEW_AND_MITIGATION.md](2026-09-28_CODE_REVIEW_AND_MITIGATION.md) - Review of the Wave 6 / AD-34 / AD-35-36 / AD-37 wave with remediation plan (2 Must Fix, 22 Should Fix, 16 Optional)
- [2026-09-18_CODE_REVIEW_AND_MITIGATION.md](2026-09-18_CODE_REVIEW_AND_MITIGATION.md) - Architecture, security, and quality review with remediation plan
- [2026-09-17_REVIEW_AND_REMEDIATION.md](2026-09-17_REVIEW_AND_REMEDIATION.md) - Review of the WebSocket/STOMP wave with repository gate remediation
- [2026-09-16_STOMP.md](2026-09-16_STOMP.md) - STOMP 1.2 protocol layer: frame codec, server broker, client, and demo gate
- [2026-09-15_WEBSOCKET_BROADCAST.md](2026-09-15_WEBSOCKET_BROADCAST.md) - WebSocket session registry, rooms/broadcast, heartbeat reaping, auto-config wiring
- [2026-09-15_WEBSOCKET_CLIENT.md](2026-09-15_WEBSOCKET_CLIENT.md) - Isomorphic socket package: client + reconnect, dispatcher seam, demo gate rewire
- [2026-09-04_REPOSITORY_REMEDIATION.md](2026-09-04_REPOSITORY_REMEDIATION.md) - Comprehensive architecture, security, quality, documentation, and release remediation plan
- [2026-05-27_FEATURE_COMPLETENESS_ROADMAP.md](2026-05-27_FEATURE_COMPLETENESS_ROADMAP.md) - Full 10-wave framework feature completeness roadmap
- [2026-03-08_PACKAGE_ROADMAP.md](2026-03-08_PACKAGE_ROADMAP.md)
- [2026-03-08_VALIDATE_DESIGN.md](2026-03-08_VALIDATE_DESIGN.md)
- [2026-03-30_ORM_MVP.md](2026-03-30_ORM_MVP.md)
- [2026-02-07_HTTP_TRANSFORM_PIPELINE.md](2026-02-07_HTTP_TRANSFORM_PIPELINE.md)

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
- [2026-02-07_TYPE_SAFE_ENUM_PATTERN.md](2026-02-07_TYPE_SAFE_ENUM_PATTERN.md) - Type-Safe Enum Pattern Documentation
- [2026-02-08_MEDIATYPE_ENHANCEMENT_SUMMARY.md](2026-02-08_MEDIATYPE_ENHANCEMENT_SUMMARY.md) - MediaType Enhancements - Implementation Complete
- [2026-02-11_SUBPATH_EXPORTS_ANALYSIS.md](2026-02-11_SUBPATH_EXPORTS_ANALYSIS.md) - Architectural Plan: Subpath Export Analysis

## Draft Plans

- _(none)_

---

_Naming convention: `YYYY-MM-DD_DESCRIPTION.md`_
