[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / customElementNamePattern

# Variable: customElementNamePattern

> `const` **customElementNamePattern**: `RegExp`

Pattern for a valid custom-element tag name (the autonomous-custom-element
subset of the HTML "valid custom element name" grammar): a lowercase ASCII
letter, then name characters with at least one hyphen. Uppercase, leading
hyphens, spaces, and markup metacharacters are rejected — the name is
interpolated raw into generated markup, so an unvalidated name is an
injection vector.
