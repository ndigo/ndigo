[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [content-negotiation-view-resolver](../README.md) / canServeMediaType

# Function: canServeMediaType()

> **canServeMediaType**(`candidate`, `accepted`): `boolean`

Whether a candidate media type can serve an accepted media range, honoring
type/subtype inclusion and wildcard semantics. Single source of truth for
the candidate-vs-range check shared by the extension strategy and the
resolver's final negotiation pass.

## Parameters

### candidate

`MediaType`

The media type a view produces.

### accepted

`MediaType`

The client-accepted range.

## Returns

`boolean`

`true` when the candidate satisfies the range.
