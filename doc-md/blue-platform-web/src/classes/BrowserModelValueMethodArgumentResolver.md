[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserModelValueMethodArgumentResolver

# Class: BrowserModelValueMethodArgumentResolver

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:23

Browser model argument resolver.

Resolves values from route data by direct key lookup and dotted
key-path traversal (`profile.name`).

## Extends

- `AbstractPlatformArgumentResolver`

## Constructors

### Constructor

> **new BrowserModelValueMethodArgumentResolver**(): `BrowserModelValueMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:24

#### Returns

`BrowserModelValueMethodArgumentResolver`

#### Overrides

`AbstractPlatformArgumentResolver.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:28

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

`Route`

##### mapping

`any`

#### Returns

`any`

#### Inherited from

`AbstractPlatformArgumentResolver.resolveArgument`

***

### handleMissingValue()

> **handleMissingValue**(`name`): `void`

Defined in: packages/blue-dispatcher/lib/argument-resolver.d.ts:55

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

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:33

Resolves model data from the current route.

#### Parameters

##### name

`string`

##### \_parameter

`MethodParameter`

##### route

`Route`

##### \_mapping

`any`

#### Returns

`any`

#### Overrides

`AbstractPlatformArgumentResolver.resolveName`

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:48

Returns whether this resolver supports model parameters.

#### Parameters

##### parameter

`MethodParameter`

#### Returns

`boolean`

#### Overrides

`AbstractPlatformArgumentResolver.supportsParameter`
