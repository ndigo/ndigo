[**@blue/boot v0.0.1**](../README.md)

***

[@blue/boot](../README.md) / resolveConfigurationProperties

# Function: resolveConfigurationProperties()

> **resolveConfigurationProperties**\<`T`\>(`ctor`, `context`): [`ConfigurationPropertiesResult`](../interfaces/ConfigurationPropertiesResult.md)\<`T`\>

Resolves a `@configurationProperties` class against an application context,
binding each `@property` field to its converted value from the environment.

Fail-loud (AD-15 D4): a missing required field (no `@defaultValue`) or a
conversion failure throws, naming class.field + attempted value + target
type. Nested fields bind recursively via `@nested`.

## Type Parameters

### T

`T`

## Parameters

### ctor

() => `T`

The configuration properties class constructor.

### context

`ApplicationContext`

The application context providing the environment.

## Returns

[`ConfigurationPropertiesResult`](../interfaces/ConfigurationPropertiesResult.md)\<`T`\>

The resolved instance and binding metadata.
