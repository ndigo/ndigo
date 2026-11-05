[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [route-definition](../README.md) / RouteParams

# Type Alias: RouteParams\<T\>

> **RouteParams**\<`T`\> = `T` *extends* `` `${string}{${infer P}}${infer Rest}` `` ? `Record`\<`P`, `string`\> & `RouteParams`\<`Rest`\> : `object`

The parameter object a route pattern requires, derived from its `{name}`
placeholders: each placeholder becomes a required `string` field, and a
pattern without placeholders needs no arguments.

## Type Parameters

### T

`T` *extends* `string`
