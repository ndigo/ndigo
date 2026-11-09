[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/mcp-tools](../README.md) / installItems

# Function: installItems()

> **installItems**(`context`, `request`): `Promise`\<\{ `dependencies`: readonly `string`[]; `dir`: `string`; `dryRun`: `boolean`; `files`: `object`[]; `items`: readonly [`InstallPlanItem`](../../install/interfaces/InstallPlanItem.md)[]; `lockPath`: `string`; `source`: `string`; `unchanged`: readonly `string`[]; `written`: readonly `string`[]; \}\>

Plans or applies a registry install into an application.

## Parameters

### context

[`RegistryToolContext`](../interfaces/RegistryToolContext.md)

Registry context.

### request

[`InstallRequest`](../interfaces/InstallRequest.md)

Items, target directory, and install flags.

## Returns

`Promise`\<\{ `dependencies`: readonly `string`[]; `dir`: `string`; `dryRun`: `boolean`; `files`: `object`[]; `items`: readonly [`InstallPlanItem`](../../install/interfaces/InstallPlanItem.md)[]; `lockPath`: `string`; `source`: `string`; `unchanged`: readonly `string`[]; `written`: readonly `string`[]; \}\>

The plan and the installer result (a dry run by default).
