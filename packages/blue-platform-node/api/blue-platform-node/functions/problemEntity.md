[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / problemEntity

# Function: problemEntity()

> **problemEntity**(`status`, `details`): [`ResponseEntity`](../classes/ResponseEntity.md)\<[`ProblemDetails`](../interfaces/ProblemDetails.md)\>

Wraps a problem document in a `ResponseEntity` at the given status. Used by
framework error resolvers to return a problem through the resolver chain;
the response-entity view detects the problem body and writes
`application/problem+json` without double-wrapping.

## Parameters

### status

`ResponseStatus`

The `ResponseStatus` for the problem (e.g. `UNPROCESSABLE_ENTITY`).

### details

[`ProblemDetails`](../interfaces/ProblemDetails.md)

The problem document.

## Returns

[`ResponseEntity`](../classes/ResponseEntity.md)\<[`ProblemDetails`](../interfaces/ProblemDetails.md)\>

An entity carrying the problem.
