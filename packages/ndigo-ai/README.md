# @ndigo/ai

> Provider-neutral agent contracts — messages, streaming events, structured
> output, and a bounded tool-calling loop over MCP tools.

`@ndigo/ai` owns the loop, not the provider. A model adapter performs one
model step; the agent executes the tool calls the model requests, feeds the
results back, and records one GenAI span per run. Because the tool source is
structural, `McpToolRegistry` from `@ndigo/mcp` is a tool source with no
adapter class.

## Installation

```bash
pnpm add @ndigo/ai
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { AIAgent } from '@ndigo/ai';
import { aiSdkModel } from '@ndigo/ai-sdk';
import { McpToolRegistry } from '@ndigo/mcp';

const tools = McpToolRegistry.from(dispatcher, { readOnly: true });
const agent = new AIAgent({ model: aiSdkModel(provider.chatModel('qwen3')), tools });

const result = await agent.run({
    messages: [{ role: 'user', content: 'What did Ada order?' }],
});
```

Streaming yields the same events framed for SSE:

```ts
import { toServerSentEvents } from '@ndigo/ai';
import { ServerSentEventView } from '@ndigo/platform-node';

return new ServerSentEventView(toServerSentEvents(agent.stream({ messages: [{ role: 'user', content: 'Hi' }] })));
```

## Usage

### Contracts

| Export               | Purpose                                                    |
| :------------------- | :--------------------------------------------------------- |
| `AIModel`            | One provider step plus structured output.                  |
| `AIMessage`          | System/user/assistant/tool message union.                  |
| `AIStepResult`       | Text, tool calls, finish reason, token usage for one step. |
| `AIToolSource`       | `listTools()` + `call()`; satisfied by `McpToolRegistry`.  |
| `AIAgent`            | Bounded multi-step loop, telemetry, limits, rollout gate.  |
| `toServerSentEvents` | Maps agent events to `{ event, data }` frames.             |

### Policies

- **Rate limit** — pass a `RateLimiter` and policy; the default key is
  `provider:model`, and exhaustion throws `AIRateLimitError` with
  `retryAfterMs`.
- **Rollout flag** — pass a `FlagEvaluator` and key; the flag is evaluated as
  a boolean with a `false` default, so a missing or broken flag fails closed.
- **Secrets** — provider keys reach the adapter through ordinary configuration
  (`ai.apiKey`), including `{cipher:…}` values; never put a key in a
  client-bound file.
- **Resilience** — wrap the controller method that calls the agent with
  `@circuitBreaker` / `@retry` from `@ndigo/resilience`; a provider outage then
  degrades through the existing interceptor chain.

### Telemetry

Each run opens `chat <model>` with the GenAI semantic-convention attributes
(`gen_ai.operation.name`, `gen_ai.provider.name`, `gen_ai.request.model`,
`gen_ai.request.temperature`, `gen_ai.request.max_tokens`,
`gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`,
`gen_ai.response.finish_reasons`). MCP tool calls are child spans of that run
(`execute_tool <name>`, `gen_ai.tool.name`, `gen_ai.tool.call.id`).

## API

See the generated [API reference](./api/README.md).

## Development

```bash
pnpm --filter @ndigo/ai build:lib
pnpm --filter @ndigo/ai test
```

## Contributing

See the repository [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

ISC
