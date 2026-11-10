[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AiAgentOptions

# Interface: AiAgentOptions

Agent construction options.

## Properties

### maxSteps?

> `readonly` `optional` **maxSteps?**: `number`

Maximum model calls per run; defaults to `8`.

***

### model

> `readonly` **model**: [`AiModel`](../../model/interfaces/AiModel.md)

The provider-neutral model.

***

### rateLimit?

> `readonly` `optional` **rateLimit?**: [`AiRateLimitOptions`](AiRateLimitOptions.md)

Optional per-model rate limit.

***

### rollout?

> `readonly` `optional` **rollout?**: [`AiRolloutOptions`](AiRolloutOptions.md)

Optional model-rollout flag.

***

### tools?

> `readonly` `optional` **tools?**: [`AiToolSource`](../../tools/interfaces/AiToolSource.md)

The tool source; omit for a chat-only agent.
