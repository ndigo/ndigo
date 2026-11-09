[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/mcp-tools](../README.md) / getItem

# Function: getItem()

> **getItem**(`context`, `request`): `Promise`\<\{ `item`: \{ `author`: `string` \| `undefined`; `categories`: readonly `string`[] \| `undefined`; `dependencies`: readonly `string`[] \| `undefined`; `description`: `string` \| `undefined`; `docs`: `string` \| `undefined`; `files`: `object`[]; `name`: `string`; `registryDependencies`: readonly `string`[] \| `undefined`; `title`: `string` \| `undefined`; `type`: `string`; \}; `readme`: `string` \| `undefined`; `source`: `string`; \}\>

Returns one item's metadata, targets, dependencies, docs, and README.

## Parameters

### context

[`RegistryToolContext`](../interfaces/RegistryToolContext.md)

Registry context.

### request

Item name, optional README switch, and registry override.

#### includeReadme?

`boolean`

#### name

`string`

#### registry?

`string`

## Returns

`Promise`\<\{ `item`: \{ `author`: `string` \| `undefined`; `categories`: readonly `string`[] \| `undefined`; `dependencies`: readonly `string`[] \| `undefined`; `description`: `string` \| `undefined`; `docs`: `string` \| `undefined`; `files`: `object`[]; `name`: `string`; `registryDependencies`: readonly `string`[] \| `undefined`; `title`: `string` \| `undefined`; `type`: `string`; \}; `readme`: `string` \| `undefined`; `source`: `string`; \}\>

The item record and README body when available.
