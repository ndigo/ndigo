# Reference Documentation

This directory contains reference documentation for dependencies, configurations, and technical specifications in the Ndigo project.

## Available References

- [2026-01-23_DEPENDENCIES_REFERENCE.md](./2026-01-23_DEPENDENCIES_REFERENCE.md) - Complete dependency version reference — **⚠️ ARCHIVED** (2026-01 snapshot; see `package.json` manifests)
- [2026-02-06_URL_PARSING_SPECIFICATIONS.md](./2026-02-06_URL_PARSING_SPECIFICATIONS.md) - URL parsing specifications and compliance references
- [2026-03-08_STYLE_GUIDE_RESEARCH.md](./2026-03-08_STYLE_GUIDE_RESEARCH.md) - Style guide research and naming convention analysis — **⚠️ ARCHIVED** (fed `STYLE_GUIDE.md`; tooling sections predate OXC)
- [2026-03-08_ARCHITECTURE_ROADMAP.md](./2026-03-08_ARCHITECTURE_ROADMAP.md) - Architecture roadmap, platform vision, and package maturity — **⚠️ ARCHIVED** (superseded by `ARCHITECTURE.md` + ADR index)
- [2026-03-09_ROUTER_MIDDLEWARE_AND_ROUTE_PARAMS.md](./2026-03-09_ROUTER_MIDDLEWARE_AND_ROUTE_PARAMS.md) - Router middleware API and named route-parameter behavior
- [2026-03-10_LEGACY_ROUTER_PATTERNS.md](./2026-03-10_LEGACY_ROUTER_PATTERNS.md) - Legacy-router patterns and migration notes — **⚠️ ARCHIVED** (legacy AMD router removed; see `@ndigo/router`, AD-61)
- [2026-03-16_ARGUMENT_CONVERTER_REFERENCES.md](./2026-03-16_ARGUMENT_CONVERTER_REFERENCES.md) - Converter reference types, registry resolution, and error-handling behavior — **⚠️ ARCHIVED** (see guides 09/14, AD-27/AD-38)
- [2026-03-16_ARGUMENT_RESOLVER_CONVERSION_SUMMARY.md](./2026-03-16_ARGUMENT_RESOLVER_CONVERSION_SUMMARY.md) - Consolidated upgrade summary for browser resolvers and conversion features — **⚠️ ARCHIVED** (see guides 09/14, AD-27/AD-38)
- [2026-08-22_CONTEXT_LIFECYCLE.md](./2026-08-22_CONTEXT_LIFECYCLE.md) - Application-context lifecycle: refresh, close, parent-child teardown, and scope semantics
- [2026-09-01_FEATURE_ASSESSMENT.md](./2026-09-01_FEATURE_ASSESSMENT.md) - Framework feature assessment (partial hydration, MFE shell status, remote module story)
- [2026-09-08_ENVIRONMENT_API.md](./2026-09-08_ENVIRONMENT_API.md) - Ndigo environment API surface: sources, profiles, binding, validation, and decorators
- [2026-03-25_FEATURE_METRIC_NAMING_AND_DASHBOARD_PATTERNS.md](./2026-03-25_FEATURE_METRIC_NAMING_AND_DASHBOARD_PATTERNS.md) - Feature-metric naming contract and dashboard grouping patterns

## Naming Convention

Reference files follow the format: `YYYY-MM-DD_DESCRIPTION.md`

Where:

- `YYYY-MM-DD` - Date the reference was created or last updated (ISO 8601 format)
- `_` - Underscore separator (consistent with UPPER_SNAKE_CASE constants)
- `DESCRIPTION` - Brief description in ALL_CAPS with underscores for multi-word phrases

## Purpose

Reference documents provide:

- Technical specifications
- Dependency version tables
- Configuration references
- API references
- Comparison tables
