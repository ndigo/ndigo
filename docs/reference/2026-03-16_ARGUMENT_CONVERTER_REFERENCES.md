# Argument Converter References

## Summary

BlueJS route-parameter extractors now support **converter references** in addition to converter functions.

This enables:

- reusable named converters (`'number'`, `'boolean'`, custom names)
- optional conversion wrappers (`{ optional: true, use: ... }`)
- context-level converter registries for application-wide reuse

## Supported `convert` Forms

All extractor factories (`queryValue`, `pathValue`, `matrixValue`, `cookieValue`, `modelValue`, `stateValue`, `sessionValue`) support:

1. Function

```typescript
queryValue('page', { convert: (value) => Number(value) });
```

2. Named converter key

```typescript
modelValue('profile.id', { convert: 'number' });
```

3. Optional descriptor

```typescript
sessionValue('darkMode', {
    convert: { optional: true, use: 'boolean' },
});
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

`@blue/platform-web` exports `argumentValueConverters` with:

- `identity`
- `number`
- `boolean`
- `date`
- `json`

## Application Context Registry Example

```typescript
import { GenericApplicationContext } from '@blue/context';
import { configureBrowserArgumentResolvers } from '@blue/platform-web';

const context = new GenericApplicationContext('app');

context.setValue('argumentValueConverterRegistry', {
    toInt: (value) => Number(value),
    toFlag: (value) => value === 'yes',
});

configureBrowserArgumentResolvers(context, {
    state: 'toInt',
    session: { optional: true, use: 'toFlag' },
});
```

## Error Handling

If a converter throws, BlueJS wraps it in `ParameterConversionError` so route error resolvers can map conversion failures consistently.
