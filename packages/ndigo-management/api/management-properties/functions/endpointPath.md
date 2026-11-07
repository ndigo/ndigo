[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [management-properties](../README.md) / endpointPath

# Function: endpointPath()

> **endpointPath**(`id`): `string` \| `undefined`

The root path of a management endpoint id, e.g. `'loggers'` → `/loggers`.

## Parameters

### id

`string`

The endpoint id.

## Returns

`string` \| `undefined`

The root path.

## Example

```ts
endpointPath('loggers'); // '/loggers'
```
