# Argument Resolver Conversion Summary

> **⚠️ ARCHIVED** — session-era upgrade note, superseded by
> [guide 09](../guides/09-argument-binding.md), AD-27 (argument binding) and
> AD-38 (schema-target conversion). Kept for history.

## Scope

This reference summarizes the recent BlueJS updates to argument resolver conversion support across:

- `@blue/dispatcher`
- `@blue/platform-web`

It is intended as a compact upgrade note for framework consumers.

## New Capabilities

### 1) Browser resolver expansion

`@blue/platform-web` now includes browser argument resolvers for:

- cookies (`BrowserCookieValueMethodArgumentResolver`)
- whole-source data binding (`BrowserDataBindingMethodArgumentResolver`)
- browser history state (`BrowserHistoryStateValueMethodArgumentResolver`)
- session storage (`BrowserSessionStorageValueMethodArgumentResolver`)
- local storage (`BrowserLocalStorageValueMethodArgumentResolver`)

### 2) Converter metadata on route parameters

`@blue/dispatcher` extractor factories now support richer `convert` forms:

- function converter
- named converter reference (`'number'`, `'toInt'`, etc.)
- optional descriptor (`{ optional: true, use: ... }`)

Supported across:

- `queryValue`
- `pathValue`
- `matrixValue`
- `cookieValue`
- `historyStateValue`
- `sessionStorageValue`
- `localStorageValue`
- `requestSessionValue`
- `dataBinderValue`

### 3) Built-in converter presets

`@blue/platform-web` exports `argumentValueConverters`:

- `identity`
- `number`
- `boolean`
- `date`
- `json`

### 4) Converter registry support

Named converter resolution now supports three levels:

1. per-call `converterRegistry` in `configureBrowserArgumentResolvers(...)`
2. `argumentValueConverterRegistry` stored in application context
3. built-in `argumentValueConverters`

Helper API:

- `configureArgumentValueConverterRegistry(context, registry)`
- `configureStrictBrowserArgumentResolvers(context, options?)`

### 5) Strict named lookup mode

`configureBrowserArgumentResolvers(...)` supports:

- `strictNamedConverterLookup: true`

In strict mode, unknown named converters fail fast.

### 6) Data Binding support

`dataBinderValue(source, Target?)` allows mapping an entire data source (like query parameters or history state) to a nested object structure.

- Supports dot-notation (`user.name`) and bracket-notation (`tags[0]`) via `@blue/core` `DataBinder`.
- Supports optional `prefix` filtering.
- Integrates with the conversion pipeline for post-binding coercion.

### 7) Zod / @blue/validate Integration

`validatedBy(schema, extractor)` allows wrapping any parameter extractor with a Zod schema or `@blue/validate` validator.

- Provides runtime validation and coercion.
- Enables compile-time type safety for controller methods.
- Maps validation failures to `ParameterConversionError`.

## Error Handling Behavior

Converter failures are wrapped as `ParameterConversionError`.

This includes strict named lookup failures at resolver runtime, enabling uniform error mapping in route error resolvers.

## Recommended Migration Pattern

1. Register shared converter registry with `configureArgumentValueConverterRegistry(...)`
2. Enable `strictNamedConverterLookup` in non-trivial applications
3. Prefer named converter references in `routeParams(...)` for reuse
4. Use optional descriptors for nullable sources

## Minimal Example

```typescript
configureArgumentValueConverterRegistry(context, {
    toInt: argumentValueConverters.number,
});

configureBrowserArgumentResolvers(context, {
    state: 'toInt',
    strictNamedConverterLookup: true,
});

@routeParams({
    amount: cookieValue('amount', { convert: 'toInt' }),
    txCount: historyStateValue('txCount', { convert: { optional: true, use: 'toInt' } }),
    user: validatedBy(UserSchema, dataBinderValue('query'))
})
handle(amount: number, txCount: number | null, user: User) {}
```
