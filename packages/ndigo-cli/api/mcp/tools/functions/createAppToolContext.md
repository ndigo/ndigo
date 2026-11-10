[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/tools](../README.md) / createAppToolContext

# Function: createAppToolContext()

> **createAppToolContext**(`dir`): [`AppToolContext`](../interfaces/AppToolContext.md)

Creates the tool context for one server. A failed manifest build is not
cached, so a later call can succeed after the application is fixed.

## Parameters

### dir

`string`

The application directory (absolute).

## Returns

[`AppToolContext`](../interfaces/AppToolContext.md)

The context shared by every manifest-derived tool.
