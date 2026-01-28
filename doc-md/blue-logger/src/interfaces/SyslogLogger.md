[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / SyslogLogger

# Interface: SyslogLogger

Defined in: packages/blue-logger/src/syslog-logging.ts:108

## Extends

- [`Logger`](Logger.md)

## Properties

### compare

> **compare**: [`comparison`](../../../blue-core/src/type-aliases/comparison.md)\<[`Level`](../classes/Level.md)\>

Defined in: packages/blue-core/src/comparable.ts:20

#### Inherited from

[`Logger`](Logger.md).[`compare`](Logger.md#compare)

***

### threshold

> **threshold**: [`Level`](../classes/Level.md)

Defined in: packages/blue-logger/src/logger.ts:24

#### Inherited from

[`Logger`](Logger.md).[`threshold`](Logger.md#threshold)

## Methods

### log()

> **log**(`level`, `message`): `void`

Defined in: packages/blue-logger/src/logger.ts:25

#### Parameters

##### level

[`Level`](../classes/Level.md)

##### message

[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

#### Inherited from

[`Logger`](Logger.md).[`log`](Logger.md#log)

***

### emerg()

> **emerg**(...`message`): `void`

Defined in: packages/blue-logger/src/syslog-logging.ts:109

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### alert()

> **alert**(...`message`): `void`

Defined in: packages/blue-logger/src/syslog-logging.ts:110

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### crit()

> **crit**(...`message`): `void`

Defined in: packages/blue-logger/src/syslog-logging.ts:111

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### error()

> **error**(...`message`): `void`

Defined in: packages/blue-logger/src/syslog-logging.ts:112

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### warning()

> **warning**(...`message`): `void`

Defined in: packages/blue-logger/src/syslog-logging.ts:113

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### notice()

> **notice**(...`message`): `void`

Defined in: packages/blue-logger/src/syslog-logging.ts:114

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### info()

> **info**(...`message`): `void`

Defined in: packages/blue-logger/src/syslog-logging.ts:115

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### debug()

> **debug**(...`message`): `void`

Defined in: packages/blue-logger/src/syslog-logging.ts:116

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`
