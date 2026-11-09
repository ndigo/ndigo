# Ndigo Documentation

This directory organizes all project documentation by category. Docs-as-code:
everything lives in the repo, reviewed in PRs, formatted by oxfmt, and
referenced from the ADR index.

## Categories

### [Decisions](./decisions/README.md)

Architecture Decision Records — a single contiguous, numbered series. Numbered
by decision-sequence, filenames use the decision date
(`YYYY-MM-DD_AD##_TITLE.md`). The [README](./decisions/README.md) is the index
and the source of truth for the current range: status legend, supersession
markers, links.

### [Guides](./guides/README.md)

How-to guides (numbered `NN-slug.md`, living documents — no dates). **00–46**
are application guides: 00–02 start the ladder (concepts, Node, browser),
03–09 cover the fundamentals, and the rest cover the web/API, data, security,
browser, cross-cutting, and operations surfaces. **90–91** are contributor
guides (package documentation and application conventions). See the
[guide index](./guides/README.md) and the
[2026-11-08 renumbering map](./reference/2026-11-08_GUIDE_RENUMBERING.md) for
the old-to-new mapping.

### [Plans](./plans/README.md)

Implementation plans and technical specifications
(`YYYY-MM-DD_DESCRIPTION.md` — the date is when the plan was written).
Implemented plans are classified in the README with their decision record;
the plans themselves are historical documents and keep their original
status lines.

### [Architecture](./architecture/)

Living architecture topics (micro-frontends, environment, security,
lifecycle-and-ownership) as dated-free
slugs. The canonical system design lives in the root
[ARCHITECTURE.md](../ARCHITECTURE.md).

### [Reference](./reference/)

Dated technical references and specifications (`YYYY-MM-DD_DESCRIPTION.md`).
Superseded entries carry an **ARCHIVED** banner and an index marker pointing
at the successor; unmarked entries are current as of their date.

### [Audits](./audits/)

Dated audit reports (`YYYY-MM-DD_DESCRIPTION.md`) — snapshots of the repository
at their date, kept for history. The Framework Gap Analysis
(`2026-09-13_FRAMEWORK_GAP_ANALYSIS.md`) is a dated baseline (refreshed
2026-10-06 to HEAD); for live feature status see
[ARCHITECTURE.md](../ARCHITECTURE.md) (Package Map, Roadmap) and the
[ADR index](./decisions/README.md), not this audit.

### [Migrations](./migrations/)

Breaking-change and upgrade migration logs (`YYYY-MM-DD_DESCRIPTION.md`),
historical by nature.

## Conventions

- **Dated filenames sort history** (`plans/`, `reference/`, `audits/`,
  `migrations/`, `decisions/`); **stable slugs identify living docs**
  (`guides/`, `architecture/`, root `ARCHITECTURE.md`, `STYLE_GUIDE.md`).
- **ADR links are the source of truth for "why"** — every implemented plan
  and feature surface may cite its decision record.
- **Generated API reference is single-sourced from JSDoc**
  (`pnpm doc:api` → `packages/<name>/api/`, indexed by `API.md`; freshness
  enforced by `pnpm doc:check`). Package READMEs follow the guide-12 standard.
- Formatting is enforced by oxfmt (`pnpm format:check`) across docs.

## See Also

- [README.md](../README.md) - Project overview
- [CHANGELOG.md](../CHANGELOG.md) - Notable changes (Keep a Changelog)
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution workflow
- [AGENTS.md](../AGENTS.md) - AI agent guidelines
- [STYLE_GUIDE.md](../STYLE_GUIDE.md) - Code style conventions
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture and design
