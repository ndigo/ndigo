[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [webmcp](../README.md) / WebMcpElementBase

# Interface: WebMcpElementBase

The element base contract the WebMCP mixin requires: a host element with the
optional custom-element lifecycle callbacks the mixin chains into.

## Extends

- `HTMLElement`

## Methods

### connectedCallback()?

> `optional` **connectedCallback**(): `void`

Custom-element connect hook, when the base class defines one.

#### Returns

`void`

***

### disconnectedCallback()?

> `optional` **disconnectedCallback**(): `void`

Custom-element disconnect hook, when the base class defines one.

#### Returns

`void`
