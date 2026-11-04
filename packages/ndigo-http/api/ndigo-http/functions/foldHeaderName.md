[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / foldHeaderName

# Function: foldHeaderName()

> **foldHeaderName**(`name`): `string`

Folds a header name to the lower-cased spelling used by Node server
header records (DSG-5).

This is the package's single folding rule: `Headers` folds
case-insensitively itself, while plain records are written lower-cased by
the Node server — so every exact-match read retries with this folded
spelling. Shared with `@ndigo/test`'s response mock (HG-10) so the captured
map and the readers can never drift.

## Parameters

### name

`string`

The header name to fold.

## Returns

`string`

The lower-cased name.
