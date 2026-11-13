[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [selector-view-targeter](../README.md) / SelectorViewTargeter

# Class: SelectorViewTargeter

Resolves a selector to a cached DOM view target.

Targets are created once per `selector + mount` pair and reused, so event
bridging and rendered state survive across renders. Evicted targets are
destroyed (their listeners released) and `destroy()` clears the cache.

A selector that matches nothing, matches a disconnected element, or throws
declines (`null`) — assignment never breaks routing. Cached targets are
keyed by selector, so selectors should be stable per destination; a
selector derived from unbounded request data will churn the cache.

## Extended by

- [`AttributeViewTargeter`](../../attribute-view-targeter/classes/AttributeViewTargeter.md)
- [`NameViewTargeter`](../../name-view-targeter/classes/NameViewTargeter.md)
- [`RouteViewTargeter`](../../route-view-targeter/classes/RouteViewTargeter.md)

## Implements

- `ViewTargeter`
- `Destroyable`

## Constructors

### Constructor

> **new SelectorViewTargeter**(`select`, `options?`): `SelectorViewTargeter`

Creates a selector-driven targeter.

#### Parameters

##### select

[`ViewTargetSelector`](../type-aliases/ViewTargetSelector.md)

Resolves the selector for a render pass.

##### options?

[`SelectorViewTargeterOptions`](../interfaces/SelectorViewTargeterOptions.md) = `{}`

Mount mode, event map, and document override.

#### Returns

`SelectorViewTargeter`

## Accessors

### destroyed

#### Get Signature

> **get** **destroyed**(): `boolean`

Whether the targeter has been destroyed.

##### Returns

`boolean`

#### Implementation of

`Destroyable.destroyed`

## Methods

### destroy()

> **destroy**(): `void`

Destroys every cached target and stops resolving new ones.

#### Returns

`void`

#### Implementation of

`Destroyable.destroy`

***

### resolveViewTarget()

> **resolveViewTarget**(`context`): [`ViewTarget`](#) \| `null`

Resolves the target for a render pass.

#### Parameters

##### context

`ViewTargetingContext`

The render pass being targeted.

#### Returns

[`ViewTarget`](#) \| `null`

The cached (or newly created) target, or `null` to decline.

#### Implementation of

`ViewTargeter.resolveViewTarget`

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Stores the application context for targets that do not exist yet.

Targets are created lazily, so forwarding to current entries is not
enough — each target created later receives the stored context.

#### Parameters

##### applicationContext

`ApplicationContext`

The application event emitter.

#### Returns

`void`
