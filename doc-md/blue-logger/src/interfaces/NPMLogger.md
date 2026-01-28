[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / NPMLogger

# Interface: NPMLogger

Defined in: packages/blue-logger/src/npm-logging.ts:101

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

### error()

> **error**(...`message`): `void`

Defined in: packages/blue-logger/src/npm-logging.ts:102

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### warn()

> **warn**(...`message`): `void`

Defined in: packages/blue-logger/src/npm-logging.ts:103

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### info()

> **info**(...`message`): `void`

Defined in: packages/blue-logger/src/npm-logging.ts:104

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### http()

> **http**(...`message`): `void`

Defined in: packages/blue-logger/src/npm-logging.ts:105

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### verbose()

> **verbose**(...`message`): `void`

Defined in: packages/blue-logger/src/npm-logging.ts:106

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### debug()

> **debug**(...`message`): `void`

Defined in: packages/blue-logger/src/npm-logging.ts:107

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

***

### silly()

> **silly**(...`message`): `void`

Defined in: packages/blue-logger/src/npm-logging.ts:108

#### Parameters

##### message

...[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`
