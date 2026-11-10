[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/log-tail](../README.md) / tailLines

# Function: tailLines()

> **tailLines**(`buffer`, `count`): `Buffer`

Returns the last `count` visibly populated lines of a buffer.

A single trailing newline closes the final line and must not consume one of
the requested lines (the previous `slice(-n)` counted that empty segment
too, so `--lines 2` showed one line on newline-terminated logs — the
off-by-one fixed under issue #146).

## Parameters

### buffer

`Buffer`

The log snapshot.

### count

`number`

The number of lines to keep.

## Returns

`Buffer`

A view over the retained bytes, untouched.
