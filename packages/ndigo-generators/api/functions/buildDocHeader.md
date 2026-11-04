[**@ndigo/generators v0.0.1**](../README.md)

***

[@ndigo/generators](../README.md) / buildDocHeader

# Function: buildDocHeader()

> **buildDocHeader**(`options`): `string`

Builds the canonical Ndigo documentation header block, trailing newline
included. The block opens with `slash-star-star` and closes with
`star-slash`:

  ` * @module <module>`
  ` * @since 1.0.0`
  ` * @author Jeff Rose`
  ` * @author` may be omitted when the file-level author equals the
  repository default.

## Parameters

### options

[`DocHeaderOptions`](../interfaces/DocHeaderOptions.md)

## Returns

`string`
