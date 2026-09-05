[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserCookieValueMethodArgumentResolver

# Class: BrowserCookieValueMethodArgumentResolver

Defined in: [packages/blue-platform-web/src/cookie-argument-resolver.ts:13](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookie-argument-resolver.ts#lines-13)

Browser cookie argument resolver using `document.cookie` parsing.

## Extends

- `AbstractPlatformArgumentResolver`

## Constructors

### Constructor

> **new BrowserCookieValueMethodArgumentResolver**(): `BrowserCookieValueMethodArgumentResolver`

Defined in: [packages/blue-platform-web/src/cookie-argument-resolver.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookie-argument-resolver.ts#lines-14)

#### Returns

`BrowserCookieValueMethodArgumentResolver`

#### Overrides

`AbstractPlatformArgumentResolver.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-platform-web/src/cookie-argument-resolver.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookie-argument-resolver.ts#lines-18)

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

> `protected` **resolveName**(`name`, `_parameter`, `_route`, `_mapping`): `any`

Defined in: [packages/blue-platform-web/src/cookie-argument-resolver.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookie-argument-resolver.ts#lines-23)

Retrieves a raw cookie string from `document.cookie`.

#### Parameters

##### name

`string`

##### \_parameter

`MethodParameter`

##### \_route

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

Defined in: [packages/blue-platform-web/src/cookie-argument-resolver.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookie-argument-resolver.ts#lines-29)

Returns whether this resolver supports cookie parameters.

#### Parameters

##### parameter

`MethodParameter`

#### Returns

`boolean`

#### Overrides

`AbstractPlatformArgumentResolver.supportsParameter`
