[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-boot/src](../README.md) / WebAutoConfiguration

# Class: WebAutoConfiguration

Defined in: packages/blue-boot/src/web-auto-configuration.ts:25

Auto-configuration for browser-based applications.
Provisions argument resolvers and converter registries.

## Constructors

### Constructor

> **new WebAutoConfiguration**(): `WebAutoConfiguration`

#### Returns

`WebAutoConfiguration`

## Methods

### argumentValueConverterRegistry()

> **argumentValueConverterRegistry**(): `Record`\<`string`, `ArgumentValueConverter`\>

Defined in: packages/blue-boot/src/web-auto-configuration.ts:32

Exposes the shared argument-value converter registry.

#### Returns

`Record`\<`string`, `ArgumentValueConverter`\>

The browser argument-value converter registry.

***

### argumentResolvers()

> **argumentResolvers**(): (`BrowserBindMethodArgumentResolver` \| `BrowserCookieValueMethodArgumentResolver` \| `BrowserModelValueMethodArgumentResolver` \| `BrowserStateValueMethodArgumentResolver` \| `BrowserSessionValueMethodArgumentResolver`)[]

Defined in: packages/blue-boot/src/web-auto-configuration.ts:42

Creates the browser argument resolvers used for request binding.

#### Returns

(`BrowserBindMethodArgumentResolver` \| `BrowserCookieValueMethodArgumentResolver` \| `BrowserModelValueMethodArgumentResolver` \| `BrowserStateValueMethodArgumentResolver` \| `BrowserSessionValueMethodArgumentResolver`)[]

The browser argument resolvers.

***

### handlerMapping()

> **handlerMapping**(): `LinearMetadataHandlerMapping`

Defined in: packages/blue-boot/src/web-auto-configuration.ts:59

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

Defined in: packages/blue-boot/src/web-auto-configuration.ts:70

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

Defined in: packages/blue-boot/src/web-auto-configuration.ts:81

Provides the default Web Component view engine.
Can be overridden by registering a custom

#### Returns

`WebComponentViewEngine`

The default Web Component view engine.

#### Configuration

with a webComponentViewEngine entry.
