[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / serializeJobPayload

# Function: serializeJobPayload()

> **serializeJobPayload**(`payload`): `string`

Serializes a job payload to the stored JSON text.

Fails loud on values JSON cannot carry faithfully: functions, symbols, and
bigints (native `JSON.stringify` would drop them silently), and circular
structures (native `TypeError`). `undefined` payloads serialize to `null`.

## Parameters

### payload

`unknown`

The payload to serialize.

## Returns

`string`

The JSON text a driver stores.
