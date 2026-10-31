[**@blue/host v0.0.1**](../README.md)

***

[@blue/host](../README.md) / HostRegistrationOptions

# Interface: HostRegistrationOptions

Options for registering a feature with a [HostManager](../classes/HostManager.md).

Adds the routing half (`prefix`, optional `onRoute`) to the mount-manager
registration contract.

## Extends

- `FeatureRegistrationOptions`

## Properties

### createContext?

> `optional` **createContext?**: (`parent`) => `ApplicationContext`

Creates the feature context instead of using `parent.newChild`.

#### Parameters

##### parent

`ApplicationContext`

#### Returns

`ApplicationContext`

#### Inherited from

`FeatureRegistrationOptions.createContext`

***

### data?

> `optional` **data?**: `JSONObject`

Initial values for the feature context.

#### Inherited from

`FeatureRegistrationOptions.data`

***

### dependencies?

> `optional` **dependencies?**: `object`

Declare dependencies this feature requires from the shell.
Validated at mount time against the SharedDependencyRegistry.

#### optional?

> `optional` **optional?**: `Record`\<`string`, `string`\>

Optional dependencies — mount warns if missing.

#### requires?

> `optional` **requires?**: `Record`\<`string`, `string`\>

Required dependencies — mount fails if missing or version-mismatched.

#### Inherited from

`FeatureRegistrationOptions.dependencies`

***

### gatewayOptions?

> `optional` **gatewayOptions?**: `ContextEventGatewayOptions`

Relay gateway validation options.

#### Inherited from

`FeatureRegistrationOptions.gatewayOptions`

***

### loader?

> `optional` **loader?**: () => `Promise`\<`LazyFeatureModule`\>

Async loader for dynamically code-split feature modules.
Resolves to a module exporting `createContext(parent)`.
Use with `mountLazy` — mount must be awaited.

#### Returns

`Promise`\<`LazyFeatureModule`\>

#### Example

```ts
manager.registerFeature({
  name: 'checkout',
  loader: () => import('./checkout/checkout-module'),
});
await manager.mountLazy('checkout');
```

#### Inherited from

`FeatureRegistrationOptions.loader`

***

### name

> **name**: `string`

The feature context name.

#### Inherited from

`FeatureRegistrationOptions.name`

***

### onDeactivate?

> `optional` **onDeactivate?**: () => `void`

Optional callback invoked after the feature is unmounted on
deactivation.

#### Returns

`void`

***

### onRoute?

> `optional` **onRoute?**: (`route`) => `void`

Optional callback invoked with the feature-local route after
activation — e.g. `(route) => dispatcher.dispatch(route)`.

#### Parameters

##### route

[`Route`](#)

#### Returns

`void`

***

### prefix

> **prefix**: `string`

URL prefix partition that activates the feature (e.g. `/catalog`).

***

### relays?

> `optional` **relays?**: `ContextEventRelay`[]

Event relays to attach to the feature context.

#### Inherited from

`FeatureRegistrationOptions.relays`

***

### relayTarget?

> `optional` **relayTarget?**: `ApplicationContext`

Optional relay target context.

#### Inherited from

`FeatureRegistrationOptions.relayTarget`

***

### unmountPolicy?

> `optional` **unmountPolicy?**: `FeatureUnmountPolicy`

#### Inherited from

`FeatureRegistrationOptions.unmountPolicy`
