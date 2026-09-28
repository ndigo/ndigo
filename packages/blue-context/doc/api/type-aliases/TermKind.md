[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / TermKind

# Type Alias: TermKind

> **TermKind** = `"name"` \| `"not"` \| `"and"` \| `"or"` \| `"compound"`

The precedence-role a composed term plays in the grammar (loose → tight):
names and raw strings are treated as loose compounds when they contain
operator characters, so they parenthesize safely under every context.
