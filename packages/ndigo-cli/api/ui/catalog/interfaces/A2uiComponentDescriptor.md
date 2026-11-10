[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/catalog](../README.md) / A2uiComponentDescriptor

# Interface: A2uiComponentDescriptor

One component definition in the A2UI catalog.

## Properties

### description

> `readonly` **description**: `string`

Human-readable description shown to the agent.

***

### properties

> `readonly` **properties**: `Record`\<`string`, `unknown`\>

JSON Schema properties of the component payload.

***

### required

> `readonly` **required**: readonly `string`[]

Required payload keys.

***

### type

> `readonly` **type**: `"object"`

Every A2UI component is a JSON object.

***

### x-ndigo-element?

> `readonly` `optional` **x-ndigo-element?**: `string`

The custom-element tag, when the item is a behaviour element.

***

### x-ndigo-item

> `readonly` **x-ndigo-item**: `string`

The registry item this component maps to.

***

### x-ndigo-type

> `readonly` **x-ndigo-type**: `string`

The registry item type (`registry:ui` or `registry:block`).
