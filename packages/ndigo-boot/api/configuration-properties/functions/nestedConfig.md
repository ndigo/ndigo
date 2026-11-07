[**@ndigo/boot v0.0.1**](../../README.md)

***

[@ndigo/boot](../../README.md) / [configuration-properties](../README.md) / nestedConfig

# Function: nestedConfig()

> **nestedConfig**(`value`, `context`): `void`

Marks a `@property('prefix')` field as a nested configuration object: bind
recursively into this plain-class field under the property's keypath
(AD-15 D3). One prefix mechanism (`@property`), one recursion flag.

## Parameters

### value

`undefined`

The field value.

### context

`ClassFieldDecoratorContext`

The field decorator context.

## Returns

`void`

A field decorator.

## Example

```ts
@configurationProperties('server')
class ServerConfig {
}
class DbConfig { @property('url') url!: string; } // binds server.db.url
```
