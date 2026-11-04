[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / InterceptorDenial

# Interface: InterceptorDenial

The outcome of a denied `preHandle`. `statusCode` is the HTTP status the
platform adapter finalizes; `body` is a JSON-safe payload (never internal
detail); `redirect` optionally names a client-side redirect target.

## Properties

### body?

> `readonly` `optional` **body?**: `Record`\<`string`, `unknown`\>

JSON-safe response body. Callers receive only this — never stack traces.

***

### redirect?

> `readonly` `optional` **redirect?**: `string`

Optional redirect target for browser denials.

***

### statusCode?

> `readonly` `optional` **statusCode?**: `number`

HTTP status code for the finalized denial response (default `403`).
