[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [context-hierarchy](../README.md) / FeatureContextOptions

# Interface: FeatureContextOptions

Options for creating a feature context and its optional relay gateway.

## Extended by

- [`FeatureRegistrationOptions`](../../feature-context-mount-manager/interfaces/FeatureRegistrationOptions.md)

## Properties

### createContext?

> `optional` **createContext?**: (`parent`) => [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

Creates the feature context instead of using `parent.newChild`.

#### Parameters

##### parent

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

#### Returns

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

***

### data?

> `optional` **data?**: `JSONObject`

Initial values for the feature context.

***

### gatewayOptions?

> `optional` **gatewayOptions?**: [`ContextEventGatewayOptions`](../../event-gateway/interfaces/ContextEventGatewayOptions.md)

Relay gateway validation options.

***

### name

> **name**: `string`

The feature context name.

***

### relays?

> `optional` **relays?**: [`ContextEventRelay`](../../event-gateway/interfaces/ContextEventRelay.md)[]

Event relays to attach to the feature context.

***

### relayTarget?

> `optional` **relayTarget?**: [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

Optional relay target context.
