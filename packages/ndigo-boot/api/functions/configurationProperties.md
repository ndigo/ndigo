[**@ndigo/boot v0.0.1**](../README.md)

***

[@ndigo/boot](../README.md) / configurationProperties

# Function: configurationProperties()

> **configurationProperties**(`prefix?`, `options?`): \<`T`\>(`target`, `context`) => `T`

Marks a class as a configuration properties holder and optionally sets a
property key prefix.

When the application starts, every field decorated with `@property` on the
class is bound from the environment (converted via `getPropertyAs`). If a
`prefix` is given, property paths are prefixed with it (e.g. `prefix =
'server'` makes `@property('port')` resolve `server.port`). The bound
instance is auto-registered as an entry bean keyed by the camelCase-derived
class name (`ServerConfig` → `serverConfig`).

**Conversion target (CTX-11).** A field's target type is, in order: the
explicit type passed to `@property(path, Type)`; else the type inferred
from the field's initializer (`port = 0` → `number`, `flag = false` →
`boolean`, `at = new Date()` → `date`); else `String`. An untyped field
with NO initializer (`port!: number` is erased at runtime) therefore binds
the raw value with no conversion — declare the type explicitly or
initialize the field to get numeric/boolean/date conversion.

Use with `@property` (+ optional `@defaultValue` / `@nestedConfig`) from
`@ndigo/context`.

## Parameters

### prefix?

`string`

Optional property key prefix applied to all `@property` fields.

### options?

[`ConfigurationPropertiesOptions`](../interfaces/ConfigurationPropertiesOptions.md)

Additional binding options.

## Returns

A class decorator.

\<`T`\>(`target`, `context`) => `T`

## Example

```ts
import { property, defaultValue, nestedConfig } from '@ndigo/context';
import { configurationProperties } from '@ndigo/boot';

@configurationProperties('server')
class ServerConfig {
    @property('port', Number) @defaultValue('8080') port!: number;
    @property('db') @nestedConfig db!: DbConfig;
}

const ctx = app.run();
const serverConfig = ctx.getValue('serverConfig');
serverConfig.port // → number from server.port (or 8080)
```
