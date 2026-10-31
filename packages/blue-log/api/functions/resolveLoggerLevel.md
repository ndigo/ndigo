[**@blue/log v0.0.1**](../README.md)

***

[@blue/log](../README.md) / resolveLoggerLevel

# Function: resolveLoggerLevel()

> **resolveLoggerLevel**(`levelName`): `SeverityNumber` \| `undefined`

Resolves a level name to its threshold severity, strictly.

Unlike [levelToSeverityNumber](levelToSeverityNumber.md) (whose unknown-name fallback silently
downgrades to INFO), an unknown name resolves to `undefined` — the
`/loggers` endpoint rejects it instead of applying a wrong threshold.

## Parameters

### levelName

`string`

The level name (case-insensitive).

## Returns

`SeverityNumber` \| `undefined`

The threshold severity, or `undefined` when unknown.
