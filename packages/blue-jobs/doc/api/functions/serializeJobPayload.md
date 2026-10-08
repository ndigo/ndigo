[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / serializeJobPayload

# Function: serializeJobPayload()

> **serializeJobPayload**(`payload`): `string`

Serializes a job payload to the stored JSON text.

Fails loud on values JSON cannot carry faithfully: functions, symbols,
bigints (native `JSON.stringify` would drop them silently), and `undefined`
**members** — those vanish without a trace under `stringify`, so a producer
would lose fields with no error (AD-72 D-2). A payload that IS `undefined`
at the top level is normalized to `null` (the documented explicit-absence
carrier), and circular structures throw natively.

## Parameters

### payload

`unknown`

The payload to serialize.

## Returns

`string`

The JSON text a driver stores.
