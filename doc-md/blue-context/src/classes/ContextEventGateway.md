[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ContextEventGateway

# Class: ContextEventGateway

Defined in: packages/blue-context/src/event-gateway.ts:228

Relays selected events from one application context to another.

## Constructors

### Constructor

> **new ContextEventGateway**(`source`, `target`, `relays?`, `options?`): `ContextEventGateway`

Defined in: packages/blue-context/src/event-gateway.ts:278

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

Defined in: packages/blue-context/src/event-gateway.ts:237

***

### relays

> `readonly` **relays**: [`ContextEventRelay`](../interfaces/ContextEventRelay.md)[]

Defined in: packages/blue-context/src/event-gateway.ts:238

***

### source

> `readonly` **source**: [`ApplicationContext`](../interfaces/ApplicationContext.md)

Defined in: packages/blue-context/src/event-gateway.ts:239

***

### target

> `readonly` **target**: [`ApplicationContext`](../interfaces/ApplicationContext.md)

Defined in: packages/blue-context/src/event-gateway.ts:240

## Accessors

### blockedRelays

#### Get Signature

> **get** **blockedRelays**(): readonly [`RelayValidationResult`](../interfaces/RelayValidationResult.md)[]

Defined in: packages/blue-context/src/event-gateway.ts:245

The relays rejected by validation.

##### Returns

readonly [`RelayValidationResult`](../interfaces/RelayValidationResult.md)[]

***

### activeRelayCount

#### Get Signature

> **get** **activeRelayCount**(): `number`

Defined in: packages/blue-context/src/event-gateway.ts:252

The number of accepted relays.

##### Returns

`number`

***

### blockedRelayCount

#### Get Signature

> **get** **blockedRelayCount**(): `number`

Defined in: packages/blue-context/src/event-gateway.ts:259

The number of rejected relays.

##### Returns

`number`

***

### relayedEventCount

#### Get Signature

> **get** **relayedEventCount**(): `number`

Defined in: packages/blue-context/src/event-gateway.ts:266

The number of events forwarded by this gateway.

##### Returns

`number`

## Methods

### addRelay()

> **addRelay**(`from`, `to?`): `this`

Defined in: packages/blue-context/src/event-gateway.ts:310

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

### hasBlockedRelays()

> **hasBlockedRelays**(): `boolean`

Defined in: packages/blue-context/src/event-gateway.ts:342

Returns whether any relays have been rejected.

#### Returns

`boolean`

`true` when blocked relays exist.

***

### connect()

> **connect**(): `this`

Defined in: packages/blue-context/src/event-gateway.ts:351

Connects all registered relays to the source context.

#### Returns

`this`

This gateway.

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-context/src/event-gateway.ts:369

Disconnects all relay listeners and marks the gateway destroyed.

#### Returns

`void`
