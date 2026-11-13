[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [name-view-targeter](../README.md) / NameSelectorResolver

# Type Alias: NameSelectorResolver

> **NameSelectorResolver** = `Record`\<`string`, `string`\> \| ((`viewName`) => `string` \| `null` \| `undefined`)

Maps a view name to a selector.

The map form is the safe default: a view name is only a lookup key, never
interpolated into selector text. The function form receives the name and is
responsible for escaping it (`idSelector` is the short safe form).
