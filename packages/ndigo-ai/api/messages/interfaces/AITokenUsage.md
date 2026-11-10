[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [messages](../README.md) / AITokenUsage

# Interface: AITokenUsage

Token usage reported by a provider. Fields are optional because not every
provider reports every counter; the agent sums the values it receives.

## Properties

### inputTokens?

> `readonly` `optional` **inputTokens?**: `number`

Input (prompt) tokens.

***

### outputTokens?

> `readonly` `optional` **outputTokens?**: `number`

Output (completion) tokens.

***

### totalTokens?

> `readonly` `optional` **totalTokens?**: `number`

Total tokens, when the provider reports one directly.
