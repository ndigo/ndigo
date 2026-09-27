[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / AbstractViewMapping

# Abstract Class: AbstractViewMapping

Base implementation for route-to-target mappings.

Subclasses are responsible for the route matching strategy; this class only
handles default-target fallback and shared mapping state.

## Extends

- `NameAware` & `ApplicationContextAware` & `Null`\<`this`\>

## Extended by

- [`AbstractPathViewMapping`](AbstractPathViewMapping.md)

## Implements

- [`ViewMapping`](../interfaces/ViewMapping.md)

## Constructors

### Constructor

> **new AbstractViewMapping**(): `AbstractViewMapping`

#### Returns

`AbstractViewMapping`

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).[$aware]`

***

### applicationContext

> **applicationContext**: `ApplicationContext`

The application context used to look up mapping dependencies.

***

### defaultTarget

> **defaultTarget**: `unknown`

The fallback target returned when no route-specific target is found.

***

### interceptors

> **interceptors**: `unknown`[]

The interceptors applied while resolving targets.

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).name`

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

The path matcher used to match request paths to targets.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

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

#### Implementation of

[`ViewMapping`](../interfaces/ViewMapping.md).[`getTarget`](../interfaces/ViewMapping.md#gettarget)

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

`AsNameAware(AsApplicationContextAware(Null)).setApplicationContext`

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

`AsNameAware(AsApplicationContextAware(Null)).setName`
