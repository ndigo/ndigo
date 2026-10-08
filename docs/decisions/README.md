# BlueJS Decision Records (ADRs)

Architecture Decision Records for the BlueJS monorepo — **AD-01..AD-75**,
contiguous. Every record captures a decision with its context, the evidence
(plan, code, commits), the decided shape, consequences, and a revisit trigger.

## Conventions

- **Numbering is date-sequenced, not chronological**: records were written
  as decisions were made; the series starts at AD-01 (2026-05-27 roadmap
  ratification) and AD-44..AD-65 backfill pre-series decisions (2026-02-01 →
  2026-09-06). Filename dates are the _decision_ dates, so files sort by
  decision date, not by number.
- **Status legend**: _Accepted_ (implemented and current) · _Superseded_
  (record kept for history; the superseding ADR is linked in the record) ·
  _Superseded in part_ (only a subset of the decision was replaced; the
  successor ADRs are linked in the record) · _Reviewed_ (proposal reviewed;
  the outcome is recorded — no change needed) · _Deferred/Rejected_
  (decided against, with revisit triggers).
- Decision records are the source of truth for _why_; implementation plans
  live in [docs/plans](../plans/README.md), how-to in
  [docs/guides](../guides/README.md).

## Index

| AD        | Decision date | Status             | Record                                                                                                                                                                      |
| --------- | ------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AD-01** | 2026-05-27    | Accepted           | [`@blue/http` vs `@blue/service` boundary — transport concerns live in HTTP, service stays a domain façade](2026-05-27_AD01_HTTP_SERVICE_BOUNDARY.md)                       |
| **AD-02** | 2026-05-27    | Superseded         | [`@blue/domain` vs `@blue/model` reconciliation — optional MVVM layer over a pure model](2026-05-27_AD02_DOMAIN_MODEL_RECONCILIATION.md)                                    |
| **AD-03** | 2026-09-07    | Accepted           | [The legacy Site/Page model — lineage, successors, and the Page question](2026-09-07_AD03_SITE_PAGE_MODEL.md)                                                               |
| **AD-04** | 2026-05-27    | Accepted           | [Browser-only code lives in `@blue/platform-web` — enforced by lint rule](2026-05-27_AD04_BROWSER_BOUNDARY_PLATFORM_WEB.md)                                                 |
| **AD-05** | 2026-05-27    | Accepted           | [`@blue/platform-node` MVP scope — server binding, resolvers, cookie/session, file loading](2026-05-27_AD05_PLATFORM_NODE_MVP_SCOPE.md)                                     |
| **AD-06** | 2026-08-22    | Reviewed           | [Resolution: @blue/factory scoping split — no split needed at 1.0](2026-08-22_AD06_FACTORY_SCOPING_SPLIT.md)                                                                |
| **AD-07** | 2026-09-05    | Accepted           | [Zod as the canonical runtime-schema primitive](2026-09-05_AD07_ZOD_VALIDATION.md)                                                                                          |
| **AD-08** | 2026-09-05    | Accepted           | [blue-service — rebase interceptors onto @blue/http, roadmap to declarative service clients](2026-09-05_AD08_BLUE_SERVICE_REBASE.md)                                        |
| **AD-09** | 2026-09-05    | Accepted           | [Server push (SSE/WebSocket) — transport for the hybrid topology](2026-09-05_AD09_SERVER_PUSH.md)                                                                           |
| **AD-10** | 2026-09-07    | Accepted           | [RFC 9457 problem+json error model for HTTP APIs](2026-09-07_AD10_RFC9457_ERROR_MODEL.md)                                                                                   |
| **AD-11** | 2026-09-08    | Accepted           | [Environment property sources — named, ordered, JS-native (Phase 0)](2026-09-08_AD11_ENVIRONMENT_PROPERTY_SOURCES.md)                                                       |
| **AD-12** | 2026-09-08    | Accepted           | [Environment resolution semantics — placeholders, typed lookup, CLI args (Phase 1)](2026-09-08_AD12_ENVIRONMENT_RESOLUTION_SEMANTICS.md)                                    |
| **AD-13** | 2026-09-08    | Accepted           | [Environment standard sources — config files, .env, browser, precedence (Phase 2)](2026-09-08_AD13_ENVIRONMENT_STANDARD_SOURCES.md)                                         |
| **AD-14** | 2026-09-08    | Accepted           | [Environment profiles completed — defaults, expressions, activation (Phase 3)](2026-09-08_AD14_ENVIRONMENT_PROFILES.md)                                                     |
| **AD-15** | 2026-09-08    | Accepted           | [Typed configuration binding v2 (`@configurationProperties` — Phase 4)](2026-09-08_AD15_CONFIGURATION_PROPERTIES.md)                                                        |
| **AD-16** | 2026-09-08    | Accepted           | [Environment observability & lifecycle — origins, customizers, refresh (Phase 5)](2026-09-08_AD16_ENVIRONMENT_OBSERVABILITY.md)                                             |
| **AD-17** | 2026-09-08    | Accepted           | [Environment validation — zod schema, fail-fast aggregated errors (Phase 6)](2026-09-08_AD17_ENVIRONMENT_VALIDATION.md)                                                     |
| **AD-18** | 2026-09-13    | Accepted           | [Host runtime — centralized micro frontend orchestration in the shell context](2026-09-13_AD18_HOST_RUNTIME.md)                                                             |
| **AD-19** | 2026-09-13    | Accepted           | [Content/i18n — own the contract, wrap i18next, use `Intl` directly](2026-09-13_AD19_CONTENT_I18N.md)                                                                       |
| **AD-20** | 2026-09-13    | Accepted           | [Scheduling — Nest/Adonis semantics behind Spring's declarative shape](2026-09-13_AD20_SCHEDULING.md)                                                                       |
| **AD-21** | 2026-09-15    | Accepted           | [WebSocket Session Registry — per-kind sessions, context-owned lifecycle](2026-09-15_AD21_WEBSOCKET_SESSION_REGISTRY.md)                                                    |
| **AD-22** | 2026-09-15    | Accepted           | [WebSocket Client & the `@blue/socket` Package](2026-09-15_AD22_WEBSOCKET_CLIENT.md)                                                                                        |
| **AD-23** | 2026-09-16    | Accepted           | [STOMP Protocol Layer — codec, broker, client](2026-09-16_AD23_STOMP.md)                                                                                                    |
| **AD-24** | 2026-09-17    | Accepted           | [Caching — isomorphic store, `@cached` decorator, `memoize`](2026-09-17_AD24_CACHING.md)                                                                                    |
| **AD-25** | 2026-09-18    | Superseded in part | [Security headers — wrap Helmet, default-on in `@blue/platform-node`](2026-09-18_AD25_SECURITY_HEADERS.md)                                                                  |
| **AD-26** | 2026-09-22    | Accepted           | [Multipart / file upload — busboy streaming parser, `MultipartFile`, `fileValue()`](2026-09-22_AD26_MULTIPART_FILE_UPLOAD.md)                                               |
| **AD-27** | 2026-09-24    | Accepted           | [Argument binding — form/model binding (`dataBinderValue`), `@requestPart`, matrix parity](2026-09-24_AD27_ARGUMENT_BINDING.md)                                             |
| **AD-28** | 2026-09-24    | Accepted           | [Static files — ETag/conditional GET, Range, precompressed variants, SPA fallback, directory control](2026-09-24_AD28_STATIC_FILES.md)                                      |
| **AD-29** | 2026-09-25    | Accepted           | [Configuration completion — refresh scope, secret at-rest encryption, config server](2026-09-25_AD29_CONFIGURATION_REFRESH_SECRETS_CONFIG_SERVER.md)                        |
| **AD-30** | 2026-09-26    | Accepted           | [ORM migrations — journaled versioned DDL for `@blue/orm-drizzle`](2026-09-26_AD30_ORM_MIGRATIONS.md)                                                                       |
| **AD-31** | 2026-09-26    | Accepted           | [ORM relation fetch — explicit join-column metadata, explicit opt-in loading](2026-09-26_AD31_ORM_RELATION_FETCH.md)                                                        |
| **AD-32** | 2026-09-26    | Accepted           | [Telemetry completion — trace sampling, exporter ergonomics, log↔trace correlation](2026-09-26_AD32_TELEMETRY_COMPLETION.md)                                                |
| **AD-33** | 2026-09-26    | Accepted           | [Auth completion — credentials, server sessions, refresh/revocation](2026-09-26_AD33_AUTH_CREDENTIALS_AND_SESSIONS.md)                                                      |
| **AD-34** | 2026-09-27    | Accepted           | [TypeScript-native layer — tokens, typed events, schema-bound config, typed DSLs](2026-09-27_AD34_TYPESCRIPT_NATIVE_LAYER.md)                                               |
| **AD-35** | 2026-09-28    | Accepted           | [OpenAPI / API documentation](2026-09-28_AD35_OPENAPI_DOCS.md)                                                                                                              |
| **AD-36** | 2026-09-28    | Accepted           | [Management endpoint hardening — redaction + bind posture (SEC-5)](2026-09-28_AD36_MANAGEMENT_HARDENING.md)                                                                 |
| **AD-37** | 2026-09-28    | Accepted           | [Trusted proxy client-IP resolution](2026-09-28_AD37_TRUSTED_PROXY.md)                                                                                                      |
| **AD-38** | 2026-09-29    | Accepted           | [DTO conversion — schema targets in ConversionService](2026-09-29_AD38_DTO_MAPPING.md)                                                                                      |
| **AD-39** | 2026-09-30    | Accepted           | [Async by default — no `-Async` suffix](2026-09-30_AD39_ASYNC_BY_DEFAULT.md)                                                                                                |
| **AD-40** | 2026-10-01    | Accepted           | [Persistence backend baseline](2026-10-01_AD40_PERSISTENCE_BASELINE.md)                                                                                                     |
| **AD-41** | 2026-10-03    | Accepted           | [Distributed scheduling — deferred on evidence, no adapter](2026-10-03_AD41_DISTRIBUTED_SCHEDULING_DEFERRED.md)                                                             |
| **AD-42** | 2026-10-03    | Accepted           | [Method interception on JavaScript `Proxy` — `@blue/proxy`](2026-10-03_AD42_METHOD_INTERCEPTION.md)                                                                         |
| **AD-43** | 2026-10-04    | Accepted           | [Retry and circuit breaking on `@blue/proxy` — `@blue/resilience`](2026-10-04_AD43_RETRY_AND_CIRCUIT_BREAKER.md)                                                            |
| **AD-44** | 2026-02-01    | Accepted           | [Migrate decorators from legacy TypeScript to TC39 Stage 3](2026-02-01_AD44_TC39_STAGE3_DECORATOR_MIGRATION.md)                                                             |
| **AD-45** | 2026-02-01    | Accepted           | [Enforce architectural rules with a dedicated lint plugin](2026-02-01_AD45_ARCHITECTURAL_LINT_RULES.md)                                                                     |
| **AD-46** | 2026-02-01    | Accepted           | [Internal files (underscore-prefixed) never exported through barrels](2026-02-01_AD46_INTERNAL_FILE_EXPORT_CONVENTION.md)                                                   |
| **AD-47** | 2026-02-03    | Accepted           | [Consolidate query/matrix string parsing into `@blue/http`](2026-02-03_AD47_URL_PARSING_CONSOLIDATION.md)                                                                   |
| **AD-48** | 2026-02-07    | Accepted           | [`MediaType` lives in `@blue/core`](2026-02-07_AD48_MEDIATYPE_IN_BLUE_CORE.md)                                                                                              |
| **AD-49** | 2026-02-07    | Accepted           | [HTTP request/response body transform pipeline](2026-02-07_AD49_HTTP_TRANSFORM_PIPELINE.md)                                                                                 |
| **AD-50** | 2026-02-08    | Accepted           | [RegExp constants use `camelCase` with `Rule` suffix](2026-02-08_AD50_REGEXP_NAMING_CONVENTION.md)                                                                          |
| **AD-51** | 2026-02-11    | Accepted           | [Subpath exports for cohesive feature sets](2026-02-11_AD51_SUBPATH_EXPORTS.md)                                                                                             |
| **AD-52** | 2026-03-08    | Superseded         | [An encapsulated validation contract with a pluggable backing backend](2026-03-08_AD52_VALIDATION_ARCHITECTURE_DESIGN.md)                                                   |
| **AD-53** | 2026-03-22    | Accepted           | [Bidirectional view/event contract — explicit event-bridge, legacy Bridge removed](2026-03-22_AD53_VIEW_EVENT_ARCHITECTURE.md)                                              |
| **AD-54** | 2026-03-24    | Accepted           | [Hierarchical shell/feature contexts with explicit event-gateway isolation and route partitioning](2026-03-24_AD54_HIERARCHICAL_CONTEXTS_ROUTE_PARTITIONING.md)             |
| **AD-55** | 2026-03-30    | Superseded in part | [ORM MVP — decorator entities, data source, repository, entity and transaction managers](2026-03-30_AD55_ORM_MVP.md)                                                        |
| **AD-56** | 2026-05-28    | Superseded in part | [Auth & ORM post-MVP — pluggable authentication plus ORM relations, lifecycle, transactions, Drizzle adapter](2026-05-28_AD56_AUTH_ORM_POST_MVP.md)                         |
| **AD-57** | 2026-06-02    | Accepted           | [Native-first refactor — drop Ramda & Arcsecond, dissolve `@blue/parser` into `@blue/core`](2026-06-02_AD57_NATIVE_FIRST_REFACTOR.md)                                       |
| **AD-58** | 2026-08-19    | Accepted           | [OXC toolchain migration — oxlint/oxfmt, `tsc -b` retained](2026-08-19_AD58_OXC_TOOLCHAIN_MIGRATION.md)                                                                     |
| **AD-59** | 2026-09-01    | Accepted           | [Signals — `@blue/reactive` modernized into `@blue/signals` on `@preact/signals-core`](2026-09-01_AD59_SIGNALS_MODERNIZATION.md)                                            |
| **AD-60** | 2026-09-03    | Accepted           | [Node platform foundation — HTTP server, dispatcher, request pipeline](2026-09-03_AD60_NODE_PLATFORM_FOUNDATION.md)                                                         |
| **AD-61** | 2026-09-03    | Accepted           | [RouteRegistry — type-safe routes from decorator metadata](2026-09-03_AD61_ROUTE_REGISTRY.md)                                                                               |
| **AD-62** | 2026-09-03    | Accepted           | [Shared-dependency contract — `@shared` + shared-dependency registry](2026-09-03_AD62_SHARED_DEPENDENCY_CONTRACT.md)                                                        |
| **AD-63** | 2026-09-04    | Accepted           | [`@blue/test` — in-process, socket-free integration test harness](2026-09-04_AD63_BLUE_TEST_HARNESS.md)                                                                     |
| **AD-64** | 2026-09-04    | Accepted           | [Platform separation — isomorphic packages stay platform-free](2026-09-04_AD64_PLATFORM_SEPARATION.md)                                                                      |
| **AD-65** | 2026-09-06    | Accepted           | [View resolution strategy — controllers return names, resolvers return views](2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md)                                                  |
| **AD-66** | 2026-10-05    | Accepted           | [TOON support as an opt-in authoring format — token + decode-only config files, JSON default intact](2026-10-05_AD66_TOON_OPTIN_SUPPORT.md)                                 |
| **AD-67** | 2026-10-06    | Accepted           | [Logging core extraction — `@blue/log` leaf package, telemetry re-exports, single instrumentation set](2026-10-06_AD67_LOG_LEAF_PACKAGE.md)                                 |
| **AD-68** | 2026-10-06    | Accepted           | [User-wide revocation — explicit session deletion, account version epoch for JWTs](2026-10-06_AD68_USER_WIDE_REVOCATION.md)                                                 |
| **AD-69** | 2026-10-06    | Accepted           | [Component integration contract — adopt the Web Component ecosystem; framework owns the DSD/FACE bridge](2026-10-06_AD69_COMPONENT_INTEGRATION_CONTRACT.md)                 |
| **AD-70** | 2026-10-06    | Accepted           | [Editor tooling — introspection first (`@blue/inspect` manifest, config schema, lint rules); no language server yet](2026-10-06_AD70_EDITOR_TOOLING_INTROSPECTION_FIRST.md) |
| **AD-71** | 2026-10-07    | Accepted           | [Component library selection — Web Awesome for the reference integration](2026-10-07_AD71_COMPONENT_LIBRARY_SELECTION.md)                                                   |
| **AD-72** | 2026-10-07    | Accepted           | [Durable jobs and the transactional outbox — `@blue/jobs`](2026-10-07_AD72_JOBS_AND_OUTBOX.md)                                                                              |
| **AD-73** | 2026-10-07    | Accepted           | [Distributed locks — `@blue/locks` (Redis fencing + `@scheduled({lock})`)](2026-10-07_AD73_DISTRIBUTED_LOCKS.md)                                                            |
| **AD-74** | 2026-10-07    | Accepted           | [Clustering / worker offload — `@blue/cluster` (process supervisor, signal relay, bounded restarts)](2026-10-07_AD74_CLUSTERING.md)                                         |
| **AD-75** | 2026-10-07    | Accepted           | [The framework CLI — `@blue/cli` on `@oclif/core` v5, embedded](2026-10-07_AD75_FRAMEWORK_CLI.md)                                                                           |
| **AD-76** | 2026-10-08    | Accepted           | [Actuator parity — `/loggers`, `/env`, `/configprops`, health groups](2026-10-08_AD76_ACTUATOR_PARITY.md)                                                                   |
