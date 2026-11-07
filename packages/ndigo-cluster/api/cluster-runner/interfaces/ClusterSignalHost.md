[**@ndigo/cluster v0.0.1**](../../README.md)

***

[@ndigo/cluster](../../README.md) / [cluster-runner](../README.md) / ClusterSignalHost

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

The signal to listen for.

##### handler

() => `void`

The handler to invoke when the signal arrives.

#### Returns

`void`

***

### removeHandler()

> **removeHandler**(`signal`, `handler`): `void`

Removes a previously registered handler.

#### Parameters

##### signal

`Signals`

The signal the handler was registered for.

##### handler

() => `void`

The handler to remove.

#### Returns

`void`
