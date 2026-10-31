[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / FeatureContextOptions

# Interface: FeatureContextOptions

Options for creating a feature context and its optional relay gateway.

## Extended by

- [`FeatureRegistrationOptions`](FeatureRegistrationOptions.md)

## Properties

### createContext?

> `optional` **createContext?**: (`parent`) => [`ApplicationContext`](ApplicationContext.md)

Creates the feature context instead of using `parent.newChild`.

#### Parameters

##### parent

[`ApplicationContext`](ApplicationContext.md)

#### Returns

[`ApplicationContext`](ApplicationContext.md)

***

### data?

> `optional` **data?**: `JSONObject`

Initial values for the feature context.

***

### gatewayOptions?

> `optional` **gatewayOptions?**: [`ContextEventGatewayOptions`](ContextEventGatewayOptions.md)

Relay gateway validation options.

***

### name

> **name**: `string`

The feature context name.

***

### relays?

> `optional` **relays?**: [`ContextEventRelay`](ContextEventRelay.md)[]

Event relays to attach to the feature context.

***

### relayTarget?

> `optional` **relayTarget?**: [`ApplicationContext`](ApplicationContext.md)

Optional relay target context.
