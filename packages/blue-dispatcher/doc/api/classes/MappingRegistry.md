[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / MappingRegistry

# Class: MappingRegistry\<T\>

Maintains mapping-to-handler-method lookups.

## Type Parameters

### T

`T` = `unknown`

## Constructors

### Constructor

> **new MappingRegistry**\<`T`\>(): `MappingRegistry`\<`T`\>

#### Returns

`MappingRegistry`\<`T`\>

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### mappings

#### Get Signature

> **get** **mappings**(): `Map`\<`T`, [`RouteHandlerMethod`](RouteHandlerMethod.md)\>

Return the current mapping table.

##### Returns

`Map`\<`T`, [`RouteHandlerMethod`](RouteHandlerMethod.md)\>

The mapping-to-handler-method map.

## Methods

### entries()

> **entries**(): [`MappingEntry`](MappingEntry.md)\<`T`\>[]

Return every registered entry, in registration order.

Unlike [mappings](#mappings), an entry carries the mapping object, the
handler method, its mapping name and any direct paths — the read model
introspection tooling needs without touching dispatch behavior.

#### Returns

[`MappingEntry`](MappingEntry.md)\<`T`\>[]

A snapshot array of the registered entries.

***

### getHandlerMethodsByMappingName()

> **getHandlerMethodsByMappingName**(`name`): [`RouteHandlerMethod`](RouteHandlerMethod.md)[]

Find handler methods registered under a mapping name.

#### Parameters

##### name

`string`

The mapping name.

#### Returns

[`RouteHandlerMethod`](RouteHandlerMethod.md)[]

The matching handler methods.

***

### getMappingsByPath()

> **getMappingsByPath**(`path`): `T`[]

Find mappings that are associated with a path.

#### Parameters

##### path

`string`

The request path.

#### Returns

`T`[]

The matching mappings.

***

### register()

> **register**(`mapping`, `handlerMethod`, `mappingName`, `directPaths?`): `void`

Register a mapping and its handler method.

#### Parameters

##### mapping

`T`

The mapping key.

##### handlerMethod

[`RouteHandlerMethod`](RouteHandlerMethod.md)

The handler method to associate.

##### mappingName

`string`

The name the handler method is exposed under, if any.

##### directPaths?

`string`[] = `[]`

Paths that map directly to this entry.

#### Returns

`void`

***

### unregister()

> **unregister**(`mapping`): `void`

#### Parameters

##### mapping

`T`

#### Returns

`void`
