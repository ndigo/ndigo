[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/app-scripts](../README.md) / runAppSupervised

# Function: runAppSupervised()

> **runAppSupervised**(`dir`, `scriptKey`, `hint`, `options?`): `Promise`\<`ClusterRunResult`\>

Runs a long-lived app script under the AD-74 supervisor.

## Parameters

### dir

`string`

The app directory (absolute).

### scriptKey

`string`

The `scripts.<key>` to run.

### hint

`string`

The missing-script hint (see [appScriptCommand](appScriptCommand.md)).

### options?

`port` (base for `PORT`-derivation), `cluster` slots.

#### cluster?

`number`

#### port?

`number`

## Returns

`Promise`\<`ClusterRunResult`\>

The cluster outcome (children signal-relayed, exit-code observed).
