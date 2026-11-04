[**@ndigo/socket v0.0.1**](../README.md)

***

[@ndigo/socket](../README.md) / parseStompFrame

# Function: parseStompFrame()

> **parseStompFrame**(`frame`): [`StompFrame`](../interfaces/StompFrame.md)

Parse a wire frame into its command/headers/body.

Frame termination: with `content-length`, the body is exactly that many
bytes and the frame must end with NUL right after it; without it, the
body runs to the first NUL. The NUL may be followed by any number of EOLs
(STOMP 1.2 §1.2). A frame holding nothing but EOLs — and, in the byte
path, NULs — is a heart-beat ping. Text frames yield string bodies; byte
inputs yield `Uint8Array` bodies (D8).

## Parameters

### frame

[`StompWireInput`](../type-aliases/StompWireInput.md)

The wire frame (a WebSocket text or binary message).

## Returns

[`StompFrame`](../interfaces/StompFrame.md)

The parsed frame (`command: ''` for a ping).

## Throws

[StompProtocolError](../classes/StompProtocolError.md) on malformed input.
