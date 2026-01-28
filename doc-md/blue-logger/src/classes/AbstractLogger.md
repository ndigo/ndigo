[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / AbstractLogger

# Abstract Class: AbstractLogger

Defined in: packages/blue-logger/src/logger.ts:30

## Extends

- [`LevelComparator`](../interfaces/LevelComparator.md)\<`this`\> & [`Null`](../../../blue-core/src/classes/Null.md)\<`this`\>

## Extended by

- [`SimpleLogger`](SimpleLogger.md)
- [`OTelLogger`](OTelLogger.md)

## Implements

- [`Logger`](../interfaces/Logger.md)

## Constructors

### Constructor

> **new AbstractLogger**(`name`): `AbstractLogger`

Defined in: packages/blue-logger/src/logger.ts:38

#### Parameters

##### name

`string` = `null`

#### Returns

`AbstractLogger`

#### Overrides

`AsLevelComparator(Null).constructor`

## Properties

### compare

> **compare**: [`comparison`](../../../blue-core/src/type-aliases/comparison.md)\<[`Level`](Level.md)\>

Defined in: packages/blue-core/src/comparable.ts:20

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`compare`](../interfaces/Logger.md#compare)

#### Inherited from

`AsLevelComparator(Null).compare`

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-logger/src/logger.ts:31

***

### threshold

> **threshold**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/logger.ts:32

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`threshold`](../interfaces/Logger.md#threshold)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-logger/src/logger.ts:34

##### Returns

`string`

## Methods

### log()

> **log**(`level`, `message`): `void`

Defined in: packages/blue-logger/src/logger.ts:49

#### Parameters

##### level

[`Level`](Level.md)

##### message

[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`log`](../interfaces/Logger.md#log)

***

### \_logEntry()

> `abstract` `protected` **\_logEntry**(`entry`): `void`

Defined in: packages/blue-logger/src/logger.ts:57

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`void`
