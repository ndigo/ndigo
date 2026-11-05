[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-mapping](../README.md) / AbstractPathViewMapping

# Abstract Class: AbstractPathViewMapping

Base implementation for mappings that resolve targets by path.

## Extends

- [`AbstractViewMapping`](AbstractViewMapping.md)

## Constructors

### Constructor

> **new AbstractPathViewMapping**(): `AbstractPathViewMapping`

#### Returns

`AbstractPathViewMapping`

#### Overrides

[`AbstractViewMapping`](AbstractViewMapping.md).[`constructor`](AbstractViewMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`[$aware]`](AbstractViewMapping.md#aware)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

The application context used to look up mapping dependencies.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`applicationContext`](AbstractViewMapping.md#applicationcontext)

***

### defaultTarget

> **defaultTarget**: `unknown`

The fallback target returned when no route-specific target is found.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`defaultTarget`](AbstractViewMapping.md#defaulttarget)

***

### interceptors

> **interceptors**: `unknown`[]

The interceptors applied while resolving targets.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`interceptors`](AbstractViewMapping.md#interceptors)

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`name`](AbstractViewMapping.md#name)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

The path matcher used to match request paths to targets.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`pathMatcher`](AbstractViewMapping.md#pathmatcher)

***

### rootTarget

> **rootTarget**: `unknown`

The target returned for the root path when one is configured.

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean`

Indicates whether trailing slashes should be treated as equivalent.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`[toStringTag]`](AbstractViewMapping.md#tostringtag)

## Methods

### getTarget()

> **getTarget**(`route`): `unknown`

Returns the target associated with the given route.

#### Parameters

##### route

[`Route`](#)

The route being resolved.

#### Returns

`unknown`

The resolved target, or `null` when no target matches.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`getTarget`](AbstractViewMapping.md#gettarget)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`setApplicationContext`](AbstractViewMapping.md#setapplicationcontext)

***

### setName()

> **setName**(`name`): `void`

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`setName`](AbstractViewMapping.md#setname)
