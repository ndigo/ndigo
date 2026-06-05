[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / FeatureRegistrationOptions

# Interface: FeatureRegistrationOptions

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:24

Options used to register a feature for mounting.

## Extends

- [`FeatureContextOptions`](FeatureContextOptions.md)

## Properties

### createContext?

> `optional` **createContext?**: (`parent`) => [`ApplicationContext`](ApplicationContext.md)

Defined in: packages/blue-context/src/context-hierarchy.ts:48

Creates the feature context instead of using `parent.newChild`.

#### Parameters

##### parent

[`ApplicationContext`](ApplicationContext.md)

#### Returns

[`ApplicationContext`](ApplicationContext.md)

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`createContext`](FeatureContextOptions.md#createcontext)

***

### name

> **name**: `string`

Defined in: packages/blue-context/src/context-hierarchy.ts:52

The feature context name.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`name`](FeatureContextOptions.md#name)

***

### data?

> `optional` **data?**: `JSONObject`

Defined in: packages/blue-context/src/context-hierarchy.ts:56

Initial values for the feature context.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`data`](FeatureContextOptions.md#data)

***

### gatewayOptions?

> `optional` **gatewayOptions?**: [`ContextEventGatewayOptions`](ContextEventGatewayOptions.md)

Defined in: packages/blue-context/src/context-hierarchy.ts:60

Relay gateway validation options.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`gatewayOptions`](FeatureContextOptions.md#gatewayoptions)

***

### relayTarget?

> `optional` **relayTarget?**: [`ApplicationContext`](ApplicationContext.md)

Defined in: packages/blue-context/src/context-hierarchy.ts:64

Optional relay target context.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`relayTarget`](FeatureContextOptions.md#relaytarget)

***

### relays?

> `optional` **relays?**: [`ContextEventRelay`](ContextEventRelay.md)[]

Defined in: packages/blue-context/src/context-hierarchy.ts:68

Event relays to attach to the feature context.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`relays`](FeatureContextOptions.md#relays)

***

### unmountPolicy?

> `optional` **unmountPolicy?**: [`FeatureUnmountPolicy`](../type-aliases/FeatureUnmountPolicy.md)

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:25
