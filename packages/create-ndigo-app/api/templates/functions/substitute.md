[**create-ndigo-app v0.0.1**](../../README.md)

***

[create-ndigo-app](../../README.md) / [templates](../README.md) / substitute

# Function: substitute()

> **substitute**(`content`, `vars`): `string`

Replaces `{{key}}` placeholders; unknown keys are left untouched.

## Parameters

### content

`string`

The template content.

### vars

`Record`\<`string`, `string` \| `number`\>

The substitution map.

## Returns

`string`

The content with known placeholders replaced.
