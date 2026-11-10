[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AIAgentOptions

# Interface: AIAgentOptions

Agent construction options.

## Properties

### maxSteps?

> `readonly` `optional` **maxSteps?**: `number`

Maximum model calls per run; defaults to `8`.

***

### model

> `readonly` **model**: [`AIModel`](../../model/interfaces/AIModel.md)

The provider-neutral model.

***

### rateLimit?

> `readonly` `optional` **rateLimit?**: [`AIRateLimitOptions`](AIRateLimitOptions.md)

Optional per-model rate limit.

***

### rollout?

> `readonly` `optional` **rollout?**: [`AIRolloutOptions`](AIRolloutOptions.md)

Optional model-rollout flag.

***

### tools?

> `readonly` `optional` **tools?**: [`AIToolSource`](../../tools/interfaces/AIToolSource.md)

The tool source; omit for a chat-only agent.
