[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [route-view-targeter](../README.md) / RouteSelectorMap

# Type Alias: RouteSelectorMap

> **RouteSelectorMap** = `Record`\<`string`, `string`\> \| `Map`\<`string`, `string`\>

Maps a route pattern to a selector.

Patterns use the URL glob syntax the router uses (`*`, `**`, `?`,
character classes) and are consulted in declaration order — put the most
specific pattern first.
