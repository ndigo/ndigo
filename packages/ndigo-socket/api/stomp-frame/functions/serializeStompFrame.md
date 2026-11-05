[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [stomp-frame](../README.md) / serializeStompFrame

# Function: serializeStompFrame()

> **serializeStompFrame**(`frame`): [`StompBody`](../type-aliases/StompBody.md)

Serialize a frame to the wire format (NUL-terminated, escaped headers).

Text bodies return a string (text frame); binary bodies return a
`Uint8Array` (binary frame, D8) and always carry `content-length` in
bytes. A text body containing NUL also forces `content-length` — the
framing ambiguity the header exists to resolve.

## Parameters

### frame

[`StompFrame`](../interfaces/StompFrame.md)

The frame to serialize.

## Returns

[`StompBody`](../type-aliases/StompBody.md)

The wire frame (string for text bodies, bytes for binary).

## Throws

[StompProtocolError](../classes/StompProtocolError.md) on values that cannot be framed.
