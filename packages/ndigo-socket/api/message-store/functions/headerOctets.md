[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [message-store](../README.md) / headerOctets

# Function: headerOctets()

> **headerOctets**(`headers`): `number`

Serialized header size as transmitted: for every entry, the UTF-8 octets
of its name and value plus the `:` separator and the line's EOL. Shared by
the broker's header cap (REV-002) and any budget that opts to charge
headers alongside the body.

## Parameters

### headers

`Readonly`\<`Record`\<`string`, `string`\>\>

The frame's headers.

## Returns

`number`

The transmitted header octet count.
