[**@blue/boot v0.0.1**](../README.md)

***

[@blue/boot](../README.md) / relaxedKeyCandidates

# Function: relaxedKeyCandidates()

> **relaxedKeyCandidates**(`key`): `string`[]

The candidate environment keys `valueAt` probes for a dotted key under
relaxed binding, exact key first, then its camelCase, kebab-case and
snake_case spellings — each rewritten to resolver-safe form via
`toLookupKey` and de-duplicated (a spelling that equals the exact key
collapses). This is the single definition of the relaxed candidate set, so
declaration probing (`@blue/inspect`) and binding cannot drift apart.

## Parameters

### key

`string`

The dotted keypath as declared (e.g. `server.hostName`).

## Returns

`string`[]

The lookup-ready candidate keys, exact key first.
