[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [stomp-frame](../README.md) / StompFrame

# Interface: StompFrame

A parsed STOMP frame. `command: ''` marks a heart-beat ping.

## Properties

### body

> **body**: [`StompBody`](../type-aliases/StompBody.md)

Frame body — string for text frames, bytes for binary (D8).

***

### command

> **command**: `string`

Frame command (`CONNECT`, `SEND`, …, or `''` for a ping).

***

### headers

> **headers**: `Record`\<`string`, `string`\>

Decoded header map; names as sent, values unescaped.
