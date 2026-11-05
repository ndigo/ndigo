[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [web-component-view-resolver](../README.md) / WebComponentViewResolverOptions

# Interface: WebComponentViewResolverOptions

Configuration for [WebComponentViewResolver](../classes/WebComponentViewResolver.md).

## Properties

### registry?

> `optional` **registry?**: `Record`\<`string`, `string` \| `Constructable`\<`HTMLElement`\>\>

Optional logical-name → component mapping. Values are either a
component class (eager; the module is already imported) or a module
path string (lazy; imported on first resolution).

***

### viewNames?

> `optional` **viewNames?**: (`string` \| `RegExp`)[]

Optional name filter. When set, only names matching these patterns
resolve; everything else falls through the resolver chain.
