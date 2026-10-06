# BlueJS Documentation

This directory organizes all project documentation by category. Docs-as-code:
everything lives in the repo, reviewed in PRs, formatted by oxfmt, and
referenced from the ADR index.

## Categories

### [Decisions](./decisions/README.md)

Architecture Decision Records — AD-01..AD-67, contiguous. Numbered by
decision-sequence, filenames use the decision date
(`YYYY-MM-DD_AD##_TITLE.md`). The README is the index: status legend,
supersession markers, links.

### [Guides](./guides/README.md)

How-to guides (numbered `NN-slug.md`, living documents — no dates). Guide 01
is the end-to-end tutorial/integration path; 02–18 cover one feature area
each.

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

Dated audit reports (`YYYY-MM-DD_DESCRIPTION.md`). The Framework Gap
Analysis is the live document (updated as features land); older audits are
historical records.

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
  (`pnpm doc:api` → `packages/<name>/doc/api/`; freshness enforced by
  `pnpm doc:check`). Package READMEs follow the guide-12 standard.
- Formatting is enforced by oxfmt (`pnpm format:check`) across docs.

## See Also

- [README.md](../README.md) - Project overview
- [CHANGELOG.md](../CHANGELOG.md) - Notable changes (Keep a Changelog)
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution workflow
- [AGENTS.md](../AGENTS.md) - AI agent guidelines
- [STYLE_GUIDE.md](../STYLE_GUIDE.md) - Code style conventions
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture and design
