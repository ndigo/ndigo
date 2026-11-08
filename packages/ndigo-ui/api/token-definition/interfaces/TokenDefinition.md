[**@ndigo/ui v0.0.1**](../../README.md)

***

[@ndigo/ui](../../README.md) / [token-definition](../README.md) / TokenDefinition

# Interface: TokenDefinition

Catalog entry for one design token.

## Properties

### description

> `readonly` **description**: `string`

What the token means and where it should be used.

***

### group

> `readonly` **group**: `"palette"` \| `"color"` \| `"typography"` \| `"space"` \| `"radius"` \| `"elevation"` \| `"motion"` \| `"z"` \| `"focus"`

Group the token belongs to.

***

### name

> `readonly` **name**: `` `--nd-${string}` ``

CSS custom property name, e.g. `--nd-color-bg`.
