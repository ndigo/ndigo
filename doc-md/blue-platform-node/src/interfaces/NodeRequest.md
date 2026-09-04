[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / NodeRequest

# Interface: NodeRequest

Defined in: packages/blue-platform-node/src/node-request.ts:19

Minimal Node.js request abstraction stored in `route.attributes[NODE_REQUEST_ATTRIBUTE]`.
Middleware is responsible for populating this before the dispatcher resolves arguments.

## Properties

### headers

> **headers**: `Record`\<`string`, `string` \| `string`[] \| `undefined`\>

Defined in: packages/blue-platform-node/src/node-request.ts:21

HTTP request headers (lower-cased names).

***

### body

> **body**: `Record`\<`string`, `unknown`\>

Defined in: packages/blue-platform-node/src/node-request.ts:23

Pre-parsed request body. Use `'*'` as a body parameter name to bind the entire object.

***

### cookies

> **cookies**: `Record`\<`string`, `string`\>

Defined in: packages/blue-platform-node/src/node-request.ts:25

Pre-parsed cookies from the `Cookie` header.

***

### session

> **session**: `Record`\<`string`, `unknown`\>

Defined in: packages/blue-platform-node/src/node-request.ts:27

Server-side session data keyed by session variable name.
