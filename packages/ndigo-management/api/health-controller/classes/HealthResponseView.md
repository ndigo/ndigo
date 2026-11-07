[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [health-controller](../README.md) / HealthResponseView

# Class: HealthResponseView

A producing view that writes the `/health` document at an explicit HTTP
status.

`/health` must keep its `{ status, components, timestamp }` body even when
the aggregate is DOWN, but the framework renders every 4xx/5xx
`ResponseEntity` as `application/problem+json` (AD-10) — which would replace
that body. A producing view writes the document directly, so the health
payload survives alongside the `503` status (the actuator convention: a
DOWN aggregate is signalled by the status code, not by an error envelope).

## Constructors

### Constructor

> **new HealthResponseView**(`body`, `status`): `HealthResponseView`

Creates the response view for a health document.

#### Parameters

##### body

[`HealthStatus`](../../health/interfaces/HealthStatus.md)

The aggregate health document.

##### status

`number`

The HTTP status to write (200 or 503).

#### Returns

`HealthResponseView`

## Methods

### renderTo()

> **renderTo**(): `Promise`\<\{ `body`: `string`; `headers`: `Record`\<`string`, `string`\>; `status`: `number`; \}\>

Produces the health response document.

#### Returns

`Promise`\<\{ `body`: `string`; `headers`: `Record`\<`string`, `string`\>; `status`: `number`; \}\>

The status, JSON content type, and serialized health body.
