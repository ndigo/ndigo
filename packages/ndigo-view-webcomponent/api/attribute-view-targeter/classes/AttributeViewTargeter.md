[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [attribute-view-targeter](../README.md) / AttributeViewTargeter

# Class: AttributeViewTargeter

Targets the element named by a route attribute.

A handler or interceptor sets the attribute; the targeter reads it. When
the attribute is absent or is not a non-empty string, the targeter declines.

## Example

```ts
route.attributes.viewTarget = '#site-footer';
```

## Extends

- [`SelectorViewTargeter`](../../selector-view-targeter/classes/SelectorViewTargeter.md)

## Constructors

### Constructor

> **new AttributeViewTargeter**(`options?`): `AttributeViewTargeter`

Creates an attribute-driven targeter.

#### Parameters

##### options?

[`AttributeViewTargeterOptions`](../interfaces/AttributeViewTargeterOptions.md) = `{}`

Attribute key, mount mode, event map, and document.

#### Returns

`AttributeViewTargeter`

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
