# AD-3: The legacy Site/Page model — lineage, successors, and the Page question

**Date:** 2026-09-07
**Status:** Accepted — Site model retired; modern equivalents documented; Page
concept deferred to a dedicated design conversation (see §5).

## Background

Early BlueJS scaled for large enterprise use with a composable top-level
model:

```
Site
├── Application(s)   — the behavior: Controllers + Models
└── Page(s)          — the presentation: owns Views
```

Routing: **Site owned the top route and handed off to the chosen Application
by the next path segment**; downstream segments continued the hand-off.
Controller actions return a **view name + model**; the view resolver looked
the view up in the Application's Page.

Two properties defined the model's value:

1. **Independent boot**: Applications and Pages could boot separately and
   be _linked_. Boot a desktop Page first → fast time-to-first-render;
   boot the Application afterwards → slower time-to-interactive. Or the
   reverse (heavy app first, page later).
2. **Decoupled assembly**: behavior (Application) and presentation (Page)
   were separate mountable units, not one monolithic context.

The current generation chose **not** to build Page; `SiteBuilder` remained
as a no-op `@experimental` stub ("Not yet implemented — see AD-3") — the
only surviving remnant of the model. This AD replaces that missing record:
it documents the lineage into the modern architecture and records the fate
of SiteBuilder.

## The modern successors (what replaced Site/Page)

The three capabilities did **not** die; they were re-implemented with the
modern primitives and re-named:

| Legacy concept                                          | Modern equivalent                                                                                                                                                                                      | Where                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Site (owner of top-level route, delegates by segment)   | **`PartitionRouter` + `FeatureRoutingRegistry`** — prefix-partitioned route delegation; features mount at URL prefixes                                                                                 | `@blue/router`                                                 |
| Application (independent context: controllers + models) | **`ApplicationContext` + `@community configuration`/`@entry`** — an app context owns its beans; `ApplicationBuilder.run()` assembles one                                                               | `@blue/context`, `@blue/boot`                                  |
| Page (independently-mounted presentation owning views)  | **View targets + `IslandView`/web-component mounts** — a render surface target is a mountable presentation unit; islands prime a fast first render                                                     | `@blue/view`, `@blue/view-webcomponent`, `@blue/platform-node` |
| Independent boot / link-time assembly                   | **Context tree + `FeatureContextMountManager`** — parent/child contexts + lazily-mounted feature contexts with shared-dependency validation (see `apps/blue-host`, `apps/blue-todo` shell composition) | `@blue/context`, demo apps                                     |
| Progressive render (TTFB vs TTI)                        | **Island/server-render-then-hydrate + lazy feature mounts** — the modern incarnation of "boot the Page first"                                                                                          | `IslandView`, `FeatureContextMountManager`                     |

**Reference implementation:** `apps/blue-host/src/shell-composition.ts` is
the canonical live heir — shell context + shared dependency registry +
`PartitionRouter` feature mounts, all composed at runtime. This is what the
legacy Site model _became_.

## Decision: SiteBuilder is removed

- `SiteBuilder` (no-op `@experimental` stub, `packages/blue-boot/src/site-builder.ts`)
  is **deleted** (2026-09-07). It was a false promise: `run()` did nothing,
  `child()` stored nothing, and the single `ApplicationBuilder` model plus
  the context tree already cover the documented intent (AD-7-era docs even
  read "use `ApplicationBuilder`").
- **No `Site`/`SiteBuilder` re-export remains** in `@blue/boot`.
- Applications needing multi-context composition use either
  `ApplicationBuilder` (single context) or the parent/child context model
  with `FeatureContextMountManager` (multiple linked contexts).
- The `@experimental SiteBuilder` row in migration docs is now obsolete; see
  this AD.

Rationale for removal rather than resurrection: the _capabilities_ were
re-implemented with better primitives; keeping a dead stub named after the
legacy model only advertised a shape the framework had already outgrown.

## The open question: does "Page" deserve a first-class concept?

What the legacy model offered that still has no _named_ modern equivalent is
**Page** as an independently-bootable, named presentation container — a view
surface that can render its own model before (or without) a full application
context. Today the island/web-component mount and view targets express the
_mechanics_, but there is no "Page" concept, no registration API, and no
documented TTFB-vs-TTI contract.

This is a real, modern capability (app-shell + feature, islands, partial
hydration — the same progressive-render story). It is deliberately _not_
designed here: it deserves its own design conversation (API shape,
relationship to `ViewTarget` vs a new `Page` seam, whether it subsumes
`IslandView`, and how it composes with the shell/feature model). The design
conversation must answer:

1. Is "Page" a distinct seam from `ViewTarget`, or a composition of it?
2. Does it subsume / replace `IslandView` (server-render-then-hydrate)?
   How does it relate to `FeatureContextMountManager`?
3. What is the registration API (decorator? builder? mount call)?
4. What is the TTFB-vs-TTI contract (boot order, dependency between page and
   application context)?
5. How does it compose with the shell/feature routing model?

The placeholder `@blue/page` package (the former record of this deferred
design) was removed on 2026-09-08; this AD is the single source of truth for
the open question.

## Status

| Item                            | Status                                                           |
| ------------------------------- | ---------------------------------------------------------------- |
| SiteBuilder removal             | ✅ Done 2026-09-07 (`@blue/boot` no longer exports it)           |
| Lineage + successors documented | ✅ This AD                                                       |
| Page concept design             | ⚠️ **Deferred** — dedicated conversation + AD; initial stub only |

## Revisit Trigger

Revisit the Page question if (a) a concrete need for independently-bootable
presentation units emerges (app-shell + feature with measurable TTFB goals,
multi-tenant resource prioritization), or (b) the islands/hydration story
grows to need a named container with a registration API. Design, when
pursued, must reconcile: the modern context tree + `ViewTarget`/`IslandView`
mechanics, the `PartitionRouter` feature-mount pattern, and the TTFB/TTI contract
the legacy model promised.
