# Micro Frontends — Design Notes

Internal notes for maintainers. The published
[Micro Frontends](./micro-frontends.md) page states the two shapes and their
rules; this file keeps the implementation status and the open questions behind
the deferred items. It is not published as a concept page.

## What exists today

- **Hosted features.** `HostManager` registers a feature, claims its route
  partition, validates required shared dependencies at mount, and applies the
  unmount policy. `apps/06-ndigo-host-demo` exercises the lazy path end to end;
  `apps/03-ndigo-todo-web` runs the same pattern with static feature contexts.
- **Islands.** `IslandView` serializes a model into an inert marker;
  `hydrateIslands()` restores the locale and model, upgrades the tag, and
  leaves tags without a client definition inert. Declarative shadow roots are
  adopted in place, so hydration upgrades the element instead of re-creating
  it.
- **Streamed updates.** The client's typed service stream validates each SSE
  frame against its response schema before the value reaches a signal.

## Page concept and the TTFB-vs-TTI contract

Registration and route partitioning exist, but a first-class **Page** — a unit
that binds a URL to a composition and states the boot order between
server-rendered markup, island hydration, and lazy feature mounts — does not.
The TTFB-vs-TTI contract is therefore undocumented: islands optimize first
paint, hosted features optimize time to interactive, and nothing states which
wins when one route uses both.

This is the open question the site page-model decision deferred. Reopening it
means defining the Page unit and a measurable boot budget, then aligning
`IslandView`, `FeatureContextMountManager`, and the shell's navigation with it.

## Island name–tag–schema triple

The triple is a convention between a server view and its client component, not
a registry:

- `IslandView` writes the model and tag; `hydrateIslands()` restores them.
- The schema is enforced on pushed updates, not on the initial hydration — a
  marker whose tag has no client definition stays inert by design.
- No cross-application catalog lets a host and its islands agree on the triple
  ahead of time or fail a mismatch at build time.

Enforcing the triple would need a registration surface plus a build-time or
runtime check, and a decision on what happens when a tag is missing from the
catalog.

## Runtime self-registration

Features are compile-time modules: `registerFeature` is runtime, but every
`loader` resolves through the bundler, so the deployment model stays static. A
feature that announces itself at runtime would need a manifest or discovery
step and a story for version negotiation; the seam exists, the model does not.

## When to Revisit

- A route mixes a server-rendered page with lazy features and needs a stated
  TTFB/TTI budget.
- More than one island implementation ships to the same client and needs a
  shared catalog.
- A feature must be deployed independently of the shell.
