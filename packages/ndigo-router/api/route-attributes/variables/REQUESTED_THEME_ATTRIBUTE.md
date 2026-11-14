[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [route-attributes](../README.md) / REQUESTED\_THEME\_ATTRIBUTE

# Variable: REQUESTED\_THEME\_ATTRIBUTE

> `const` **REQUESTED\_THEME\_ATTRIBUTE**: `"requestedTheme"` = `'requestedTheme'`

Route attribute carrying the requested theme name. Platform adapters set it
from transport input (a cookie, typically) when building a route so theme
negotiation stays transport-agnostic (consumed by theme resolvers).

The value is untrusted: resolvers normalize it before use.
