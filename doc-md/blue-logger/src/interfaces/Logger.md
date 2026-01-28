[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / Logger

# Interface: Logger

Defined in: packages/blue-logger/src/logger.ts:23

## Extends

- [`LevelComparator`](LevelComparator.md)

## Extended by

- [`ApacheLogger`](ApacheLogger.md)
- [`CLILogger`](CLILogger.md)
- [`NPMLogger`](NPMLogger.md)
- [`SyslogLogger`](SyslogLogger.md)

## Properties

### compare

> **compare**: [`comparison`](../../../blue-core/src/type-aliases/comparison.md)\<[`Level`](../classes/Level.md)\>

Defined in: packages/blue-core/src/comparable.ts:20

#### Inherited from

[`LevelComparator`](LevelComparator.md).[`compare`](LevelComparator.md#compare)

***

### threshold

> **threshold**: [`Level`](../classes/Level.md)

Defined in: packages/blue-logger/src/logger.ts:24

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
