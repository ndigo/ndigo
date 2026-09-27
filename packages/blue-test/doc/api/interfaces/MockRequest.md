[**@blue/test v0.0.1**](../README.md)

***

[@blue/test](../README.md) / MockRequest

# Interface: MockRequest

A mock HTTP request to be dispatched through the application's pipeline.

## Properties

### body?

> `optional` **body?**: `Record`\<`string`, `unknown`\>

Request body (JSON object). Bound as `'*'` for the whole object, or by field name.

***

### cookies?

> `optional` **cookies?**: `Record`\<`string`, `string`\>

Cookies.

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Request headers — keys are case-insensitive and normalized to lowercase, matching Node's `IncomingMessage`.

***

### method?

> `optional` **method?**: `string`

HTTP method. Defaults to `GET`.

***

### path

> **path**: `string`

Path, e.g. `/todos/42`. Map params like `/todos/{id}` are resolved by the framework.

***

### query?

> `optional` **query?**: `Record`\<`string`, `string`\>

Query parameters, e.g. `{ filter: 'active' }`.

***

### rawBody?

> `optional` **rawBody?**: `string` \| `Buffer`\<`ArrayBufferLike`\>

Raw request body sent verbatim (string or Buffer). `multipart/form-data` streams through the real parser before dispatch; any other Content-Type is parsed like a live body (JSON / urlencoded / raw text).

***

### remoteAddress?

> `optional` **remoteAddress?**: `string`

Client socket address for the rate limiter's key. Defaults to a
fresh per-request `mock-peer-<n>` address — tests are isolated from
each other's budgets unless they deliberately share an address.

***

### session?

> `optional` **session?**: `Record`\<`string`, `unknown`\>

Session data.
