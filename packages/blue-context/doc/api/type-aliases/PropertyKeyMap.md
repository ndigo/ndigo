[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / PropertyKeyMap

# Type Alias: PropertyKeyMap\<S\>

> **PropertyKeyMap**\<`S`\> = `{ [K in keyof S & string]: DeepPropertyKey<S[K], K> }`

The shape's leaf keypaths, mirroring the shape object: leaves become the
joined template-literal path (`{ server: { port: 0 } }` →
`'server.port'`), nested objects stay objects.

## Type Parameters

### S

`S` *extends* `object`
