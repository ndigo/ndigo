[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/app-scripts](../README.md) / runInteractiveSpawn

# Function: runInteractiveSpawn()

> **runInteractiveSpawn**(`argv`, `options?`): `Promise`\<`number`\>

Spawns `argv` as an interactive subprocess (stdio inherit) and resolves
the child's exit code. Signal handlers are installed BEFORE the spawn
(AD75-H2: a signal arriving between spawn and registration would
otherwise lay the relay bare and orphan the child) and relay
SIGINT/SIGTERM into the child. An `'error'` event — which Node emits
asynchronously when the program cannot be spawned (ENOENT) and for which
`'exit'` is not guaranteed — becomes a deterministic exit 127 with a
readable stderr message instead of Node's unhandled `'error'` stack
(issue #144, verified live on `ndigo doctor`).

## Parameters

### argv

`string`[]

The command and its arguments (no shell is used).

### options?

`cwd` and `env` (omit `env` to inherit the invoking
  environment, matching a bare `spawn`).

#### cwd?

`string`

#### env?

`ProcessEnv`

## Returns

`Promise`\<`number`\>

The child's exit code (`128 + signal` when killed, `127` when
  the program could not be spawned).
