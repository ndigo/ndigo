[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/install](../README.md) / applyInstall

# Function: applyInstall()

> **applyInstall**(`plan`, `options`): `Promise`\<[`InstallResult`](../interfaces/InstallResult.md)\>

Applies an install plan: writes files (refusing silent overwrites), updates
the lockfile, and installs dependencies unless disabled or dry-run.

## Parameters

### plan

[`InstallPlan`](../interfaces/InstallPlan.md)

Resolved install plan.

### options

[`InstallOptions`](../interfaces/InstallOptions.md)

Application directory and behavior flags.

## Returns

`Promise`\<[`InstallResult`](../interfaces/InstallResult.md)\>

The written/unchanged files and dependencies.
