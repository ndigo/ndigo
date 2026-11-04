[**@ndigo/socket v0.0.1**](../README.md)

***

[@ndigo/socket](../README.md) / materialOctets

# Function: materialOctets()

> **materialOctets**(`body`): `number`

Body size as transmitted: UTF-8 octets for text, raw length for bytes.
Shared by the store's byte budget and the broker's transaction budget.

## Parameters

### body

[`StompBody`](../type-aliases/StompBody.md)

The message body.

## Returns

`number`

The transmitted octet count.
