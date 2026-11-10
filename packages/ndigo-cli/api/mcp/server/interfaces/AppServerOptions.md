[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/server](../README.md) / AppServerOptions

# Interface: AppServerOptions

Options for [createAppServer](../functions/createAppServer.md).

## Properties

### dir

> `readonly` **dir**: `string`

The application directory (absolute).

***

### live?

> `readonly` `optional` **live?**: `boolean`

Delegate to the application's `scripts.mcp` instead of the static set.

***

### readOnly?

> `readonly` `optional` **readOnly?**: `boolean`

Expose read-only tools only; omit `run_target` and `record_rule`.
