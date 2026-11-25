# Agent-First

Ndigo treats agents as first-class users of every application, in two roles:
**authoring agents** that build the application on a user's behalf, and
**runtime agents** that operate it afterwards. Both are served from one
foundation — the application's own declarations — instead of a parallel,
agent-only description that would drift from the real thing. This page states
the model and shows one declaration projected into three surfaces; the guides
teach the individual workflows.

## Design Principles

Four principles follow from one conviction: an application should describe
itself, and agents should consume that description instead of a copy of it.
Agent-first is not a chatbot added to the product, and not a second API kept in
step by hand; it is the choice to make an application legible and operable to
agents by construction.

1. **One declaration, every projection.** A behaviour is described once — what
   it does, what it accepts, who may invoke it, when it is available — and every
   audience-facing surface is a projection of that description: the endpoint on
   the wire, the published API reference, the tool an agent calls, the interface
   a person sees, the guidance an agent reads. Nothing is authored a second
   time, so nothing can disagree. Where a surface needs a name or a shape the
   declaration does not carry, one shared rule derives it, never a local
   convention.

2. **Two agent roles, one foundation.** Authoring agents inspect, plan, apply,
   and prove changes through deterministic operations with defined inputs and
   machine-readable results. Runtime agents operate the live application through
   the same operations exposed as tools, with guardrails around them. Both read
   the application's own declarations, so improving the application improves
   both at once.

3. **A capability is the installable unit.** A package is a building block; a
   workflow is a goal. Between them sits the capability: a declared unit of
   application behaviour that names what the application gains, which packages
   it brings, what wiring it performs, what surfaces it emits, and how the
   result is checked. Each is declared once, planned before it is applied, and
   never left half-installed.

4. **Verification is executable, not aspirational.** "It installed" is not "it
   works". The framework proves the contract a capability declares against a
   live application: it boots, completes a real handshake, and compares the
   surfaces that are supposed to agree, reporting one result per check rather
   than a claim of success.

## How the Pieces Compose

Read from the foundation outward, the architecture has six layers. Each layer
exists so the next does not need a second source of truth.

| Layer               | Role                                                                                                                                                                    |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Declaration         | What the application states about each behaviour: its inputs, its results, who may invoke it, and when it is available.                                                 |
| Projection          | Reading those declarations out as endpoints, API reference, tools, and interface representation, so every audience meets the same behaviour in its own idiom.           |
| Deterministic front | A small set of operations that let an agent inspect and change the application without interpreting prose: discover, plan, apply, prove. Each answers machine-readably. |
| Capability catalog  | The declared, installable units of application behaviour, together with the vocabulary of checks each one promises.                                                     |
| Guidance            | Short routers over the operations: what to run, in what order, and where the traps are. Facts are fetched when needed, not memorised.                                   |
| Verification        | The runner that executes a capability's declared checks against the live application and reports one result per check.                                                  |

The direction matters. Declarations flow outward into every surface, and no
surface is authored independently. When a behaviour changes, it changes once,
and the endpoint, the API reference, the tool, and the interface representation
follow. An agent never has to ask which description is current.

### One Declaration, Three Surfaces

Here is the whole declaration for one handler:

```ts
import { getMapping, parameters, pathVariable, requestMapping, toolMapping } from '@ndigo/dispatcher';

@requestMapping('/')
export class OrderTools {
    @getMapping('/orders/:id')
    @parameters({ id: pathVariable('id') })
    @toolMapping({ name: 'lookup_order', readOnly: true, description: 'Read one order by id.' })
    lookupOrder(id: string): Order | { error: 'order_not_found' } {
        return ORDERS.find((order) => order.id === id) ?? { error: 'order_not_found' };
    }
}
```

`lookupOrder` is `GET /orders/:id` on the wire, an operation in the generated
[OpenAPI][openapi] document, and the [MCP][mcp] tool `lookup_order` in
`tools/list`. The argument schema is declared once, in `@parameters`;
`@toolMapping` adds only the agent-specific name, description, and read-only
flag. `@apiDocs` adds summaries, tags, and response documentation when the
generated defaults are not enough — it is optional metadata, not a second
declaration.

### What Carries It

`@ndigo/dispatcher` holds the route and `@toolMapping` declarations.
`@ndigo/mcp` projects those handlers into MCP tools over stdio and Streamable
HTTP, with [JSON Schema][json-schema] inputs derived from the same `@parameters`
metadata. `@ndigo/ai` owns the bounded agent loop and `@ndigo/ai-sdk` adapts the
model provider, so MCP tools and local tools behave identically across
providers. The `ndigo` CLI runs the deterministic front: `ndigo capabilities`,
`ndigo add`, and `ndigo verify`.

The same handler also feeds an MCP App resource, an A2UI representation, and a
browser tool; [Guide 48](../guides/48-agent-facing-surfaces.md) lists every
surface.

## Working Agent-First Day to Day

The loop an authoring agent follows is short. It starts by discovering what the
application is and what it could become, then turns a goal into a plan: the
packages, files, wiring, and surfaces the change would touch. The `ndigo add`
verb prints that plan and writes nothing; `--apply` executes it atomically — if
a step fails, the application is left as it was, never half-wired. The agent
then proves the result with `ndigo verify --capability <id>`, which runs the
declared checks against a real start of the application, alongside the
application's own type checking, tests, and lint.

Discover, plan, apply, prove: the same sequence underlies every capability, and
it is why an agent can act without a person translating for it. It is the shape
[Terraform][terraform] uses for infrastructure — a plan you can read before
anything changes, an apply that is all-or-nothing — applied to application
wiring.

The runtime half needs no separate declaration. The behaviours the authoring
agent wired are already the tools a runtime agent calls; the runtime layer
contributes the reasoning loop, the transport, and the guardrails — read-only by
default, mutation explicit — so the application does not grow a second,
agent-only surface.

## Where to Go Next

- [Guide 37 — The CLI](../guides/37-ndigo-cli.md) — the deterministic front in
  full.
- [Guide 47 — AI Agents & Streaming](../guides/47-ai-agents.md) — the
  provider-neutral tool-calling loop.
- [Guide 48 — Agent-Facing Surfaces](../guides/48-agent-facing-surfaces.md) —
  MCP, MCP Apps, A2UI, and WebMCP.
- [Guide 51 — Capabilities for Authoring Agents](../guides/51-capabilities-for-authoring-agents.md)
  — the capability catalog and the plan/apply contract.
- [Guide 52 — The Agent Operate Contract](../guides/52-agent-operate-contract.md)
  — what a runtime agent may do.
- [Guide 53 — Capability Authoring](../guides/53-capability-authoring.md) —
  writing a capability.
- [Architecture Overview](../../ARCHITECTURE.md) — the full system design.
- [Reference → Packages](https://ndigo.dev/reference/packages/) — the package
  inventory.

[json-schema]: https://json-schema.org/
[mcp]: https://modelcontextprotocol.io/
[openapi]: https://spec.openapis.org/oas/latest.html
[terraform]: https://developer.hashicorp.com/terraform/intro/core-workflow
