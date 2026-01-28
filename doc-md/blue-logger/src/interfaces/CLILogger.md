[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / CLILogger

# Interface: CLILogger

Defined in: packages/blue-logger/src/cli-logging.ts:112

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

### error()

> **error**(...`message`): `void`

Defined in: packages/blue-logger/src/cli-logging.ts:113

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### warn()

> **warn**(...`message`): `void`

Defined in: packages/blue-logger/src/cli-logging.ts:114

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### help()

> **help**(...`message`): `void`

Defined in: packages/blue-logger/src/cli-logging.ts:115

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### data()

> **data**(...`message`): `void`

Defined in: packages/blue-logger/src/cli-logging.ts:116

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### info()

> **info**(...`message`): `void`

Defined in: packages/blue-logger/src/cli-logging.ts:117

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### debug()

> **debug**(...`message`): `void`

Defined in: packages/blue-logger/src/cli-logging.ts:118

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### prompt()

> **prompt**(...`message`): `void`

Defined in: packages/blue-logger/src/cli-logging.ts:119

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### verbose()

> **verbose**(...`message`): `void`

Defined in: packages/blue-logger/src/cli-logging.ts:120

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### input()

> **input**(...`message`): `void`

Defined in: packages/blue-logger/src/cli-logging.ts:121

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### silly()

> **silly**(...`message`): `void`

Defined in: packages/blue-logger/src/cli-logging.ts:122

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

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
