[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / NPMLevel

# Class: NPMLevel

Defined in: packages/blue-logger/src/npm-logging.ts:15

## Extends

- [`Level`](Level.md)

## Constructors

### Constructor

> **new NPMLevel**(`name`, `value`): `NPMLevel`

Defined in: packages/blue-logger/src/level.ts:42

#### Parameters

##### name

`string`

##### value

`number`

#### Returns

`NPMLevel`

#### Inherited from

[`Level`](Level.md).[`constructor`](Level.md#constructor)

## Properties

### OFF

> `static` **OFF**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/level.ts:22

#### Inherited from

[`Level`](Level.md).[`OFF`](Level.md#off)

***

### ALL

> `static` **ALL**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/level.ts:26

#### Inherited from

[`Level`](Level.md).[`ALL`](Level.md#all)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-logger/src/level.ts:31

#### Inherited from

[`Level`](Level.md).[`name`](Level.md#name)

***

### value

> `readonly` **value**: `number`

Defined in: packages/blue-logger/src/level.ts:36

#### Inherited from

[`Level`](Level.md).[`value`](Level.md#value)

***

### ERROR

> `static` **ERROR**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/npm-logging.ts:16

***

### WARN

> `static` **WARN**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/npm-logging.ts:17

***

### INFO

> `static` **INFO**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/npm-logging.ts:18

***

### HTTP

> `static` **HTTP**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/npm-logging.ts:19

***

### VERBOSE

> `static` **VERBOSE**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/npm-logging.ts:20

***

### DEBUG

> `static` **DEBUG**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/npm-logging.ts:21

***

### SILLY

> `static` **SILLY**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/npm-logging.ts:22

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-logger/src/level.ts:38

##### Returns

`string`

#### Inherited from

[`Level`](Level.md).[`[toStringTag]`](Level.md#tostringtag)

## Methods

### compareTo()

> **compareTo**(`value`): `number`

Defined in: packages/blue-logger/src/level.ts:62

#### Parameters

##### value

[`Level`](Level.md)

#### Returns

`number`

#### Inherited from

[`Level`](Level.md).[`compareTo`](Level.md#compareto)

***

### toJSON()

> **toJSON**(): `string`

Defined in: packages/blue-logger/src/level.ts:79

#### Returns

`string`

#### Inherited from

[`Level`](Level.md).[`toJSON`](Level.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-logger/src/level.ts:86

#### Returns

`string`

The string representation of the level

#### Inherited from

[`Level`](Level.md).[`toString`](Level.md#tostring)

***

### toSeverity()

> `static` **toSeverity**(`level`): `SeverityNumber`

Defined in: packages/blue-logger/src/npm-logging.ts:30

Convert an NPM level to OpenTelemetry SeverityNumber

#### Parameters

##### level

[`Level`](Level.md)

The NPM level to convert

#### Returns

`SeverityNumber`

The corresponding OpenTelemetry SeverityNumber

***

### fromSeverity()

> `static` **fromSeverity**(`severityNumber`): [`Level`](Level.md)

Defined in: packages/blue-logger/src/npm-logging.ts:40

Convert an OpenTelemetry SeverityNumber to an NPM level

#### Parameters

##### severityNumber

`SeverityNumber`

The severity number to convert

#### Returns

[`Level`](Level.md)

The corresponding NPM level
