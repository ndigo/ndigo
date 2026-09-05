[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / SimpleLogger

# Class: SimpleLogger

Defined in: packages/blue-logger/src/loggers/simple-logger.ts:12

## Extends

- [`AbstractLogger`](AbstractLogger.md)

## Implements

- [`AppenderRegistry`](../interfaces/AppenderRegistry.md)\<[`Appender`](../interfaces/Appender.md)\>

## Constructors

### Constructor

> **new SimpleLogger**(`name`, `appenders`): `SimpleLogger`

Defined in: packages/blue-logger/src/loggers/simple-logger.ts:17

#### Parameters

##### name

`string`

##### appenders

[`Appender`](../interfaces/Appender.md)[] = `[]`

#### Returns

`SimpleLogger`

#### Overrides

[`AbstractLogger`](AbstractLogger.md).[`constructor`](AbstractLogger.md#constructor)

## Properties

### compare

> **compare**: [`comparison`](../../../blue-core/src/type-aliases/comparison.md)\<[`Level`](Level.md)\>

Defined in: packages/blue-core/src/comparable.ts:20

#### Inherited from

[`AbstractLogger`](AbstractLogger.md).[`compare`](AbstractLogger.md#compare)

---

### name

> `readonly` **name**: `string`

Defined in: packages/blue-logger/src/loggers/simple-logger.ts:13

#### Overrides

[`AbstractLogger`](AbstractLogger.md).[`name`](AbstractLogger.md#name)

---

### appenders

> `readonly` **appenders**: [`Appender`](../interfaces/Appender.md)[]

Defined in: packages/blue-logger/src/loggers/simple-logger.ts:14

#### Implementation of

[`AppenderRegistry`](../interfaces/AppenderRegistry.md).[`appenders`](../interfaces/AppenderRegistry.md#appenders)

---

### threshold

> **threshold**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/loggers/simple-logger.ts:15

#### Overrides

[`AbstractLogger`](AbstractLogger.md).[`threshold`](AbstractLogger.md#threshold)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-logger/src/logger.ts:34

##### Returns

`string`

#### Inherited from

[`AbstractLogger`](AbstractLogger.md).[`[toStringTag]`](AbstractLogger.md#tostringtag)

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

#### Inherited from

[`AbstractLogger`](AbstractLogger.md).[`log`](AbstractLogger.md#log)

---

### addAppender()

> **addAppender**(`appender`): `void`

Defined in: packages/blue-logger/src/loggers/simple-logger.ts:36

#### Parameters

##### appender

[`Appender`](../interfaces/Appender.md)

#### Returns

`void`

#### Implementation of

[`AppenderRegistry`](../interfaces/AppenderRegistry.md).[`addAppender`](../interfaces/AppenderRegistry.md#addappender)

---

### clearAppenders()

> **clearAppenders**(): `void`

Defined in: packages/blue-logger/src/loggers/simple-logger.ts:40

#### Returns

`void`

#### Implementation of

[`AppenderRegistry`](../interfaces/AppenderRegistry.md).[`clearAppenders`](../interfaces/AppenderRegistry.md#clearappenders)

---

### \_logEntry()

> `protected` **\_logEntry**(`entry`): `void`

Defined in: packages/blue-logger/src/loggers/simple-logger.ts:47

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`void`

#### Overrides

[`AbstractLogger`](AbstractLogger.md).[`_logEntry`](AbstractLogger.md#_logentry)

---

### removeAppender()

> **removeAppender**(`appender`): `void`

Defined in: packages/blue-logger/src/loggers/simple-logger.ts:55

#### Parameters

##### appender

[`Appender`](../interfaces/Appender.md)

#### Returns

`void`

#### Implementation of

[`AppenderRegistry`](../interfaces/AppenderRegistry.md).[`removeAppender`](../interfaces/AppenderRegistry.md#removeappender)
