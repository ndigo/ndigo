[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / AbstractBindMethodArgumentResolver

# Abstract Class: AbstractBindMethodArgumentResolver

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:22

Abstract base class for binding entire data sources to objects.

## Extends

- `AbstractNamedValueMethodArgumentResolver`

## Extended by

- [`BrowserBindMethodArgumentResolver`](BrowserBindMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractBindMethodArgumentResolver**(`converter?`, `converterRegistry?`, `converterResolutionOptions?`): `AbstractBindMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:34

Creates a bind-backed resolver.

#### Parameters

##### converter?

[`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md) = `identityArgumentValueConverter`

Default converter to apply to resolved values.

##### converterRegistry?

[`ArgumentValueConverterRegistry`](../type-aliases/ArgumentValueConverterRegistry.md) = `argumentValueConverters`

Named converter registry used for lookups.

##### converterResolutionOptions?

[`ConverterResolutionOptions`](../type-aliases/ConverterResolutionOptions.md) = `{}`

Resolution behavior overrides.

#### Returns

`AbstractBindMethodArgumentResolver`

#### Overrides

`AbstractNamedValueMethodArgumentResolver.constructor`

## Methods

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

`AbstractNamedValueMethodArgumentResolver.handleMissingValue`

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:46

Resolves and converts a bind-backed argument value.

#### Parameters

##### parameter

`MethodParameter`

##### route

`Route`

##### mapping

`any`

#### Returns

`any`

#### Overrides

`AbstractNamedValueMethodArgumentResolver.resolveArgument`

***

### getSourceData()

> `abstract` `protected` **getSourceData**(`source`, `route`): `Record`\<`string`, `any`\>

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:80

Retrieves the source data map for the named binding source.

#### Parameters

##### source

`string`

##### route

`Route`

#### Returns

`Record`\<`string`, `any`\>

***

### filterByPrefix()

> `protected` **filterByPrefix**(`data`, `prefix`): `Record`\<`string`, `any`\>

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:83

Removes a prefix from keys before binding nested values.

#### Parameters

##### data

`Record`\<`string`, `any`\>

##### prefix

`string`

#### Returns

`Record`\<`string`, `any`\>

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:101

Returns whether this resolver supports bind parameters.

#### Parameters

##### parameter

`MethodParameter`

#### Returns

`boolean`

#### Overrides

`AbstractNamedValueMethodArgumentResolver.supportsParameter`

***

### resolveName()

> `protected` **resolveName**(): `any`

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:106

Resolves the source name from the parameter metadata.

#### Returns

`any`

#### Overrides

`AbstractNamedValueMethodArgumentResolver.resolveName`
