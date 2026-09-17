# Plans

Implementation plans for features and technical specifications.

## Completed Plans

### 2026-09-13 - Scheduling

`@scheduled` decorator, ScheduleRegistry + TaskScheduler engine, croner
seam, Node-only guardrails, zero-config discovery, per-run OTel spans —
Phase 4 demo gate in blue-api.

**Status:** Completed (2026-09-13)  
**Commit:** (pending)  
**Impact:** Enterprise scheduling (AD-20) — Spring's shape, Nest/AdonisJS
semantics

[Read full plan](2026-09-13_SCHEDULING.md)

---

### 2026-09-13 - Content/i18n

Content/i18n completion: `MessageSource` contract, i18next adapter
(`@blue/content-i18next`), Intl formatters, locale flow (server +
client), EJS/island integration, and both demo gates.

**Status:** Completed (2026-09-13)  
**Commit:** (pending)  
**Impact:** Full i18n story — contract + wrapped i18next + `Intl` formatting,
with reactive client-side locale switching (AD-19)

[Read full plan](2026-09-13_CONTENT_I18N.md)

---

### 2026-03-22 - View Event Architecture

Hardened the Spring MVC-inspired view/event contracts with explicit event-bridge interfaces, router refresh contract, lifecycle cleanup, and legacy Bridge removal.

**Status:** Completed  
**Commit:** (pending)  
**Impact:** Architectural hardening - stronger contracts and lifecycle safety

[Read full plan](2026-03-22_VIEW_EVENT_ARCHITECTURE.md)

---

### 2026-03-24 - Scale 2 Context + Routing Architecture

Multi-context/site architecture with hierarchical shell/feature contexts, route partitioning, event gateway isolation, and per-feature telemetry.

**Status:** Completed  
**Commit:** (pending)  
**Impact:** Architectural foundation for micro-frontends and multi-feature applications

[Read full plan](2026-03-24_SCALE2_CONTEXT_ROUTING_ARCHITECTURE.md)

---

### 2026-02-08 - RegExp Naming Convention Standardization

Standardized all UPPER_SNAKE_CASE RegExp constants to camelCase with Rule suffix across @blue/validate, @blue/http, and @blue/platform-web packages.

**Status:** Completed  
**Commit:** 7d58ca0  
**Impact:** Breaking change - 37 constants renamed

[Read full plan](2026-02-08_REGEX_NAMING_CONVENTION.md)

---

## Active Plans

- [2026-09-17_REVIEW_AND_REMEDIATION.md](2026-09-17_REVIEW_AND_REMEDIATION.md) - Review of the AD-21/22/23 wave (WS registry, client, STOMP) + uncommitted tree — **implemented 2026-09-17**: gate failures cleared, STOMP 1.2 conformance and ack/queue defects fixed, socket auth/DoS hardening landed, all repository gates green (including `pnpm audit --prod` via the `smol-toml` override)
- [2026-09-16_STOMP.md](2026-09-16_STOMP.md) - STOMP 1.2 protocol layer: frame codec, server broker (destinations, subscriptions, receipts), `StompClient`, `@stompMapping` + `v12.stomp` subprotocol negotiation, blue-api demo gate (AD-23)
- [2026-09-15_WEBSOCKET_BROADCAST.md](2026-09-15_WEBSOCKET_BROADCAST.md) - WebSocket session registry, rooms/broadcast, heartbeat reaping, auto-configuration wiring (AD-21)
- [2026-09-15_WEBSOCKET_CLIENT.md](2026-09-15_WEBSOCKET_CLIENT.md) - Isomorphic `@blue/socket` package, `SocketClient` + reconnect, dispatcher re-export seam, demo gate rewire (AD-22)
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

None currently.

---

_Naming convention: `YYYY-MM-DD_DESCRIPTION.md`_
