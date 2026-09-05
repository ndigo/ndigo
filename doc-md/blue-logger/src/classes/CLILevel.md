[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / CLILevel

# Class: CLILevel

Defined in: packages/blue-logger/src/cli-logging.ts:14

## Extends

- [`Level`](Level.md)

## Constructors

### Constructor

> **new CLILevel**(`name`, `value`): `CLILevel`

Defined in: packages/blue-logger/src/level.ts:42

#### Parameters

##### name

`string`

##### value

`number`

#### Returns

`CLILevel`

#### Inherited from

[`Level`](Level.md).[`constructor`](Level.md#constructor)

## Properties

### ERROR

> `static` **ERROR**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:15

---

### WARN

> `static` **WARN**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:16

---

### HELP

> `static` **HELP**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:17

---

### DATA

> `static` **DATA**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:18

---

### INFO

> `static` **INFO**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:19

---

### DEBUG

> `static` **DEBUG**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:20

---

### PROMPT

> `static` **PROMPT**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:21

---

### VERBOSE

> `static` **VERBOSE**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:22

---

### INPUT

> `static` **INPUT**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:23

---

### SILLY

> `static` **SILLY**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:24

---

### OFF

> `static` **OFF**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/level.ts:22

#### Inherited from

[`Level`](Level.md).[`OFF`](Level.md#off)

---

### ALL

> `static` **ALL**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/level.ts:26

#### Inherited from

[`Level`](Level.md).[`ALL`](Level.md#all)

---

### name

> `readonly` **name**: `string`

Defined in: packages/blue-logger/src/level.ts:31

#### Inherited from

[`Level`](Level.md).[`name`](Level.md#name)

---

### value

> `readonly` **value**: `number`

Defined in: packages/blue-logger/src/level.ts:36

#### Inherited from

[`Level`](Level.md).[`value`](Level.md#value)

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

### toSeverity()

> `static` **toSeverity**(`level`): `SeverityNumber`

Defined in: packages/blue-logger/src/cli-logging.ts:32

Convert a CLI level to OpenTelemetry SeverityNumber

#### Parameters

##### level

[`Level`](Level.md)

The CLI level to convert

#### Returns

`SeverityNumber`

The corresponding OpenTelemetry SeverityNumber

---

### fromSeverity()

> `static` **fromSeverity**(`severityNumber`): [`Level`](Level.md)

Defined in: packages/blue-logger/src/cli-logging.ts:42

Convert an OpenTelemetry SeverityNumber to a CLI level

#### Parameters

##### severityNumber

`SeverityNumber`

The severity number to convert

#### Returns

[`Level`](Level.md)

The corresponding CLI level

---

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

---

### toJSON()

> **toJSON**(): `string`

Defined in: packages/blue-logger/src/level.ts:79

#### Returns

`string`

#### Inherited from

[`Level`](Level.md).[`toJSON`](Level.md#tojson)

---

### toString()

> **toString**(): `string`

Defined in: packages/blue-logger/src/level.ts:86

#### Returns

`string`

The string representation of the level

#### Inherited from

[`Level`](Level.md).[`toString`](Level.md#tostring)
