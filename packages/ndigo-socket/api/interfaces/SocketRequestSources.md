[**@ndigo/socket v0.0.1**](../README.md)

***

[@ndigo/socket](../README.md) / SocketRequestSources

# Interface: SocketRequestSources

Request sources captured from the upgrade request — the same vocabulary
HTTP handlers use (`query`/`headers`/`cookies`), so WebSocket handlers can
read and validate them (e.g. `z.email().parse(session.query.user)`).

## Properties

### cookies

> **cookies**: `Record`\<`string`, `string`\>

Cookies from the upgrade request.

***

### headers

> **headers**: `Record`\<`string`, `string` \| `string`[] \| `undefined`\>

Headers from the upgrade request (lower-cased names).

***

### query

> **query**: `Record`\<`string`, `string` \| `string`[]\>

Query parameters from the upgrade URL.
