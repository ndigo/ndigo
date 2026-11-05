[**@ndigo/cluster v0.0.1**](../../README.md)

***

[@ndigo/cluster](../../README.md) / [cluster-runner](../README.md) / runCluster

# Function: runCluster()

> **runCluster**(`options`): `Promise`\<[`ClusterRunResult`](../interfaces/ClusterRunResult.md)\>

Runs a cluster to completion and returns the outcome — the top-level
entry for applications that have nothing else after the cluster (the
GAP-6 CLI's `serve --cluster <n>` will invoke this).

## Parameters

### options

[`ClusterRunnerOptions`](../interfaces/ClusterRunnerOptions.md)

Cluster sizing, command, and tuning.

## Returns

`Promise`\<[`ClusterRunResult`](../interfaces/ClusterRunResult.md)\>

The cluster outcome.
