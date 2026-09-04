[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractViewMapping

# Abstract Class: AbstractViewMapping

Defined in: packages/blue-view/src/view-mapping.ts:31

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

Defined in: packages/blue-view/src/view-mapping.ts:53

#### Returns

`AbstractViewMapping`

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).[$aware]`

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/lib/aware.d.ts:31

The name of the value in the factory.

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).name`

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: packages/blue-view/src/view-mapping.ts:35

The application context used to look up mapping dependencies.

***

### defaultTarget

> **defaultTarget**: `any`

Defined in: packages/blue-view/src/view-mapping.ts:39

The fallback target returned when no route-specific target is found.

***

### interceptors

> **interceptors**: `any`[]

Defined in: packages/blue-view/src/view-mapping.ts:43

The interceptors applied while resolving targets.

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: packages/blue-view/src/view-mapping.ts:47

The path matcher used to match request paths to targets.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-view/src/view-mapping.ts:49

##### Returns

`string`

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/lib/context.d.ts:145

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

Defined in: packages/blue-factory/lib/aware.d.ts:36

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).setName`

***

### getTarget()

> **getTarget**(`route`): `any`

Defined in: packages/blue-view/src/view-mapping.ts:81

Returns the target associated with the given route.

#### Parameters

##### route

`Route`

The route being resolved.

#### Returns

`any`

The resolved target, or `null` when no target matches.

#### Implementation of

[`ViewMapping`](../interfaces/ViewMapping.md).[`getTarget`](../interfaces/ViewMapping.md#gettarget)

***

### \_getTarget()

> `abstract` `protected` **\_getTarget**(`route`): `any`

Defined in: packages/blue-view/src/view-mapping.ts:94

#### Parameters

##### route

`Route`

#### Returns

`any`
