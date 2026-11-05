[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [web-auto-configuration](../README.md) / WebAutoConfiguration

# Class: WebAutoConfiguration

Auto-configuration for browser-based applications.
Provisions argument resolvers and converter registries.

## Constructors

### Constructor

> **new WebAutoConfiguration**(): `WebAutoConfiguration`

#### Returns

`WebAutoConfiguration`

## Methods

### argumentResolvers()

> **argumentResolvers**(): `HandlerMethodArgumentResolver`[]

Creates the browser argument resolvers used for request binding.

#### Returns

`HandlerMethodArgumentResolver`[]

The browser argument resolvers.

***

### argumentValueConverterRegistry()

> **argumentValueConverterRegistry**(): `Record`\<`string`, [`ArgumentValueConverter`](../../index/type-aliases/ArgumentValueConverter.md)\>

Exposes the shared argument-value converter registry.

#### Returns

`Record`\<`string`, [`ArgumentValueConverter`](../../index/type-aliases/ArgumentValueConverter.md)\>

The browser argument-value converter registry.

***

### handlerMapping()

> **handlerMapping**(): `RadixMetadataHandlerMapping`

Provides the default handler mapping for browser-based request dispatch.
Can be overridden by registering a custom `configuration` with a handlerMapping entry.

#### Returns

`RadixMetadataHandlerMapping`

The default metadata-driven handler mapping.

***

### languageResolver()

> **languageResolver**(): [`CookieLanguageResolver`](../../cookie-language-resolver/classes/CookieLanguageResolver.md)

Resolves the request language from the persisted cookie, falling back
to the browser language. Can be overridden by registering a custom
`configuration` with a languageResolver entry.

#### Returns

[`CookieLanguageResolver`](../../cookie-language-resolver/classes/CookieLanguageResolver.md)

The cookie-backed language resolver.

***

### viewResolver()

> **viewResolver**(): `ViewResolverComposite`

Provides the default view resolver chain: web-component descriptors
first, then name-registered view beans. Can be overridden by
registering a custom `configuration` with a viewResolver entry.

#### Returns

`ViewResolverComposite`

The composite view resolver.
