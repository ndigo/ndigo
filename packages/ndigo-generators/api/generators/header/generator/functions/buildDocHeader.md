[**@ndigo/generators v0.0.1**](../../../../README.md)

***

[@ndigo/generators](../../../../README.md) / [generators/header/generator](../README.md) / buildDocHeader

# Function: buildDocHeader()

> **buildDocHeader**(`options`): `string`

Builds the canonical Ndigo documentation header block, trailing newline
included. The block opens with `slash-star-star` and closes with
`star-slash`, and carries the tags:

  ` * @since 1.0.0`
  ` * @author Jeff Rose`
  ` * @author` may be omitted when the file-level author equals the
  repository default.

No `@module` tag: TypeDoc derives each module's name from its entry-point
path, and a package-wide tag collapses every file of the package into one
module (or, worse, into `README-1.md`…`README-N.md` duplicates).

## Parameters

### options

[`DocHeaderOptions`](../interfaces/DocHeaderOptions.md)

## Returns

`string`
