# Argument Converter References

> **⚠️ ARCHIVED** — superseded by the conversion pipeline in
> [guide 06](../guides/06-argument-binding.md) / [guide 13](../guides/13-dto-conversion.md),
> AD-27 and AD-38 (`ConversionService`). Kept for history.

## Summary

ndigo route-parameter extractors now support **converter references** in addition to converter functions.

This enables:

- reusable named converters (`'number'`, `'boolean'`, custom names)
- optional conversion wrappers (`{ optional: true, use: ... }`)
- context-level converter registries for application-wide reuse
- strict named lookup mode for fail-fast configuration

## Supported `convert` Forms

All extractor factories (`queryValue`, `pathVariable`, `matrixValue`, `headerValue`,
`bodyValue`, `cookieValue`, `requestSessionValue`, `sessionStorageValue`,
`localStorageValue`, `historyStateValue`, `attributeValue`, `socketSessionValue`)
support:

1. Function

```typescript
queryValue('page', { convert: (value) => Number(value) });
```

2. Named converter key

```typescript
historyStateValue('profile.id', { convert: 'number' });
```

3. Optional descriptor

```typescript
sessionStorageValue('darkMode', {
    convert: { optional: true, use: 'boolean' },
});
```

4. Typed Converter Wrappers (Recommended)

```typescript
import { asNumber, queryValue } from '@ndigo/dispatcher';

// Wraps an extractor to enforce number conversion
asNumber(queryValue('page'));
```

## Converter Resolution Order

When resolving an argument value:

1. **Parameter-level converter** (`parameter.convert`) if present
2. **Resolver-level converter** (from resolver constructor/config)
3. Identity fallback

Named converters are resolved against:

1. Explicit `converterRegistry` passed to `configureBrowserArgumentResolvers(...)`
2. `argumentValueConverterRegistry` from `ApplicationContext` (if set)
3. Built-in `argumentValueConverters`

## Built-in Converter Presets

`@ndigo/platform-web` exports `argumentValueConverters` with:

- `identity`
- `number`
- `boolean`
- `date`
- `json`

## Application Context Registry Example

```typescript
import { GenericApplicationContext } from '@ndigo/context';
import {
    argumentValueConverters,
    configureArgumentValueConverterRegistry,
    configureBrowserArgumentResolvers,
} from '@ndigo/platform-web';

const context = new GenericApplicationContext('app');

configureArgumentValueConverterRegistry(context, {
    toInt: argumentValueConverters.number,
    toFlag: (value) => value === 'yes',
});

configureBrowserArgumentResolvers(context, {
    state: 'toInt',
    session: { optional: true, use: 'toFlag' },
    strictNamedConverterLookup: true,
});
```

## Strict Named Lookup

By default, unknown named converters fall back to identity conversion.

Set `strictNamedConverterLookup: true` in `configureBrowserArgumentResolvers(...)` to throw an error when a named converter cannot be found.

## Error Handling

If a converter throws, ndigo wraps it in `ParameterConversionError` so route error resolvers can map conversion failures consistently.

## Typed Converter Wrappers

For better readability and type safety, `@ndigo/dispatcher` provides fluent wrappers:

- `asNumber(extractor)`
- `asBoolean(extractor)`
- `asDate(extractor)`
- `asJson<T>(extractor)`

These wrappers merge the appropriate `convert` reference into the extractor while preserving other options.
