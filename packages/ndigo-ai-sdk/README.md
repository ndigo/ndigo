# @ndigo/ai-sdk

> The AI SDK integration layer — the only package that imports the Vercel AI
> SDK. Everything else talks to `@ndigo/ai`'s `AiModel` contract.

The adapter declares tools to the model but never executes them. The
`@ndigo/ai` agent loop owns execution, so MCP tools and local tool sources
behave identically across providers, and telemetry stays provider-independent.

## Installation

```bash
pnpm add @ndigo/ai-sdk ai @ai-sdk/openai-compatible
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12. The provider
package is app-owned: `@ndigo/ai-sdk` wraps `ai`, not every provider.

## Getting Started

```ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { AiAgent } from '@ndigo/ai';
import { aiSdkModel } from '@ndigo/ai-sdk';

const provider = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: 'http://127.0.0.1:1234/v1',
    apiKey: config.apiKey,
});

const agent = new AiAgent({
    model: aiSdkModel(provider.chatModel('qwen3'), { provider: 'lmstudio', model: 'qwen3' }),
});
```

## Usage

### Mapping

| `@ndigo/ai`                      | AI SDK                                             |
| :------------------------------- | :------------------------------------------------- |
| `AiMessage` system               | `instructions`                                     |
| assistant tool calls             | assistant content `tool-call` parts                |
| tool results                     | tool message `tool-result` parts (`json` fallback) |
| `AiToolDescriptor` (JSON Schema) | `jsonSchema()` tool `inputSchema`                  |
| structured output (Zod)          | `zodSchema()`                                      |
| `streamStep`                     | `streamText().stream`                              |

`AiSdkModel.info` reads `provider` / `modelId` from the model and can be
overridden for stable telemetry and rate-limit keys.

### Integration-layer rule

No package imports `ai` directly. Add `ai` to `INTEGRATION_LAYER_MAP` in
`src/oxlint/_constants.ts` when the rule is extended; provider packages
(`@ai-sdk/*`) stay app-owned.

## API

See the generated [API reference](./api/README.md).

## Development

```bash
pnpm --filter @ndigo/ai-sdk build:lib
pnpm --filter @ndigo/ai-sdk test
```

## Contributing

See the repository [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

ISC
