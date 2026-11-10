[**@ndigo/view-toon v0.0.1**](../../README.md)

***

[@ndigo/view-toon](../../README.md) / [toon-encode](../README.md) / ToonEncodeOptions

# Interface: ToonEncodeOptions

TOON encoding options, mirroring the reference encoder's supported surface
(spec §9): indentation width for nested lines, and the row/inline-array
delimiter — `\t` or `|` are the tabular-friendly choices for LLM
consumers.

## Properties

### delimiter?

> `optional` **delimiter?**: `","` \| "\\t" \| "\|"

Delimiter for tabular array rows and inline primitive arrays.
Defaults to `','`.

***

### indentSize?

> `optional` **indentSize?**: `number`

Spaces per indentation level. Defaults to `2`.
