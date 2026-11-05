[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [mapping-registry](../README.md) / MappingEntry

# Class: MappingEntry\<T\>

Internal registry entry for a mapping and its resolved handler method.

## Type Parameters

### T

`T` = `unknown`

## Constructors

### Constructor

> **new MappingEntry**\<`T`\>(`mapping`, `handlerMethod`, `mappingName`, `directPaths?`): `MappingEntry`\<`T`\>

Create a mapping registry entry.

#### Parameters

##### mapping

`T`

The mapping key.

##### handlerMethod

[`RouteHandlerMethod`](../../route-handler-method/classes/RouteHandlerMethod.md)

The resolved handler method.

##### mappingName

`string`

The mapping name, if any.

##### directPaths?

`string`[] = `[]`

Paths that map directly to this entry.

#### Returns

`MappingEntry`\<`T`\>

## Properties

### directPaths

> `readonly` **directPaths**: `string`[]

***

### handlerMethod

> `readonly` **handlerMethod**: [`RouteHandlerMethod`](../../route-handler-method/classes/RouteHandlerMethod.md)

***

### mapping

> `readonly` **mapping**: `T`

***

### mappingName

> `readonly` **mappingName**: `string`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`
