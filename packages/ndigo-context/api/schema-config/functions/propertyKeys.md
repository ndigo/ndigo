[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [schema-config](../README.md) / propertyKeys

# Function: propertyKeys()

> **propertyKeys**\<`S`\>(`shape`): [`PropertyKeyMap`](../type-aliases/PropertyKeyMap.md)\<`S`\>

Materializes the shape's leaf keypaths as a plain object — the typed
counterpart of `DeepPropertyKeyMap`. Values are placeholders; pass any
sample shape: `propertyKeys({ server: { name: '', port: 0 } })`.

## Type Parameters

### S

`S` *extends* `object`

## Parameters

### shape

`S`

A literal-shaped sample of the configuration object.

## Returns

[`PropertyKeyMap`](../type-aliases/PropertyKeyMap.md)\<`S`\>

Leaf keypath strings in the same shape ('server.port').
