---
name: ndigo-model
description: Adds a bounded, provider-neutral model loop with streaming and structured output. Use when adding an LLM, changing providers, or wiring tools to a model.
package: "@ndigo/ai"
---

# Agent model

## Decision table

| Goal                 | Command                                     |
| :------------------- | :------------------------------------------ |
| What it installs     | `ndigo capabilities get agent-model --json` |
| Plan the wiring      | `ndigo add agent-model`                     |
| Apply it             | `ndigo add agent-model --apply`             |
| Validate the catalog | `ndigo capabilities check`                  |

## What it owns

The capability adds the framework packages and an `ai.*` configuration class.
The application owns the provider package and the model instance; the adapter
only declares tools, and the agent loop executes them.

## Sequence

1. `ndigo capabilities get agent-model --json` — read `packages`, `ops`, and
   `checks`.
2. Choose the provider package for the app (it is app-owned).
3. `ndigo add agent-model`, then `--apply`. Re-running is a no-op.
4. Bind `ai.*`: base URL, model id, key, and max steps.
5. Construct the agent once from the configuration; pass the application's tool
   source so the loop can execute what the model calls.
6. Send one prompt through the app and observe streamed events.

## Traps

- **Only `@ndigo/ai-sdk` imports the Vercel AI SDK.** Everything else talks to
  the `AIModel` contract; do not import the SDK in app code.
- **The adapter never executes tools.** Execution belongs to the agent loop, so
  MCP tools and local sources behave identically.
- **Secrets are resolved, not inlined.** Use `{cipher:…}` markers so the normal
  property sources decrypt at lookup.
- **Rollout fails closed.** A missing or broken model flag disables the model.
- **Bound the loop.** `maxSteps` is required; a model that keeps calling tools
  must stop.

## Verify

`ndigo verify --capability agent-model --json` is green; one run streams text
and a tool call; structured output validates against its schema.

## Example prompt

> Add a model loop to this app using the `agent-model` capability. Plan it,
> apply it, then bind the `ai.*` settings to my local provider. Prove it with one
> streamed prompt that calls a tool.
