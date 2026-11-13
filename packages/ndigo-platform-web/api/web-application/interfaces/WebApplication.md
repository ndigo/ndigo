[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [web-application](../README.md) / WebApplication

# Interface: WebApplication

A booted browser application: the refreshed context, the wired runtime, and
a programmatic teardown.

## Properties

### context

> `readonly` **context**: `ConfigurableApplicationContext`

The refreshed context — every entry stays reachable.

***

### dispatcher

> `readonly` **dispatcher**: [`BrowserDispatcher`](../../browser-dispatcher/classes/BrowserDispatcher.md)

The started browser dispatcher (strategies initialized).

***

### router

> `readonly` **router**: [`HashRouter`](../../hash-router/classes/HashRouter.md)

The hash router driving navigation.

***

### viewTarget

> `readonly` **viewTarget**: `DOMElementViewTarget`

The DOM view target routes render into.

***

### viewTargeters

> `readonly` **viewTargeters**: readonly `ViewTargeter`[]

The installed view-targeter chain (configured plus preset).

## Methods

### destroy()

> **destroy**(): `void`

Destroys the router, the view target, and the context. Idempotent.

#### Returns

`void`
