[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / denialOf

# Function: denialOf()

> **denialOf**(`statusCode`, `options?`): [`InterceptorDenial`](../interfaces/InterceptorDenial.md)

Creates an explicit [InterceptorDenial](../interfaces/InterceptorDenial.md).

## Parameters

### statusCode

`number`

HTTP status for the finalized denial (`401`/`403`).

### options?

Body and redirect for the denial outcome.

#### body?

`Record`\<`string`, `unknown`\>

#### redirect?

`string`

## Returns

[`InterceptorDenial`](../interfaces/InterceptorDenial.md)
