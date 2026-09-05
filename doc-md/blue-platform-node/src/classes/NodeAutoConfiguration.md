[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / NodeAutoConfiguration

# Class: NodeAutoConfiguration

Defined in: [packages/blue-platform-node/src/node-auto-configuration.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-auto-configuration.ts#lines-26)

Auto-configuration for Node.js-based applications.
Provisions Node.js argument resolvers, a dispatcher, and an HTTP server.

Register this configuration class with your `ApplicationContext` alongside
[NodeEnvironment](NodeEnvironment.md) to enable full server-side request handling.

## Constructors

### Constructor

> **new NodeAutoConfiguration**(): `NodeAutoConfiguration`

#### Returns

`NodeAutoConfiguration`

## Methods

### argumentValueConverterRegistry()

> **argumentValueConverterRegistry**(): `Record`\<`string`, [`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md)\>

Defined in: [packages/blue-platform-node/src/node-auto-configuration.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-auto-configuration.ts#lines-33)

Exposes the shared argument-value converter registry.

#### Returns

`Record`\<`string`, [`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md)\>

The Node.js argument-value converter registry.

***

### argumentResolvers()

> **argumentResolvers**(): ([`NodeQueryValueMethodArgumentResolver`](NodeQueryValueMethodArgumentResolver.md) \| [`NodePathValueMethodArgumentResolver`](NodePathValueMethodArgumentResolver.md) \| [`NodeHeaderValueMethodArgumentResolver`](NodeHeaderValueMethodArgumentResolver.md) \| [`NodeBodyValueMethodArgumentResolver`](NodeBodyValueMethodArgumentResolver.md) \| [`NodeCookieValueMethodArgumentResolver`](NodeCookieValueMethodArgumentResolver.md) \| [`NodeSessionValueMethodArgumentResolver`](NodeSessionValueMethodArgumentResolver.md))[]

Defined in: [packages/blue-platform-node/src/node-auto-configuration.ts:43](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-auto-configuration.ts#lines-43)

Creates the Node.js argument resolvers used for request binding.

#### Returns

([`NodeQueryValueMethodArgumentResolver`](NodeQueryValueMethodArgumentResolver.md) \| [`NodePathValueMethodArgumentResolver`](NodePathValueMethodArgumentResolver.md) \| [`NodeHeaderValueMethodArgumentResolver`](NodeHeaderValueMethodArgumentResolver.md) \| [`NodeBodyValueMethodArgumentResolver`](NodeBodyValueMethodArgumentResolver.md) \| [`NodeCookieValueMethodArgumentResolver`](NodeCookieValueMethodArgumentResolver.md) \| [`NodeSessionValueMethodArgumentResolver`](NodeSessionValueMethodArgumentResolver.md))[]

The Node.js argument resolvers.

***

### handlerMapping()

> **handlerMapping**(): `RadixMetadataHandlerMapping`

Defined in: [packages/blue-platform-node/src/node-auto-configuration.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-auto-configuration.ts#lines-60)

Provides the default handler mapping for Node.js request dispatch.

#### Returns

`RadixMetadataHandlerMapping`

The default metadata-driven handler mapping.

***

### dispatcher()

> **dispatcher**(): [`NodeDispatcher`](NodeDispatcher.md)

Defined in: [packages/blue-platform-node/src/node-auto-configuration.ts:70](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-auto-configuration.ts#lines-70)

Creates the Node dispatcher used for server-side request dispatch and rendering.

#### Returns

[`NodeDispatcher`](NodeDispatcher.md)

The Node dispatcher.
