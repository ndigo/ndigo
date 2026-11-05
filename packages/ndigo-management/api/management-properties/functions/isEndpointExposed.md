[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [management-properties](../README.md) / isEndpointExposed

# Function: isEndpointExposed()

> **isEndpointExposed**(`environment`, `options`, `id`): `boolean`

Resolves whether an endpoint id is served: `options` (programmatic,
AD-76 D-5) win over the `management.*` source section; the default
posture serves health+metrics.

## Parameters

### environment

`Environment` \| `undefined`

The application environment (may be undefined pre-injection).

### options

\{ `exclude?`: `string`[]; `include?`: `string`[]; \} \| `undefined`

The programmatic exposure override.

### id

`string`

The endpoint id to test.

## Returns

`boolean`

`true` when the endpoint is served.
