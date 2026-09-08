# Blue Page

> **⚠️ CONCEPT STUB — NOT IMPLEMENTED.**
>
> This package exists to record a deferred design decision, not to provide
> functionality. Do not build against it. See [AD-3: The legacy Site/Page
> model](../../docs/decisions/2026-09-07_AD3_SITE_PAGE_MODEL.md) §5 for the
> open question and the required design conversation.

## The concept

In the legacy BlueJS architecture a **Page** was an independently-bootable,
named presentation container: it owned Views and could render its own model
before (or without) a full application context, giving fast
time-to-first-render while the Application loaded slower
(time-to-interactive). The modern framework expresses the *mechanics*
(view targets, islands, lazy feature mounts) but has no first-class "Page"
concept, no registration API, and no documented TTFB-vs-TTI contract.

## Why this stub exists

We chose to defer the design rather than resurrect the legacy Site model
wholesale. The successors below already cover most of the intent; what is
**open** is whether an independently-bootable, named presentation unit
deserves first-class status.

| Legacy concept | Modern equivalent (live) |
| --- | --- |
| Site routing by segment | `SiteRouter` + `FeatureRoutingRegistry` (`@blue/router`) |
| Application = behavior context | `ApplicationContext` + `ApplicationBuilder` (`@blue/context`, `@blue/boot`) |
| Page = mounted presentation | `ViewTarget`, `IslandView`, web-component mounts |
| Independent boot / linking | Context tree + `FeatureContextMountManager` (see `apps/blue-host`) |

## Required conversation before implementing

When this is revisited (trigger conditions + guidance in AD-3), the design
must answer:

1. Is "Page" a distinct seam from `ViewTarget`, or a composition of it?
2. Does it subsume / replace `IslandView` (server-render-then-hydrate)?
   How does it relate to `FeatureContextMountManager`?
3. What is the registration API (decorator? builder? mount call)?
4. What is the TTFB-vs-TTI contract (boot order, dependency between page and
   application context)?
5. How does it compose with the shell/feature routing model?

**Current state:** no code. The package (if it survives the conversation)
would live here in `@blue/page`.