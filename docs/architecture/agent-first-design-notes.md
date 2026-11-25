# Agent-First — Design Notes

Internal notes for maintainers. The published [Agent-First](./agent-first.md)
page states the model and the four principles; this file keeps the resolved
tensions, the packaging rejection, and the pre-release limits behind them. It is
not published as a concept page.

## Resolved Tensions

| Tension                                                           | Resolution                                                                                                                 |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| Agent documentation rots per harness and per client               | One derived, version-matched body of content instead of a per-client matrix                                                |
| A second tool description drifts from the endpoint                | Every description is projected from one declaration; an agreement check catches the rest                                   |
| Install-time success treated as "it works"                        | Verification executes the declared checks against the live application, one result per check                               |
| Wiring knowledge split across generators, guides, and conventions | The capability is the declared unit; the deterministic front executes it, guidance only coordinates                        |
| A separate product for the agent runtime would simplify packaging | Rejected: it would break the one-declaration invariant, because the projection must read the code it describes in one tree |

## Why the runtime is not a separate product

The rejected option was a separate product for the agent runtime, on the
argument that it would simplify packaging. It would break the one-declaration
invariant: the projection has to read the code it describes in the same tree,
and a split product would either duplicate the declaration or reach back into
the application's build. The runtime therefore ships as packages over the same
dispatch metadata, not as a second system.

## Status and Limits

Agent-first is a complete loop, not a finished catalogue.

- **The loop is in place.** The capability catalog, planning and application,
  the coordinating guidance, and runtime verification all ship today.
- **Publishing gate.** The capability layer is exercised inside the framework
  repository; consumer installation becomes fully real when the packages
  publish at 1.0. The pre-1.0 status is stated on
  [Architecture Overview](../../ARCHITECTURE.md), so the published page does
  not repeat it.
- **Coverage.** The agent surface and the reasoning loop ship now; further
  capabilities back-port wiring that already exists and is proven in the
  generators.
- **Verification depth.** Boot, handshake, and cross-surface agreement are
  covered; tool-call round-trips and response-shape assertions are the natural
  next tier.
