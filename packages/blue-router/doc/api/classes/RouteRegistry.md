[**@blue/router v0.0.1**](../README.md)

***

[@blue/router](../README.md) / RouteRegistry

# Class: RouteRegistry

Registry of type-safe route definitions.

Created by scanning `routeMapping` decorator metadata from registered
source classes. Provides a nested tree of [RouteDefinition](RouteDefinition.md) instances
for URL generation, navigation, and route matching.

## Constructors

### Constructor

> **new RouteRegistry**(): `RouteRegistry`

#### Returns

`RouteRegistry`

## Methods

### entries()

> **entries**(): `IterableIterator`\<\[`string`, [`RouteDefinition`](RouteDefinition.md)\<`string`\>\]\>

Returns the flat definition map entries.

#### Returns

`IterableIterator`\<\[`string`, [`RouteDefinition`](RouteDefinition.md)\<`string`\>\]\>

***

### get()

> **get**\<`T`\>(`path`): [`RouteDefinition`](RouteDefinition.md)\<`T`\> \| `undefined`

Access a route definition by dotted path.

#### Type Parameters

##### T

`T` *extends* `string`

#### Parameters

##### path

`string`

#### Returns

[`RouteDefinition`](RouteDefinition.md)\<`T`\> \| `undefined`

***

### keys()

> **keys**(): `IterableIterator`\<`string`\>

Returns all registered route definition keys.

#### Returns

`IterableIterator`\<`string`\>

***

### scanSources()

> **scanSources**(`sources`, `context`): `void`

Scan source classes for `routeMapping` metadata and populate the registry.

#### Parameters

##### sources

`Iterable`\<`Function`\>

The source/configuration classes to scan.

##### context

`Registry`

The application context for resolving the Router.

#### Returns

`void`
