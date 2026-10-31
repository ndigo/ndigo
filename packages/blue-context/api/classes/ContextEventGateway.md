[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ContextEventGateway

# Class: ContextEventGateway

Relays selected events from one application context to another.

## Constructors

### Constructor

> **new ContextEventGateway**(`source`, `target`, `relays?`, `options?`): `ContextEventGateway`

Creates a gateway that relays selected events between contexts.

#### Parameters

##### source

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The source context.

##### target

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The target context.

##### relays?

[`ContextEventRelay`](../interfaces/ContextEventRelay.md)[] = `[]`

Initial relay mappings.

##### options?

[`ContextEventGatewayOptions`](../interfaces/ContextEventGatewayOptions.md) = `{}`

Gateway validation and diagnostic options.

#### Returns

`ContextEventGateway`

## Properties

### destroyed

> **destroyed**: `boolean`

***

### relays

> `readonly` **relays**: [`ContextEventRelay`](../interfaces/ContextEventRelay.md)[]

***

### source

> `readonly` **source**: [`ApplicationContext`](../interfaces/ApplicationContext.md)

***

### target

> `readonly` **target**: [`ApplicationContext`](../interfaces/ApplicationContext.md)

## Accessors

### activeRelayCount

#### Get Signature

> **get** **activeRelayCount**(): `number`

The number of accepted relays.

##### Returns

`number`

***

### blockedRelayCount

#### Get Signature

> **get** **blockedRelayCount**(): `number`

The number of rejected relays.

##### Returns

`number`

***

### blockedRelays

#### Get Signature

> **get** **blockedRelays**(): readonly [`RelayValidationResult`](../interfaces/RelayValidationResult.md)[]

The relays rejected by validation.

##### Returns

readonly [`RelayValidationResult`](../interfaces/RelayValidationResult.md)[]

***

### relayedEventCount

#### Get Signature

> **get** **relayedEventCount**(): `number`

The number of events forwarded by this gateway.

##### Returns

`number`

## Methods

### addRelay()

> **addRelay**(`from`, `to?`): `this`

Registers a relay mapping.

#### Parameters

##### from

[`EventType`](../type-aliases/EventType.md)

The source event type.

##### to?

[`EventType`](../type-aliases/EventType.md) = `from`

The target event type.

#### Returns

`this`

This gateway.

***

### connect()

> **connect**(): `this`

Connects all registered relays to the source context.

#### Returns

`this`

This gateway.

***

### destroy()

> **destroy**(): `void`

Disconnects all relay listeners and marks the gateway destroyed.

#### Returns

`void`

***

### hasBlockedRelays()

> **hasBlockedRelays**(): `boolean`

Returns whether any relays have been rejected.

#### Returns

`boolean`

`true` when blocked relays exist.
