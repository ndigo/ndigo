[**@ndigo/boot v0.0.1**](../../README.md)

***

[@ndigo/boot](../../README.md) / [configuration-properties](../README.md) / getConfigurationPropertiesPrefix

# Function: getConfigurationPropertiesPrefix()

> **getConfigurationPropertiesPrefix**(`target`): `string` \| `undefined`

Reads the optional prefix from a `@configurationProperties` class.

## Parameters

### target

`unknown`

The decorated class (or instance) to inspect.

## Returns

`string` \| `undefined`

The declared prefix, or `undefined` when none was set.

## Example

```ts
const prefix = getConfigurationPropertiesPrefix(ServerConfig); // 'server'
```
