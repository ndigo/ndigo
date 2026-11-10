# Agent Lab

Local-model tool calling over MCP tools, streamed over SSE, with one GenAI
trace per request.

The same `@toolMapping` handlers serve the HTTP endpoints, the MCP stdio server,
and the agent loop. No tool description is duplicated.

## Prerequisites

- LM Studio (or any OpenAI-compatible server) listening on
  `http://127.0.0.1:1234/v1`.
- A model that supports tool calling, e.g. `qwen/qwen3.8-27b`.
- Node ≥24 and pnpm ≥12.

## Run

```bash
pnpm --filter @ndigo/agent-lab start
```

```bash
curl -N -X POST localhost:3210/api/chat \
  -H 'content-type: application/json' \
  -d '{"prompt":"What did Ada order? Use the tools."}'
```

Events: `text-delta`, `tool-call`, `tool-result`, and a final `finish` carrying
the settled run result. The console prints the trace: one `chat` root span and
one `execute_tool` child span per call.

## MCP

```bash
pnpm --filter @ndigo/agent-lab mcp
```

`tools/list` returns `lookup_order` and `list_orders` with the same JSON
schemas the agent received. `list_orders` carries
`_meta.ui.resourceUri: 'ui://orders'`, and `resources/read` serves the
`ui://orders` MCP App as `text/html;profile=mcp-app`.

The same registry is available over Streamable HTTP while the app is running:

```bash
curl -s localhost:3210/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## A2UI report

`GET /reports/orders` negotiates its representation:

```bash
curl -s localhost:3210/reports/orders -H 'accept: application/json'
curl -s localhost:3210/reports/orders -H 'accept: application/a2ui+json'
```

The A2UI payload is a `createSurface` + `updateComponents` message array. The
surface uses `Switch`, the simplest component the UI lab installs; A2UI renders
only the components an application installed (see `apps/20-ndigo-ui-lab`).

## Tests

```bash
pnpm --filter @ndigo/agent-lab test
```

The spec boots the same context the app uses and asserts the tool list, the
`ui://orders` link, the `lookup_order` schema against the generated OpenAPI
operation, and the A2UI serialization.

## Configuration

| Key            | Default                    | Meaning                           |
| :------------- | :------------------------- | :-------------------------------- |
| `ai.baseURL`   | `http://127.0.0.1:1234/v1` | OpenAI-compatible endpoint.       |
| `ai.model`     | `qwen/qwen3.8-27b`         | Model id.                         |
| `ai.apiKey`    | `lm-studio`                | Provider key; `{cipher:…}` works. |
| `ai.maxSteps`  | `6`                        | Model calls per request.          |
| `ai.modelFlag` | `ai.chat`                  | Rollout flag; must evaluate true. |

Defaults can be overridden with environment variables (`AI_BASEURL`,
`AI_MODEL`, …) or a config file.
