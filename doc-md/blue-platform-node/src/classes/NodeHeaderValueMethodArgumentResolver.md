[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / NodeHeaderValueMethodArgumentResolver

# Class: NodeHeaderValueMethodArgumentResolver

Defined in: [packages/blue-platform-node/src/header-argument-resolver.ts:13](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/header-argument-resolver.ts#lines-13)

Node.js request header argument resolver.

## Extends

- `AbstractPlatformArgumentResolver`

## Constructors

### Constructor

> **new NodeHeaderValueMethodArgumentResolver**(): `NodeHeaderValueMethodArgumentResolver`

Defined in: [packages/blue-platform-node/src/header-argument-resolver.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/header-argument-resolver.ts#lines-14)

#### Returns

`NodeHeaderValueMethodArgumentResolver`

#### Overrides

`AbstractPlatformArgumentResolver.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-platform-node/src/header-argument-resolver.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/header-argument-resolver.ts#lines-18)

##### Returns

`string`

## Methods

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-dispatcher/lib/abstract-platform-resolver.d.ts:41

Resolves and converts a method argument value.

Pipeline: resolveName → defaultValue fallback → convertType lookup → conversion → nil check.

#### Parameters

##### parameter

`MethodParameter`

##### route

[`Route`](#)

##### mapping

`any`

#### Returns

`any`

#### Inherited from

`AbstractPlatformArgumentResolver.resolveArgument`

***

### handleMissingValue()

> **handleMissingValue**(`name`): `void`

Defined in: packages/blue-dispatcher/lib/argument-resolver.d.ts:46

Handles a missing argument value by throwing a TypeError.

#### Parameters

##### name

`string`

The name of the missing argument.

#### Returns

`void`

#### Throws

If the argument is undefined or null.

#### Inherited from

`AbstractPlatformArgumentResolver.handleMissingValue`

***

### resolveName()

> `protected` **resolveName**(`name`, `_parameter`, `route`, `_mapping`): `any`

Defined in: [packages/blue-platform-node/src/header-argument-resolver.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/header-argument-resolver.ts#lines-22)

#### Parameters

##### name

`string`

##### \_parameter

`MethodParameter`

##### route

[`Route`](#)

##### \_mapping

`any`

#### Returns

`any`

#### Overrides

`AbstractPlatformArgumentResolver.resolveName`

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: [packages/blue-platform-node/src/header-argument-resolver.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/header-argument-resolver.ts#lines-31)

Whether the given method parameter is supported by this resolver.

#### Parameters

##### parameter

`MethodParameter`

The method parameter to check.

#### Returns

`boolean`

Whether or not the given method parameter is supported by this resolver.

#### Overrides

`AbstractPlatformArgumentResolver.supportsParameter`
