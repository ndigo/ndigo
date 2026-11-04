[**@ndigo/socket v0.0.1**](../README.md)

***

[@ndigo/socket](../README.md) / parseTextFrame

# Function: parseTextFrame()

> **parseTextFrame**(`frame`): [`StompFrame`](../interfaces/StompFrame.md)

Parse a text frame (string input).

Lines end with `EOL = [CR] LF` (STOMP 1.2 §1.2), so `\r\n` and `\n` may
be mixed; the NUL may be followed by any number of EOLs.

## Parameters

### frame

`string`

The wire frame text.

## Returns

[`StompFrame`](../interfaces/StompFrame.md)

The parsed frame (`command: ''` for a ping).

## Throws

[StompProtocolError](../classes/StompProtocolError.md) on malformed input.
