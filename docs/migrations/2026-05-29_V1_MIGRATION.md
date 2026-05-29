# 2026-05-29 V1 Migration Guide

This guide documents the breaking changes and new features introduced in the BlueJS 10-wave roadmap (pre-Wave-1 baseline) that developers need to understand when upgrading from previous versions.

## Overview

The 10-wave roadmap has completed a major architectural overhaul of BlueJS, focusing on:
- Clear separation of concerns between packages
- Isomorphic core principles with browser-only code moved to platform packages
- Enhanced service layer with HTTP interceptors
- Domain-driven design patterns
- Platform expansion with Node.js support
- Improved tooling and linting enforcement

## Breaking Changes by Wave

### Wave 1: pnpm 11 upgrade; deleted legacy `.legacy.js` files

The pnpm 11 upgrade has been completed, and several legacy files have been removed:
- `packages/blue-util/bench/like.test.ts`
- `packages/blue-util/src/type/_like-is.ts`
- `packages/blue-context/src/event-emitter.old.ts.txt`
- `blue-view/test/*.js` (Chai/Mocha shared spec factories)
- All 9 `.legacy.js` files from various packages

### Wave 2: `no-browser-globals-in-isomorphic` ESLint rule is now `warn`

A new ESLint rule `@blue/no-browser-globals-in-isomorphic` has been added to enforce that browser-only globals (`window`, `document`, `navigator`, `HTMLElement`, `history`) are not used in isomorphic-core packages. This rule is now set to `warn` level, which may cause lint warnings in consumer code using browser globals in isomorphic packages.

### Wave 4: Service interceptors moved

The following service interceptors have been moved from `@blue/service` to `@blue/http`:
- `RetryInterceptor`
- `AppResetInterceptor`

Additionally, 7 legacy interceptor files were deleted from `@blue/service`:
- `cache.legacy.js`
- `offline.legacy.js` (deferred to platform-web)
- `header.legacy.js`
- `error.legacy.js`
- `status.legacy.js`
- `retryOnError.legacy.js`
- `appReset.legacy.js`

### Wave 9: New exports in `@blue/dispatcher`

The `@blue/dispatcher` package now exports `RouteHandlerInterceptor`, which is an additive change but may affect imports.

## New Packages

### `@blue/platform-node` (Wave 8)
Node.js HTTP argument resolvers and environment for server-side development.

### `@blue/auth` (Wave 9)
Authentication strategies, principals, sessions, and decorators for secure application development.

## New Decorators

The following new TC39 Stage 3 decorators have been added across various packages:

### `@blue/orm`
- `@oneToMany`
- `@manyToOne`
- `@manyToMany`
- `@oneToOne`
- `@prePersist`
- `@postLoad`
- `@preUpdate`
- `@postRemove`
- `@transactional`

### `@blue/domain`
- `@domainComponent`
- `@domainAction`
- `@domainData`

### `@blue/auth`
- `@authenticated`
- `@authorized(role)`

## Experimental APIs

The following APIs are marked as `@experimental` and may change in future releases:

- `SiteBuilder` in `@blue/boot`
- `@transactional` decorator in `@blue/orm` (metadata stored but not enforced without a TransactionManager)
- `UnitOfWork` / `InMemoryUnitOfWork` in `@blue/orm` (not yet auto-configured)

## Dependency Changes

The Library Integration Layer pattern has been enforced more strictly:
- External dependencies must now be imported through their designated integration layer packages:
  - `@blue/util` for `ramda`, `date-fns`, `date-fns-tz`, `seedrandom`, `slug`
  - `@blue/parser` for `arcsecond`
  - `@blue/model` for `objectmodel`
- Direct imports from ramda, arcsecond, objectmodel are now linted as warnings

This change ensures better consistency and prevents runtime issues with ESM/CJS dual-exports.