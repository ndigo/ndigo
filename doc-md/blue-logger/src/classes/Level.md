[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / Level

# Class: Level

Defined in: packages/blue-logger/src/level.ts:19

## Extended by

- [`ApacheLevel`](ApacheLevel.md)
- [`CLILevel`](CLILevel.md)
- [`NPMLevel`](NPMLevel.md)
- [`SyslogLevel`](SyslogLevel.md)

## Implements

- [`Comparable`](../../../blue-core/src/interfaces/Comparable.md)\<`Level`\>
- [`Serializable`](../../../blue-core/src/interfaces/Serializable.md)

## Constructors

### Constructor

> **new Level**(`name`, `value`): `Level`

Defined in: packages/blue-logger/src/level.ts:42

#### Parameters

##### name

`string`

##### value

`number`

#### Returns

`Level`

## Properties

### OFF

> `static` **OFF**: `Level`

Defined in: packages/blue-logger/src/level.ts:22

***

### ALL

> `static` **ALL**: `Level`

Defined in: packages/blue-logger/src/level.ts:26

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-logger/src/level.ts:31

***

### value

> `readonly` **value**: `number`

Defined in: packages/blue-logger/src/level.ts:36

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-logger/src/level.ts:38

##### Returns

`string`

## Methods

### compareTo()

> **compareTo**(`value`): `number`

Defined in: packages/blue-logger/src/level.ts:62

#### Parameters

##### value

`Level`

#### Returns

`number`

#### Implementation of

[`Comparable`](../../../blue-core/src/interfaces/Comparable.md).[`compareTo`](../../../blue-core/src/interfaces/Comparable.md#compareto)

***

### toJSON()

> **toJSON**(): `string`

Defined in: packages/blue-logger/src/level.ts:79

#### Returns

`string`

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-logger/src/level.ts:86

#### Returns

`string`

The string representation of the level

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)
