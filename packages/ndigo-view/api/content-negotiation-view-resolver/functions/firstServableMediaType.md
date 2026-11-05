[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [content-negotiation-view-resolver](../README.md) / firstServableMediaType

# Function: firstServableMediaType()

> **firstServableMediaType**(`candidates`, `acceptedRanges`): `MediaType` \| `undefined`

Returns the first candidate media type that can serve one of the accepted
ranges, honoring the client's priority order (accepted ranges are already
ordered by descending q-value).

Single source of truth for the candidate-vs-range walk shared by the
extension negotiation strategy and the resolver's final negotiation pass,
so both select the same representation for the same `Accept` header.

## Parameters

### candidates

`MediaType`[]

The media types the server can produce, in registration order.

### acceptedRanges

`MediaType`[]

The client-accepted ranges, in client-priority order.

## Returns

`MediaType` \| `undefined`

The first servable candidate, or `undefined` when none matches.
