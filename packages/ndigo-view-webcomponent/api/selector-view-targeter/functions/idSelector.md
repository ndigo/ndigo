[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [selector-view-targeter](../README.md) / idSelector

# Function: idSelector()

> **idSelector**(`name`): `string`

Builds a selector for an element id.

The safe short form for the convention `view "hello" → element #hello`:
escapes the name so a request-derived value cannot break out of the
selector. Prefer this (or an explicit map) over interpolating a name.

## Parameters

### name

`string`

The element id.

## Returns

`string`

An escaped id selector.
