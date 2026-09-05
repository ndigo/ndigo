[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / WebAutoConfiguration

# Class: WebAutoConfiguration

Defined in: packages/blue-platform-web/src/web-auto-configuration.ts:23

Auto-configuration for browser-based applications.
Provisions argument resolvers and converter registries.

## Constructors

### Constructor

> **new WebAutoConfiguration**(): `WebAutoConfiguration`

#### Returns

`WebAutoConfiguration`

## Methods

### argumentValueConverterRegistry()

> **argumentValueConverterRegistry**(): `Record`\<`string`, [`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md)\>

Defined in: packages/blue-platform-web/src/web-auto-configuration.ts:30

Exposes the shared argument-value converter registry.

#### Returns

`Record`\<`string`, [`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md)\>

The browser argument-value converter registry.

***

### argumentResolvers()

> **argumentResolvers**(): ([`BrowserBindMethodArgumentResolver`](BrowserBindMethodArgumentResolver.md) \| [`BrowserCookieValueMethodArgumentResolver`](BrowserCookieValueMethodArgumentResolver.md) \| [`BrowserModelValueMethodArgumentResolver`](BrowserModelValueMethodArgumentResolver.md) \| [`BrowserStateValueMethodArgumentResolver`](BrowserStateValueMethodArgumentResolver.md) \| [`BrowserSessionValueMethodArgumentResolver`](BrowserSessionValueMethodArgumentResolver.md))[]

Defined in: packages/blue-platform-web/src/web-auto-configuration.ts:40

Creates the browser argument resolvers used for request binding.

#### Returns

([`BrowserBindMethodArgumentResolver`](BrowserBindMethodArgumentResolver.md) \| [`BrowserCookieValueMethodArgumentResolver`](BrowserCookieValueMethodArgumentResolver.md) \| [`BrowserModelValueMethodArgumentResolver`](BrowserModelValueMethodArgumentResolver.md) \| [`BrowserStateValueMethodArgumentResolver`](BrowserStateValueMethodArgumentResolver.md) \| [`BrowserSessionValueMethodArgumentResolver`](BrowserSessionValueMethodArgumentResolver.md))[]

The browser argument resolvers.

***

### handlerMapping()

> **handlerMapping**(): `LinearMetadataHandlerMapping`

Defined in: packages/blue-platform-web/src/web-auto-configuration.ts:57

Provides the default handler mapping for browser-based request dispatch.
Can be overridden by registering a custom

#### Returns

`LinearMetadataHandlerMapping`

The default metadata-driven handler mapping.

#### Configuration

with a handlerMapping entry.

***

### viewResolver()

> **viewResolver**(): `NameViewResolver`

Defined in: packages/blue-platform-web/src/web-auto-configuration.ts:68

Provides the default view resolver that matches views by name.
Can be overridden by registering a custom

#### Returns

`NameViewResolver`

The default name-based view resolver.

#### Configuration

with a viewResolver entry.

***

### webComponentViewEngine()

> **webComponentViewEngine**(): `WebComponentViewEngine`

Defined in: packages/blue-platform-web/src/web-auto-configuration.ts:79

Provides the default Web Component view engine.
Can be overridden by registering a custom

#### Returns

`WebComponentViewEngine`

The default Web Component view engine.

#### Configuration

with a webComponentViewEngine entry.
