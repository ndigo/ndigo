[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / RouteRegistry

# Class: RouteRegistry

Defined in: [packages/blue-router/src/route-registry.ts:81](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-registry.ts#lines-81)

Registry of type-safe route definitions.

Created by scanning `routeMapping` decorator metadata from registered
source classes. Provides a nested tree of [RouteDefinition](RouteDefinition.md) instances
for URL generation, navigation, and route matching.

## Constructors

### Constructor

> **new RouteRegistry**(): `RouteRegistry`

Defined in: [packages/blue-router/src/route-registry.ts:84](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-registry.ts#lines-84)

#### Returns

`RouteRegistry`

## Methods

### scanSources()

> **scanSources**(`sources`, `context`): `void`

Defined in: [packages/blue-router/src/route-registry.ts:94](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-registry.ts#lines-94)

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

***

### get()

> **get**\<`T`\>(`path`): [`RouteDefinition`](RouteDefinition.md)\<`T`\> \| `undefined`

Defined in: [packages/blue-router/src/route-registry.ts:141](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-registry.ts#lines-141)

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

Defined in: [packages/blue-router/src/route-registry.ts:148](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-registry.ts#lines-148)

Returns all registered route definition keys.

#### Returns

`IterableIterator`\<`string`\>

***

### entries()

> **entries**(): `IterableIterator`\<\[`string`, [`RouteDefinition`](RouteDefinition.md)\<`string`\>\]\>

Defined in: [packages/blue-router/src/route-registry.ts:155](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-registry.ts#lines-155)

Returns the flat definition map entries.

#### Returns

`IterableIterator`\<\[`string`, [`RouteDefinition`](RouteDefinition.md)\<`string`\>\]\>
