[**@ndigo/content v0.0.1**](../README.md)

***

[@ndigo/content](../README.md) / MessageParams

# Interface: MessageParams

Parameters controlling message formatting.

The three fields map onto the two message standards the contract supports:
named interpolation values (i18next `replace` / ICU `values`), a plural
count (i18next plural keys / ICU `plural`), and a variant selector
(i18next context suffix / ICU `select`).

## Properties

### context?

> `optional` **context?**: `string`

Variant selector — i18next context suffix (e.g. `key_male`) or ICU `select`.

***

### count?

> `optional` **count?**: `number`

Plural count — drives i18next `_one`/`_other` keys or ICU plural selection.

***

### values?

> `optional` **values?**: `Record`\<`string`, `unknown`\>

Named interpolation values for `{name}` placeholders.
