[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-boot/src](../README.md) / ConfigurationProperties

# Function: ConfigurationProperties()

> **ConfigurationProperties**(`prefix?`): \<`T`\>(`target`, `context`) => `T`

Defined in: [packages/blue-boot/src/configuration-properties.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-boot/src/configuration-properties.ts#lines-56)

Marks a class as a configuration properties holder and optionally sets a property key prefix.

When the application starts, every field decorated with `@property` on the class is resolved
from the environment. If a `prefix` is given, property paths are prefixed with it (e.g.
`prefix = 'server'` makes `@property('port')` resolve `server.port`).

Use with the existing `@property` decorator from `@blue/context` for field-level binding.

## Parameters

### prefix?

`string`

Optional property key prefix applied to all `@property` fields.

## Returns

A class decorator.

\<`T`\>(`target`, `context`) => `T`

## Example

```ts
import { property } from '@blue/context';
import { ConfigurationProperties, resolveConfigurationProperties } from '@blue/boot';

@ConfigurationProperties('server')
class ServerConfig {
    @property('port')
    port: number = 8080;

    @property('host')
    host: string = 'localhost';
}

const ctx = app.run();
const { instance, isValid } = resolveConfigurationProperties(ServerConfig, ctx);
instance.port // → resolved from server.port in environment
```
