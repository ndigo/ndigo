[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / MockRequest

# Interface: MockRequest

Defined in: packages/blue-test/src/request-builder.ts:19

A mock HTTP request to be dispatched through the application's pipeline.

## Properties

### method?

> `optional` **method?**: `string`

Defined in: packages/blue-test/src/request-builder.ts:21

HTTP method. Defaults to `GET`.

***

### path

> **path**: `string`

Defined in: packages/blue-test/src/request-builder.ts:23

Path, e.g. `/todos/42`. Map params like `/todos/{id}` are resolved by the framework.

***

### query?

> `optional` **query?**: `Record`\<`string`, `string`\>

Defined in: packages/blue-test/src/request-builder.ts:25

Query parameters, e.g. `{ filter: 'active' }`.

***

### body?

> `optional` **body?**: `Record`\<`string`, `unknown`\>

Defined in: packages/blue-test/src/request-builder.ts:27

Request body (JSON object). Bound as `'*'` for the whole object, or by field name.

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Defined in: packages/blue-test/src/request-builder.ts:29

Request headers (lower-cased keys).

***

### cookies?

> `optional` **cookies?**: `Record`\<`string`, `string`\>

Defined in: packages/blue-test/src/request-builder.ts:31

Cookies.

***

### session?

> `optional` **session?**: `Record`\<`string`, `unknown`\>

Defined in: packages/blue-test/src/request-builder.ts:33

Session data.
