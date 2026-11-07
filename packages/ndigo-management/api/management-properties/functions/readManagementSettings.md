[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [management-properties](../README.md) / readManagementSettings

# Function: readManagementSettings()

> **readManagementSettings**(`environment`): `object`

Reads the `management` config-file section from the environment's
property sources (AD-76 D-5).

Sources are visited lowest-precedence first and their `management`
subtrees deep-merged, so the result matches exactly what the property
index would resolve per dotted key — the same JSON-file convention
`@configurationProperties` classes bind. Values are raw source text:
no placeholder resolution, no secret decryption.

The defaults kick in per missing section (`endpoints.exposure.include`
defaults to `["health","metrics"]`), so `{}` is a valid configuration.

## Parameters

### environment

`Environment` \| `undefined`

The application environment.

## Returns

`object`

The validated management settings.

### endpoints

> **endpoints**: `object`

#### endpoints.env

> **env**: `object`

#### endpoints.env.showValues

> **showValues**: `boolean`

#### endpoints.exposure

> **exposure**: `object`

#### endpoints.exposure.exclude

> **exclude**: `string`[]

#### endpoints.exposure.include

> **include**: `string`[]

### health

> **health**: `object`

#### health.groups

> **groups**: `Record`\<`string`, \{ `include`: `string`[]; \}\>

## Example

```ts
const settings = readManagementSettings(context.environment);
settings.endpoints.exposure.include; // ['health', 'metrics']
```
