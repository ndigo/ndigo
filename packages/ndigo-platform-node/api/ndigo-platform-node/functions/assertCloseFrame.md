[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / assertCloseFrame

# Function: assertCloseFrame()

> **assertCloseFrame**(`code`, `reason`): `void`

RFC 6455 close-status validation (mirrors the `ws` client's valid range):
1000–1014 excluding the reserved 1004/1005/1006, or 3000–4999
(application-defined). Reasons are capped at 123 UTF-8 bytes (RFC 6455
§5.5.1). Invalid input throws a `RangeError` instead of surfacing as a
late `ws` error mid-loop (e.g. a `closeAll` aborting on the first bad
session).

## Parameters

### code

`number`

### reason

`string`

## Returns

`void`
