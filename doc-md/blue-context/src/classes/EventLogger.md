[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / EventLogger

# Class: EventLogger

Defined in: packages/blue-context/src/event-logger.ts:28

## Extends

- [`LevelComparator`](../../../blue-logger/src/interfaces/LevelComparator.md)\<`this`\> & [`EventEmitter`](../interfaces/EventEmitter.md)\<`this`\> & [`NameAware`](../../../blue-factory/src/interfaces/NameAware.md) & [`Null`](../../../blue-core/src/classes/Null.md)\<`this`\>

## Constructors

### Constructor

> **new EventLogger**(): `EventLogger`

Defined in: packages/blue-context/src/event-logger.ts:51

#### Returns

`EventLogger`

#### Overrides

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).constructor`

## Properties

### name

> **name**: `string`

Defined in: packages/blue-context/src/event-logger.ts:29

#### Overrides

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).name`

---

### compare

> **compare**: [`comparison`](../../../blue-core/src/type-aliases/comparison.md)\<[`Level`](../../../blue-logger/src/classes/Level.md)\>

Defined in: packages/blue-core/src/comparable.ts:20

#### Inherited from

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).compare`

---

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).[$aware]`

## Accessors

### threshold

#### Get Signature

> **get** **threshold**(): [`Level`](../../../blue-logger/src/classes/Level.md)

Defined in: packages/blue-context/src/event-logger.ts:39

##### Returns

[`Level`](../../../blue-logger/src/classes/Level.md)

#### Set Signature

> **set** **threshold**(`newThreshold`): `void`

Defined in: packages/blue-context/src/event-logger.ts:43

##### Parameters

###### newThreshold

[`Level`](../../../blue-logger/src/classes/Level.md)

##### Returns

`void`

## Methods

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: packages/blue-context/src/event-emitter.ts:20

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

##### data

...`any`[]

#### Returns

`boolean`

#### Inherited from

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).emit`

---

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:21

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

#### Inherited from

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).eventTypes`

---

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: packages/blue-context/src/event-emitter.ts:22

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

#### Returns

`number`

#### Inherited from

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).listenerCount`

---

### listeners()

> **listeners**(`type`): `Function`[]

Defined in: packages/blue-context/src/event-emitter.ts:23

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

#### Returns

`Function`[]

#### Inherited from

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).listeners`

---

### on()

> **on**(`type`, `listener`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:24

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

##### listener

`Function`

#### Returns

`this`

#### Inherited from

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).on`

---

### off()

> **off**(`type`, `listener`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:25

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

##### listener

`Function`

#### Returns

`this`

#### Inherited from

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).off`

---

### enableOTel()

> **enableOTel**(`provider`, `options?`): `void`

Defined in: packages/blue-context/src/event-logger.ts:77

Enable OpenTelemetry integration

When enabled, log entries will be emitted both as events (existing behavior)
and as OpenTelemetry LogRecords (new behavior).

#### Parameters

##### provider

`any`

The BlueLoggerProvider to use for creating the OTel logger

##### options?

`any`

Optional conversion options for Entry to LogRecord conversion

#### Returns

`void`

#### Example

```typescript
import { BlueLoggerProvider } from '@blue/logger';

const provider = new BlueLoggerProvider();
const logger = new EventLogger();
logger.enableOTel(provider);

// Logs will now emit both events and OTel records
logger.log(Level.INFO, ['Application started']);
```

---

### disableOTel()

> **disableOTel**(): `void`

Defined in: packages/blue-context/src/event-logger.ts:97

Disable OpenTelemetry integration

After calling this, only event emission will occur (original behavior).

#### Returns

`void`

---

### isOTelEnabled()

> **isOTelEnabled**(): `boolean`

Defined in: packages/blue-context/src/event-logger.ts:109

Check if OpenTelemetry integration is enabled

#### Returns

`boolean`

True if OTel is enabled

---

### getOTelLogger()

> **getOTelLogger**(): `any`

Defined in: packages/blue-context/src/event-logger.ts:118

Get the OpenTelemetry logger (if enabled)

#### Returns

`any`

The OTel logger or undefined

---

### log()

> **log**(`level`, `message`): `void`

Defined in: packages/blue-context/src/event-logger.ts:122

#### Parameters

##### level

[`Level`](../../../blue-logger/src/classes/Level.md)

##### message

[`loggable`](../../../blue-logger/src/type-aliases/loggable.md)[]

#### Returns

`void`

---

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-factory/src/aware.ts:21

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

`AsLevelComparator(AsEventEmitter(AsNameAware(Null))).setName`
