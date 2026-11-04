[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / socketSessionValue

# Function: socketSessionValue()

> **socketSessionValue**(`name?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Binder for the `SocketSession` on a socket mapping. Explicit replacement
for the removed implicit session injection: the session is only bound
where the handler asks for it, like every other value.

## Parameters

### name?

`string` = `'session'`

The extractor name (defaults to `'session'`).

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

A socket-session extractor.
