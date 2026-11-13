[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [route-view-targeter](../README.md) / RouteViewTargeter

# Class: RouteViewTargeter

Targets the element configured for the current route path.

## Example

```ts
new RouteViewTargeter({ '/report/**': '#sidebar', '/': '#app' });
```

## Extends

- [`SelectorViewTargeter`](../../selector-view-targeter/classes/SelectorViewTargeter.md)

## Constructors

### Constructor

> **new RouteViewTargeter**(`routes`, `options?`): `RouteViewTargeter`

Creates a route-driven targeter.

#### Parameters

##### routes

[`RouteSelectorMap`](../type-aliases/RouteSelectorMap.md)

Route pattern → selector entries.

##### options?

[`RouteViewTargeterOptions`](../interfaces/RouteViewTargeterOptions.md) = `{}`

Matcher override, mount mode, event map, and document.

#### Returns

`RouteViewTargeter`

#### Overrides

[`SelectorViewTargeter`](../../selector-view-targeter/classes/SelectorViewTargeter.md).[`constructor`](../../selector-view-targeter/classes/SelectorViewTargeter.md#constructor)

## Accessors

### destroyed

#### Get Signature

> **get** **destroyed**(): `boolean`

Whether the targeter has been destroyed.

##### Returns

`boolean`

#### Inherited from

[`SelectorViewTargeter`](../../selector-view-targeter/classes/SelectorViewTargeter.md).[`destroyed`](../../selector-view-targeter/classes/SelectorViewTargeter.md#destroyed)

## Methods

### destroy()

> **destroy**(): `void`

Destroys every cached target and stops resolving new ones.

#### Returns

`void`

#### Inherited from

[`SelectorViewTargeter`](../../selector-view-targeter/classes/SelectorViewTargeter.md).[`destroy`](../../selector-view-targeter/classes/SelectorViewTargeter.md#destroy)

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

#### Inherited from

[`SelectorViewTargeter`](../../selector-view-targeter/classes/SelectorViewTargeter.md).[`resolveViewTarget`](../../selector-view-targeter/classes/SelectorViewTargeter.md#resolveviewtarget)

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

#### Inherited from

[`SelectorViewTargeter`](../../selector-view-targeter/classes/SelectorViewTargeter.md).[`setApplicationContext`](../../selector-view-targeter/classes/SelectorViewTargeter.md#setapplicationcontext)
