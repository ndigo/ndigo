[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / ResultMatcher

# Interface: ResultMatcher\<TInput, TResult\>

Represents an object that returns a matching result for an input.

## Type Parameters

### TInput

`TInput`

The type of the input to match.

### TResult

`TResult`

The type of the matching result.

## Methods

### match()

> **match**(`input`): `TResult` \| `null`

Matches an input and returns the narrowed result, or `null` when no match exists.

#### Parameters

##### input

`TInput`

The input to match.

#### Returns

`TResult` \| `null`

The matching result, or `null` when the input does not match.
