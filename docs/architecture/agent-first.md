# Agent-First

Ndigo treats agents as first-class users of every application, in two roles:
**authoring agents** that build the application on a user's behalf, and
**runtime agents** that operate it afterwards. Both are served from one
foundation — the application's own declarations — instead of a parallel,
agent-only description that would drift from the real thing. This page states
the idea and the principles behind it; the guides teach the individual
workflows.

## Design Principles

Six principles follow from one conviction: an application should describe
itself, and agents should consume that description instead of a copy of it.
Agent-first is not a chatbot added to the product, and not a second API kept in
step by hand; it is the choice to make an application legible and operable to
agents by construction.

1. **One declaration, every audience.** A behaviour is described once — what it
   does, what it accepts, who may invoke it, when it is available — and every
   audience-facing surface is a projection of that description: the endpoint on
   the wire, the published API reference, the tool an agent calls, the
   interface a person sees. Nothing is authored a second time, so nothing can
   disagree. Where a surface needs a name or a shape the declaration does not
   carry, one shared rule derives it, never a local convention.

2. **Two audiences, one foundation.** Authoring agents and runtime agents need
   different things: the first needs instructions, workflows, and a tool it can
   drive without interpreting prose; the second needs the application's own
   operations exposed as tools, a representation of its interface, and a
   reasoning loop that respects the framework's telemetry, limits, and
   configuration. Both are served by surfaces derived from the application
   itself, so improving the application improves both at once.

3. **Agents run verbs, not prose.** Prose accumulates drift; an operation does
   not. Every workflow the framework teaches an agent is a deterministic
   operation with a defined input and a machine-readable result. Written
   guidance routes to those operations and names the traps; facts — flags, item
   lists, routes — are fetched from machine output when they are needed, never
   memorised from a page that changes.

4. **A capability is the installable unit.** A package is a building block; a
   workflow is a goal. Between them sits the capability: a declared unit of
   application behaviour that names what the application gains, which packages
   it brings, what wiring it performs, what surfaces it emits, and how the
   result is checked. Each is declared once, planned before it is applied, and
   never left half-installed.

5. **Verification is executable, not aspirational.** "It installed" is not "it
   works". The framework proves the contract a capability declares against a
   live application: it boots, completes a real handshake, and compares the
   surfaces that are supposed to agree, reporting one result per check rather
   than a claim of success.

6. **Agent content is derived, version-matched, and short.** Everything an
   agent reads that describes the framework is generated from committed inputs
   and shipped with the version it describes. Hand-written guidance stays small
   and router-shaped; generated artefacts are never edited by hand.

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

## Working Agent-First Day to Day

The loop an authoring agent follows is short. It starts by discovering what the
application is and what it could become, then turns a goal into a plan: the
packages, files, wiring, and surfaces the change would touch. Nothing is
written while the plan is under review. Applying the plan is atomic — if a step
fails, the application is left as it was, never half-wired. The agent then
proves the result by running the declared checks against a real start of the
application, alongside the application's own type checking, tests, and lint.

Discover, plan, apply, prove: the same sequence underlies every capability, and
it is why an agent can act without a person translating for it.

The runtime half needs no separate declaration. The behaviours the authoring
agent wired are already the tools a runtime agent calls; the runtime layer
contributes the reasoning loop, the transport, and the guardrails — read-only by
default, mutation explicit — so the application does not grow a second,
agent-only surface.

## Resolved Tensions

| Tension                                                           | Resolution                                                                                                                 |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| Agent documentation rots per harness and per client               | One derived, version-matched body of content instead of a per-client matrix                                                |
| A second tool description drifts from the endpoint                | Every description is projected from one declaration; an agreement check catches the rest                                   |
| Install-time success treated as "it works"                        | Verification executes the declared checks against the live application, one result per check                               |
| Wiring knowledge split across generators, guides, and conventions | The capability is the declared unit; the deterministic front executes it, guidance only coordinates                        |
| A separate product for the agent runtime would simplify packaging | Rejected: it would break the one-declaration invariant, because the projection must read the code it describes in one tree |

## Status and Limits

Agent-first is a complete loop, not a finished catalogue.

- **The loop is in place.** The capability catalog, planning and application,
  the coordinating guidance, and runtime verification all ship today.
- **Publishing gate.** The capability layer is exercised inside the framework
  repository; consumer installation becomes fully real when the packages
  publish at 1.0.
- **Coverage.** The agent surface and the reasoning loop ship now; further
  capabilities back-port wiring that already exists and is proven in the
  generators.
- **Verification depth.** Boot, handshake, and cross-surface agreement are
  covered; tool-call round-trips and response-shape assertions are the natural
  next tier.

## Where to Go Next

The workflows live in the guides:
[Guide 37 — The CLI](../guides/37-ndigo-cli.md) ·
[Guide 47 — AI agents](../guides/47-ai-agents.md) ·
[Guide 48 — agent-facing surfaces](../guides/48-agent-facing-surfaces.md) ·
[Guide 51 — capabilities](../guides/51-capabilities-for-authoring-agents.md) ·
[Guide 52 — the operate contract](../guides/52-agent-operate-contract.md).
Capability authoring has its own guide
([53](../guides/53-capability-authoring.md)), and the canonical system design
lives in [ARCHITECTURE.md](../../ARCHITECTURE.md).
