[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [webmcp](../README.md) / AsWebMcpElement

# Function: AsWebMcpElement()

> **AsWebMcpElement**\<`T`\>(`superclass`): `T` & `Constructable`\<[`WebMcpElementBase`](../interfaces/WebMcpElementBase.md) & [`WebMcpElement`](../interfaces/WebMcpElement.md)\>

Mixin that registers an element's WebMCP tools on connect and aborts them on
disconnect. Subclasses implement [WebMcpElement.webMcpTools](../interfaces/WebMcpElement.md#webmcptools); they can
read dependencies from `this.applicationContext` on `AbstractWebComponent`.

## Type Parameters

### T

`T` *extends* `Constructable`\<[`WebMcpElementBase`](../interfaces/WebMcpElementBase.md)\>

## Parameters

### superclass

`T`

The element base class.

## Returns

`T` & `Constructable`\<[`WebMcpElementBase`](../interfaces/WebMcpElementBase.md) & [`WebMcpElement`](../interfaces/WebMcpElement.md)\>

A subclass with the WebMCP lifecycle.
