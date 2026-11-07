[**@ndigo/cluster v0.0.1**](../../README.md)

***

[@ndigo/cluster](../../README.md) / [cluster-runner](../README.md) / ClusterChild

# Interface: ClusterChild

A spawned child as the runner sees it. The default spawner wraps
`node:child_process`; tests inject a scripted handle.

## Properties

### pid

> `readonly` **pid**: `number`

The operating-system process id.

## Methods

### kill()

> **kill**(): `void`

Force-kills the child (`SIGKILL`).

#### Returns

`void`

***

### signal()

> **signal**(`signal`): `void`

Sends a signal (e.g. `SIGTERM`) to the child.

#### Parameters

##### signal

`Signals`

The signal to send.

#### Returns

`void`

***

### waitForExit()

> **waitForExit**(): `Promise`\<`number`\>

Resolves with the child's exit code once the process terminates.

#### Returns

`Promise`\<`number`\>
