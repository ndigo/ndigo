[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractPathViewMapping

# Abstract Class: AbstractPathViewMapping

Defined in: [packages/blue-view/src/view-mapping.ts:100](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-100)

Base implementation for mappings that resolve targets by path.

## Extends

- [`AbstractViewMapping`](AbstractViewMapping.md)

## Constructors

### Constructor

> **new AbstractPathViewMapping**(): `AbstractPathViewMapping`

Defined in: [packages/blue-view/src/view-mapping.ts:112](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-112)

#### Returns

`AbstractPathViewMapping`

#### Overrides

[`AbstractViewMapping`](AbstractViewMapping.md).[`constructor`](AbstractViewMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`[$aware]`](AbstractViewMapping.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/lib/aware.d.ts:31

The name of the value in the factory.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`name`](AbstractViewMapping.md#name)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: [packages/blue-view/src/view-mapping.ts:35](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-35)

The application context used to look up mapping dependencies.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`applicationContext`](AbstractViewMapping.md#applicationcontext)

***

### defaultTarget

> **defaultTarget**: `any`

Defined in: [packages/blue-view/src/view-mapping.ts:39](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-39)

The fallback target returned when no route-specific target is found.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`defaultTarget`](AbstractViewMapping.md#defaulttarget)

***

### interceptors

> **interceptors**: `any`[]

Defined in: [packages/blue-view/src/view-mapping.ts:43](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-43)

The interceptors applied while resolving targets.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`interceptors`](AbstractViewMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: [packages/blue-view/src/view-mapping.ts:47](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-47)

The path matcher used to match request paths to targets.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`pathMatcher`](AbstractViewMapping.md#pathmatcher)

***

### rootTarget

> **rootTarget**: `any`

Defined in: [packages/blue-view/src/view-mapping.ts:104](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-104)

The target returned for the root path when one is configured.

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean`

Defined in: [packages/blue-view/src/view-mapping.ts:108](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-108)

Indicates whether trailing slashes should be treated as equivalent.

***

### \_targets

> `protected` `readonly` **\_targets**: `Map`\<`string`, `any`\>

Defined in: [packages/blue-view/src/view-mapping.ts:110](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-110)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-view/src/view-mapping.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-49)

##### Returns

`string`

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`[toStringTag]`](AbstractViewMapping.md#tostringtag)

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

[`AbstractViewMapping`](AbstractViewMapping.md).[`setApplicationContext`](AbstractViewMapping.md#setapplicationcontext)

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

[`AbstractViewMapping`](AbstractViewMapping.md).[`setName`](AbstractViewMapping.md#setname)

***

### getTarget()

> **getTarget**(`route`): `any`

Defined in: [packages/blue-view/src/view-mapping.ts:81](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-81)

Returns the target associated with the given route.

#### Parameters

##### route

[`Route`](#)

The route being resolved.

#### Returns

`any`

The resolved target, or `null` when no target matches.

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`getTarget`](AbstractViewMapping.md#gettarget)

***

### \_getTarget()

> `abstract` `protected` **\_getTarget**(`route`): `any`

Defined in: [packages/blue-view/src/view-mapping.ts:94](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-94)

#### Parameters

##### route

[`Route`](#)

#### Returns

`any`

#### Inherited from

[`AbstractViewMapping`](AbstractViewMapping.md).[`_getTarget`](AbstractViewMapping.md#_gettarget)
