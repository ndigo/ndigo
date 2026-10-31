[**@blue/cluster v0.0.1**](../README.md)

***

[@blue/cluster](../README.md) / ClusterSignalHost

# Interface: ClusterSignalHost

The signal-delivery seam: where the runner registers its OS-signal
handlers. Injectable so a test can trigger the relay without signaling
the vitest worker. Defaults to `process`.

## Methods

### on()

> **on**(`signal`, `handler`): `void`

Registers a handler for the signal.

#### Parameters

##### signal

`Signals`

##### handler

() => `void`

#### Returns

`void`

***

### removeHandler()

> **removeHandler**(`signal`, `handler`): `void`

Removes a previously registered handler.

#### Parameters

##### signal

`Signals`

##### handler

() => `void`

#### Returns

`void`
