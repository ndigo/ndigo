[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / FeatureContextOptions

# Interface: FeatureContextOptions

Defined in: packages/blue-context/src/context-hierarchy.ts:44

Options for creating a feature context and its optional relay gateway.

## Extended by

- [`FeatureRegistrationOptions`](FeatureRegistrationOptions.md)

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

***

### name

> **name**: `string`

Defined in: packages/blue-context/src/context-hierarchy.ts:52

The feature context name.

***

### data?

> `optional` **data?**: `JSONObject`

Defined in: packages/blue-context/src/context-hierarchy.ts:56

Initial values for the feature context.

***

### gatewayOptions?

> `optional` **gatewayOptions?**: [`ContextEventGatewayOptions`](ContextEventGatewayOptions.md)

Defined in: packages/blue-context/src/context-hierarchy.ts:60

Relay gateway validation options.

***

### relayTarget?

> `optional` **relayTarget?**: [`ApplicationContext`](ApplicationContext.md)

Defined in: packages/blue-context/src/context-hierarchy.ts:64

Optional relay target context.

***

### relays?

> `optional` **relays?**: [`ContextEventRelay`](ContextEventRelay.md)[]

Defined in: packages/blue-context/src/context-hierarchy.ts:68

Event relays to attach to the feature context.
