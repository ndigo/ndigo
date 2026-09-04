[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / cachedBootApp

# Function: cachedBootApp()

> **cachedBootApp**(`sources`): [`BlueTestApp`](../interfaces/BlueTestApp.md)

Defined in: packages/blue-test/src/blue-test.ts:133

Boots (or reuses a cached) application for the given sources.

Within a vitest worker, calling `cachedBootApp` twice with the same sources
returns the SAME app — the context is booted once, not per suite. Each call
increments a reference; release one with [releaseCachedApp](releaseCachedApp.md) (or by
closing the app). The app is closed when the last reference is released.

NOTE: Vitest isolates modules per file by default, so the cache is scoped to
one worker/file. To share one context across multiple spec files, disable
per-file isolation (e.g. `isolate: false` in the pool config) — a deliberate
safety trade-off: shared mutable context means suites can interfere.

## Parameters

### sources

`Function`[]

Application configuration and/or controller classes.

## Returns

[`BlueTestApp`](../interfaces/BlueTestApp.md)

A booted app.

## Example

```ts
const app = cachedBootApp([TodoConfiguration]); // boots once
const app2 = cachedBootApp([TodoConfiguration]); // reuses app
expect(app2).toBe(app); // same context
```
