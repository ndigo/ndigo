[**@ndigo/ui-web v0.0.1**](../../README.md)

***

[@ndigo/ui-web](../../README.md) / [set-visual-theme](../README.md) / ThemeContextLike

# Interface: ThemeContextLike

Structural shape of the theme state `setVisualTheme` updates.

Deliberately narrow: any application context (or test double) that exposes
the default theme name and a setter works, so this package never forces a
specific context implementation on its consumers.

## Properties

### themeName

> `readonly` **themeName**: `string`

Current default theme name.

## Methods

### setThemeName()

> **setThemeName**(`name`): `void`

Records a new default theme name.

#### Parameters

##### name

`string`

The theme name to record.

#### Returns

`void`
