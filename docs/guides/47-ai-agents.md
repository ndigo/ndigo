# Guide 47 — AI Agents, MCP Tools & Streaming

Add a provider-neutral tool-calling loop to an application: define tools once,
serve them over HTTP and MCP, run them against a local or hosted model, and
stream the result over SSE with one GenAI trace.

**Audience:** Node · **Prerequisites:** guides 01, 16, 32, 37 · **Reference app:** `apps/21-ndigo-agent-lab`

## What you'll learn

- How `@ndigo/ai` separates the agent loop from the provider adapter.
- How `McpToolRegistry` doubles as the agent's tool source with no adapter.
- How to stream agent events over the existing SSE write path.
- How rate limits, rollout flags, secrets, and resilience apply to model calls.

## 1. The pieces

| Package          | Role                                                              |
| :--------------- | :---------------------------------------------------------------- |
| `@ndigo/ai`      | `AIMessage`, `AIModel`, `AIAgent`, stream events, SSE framing.    |
| `@ndigo/ai-sdk`  | The only package that imports the Vercel AI SDK.                  |
| `@ndigo/mcp`     | Projects `@toolMapping` handlers into an `McpToolRegistry`.       |
| provider package | App-owned, e.g. `@ai-sdk/openai-compatible` for LM Studio/Ollama. |

The loop is deliberately outside the adapter. A model step returns text, tool
calls, a finish reason, and usage; `AIAgent` executes the calls through an
`AIToolSource`, appends the results, and repeats until the model stops or
`maxSteps` is reached.

## 2. Define a tool once

```ts
import { getMapping, parameters, pathVariable, requestMapping, toolMapping } from '@ndigo/dispatcher';

@requestMapping('/')
export class OrderTools {
    @getMapping('/tools/orders/:id')
    @parameters({ id: pathVariable('id') })
    @toolMapping({ name: 'lookup_order', readOnly: true, description: 'Read one order by id.' })
    lookupOrder(id: string) {
        return this.orders.find(id) ?? { error: `order '${id}' not found` };
    }
}
```

The HTTP route and `tools/list` share the same JSON Schema. There is no second
tool description to keep in sync.

## 3. Build the agent

```ts
import { AIAgent } from '@ndigo/ai';
import { aiSdkModel } from '@ndigo/ai-sdk';
import { McpToolRegistry } from '@ndigo/mcp';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const provider = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: 'http://127.0.0.1:1234/v1',
    apiKey: config.apiKey,
    includeUsage: true,
});
const tools = McpToolRegistry.from(dispatcher, {
    readOnly: true,
    argumentResolvers: context.getValue(ARGUMENT_RESOLVERS),
});
const agent = new AIAgent({
    model: aiSdkModel(provider.chatModel(config.model), { provider: 'lmstudio', model: config.model }),
    tools,
    maxSteps: 6,
});
```

`McpToolRegistry` satisfies `AIToolSource` structurally: `listTools()` supplies
the descriptors and `call(name, args, { callId })` executes them through the
normal dispatcher binding pipeline.

## 4. Stream over SSE

`AIAgent.stream()` is an async generator of `text-delta`, `tool-call`,
`tool-result`, and `finish` events. `toServerSentEvents` maps each event to the
`{ event, data }` envelope `ServerSentEventView` already understands.

```ts
@postMapping('/api/chat')
@parameters({ request: validatedBy(chatRequestSchema, bodyValue()) })
chat(request: ChatRequest) {
    return new ServerSentEventView(
        toServerSentEvents(agent.stream({ messages: [{ role: 'user', content: request.prompt }] }))
    );
}
```

Clients consume it with the existing reader:

```ts
for await (const event of parseServerSentEvents(response.body)) {
    if (event.event === 'text-delta') {
        write(event.data.text);
    }
}
```

The generator's return value is the settled `AIRunResult` (final text, full
conversation, every tool call/result, usage, and step count) when consumed
manually; the SSE writer ignores it.

## 5. One trace

Every run opens `chat <model>` with GenAI attributes; MCP tool executions are
child spans with `gen_ai.tool.name` and `gen_ai.tool.call.id`. The demo exports
traces to the console, so one request prints a single trace containing the root
span and each tool span. Point `traceExporter` at OTLP in production.

## 6. Limits, rollout, and resilience

```ts
const agent = new AIAgent({
    model,
    tools,
    rateLimit: {
        limiter: new FixedWindowRateLimiter(),
        policy: { limit: 20, windowMs: 60_000 },
    },
    rollout: { evaluator: flags, key: 'ai.chat' },
});
```

- The rate-limit key defaults to `provider:model` and throws
  `AIRateLimitError` with `retryAfterMs`.
- The rollout flag is a boolean with a `false` default — a missing flag fails
  closed.
- Put `@circuitBreaker` / `@retry` on the controller method that calls the
  agent so a provider outage trips the existing interceptor chain instead of
  surfacing raw SDK errors.

## 7. Secrets

Provider keys travel through ordinary configuration. A `{cipher:…}` value in
any property source decrypts at lookup time when the app registers a cipher:

```ts
await runNodeApplication([AgentLabConfiguration, AgentLabConfig], {
    configureBuilder: (builder) => builder.secrets(new AESGCMCipher(getEnv('NDIGO_SECRET_KEY')!)),
});
```

Never commit a key, and never place one in a client-bound file.

## 8. Run the reference app

```bash
pnpm --filter @ndigo/agent-lab start
curl -N -X POST localhost:3210/api/chat \
  -H 'content-type: application/json' \
  -d '{"prompt":"What did Ada order? Use the tools."}'
```

The same tools over MCP:

```bash
pnpm --filter @ndigo/agent-lab mcp
```

Configuration lives under `ai.*`: `baseURL`, `model`, `apiKey`, `maxSteps`, and
`modelFlag`. The app defaults to LM Studio on port 1234.

## 9. Testing

- Fake `AIModel` implementations prove loop behavior without a provider.
- `MockLanguageModelV4` from `ai/test` proves adapter mapping.
- The demo's MCP smoke test lists `lookup_order` and `list_orders` with the same
  schemas the agent receives.

## See also

- [`@ndigo/ai` README](../../packages/ndigo-ai/README.md), [`@ndigo/ai-sdk` README](../../packages/ndigo-ai-sdk/README.md)
- [`@ndigo/mcp` README](../../packages/ndigo-mcp/README.md)
- Guides 16 (SSE), 32 (telemetry), 34 (flags), 35 (resilience), 37 (CLI)
- `apps/21-ndigo-agent-lab`
