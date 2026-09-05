[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserBindMethodArgumentResolver

# Class: BrowserBindMethodArgumentResolver

Defined in: [packages/blue-platform-web/src/bind-argument-resolver.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/bind-argument-resolver.ts#lines-22)

Browser-specific bind resolver.

Resolves values from browser data sources (query, state, session, cookie)
and binds them to objects using `DataBinder`.

Overrides `resolveArgument()` because the bind pipeline (source data →
filter by prefix → bind to object → convert) differs from the standard
name-resolution pipeline used by other resolvers.

## Extends

- `AbstractPlatformArgumentResolver`

## Constructors

### Constructor

> **new BrowserBindMethodArgumentResolver**(): `BrowserBindMethodArgumentResolver`

Defined in: [packages/blue-platform-web/src/bind-argument-resolver.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/bind-argument-resolver.ts#lines-23)

#### Returns

`BrowserBindMethodArgumentResolver`

#### Overrides

`AbstractPlatformArgumentResolver.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-platform-web/src/bind-argument-resolver.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/bind-argument-resolver.ts#lines-27)

##### Returns

`string`

## Methods

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

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: [packages/blue-platform-web/src/bind-argument-resolver.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/bind-argument-resolver.ts#lines-31)

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

#### Overrides

`AbstractPlatformArgumentResolver.resolveArgument`

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: [packages/blue-platform-web/src/bind-argument-resolver.ts:100](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/bind-argument-resolver.ts#lines-100)

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

***

### resolveName()

> `protected` **resolveName**(): `any`

Defined in: [packages/blue-platform-web/src/bind-argument-resolver.ts:104](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/bind-argument-resolver.ts#lines-104)

#### Returns

`any`

#### Overrides

`AbstractPlatformArgumentResolver.resolveName`
