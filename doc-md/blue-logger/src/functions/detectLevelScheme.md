[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / detectLevelScheme

# Function: detectLevelScheme()

> **detectLevelScheme**(`level`): `"apache"` \| `"npm"` \| `"cli"` \| `"syslog"` \| `"unknown"`

Defined in: packages/blue-logger/src/otel/level-mapping.ts:165

Detect which level scheme a Level belongs to based on its value

## Parameters

### level

[`Level`](../classes/Level.md)

The Level to identify

## Returns

`"apache"` \| `"npm"` \| `"cli"` \| `"syslog"` \| `"unknown"`

The scheme name or 'unknown'
