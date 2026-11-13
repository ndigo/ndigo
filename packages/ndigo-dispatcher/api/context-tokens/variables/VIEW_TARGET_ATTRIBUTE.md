[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [context-tokens](../README.md) / VIEW\_TARGET\_ATTRIBUTE

# Variable: VIEW\_TARGET\_ATTRIBUTE

> `const` **VIEW\_TARGET\_ATTRIBUTE**: `"__dispatch:viewTarget"` = `'__dispatch:viewTarget'`

Route attribute key under which a handler or interceptor may place a
per-dispatch [ViewTarget](#).

The value must be a target instance, never a selector string: route
attributes can carry request-derived data, and the dispatcher validates the
value with `likeViewTarget` before a view writes into it.
