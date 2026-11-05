[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [island-view](../README.md) / customElementNamePattern

# Variable: customElementNamePattern

> `const` **customElementNamePattern**: `RegExp`

Pattern for a valid custom-element tag name (the autonomous-custom-element
subset of the HTML "valid custom element name" grammar): a lowercase ASCII
letter, then name characters with at least one hyphen. Uppercase, leading
hyphens, spaces, and markup metacharacters are rejected — the name is
interpolated raw into generated markup, so an unvalidated name is an
injection vector.

Deliberately a strict ASCII subset: the spec's non-ASCII PCENChar range
(e.g. `x-føø`, `x-你好`) is rejected until the grammar is widened — see
[isValidCustomElementName](../functions/isValidCustomElementName.md) (VIEW-6).
