# Ndigo Agent Guidelines

This document provides essential instructions for AI agents (and human developers) working in the Ndigo repository.

## Quick Start for AI Agents

**Essential Commands:**

```bash
pnpm install          # Install dependencies
pnpm hooks:install   # Enable the primary-checkout commit guard (once per clone)
pnpm build           # Build all packages (~30s)
pnpm test            # Run all tests (~2min)
pnpm lint            # Check code quality
```

**Critical - Read Before Coding:**

⚠️ **Section 8 (Worktrees)** - The primary checkout is for reading, releases, and `git worktree` management. Before the first write, create an adjacent worktree, branch off `main`, and move the session there.

⚠️ **Section 5 (Research Workflow)** - ALWAYS perform two-step reconnaissance before writing code. This repo is graft-indexed: run `graft ask`/`graft callers` (see the Graft section at the end) to understand code or trace callers before grepping/reading; use raw grep only for unindexed files or exhaustive checks.

⚠️ **Section 4.4 (Library Integration Layer)** - Most common error: importing linkedom directly instead of through @ndigo/dom

⚠️ **Section 4.7 (Decorator Naming)** - All decorators MUST use camelCase; each decorator category fixes its name's form (STYLE_GUIDE.md §3.17)

⚠️ **STYLE_GUIDE.md Predicate (is\*) vs Duck-Typing (like\*) Functions** - `is*` for type/identity checks (`typeof`, `instanceof`); `like*` for structural/duck-typing checks (property shape). Never use `instanceof` in a `like*` function.

⚠️ **STYLE_GUIDE.md Section 3.9 (Acronym Casing)** - Use all-uppercase in types (HTTPTransformer), all-lowercase or all-uppercase in identifiers (httpTransformer or myHTTPData)

⚠️ **STYLE_GUIDE.md Section 3.10 (Interfaces/Abstract Classes)** - Use description-first pattern (UserDataTransformer implements DataTransformer), Abstract prefix for abstract classes

⚠️ **STYLE_GUIDE.md Section 3.11 (Role-Based Suffixes)** - Use semantic suffixes: *Handler (processes), *Resolver (locates), *Strategy (algorithm), *Factory (creates)

⚠️ **STYLE_GUIDE.md Section 3.12 (Properties vs Methods)** - Properties for cheap/intrinsic data (O(1), no side effects), get-methods for external lookups (may fail/return null), to-methods for transformations

⚠️ **STYLE_GUIDE.md Section 3.13 (Method Naming)** - Use conventional prefixes: get* (retrieve), is* (type check), has* (presence), set* (mutate), from*/to* (convert), with\* (immutable copy). Factory functions: create* (no global state) vs get* (global state affects result).

⚠️ **STYLE_GUIDE.md Section 3.14 (Type-Safe Enums)** - Use class-based pattern for enums with methods/inheritance, built-in enums for simple constants

⚠️ **STYLE_GUIDE.md Section 8 (Self-Documenting Code)** - Names carry meaning, comments carry rationale. Document _why_, not _what_. Bare `as any`/`as unknown as T`/`// @ts-ignore` need a one-line reason; `// NOTE:` is technical debt; one public type per file, files under 300 lines.

**Pre-Commit Validation:**

```bash
pnpm lint   # enforces integration-layer imports, internal-file imports/exports
```

Naming conventions live in STYLE_GUIDE.md §3 and are enforced mechanically
where a rule exists: acronym casing (`internal/no-mixed-case-acronyms`), the
`Abstract` prefix (`internal/no-abstract-class-without-prefix`), UPPER_SNAKE_CASE
regex constants (`internal/no-uppercase-regexp-constants`), and `create\*` vs
`get\*` for factories (`internal/no-global-state-in-create-factories` — mutable
module/class state references). The rest of §3.13 remains a review check.

---

## 1. Project Overview & Environment

- **Type:** Nx Monorepo with pnpm workspaces.
- **Module System:** **ESM Only**. No CommonJS (`require`) allowed.
- **Language:** TypeScript (Target: `ES2022`; single compiler line `~7.0.2` pinned in the pnpm catalog — root, packages, and apps resolve it from there; TypeDoc still runs on the shimmed 6.0.3 toolchain, see `scripts/typedoc-ts-shim.mjs`).
- **Package Manager:** pnpm >= 12.0.0.
- **Node Version:** >= 24.0.0 (root `engines`, `engine-strict=true`; the floor
  every package README and the README template state).

## 2. Documentation Guide

### STYLE_GUIDE vs ARCHITECTURE

The project maintains two complementary documentation files for different purposes:

**STYLE_GUIDE.md - "How to Write Code"**

- **Focus:** Concrete implementation rules, naming, and formatting conventions
- **Audience:** All developers (including AI agents) writing code daily
- **Content:**
    - File naming conventions (kebab-case, underscore prefix, etc.)
    - Code naming conventions (camelCase, PascalCase, UPPER_SNAKE_CASE)
    - oxfmt formatting rules (indentation, quotes, semicolons, etc.)
    - Module organization structure
    - Special patterns (internal files, test helpers, mixins)
    - Before/after examples of correct usage

**Think:** "How do I name this file/variable/class?" and "How should this code be formatted?"

**ARCHITECTURE.md - "Why the System Works This Way"**

- **Focus:** High-level design decisions, patterns, principles, and rationale
- **Audience:** Architects and senior developers understanding system design
- **Content:**
    - Core philosophy and design principles
    - Layered architecture organization
    - Design patterns (Strategy, Factory, Observer, Decorator, etc.)
    - Dependency management strategy (Library Integration Layer)
    - Module visibility concepts and API design
    - Roadmap and development phases

**Think:** "Why is the system designed this way?" and "What are the architectural patterns?"

**The Dividing Line:**

| Concern               | ARCHITECTURE.md                                           | STYLE_GUIDE.md                                            |
| :-------------------- | :-------------------------------------------------------- | :-------------------------------------------------------- |
| Dependency Management | "Use Library Integration Layer pattern"                   | "Import from @ndigo/dom, not from linkedom"               |
| Code Organization     | "Use Strategy Pattern for parsers"                        | "Name parser files: kebab-case.ts in src/"                |
| Module Visibility     | "Internal modules are implementation details"             | "Prefix internal files with underscore: \_util.ts"        |
| Naming Philosophy     | "Use `is` prefix for type checks, `like` for duck-typing" | "isString checks with typeof, returns boolean"            |
| Decorators            | "Decorators enable separation of concerns"                | "@routeMapping uses camelCase, stores in Symbol.metadata" |

**Maintenance Note:** The root README links [`STYLE_GUIDE.md`](STYLE_GUIDE.md)
and [`ARCHITECTURE.md`](ARCHITECTURE.md) instead of restating this split — keep
this summary synchronized with them.

### Package Documentation

Every package must meet the documentation standard:

- **README.md** — required sections (tagline, Installation, Getting Started,
  Usage, API _link only_, Development, Contributing, License). No internal
  tracking IDs or decision-record links in package READMEs. Template:
  `tools/generators/src/generators/readme/files/README.md.template`.
- **Generated API reference** — `pnpm doc:api` writes
  `packages/<name>/api/` per package (zero-warning TypeDoc standard,
  CI-enforced). After public API changes: regenerate, commit the tree.
- **Cross-package JSDoc links** — add an entry to
  `scripts/external-symbol-links.json`; never sprinkle links into package code.
- **Enforcement** — `pnpm manifest:check` (README/metadata/files), CI
  freshness diff. Full rules: `docs/guides/90-package-documentation.md`.

**No HTML docs:** `doc-html/` and `typedoc.html.json` are gone; do not
reintroduce them.

### Design Principles (SOLID & DRY)

ARCHITECTURE.md now includes comprehensive guidance on SOLID and DRY principles adapted for JavaScript/TypeScript. When writing or refactoring code, refer to these principles:

**SOLID Principles:**

- **S**ingle Responsibility: Classes/functions should have one reason to change
- **O**pen-Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable for base types
- **I**nterface Segregation: Clients shouldn't depend on unused interfaces
- **D**ependency Inversion: Depend on abstractions, not concretions

**DRY Principle (Don't Repeat Yourself):**

- Apply the **Rule of Three**: Wait for three occurrences before abstracting
- **Prefer duplication over the wrong abstraction** (Sandi Metz)
- Consider **AHA programming** (Avoid Hasty Abstractions)
- Balance DRY with KISS (simplicity) and YAGNI (don't over-engineer)

**Quick Reference:**

- Use TypeScript interfaces for DIP and ISP
- Favor composition over inheritance
- Use dependency injection (ApplicationContext)
- Extract functions/classes when you have actual duplication, not hypothetical
- Keep abstractions simple and focused

**See:** ARCHITECTURE.md Section 2 "Foundational Principles" for detailed examples, anti-patterns, and practical guidelines.

## 3. Core Commands

### Installation

```bash
pnpm install
```

### Building

Packages are built using `tsc -b` via Nx. Output goes to `lib/`.

```bash
# Build all packages
pnpm build

# Build a specific package
nx run @ndigo/core:build:lib
# OR directly in the directory
cd packages/ndigo-core && pnpm build:lib
```

### Testing

We use **Vitest**.

```bash
# Run all tests
pnpm test

# Run tests for a specific package
nx run @ndigo/core:test

# Run a SINGLE test file (Fastest)
pnpm vitest run packages/ndigo-core/test/deferred.spec.ts
```

### Code Quality

```bash
# Linting (oxlint)
pnpm lint

# Formatting (oxfmt)
pnpm format
```

## 4. Code Style & Conventions

### Formatting

- **Indentation:** 4 spaces for TS/JS, 2 spaces for JSON/YAML.
- **Quotes:** Single quotes `'`.
- **Semicolons:** Always required.
- **Print Width:** 120 characters.
- **Trailing Commas:** ES5 style.

### Naming

- **Classes/Interfaces:** `PascalCase` (e.g., `Deferred`, `ApplicationContext`).
- **Methods/Variables:** `camelCase` (e.g., `resolve`, `configureEnvironment`).
- **Private Fields:** Use `#` syntax (e.g., `#environment`).
- **Predicates:** Prefix with `is` for type/identity checks using `typeof` or `instanceof` (e.g., `isString`, `isContextToken`). Asks: "Is this _an instance of_ X?"
- **Duck Typing:** Prefix with `like` for structural/shape checks using property presence (e.g., `likeController`, `likeFactory`). Asks: "Does this _behave like_ X?" Never use `instanceof` as the primary check in a `like*` function.
- **Mixins:**
    - Class Mixins: `PascalCase` with `As` prefix (e.g., `AsEventEmitter(Base)`).
    - Function Mixins: `camelCase` with `as` prefix (e.g., `asEventEmitter(target)`).
- **Acronyms:** All-uppercase in types (e.g., `HTTPTransformer`, `JSONParser`), all-lowercase or all-uppercase in identifiers (e.g., `httpTransformer`, `myHTTPData`).
- **Interfaces/Abstract Classes:**
    - Interfaces: `[Domain][Role]` (e.g., `HTTPTransformer`, `DataTransformer`).
    - Concrete classes: `[Description][Role]` (e.g., `UserDataTransformer`).
    - Abstract classes: `Abstract[Description][Role]` (e.g., `AbstractUserDataTransformer`).
- **Role-Based Suffixes:**
    - `*Handler` - Processes requests/events.
    - `*Adapter` - Adapts interfaces.
    - `*Resolver` - Resolves/locates values.
    - `*Strategy` - Encapsulates algorithms.
    - `*Factory` - Creates instances.
    - `*Registry` - Stores registered objects.
    - `*Service` - Business logic.
    - `*Controller` - Web request handlers.

### TypeScript

- **Target:** `ES2022` (supports top-level await, private fields).
- **Module Resolution:** `Bundler`.
- **Types:** Avoid `any` where possible, though strictly enforced rules are currently relaxed. Use proper generics.
- **Documentation:** Use **TSDoc** syntax (`/** ... */`) for all public APIs.

### TC39 Decorators

- **Standard:** Ndigo uses modern **TC39 Stage 3 decorators**.
- **Polyfill:** The `@tsmetadata/polyfill` is used to support `Symbol.metadata`.
- **Legacy:** `reflect-metadata` and the old `experimentalDecorators` flag are **no longer used**.
- **Further Reading:** For a deep dive into the architecture, see the "Decorators & Separation of Concerns" section in `ARCHITECTURE.md`.

### Library Integration Layer Pattern

**Critical Rule:** External dependencies must be imported through their designated integration layer packages, never directly.

**Integration Layer Packages:**

| Package      | Encapsulates | Import From  |
| :----------- | :----------- | :----------- |
| `@ndigo/dom` | `linkedom`   | `@ndigo/dom` |

**Import Rules by Package Type:**

1. **Integration Layer Packages** (`@ndigo/dom`):

    - ✅ May import directly from their encapsulated libraries
    - ✅ Must re-export functionality through `src/index.ts`

2. **All Other Packages** (`@ndigo/core`, `@ndigo/context`, etc.):

    - ✅ Must import from integration layer packages
    - ❌ Must never import directly from encapsulated libraries

3. **Test Files** (`*.spec.ts`, `*.test.ts`):
    - ✅ May import external libraries for mocking purposes
    - ✅ May import directly for test utilities (e.g., `vitest`, `jsdom`)

**Code Examples:**

```typescript
// ✅ CORRECT: Import from integration layer
import { createDOMProvider } from '@ndigo/dom';

// ❌ INCORRECT: Direct import bypasses integration layer
import { parseHTML } from 'linkedom'; // Wrong! Use @ndigo/dom
```

**Common Violations to Avoid:**

```typescript
// ❌ In @ndigo/view/src/renderer.ts
import { parse } from 'linkedom'; // WRONG

// ✅ Correct version:
import { createDOMProvider } from '@ndigo/dom';
```

**Enforcement:**

These rules are **automatically enforced** by the repository-only oxlint
plugin at root [`src/oxlint/`](src/oxlint/README.md) (rule namespace
`internal/*`, AD-86), loaded by the same `pnpm lint` lane as the
consumer-facing `@ndigo/oxlint-plugin`:

| Rule                                     | Severity | Description                                                                                                                                        |
| :--------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `internal/no-direct-integration-imports` | warn     | Forbids importing encapsulated libraries (linkedom, etc.) outside their integration layer packages. Allows in integration packages and test files. |
| `internal/no-internal-file-imports`      | error    | Forbids cross-package imports of internal files (`@ndigo/<pkg>/_*`), including `export * from '@ndigo/<pkg>/_*'`.                                  |
| `internal/no-internal-file-exports`      | error    | Forbids re-exporting internal files (`./_*`) — both `export * from './_*'` and named re-exports (`export { foo } from './_*'`).                    |

Run `pnpm lint` to check for violations. These rules are integrated into the root `.oxlintrc.json`.

When reviewing or writing code:

1. **Run `pnpm lint`** to catch violations automatically
2. **Check imports** at the top of every file
3. **In tests**, direct imports are OK for mocking but document why

**Updating Rules:**

When adding new integration layers or encapsulated libraries:

1. Update this section with the new mapping
2. Update the internal plugin constants in `src/oxlint/_constants.ts`
3. Update `ARCHITECTURE.md` "Dependency Management Strategy" section

### Decorator Naming and Conventions

**Critical Rule:** All decorators must use `camelCase` to align with standard TypeScript method and function naming. PascalCase is reserved for classes and types.

- ✅ **Correct:** `@routeMapping`, `@injectable`
- ❌ **Incorrect:** `@RouteMapping`, `@Injectable`

This convention is detailed in **STYLE_GUIDE.md Section 3.8**; the per-category forms (stereotypes, behaviors, conditions, registrations, lifecycle, descriptors, policies) are in **Section 3.17** ([AD-83](docs/decisions/2026-10-31_AD83_DECORATOR_CATEGORIES.md)). Adherence is critical for distinguishing decorators from classes at a glance.

### Architecture & File Structure

- **Location:** Source code in `packages/<package-name>/src/`.
- **Output:** Compiled ESM files in `packages/<package-name>/lib/`.
- **Imports:** Use path aliases `@ndigo/*` where applicable, or relative paths within the same package.
- **Dependencies:**
    - **Runtime (external):** Add to `dependencies` (e.g. `@redis/client`, `jose`).
    - **Development:** Add to `devDependencies`.
    - **Cross-Package (`@ndigo/*`):** Framework dependencies go in
      `dependencies` with the workspace version range (e.g. `"@ndigo/core":
      "~0.0.1"`) — Angular/Nest-style self-contained published graph.
      **Optional capability drivers** — subpath entry points that integrate a
      _sibling_ contract package the consumer may not use — declare that
      contract as a `peerDependencies` entry instead (canonical example:
      `@ndigo/redis` root depends on `@ndigo/core`/`@ndigo/log`, while its
      `/cache`, `/jobs`, `/locks`, `/rate-limit`, `/pubsub` subpaths peer-depend
      on `@ndigo/cache`, `@ndigo/jobs`, `@ndigo/locks`, `@ndigo/rate-limit`,
      `@ndigo/socket` respectively). Do not add a `peerDependencies` entry for a
      hard framework dependency, and do not duplicate `dependencies` entries
      into `devDependencies` — `auto-install-peers=true` plus workspace linking
      resolves both kinds inside the monorepo.

### Internal vs Public Modules

- **Public Modules:** Exported via `packages/<package-name>/src/index.ts`. These form the stable, documented API.
- **Internal Modules:** Files prefixed with underscore (`_*.ts`) are implementation details:
    - **Source:** `src/_*.ts` - Internal utilities, helpers, re-exports
    - **Tests:** `test/_*.ts` - Test helpers, fixtures, custom assertions
    - ❌ **Never export** underscore files in public API
    - ❌ **Never import** underscore files across packages
    - ✅ **Only use** within the same package

### Error Handling

- Use specific error classes (e.g., `IllegalStateError` from `@ndigo/core`) rather than generic `Error` where possible.

### Utility Function Organization

When organizing helper functions and utilities, follow the extraction hierarchy:

**Decision Tree:**

1. **1 file uses** → Keep inline (regexes, functional constants)
2. **3+ files (same category)** → Extract to dedicated file (e.g., `remove-non-word.ts`)
3. **4+ files (cross-category)** → Add to internal file (e.g., `_util.ts`, `_validators.ts`)
4. **Multiple packages** → Promote to `@ndigo/util`

**Critical Rule:** Internal files (`_util.ts`, `_parser.ts`, etc.) must contain **actual local utility functions**, not just pass-through re-exports.

> Decision rule: If deleting all re-export lines leaves an empty file, don't create it.

**Internal File Naming:**

- `_util.ts` - Mixed-purpose utilities (often with `@ndigo/util` re-exports)
- `_<domain>.ts` - Domain-specific collections (e.g., `_validators.ts`, `_parsers.ts`)
- `_<algorithm>.ts` - Specific implementations (e.g., `_natural-sort.ts`)

**Example: Node.js uses descriptive names** like `_http_agent.js`, `_http_common.js` rather than generic `_util.js` for everything.

**File Size Targets:**

- **Ideal:** 20-150 lines (median: 61 lines)
- **Review:** >200 lines with multiple responsibilities
- **Refactor:** >300 lines (likely violates SRP)

**Acceptable Large Files:**

- Constant collections (e.g., `http-headers.ts`: 725 lines, 124 constants)
- Complex classes with single responsibility
- Framework integration modules

**Important:** Once a package has `_util.ts`, add new cross-file utilities there directly instead of waiting for the 4-file threshold.

**See:** STYLE_GUIDE.md Sections 4.5 and 4.6 for detailed patterns and examples.

#### Phase 3: Ongoing Practice (Not a Scanning Task)

**Important:** Creating internal files is an **ongoing guideline**, not a discrete task to execute.

❌ **Do NOT:**

- Proactively scan packages for 4-file duplication patterns
- Create internal files "just in case"
- Extract utilities before they're actually duplicated

✅ **DO:**

- Create internal files when you naturally discover duplication during development
- Follow thresholds: 4+ files for cross-category utilities within a package
- Use appropriate naming: `_util.ts` (mixed), `_validators.ts` (domain), `_natural-sort.ts` (algorithm)

**Example:** While working in `@ndigo/telemetry`, you notice `formatTimestamp` appears in 5 files → create `_formatters.ts` following the guidelines in STYLE_GUIDE.md Section 4.5.

## 5. Workflows

### Modifying Code

1.  **Read:** Analyze existing code and `package.json` first.
2.  **Research:** Before writing code, understand the relevant code and avoid duplication. This repo is graft-indexed — prefer the graph:
    - **Understand first (graft):** Run `graft ask "<question>" --source` for ranked context with inlined spans, `graft callers <symbol>` for who-calls-what, `graft skeleton <file>` to skim an API. Only open a source file at the exact span the graph cites. See the Graft section at the end of this file.
    - **Fallback (unindexed/exhaustive):** When the graph lacks a detail or you need _every_ occurrence, grep the target:
        - **Step 1 - Scan target package:** Search for related functionality, established patterns, internal utilities (`_util.ts`, `_parsers.ts`), naming conventions, and design patterns currently in use.
        - **Step 2 - Scan related packages:** Check common utilities and specialized tools:
            - `@ndigo/util` - Common utilities (type guards, string utils, environment, crypto) - **Check first!**
            - `@ndigo/dom` - Isomorphic DOM parsing/creation (linkedom wrappers) - For HTML parsing, element creation
            - `@ndigo/validate` - (retired 2026-09-05 per AD-07; use `zod` via `@ndigo/orm` entity schemas / `@ndigo/dispatcher` `validatedBy`)
            - `@ndigo/core` - Core primitives, containers, patterns - Use for application context, DI, base types
    - **After big changes:** refresh the graph with `graft build`.
3.  **Plan:** Check `docs/migrations/` or `ARCHITECTURE.md` for recent architectural shifts.
4.  **Design Decisions:** Consider API design patterns:
    - **Property vs Method:** Use properties for cheap/intrinsic data (O(1), no side effects), get-methods for external lookups (may fail/return null), to-methods for transformations (STYLE_GUIDE.md Section 3.12)
    - **Method Naming:** Use conventional prefixes: get\* (retrieve), is\* (type check), has\* (presence), set\* (mutate), from\*/to\* (convert), with\* (immutable copy) (STYLE_GUIDE.md Section 3.13)
5.  **Implement:** Adhere to the ESM-only mandate and follow patterns discovered in research phase.
6.  **Check Dependencies:** Verify imports follow the Library Integration Layer pattern (no direct imports from encapsulated libraries).
7.  **Verify:** Always run `pnpm build` and `pnpm test` (or specific package build/test) before finishing.

### Creating New Files

- Match the standard file-header style observed in adjacent files (TSDoc module doc — a one-line module summary, no tags; no `@module` tag; no author/copyright lines). See STYLE_GUIDE §5.
- Add to `exports` in `package.json` if the file needs to be part of the public API.

## 6. Documentation Standards

### Documentation Directory Structure

All project documentation (except root-level guides) should be organized under `docs/`:

```
docs/
├── migrations/     # Breaking changes and upgrade guides
├── plans/          # Implementation plans for features
├── reference/      # Technical references and specifications
└── audits/         # Codebase analysis and compliance reports
```

**Naming Convention:** `YYYY-MM-DD_DESCRIPTION.md`

Where:

- `YYYY-MM-DD` - ISO 8601 date (creation or last major update)
- `_` - Underscore separator (consistent with UPPER_SNAKE_CASE for constants)
- `DESCRIPTION` - Brief description in ALL_CAPS with underscores for multi-word phrases

**Examples:**

- ✅ `2025-01-23_DEPENDENCIES.md`
- ✅ `2025-02-01_DEPENDENCY_AUDIT.md`
- ✅ `2025-01-30_PARSER_ENHANCEMENT.md`
- ❌ `2025-01-23-dependencies.md` (lowercase, hyphen separator)
- ❌ `dependencies-2025.md` (date at end)

### When Creating New Documentation

**Migration Guides** (`docs/migrations/`):

- Document breaking changes
- Provide upgrade paths
- Include before/after examples

**Implementation Plans** (`docs/plans/`):

- Detail technical specifications
- Outline implementation steps
- Include testing strategy

**Audit Reports** (`docs/audits/`):

- Analyze codebase patterns
- Identify violations or inconsistencies
- Recommend improvements

**Reference Docs** (`docs/reference/`):

- Document dependency versions
- Provide configuration references
- Include comparison tables

**Each directory has a README.md** that indexes all documents in that category.

## 7. Agent Configuration

This repository's AI-agent definitions are **generated, not hand-edited**:

- **Source of truth:** the neutral store in `development-agents/` (agents,
  skills, per-harness shims) plus this repo's `agent-local/` (repo-specific
  overrides, e.g. the `graft` skill).
- **Regenerate:** `pnpm agents:sync` (runs `gen.mjs`; agents into
  `.opencode/` + `.omp/`, skills once into the harness-neutral `.agents/skills/`,
  plus `.agent-gen.json`)
- **Validate:** `pnpm agents:check` — committed files vs. the sha256
  manifest + structural invariants (CI-gated)
- Edit `development-agents/` or `agent-local/` and regenerate — never edit
  generated files under `.opencode/agents`, `.omp/agents`, `.agents/skills`.
  Skills are deployed once to `.agents/skills` because both harnesses read
  that tree natively; a second copy under a harness directory would shadow it
  at a different precedence.
- Models: not part of the deployment — agents inherit the session model
  (OpenCode `model`, OMP `modelRoles`, configured outside the store).

## 8. Work Tracking & Multi-Agent Concurrency

Live work lives in **GitHub Issues**; durable records — ADRs, specs, guides —
stay in `docs/`. The project board flows
`Backlog → Ready → In Progress → In Review → Done`.

**Picking up work**

- Take issues only from `Ready` (groomed: acceptance criteria, files/area
  noted, no blockers).
- Claim before starting: board status → `In Progress`, assign yourself, and
  comment `claimed — <branch>` on the issue. If a claim already exists, pick
  another issue. If two sessions race anyway, the first PR wins; the other
  closes its branch.

**One issue = one branch = one worktree = one session = one PR**

Worktrees are **mandatory, not a concurrency optimization**. The primary
checkout (`~/Workspace/ndigo`) is for reading, `git worktree` management, and
release operations. Every session that writes files — source, docs, generated
output, commits — works in its own worktree, because another session can start
after you do and detection alone cannot prevent the collision.

- **Before the first write**, start the worktree:
    1. `worktree_create` with the name below. `opencode.json` sets
       `worktree.directory: ".."`, so the tree lands beside the repo — never
       inside it and never in a harness data directory.
    2. `git switch -c <branch> main` in the new tree; the tool leaves HEAD
       detached, and branching off `main` is required.
    3. `session_move` the session into it, then run `pnpm install` once (the
       shared pnpm store makes it cheap).
- **Find the issue first.** Before naming anything, search GitHub for the
  work's tracking issue (`gh issue list --search "<task>"`). When one exists —
  or after filing one — use the issue forms below: the worktree, branch, and
  PR all carry the same number. The no-issue forms are for genuinely
  untracked one-offs only.
- **Names:** `<repo>-<issue>-<slug>` (e.g.
  `~/Workspace/ndigo-50-lint-surface-split`) when the work has an issue;
  `<repo>-<slug>` when it does not (e.g. `~/Workspace/ndigo-worktree-discipline`).
- **Branches:** `type/N-short-slug` (`feat/12-auth-refresh`), or
  `type/short-slug` when there is no issue (`docs/worktree-discipline`); `type`
  is the conventional-commit type.
- **If the checkout already has changes you did not make**, stop and report —
  do not edit, stage, commit, or "repair" around them. If the collision is
  discovered after writing, create the worktree anyway, re-apply the work
  there, and leave the foreign changes untouched.
- If a tool places a worktree elsewhere, stop the processes whose cwd is inside
  it (MCP servers included), `git worktree move` it, and re-point the session.
- PR back to `main`: title `type(scope): summary`, body `Closes #N`. Rebase
  onto `main` before merging; **squash-merge only**; delete the branch and
  remove the worktree directory afterwards.

The tracked `.githooks/pre-commit` guard enforces the checkout rule once
`pnpm hooks:install` has run; releases opt out with
`ALLOW_PRIMARY_COMMIT=1 git commit …`.

**Never**

- Never push directly to `main`, never force-push.
- Never hand-merge generated files — after a rebase, regenerate:
  `pnpm agents:sync` (agent trees + `.agent-gen.json`), `pnpm doc:api`
  (API reference), `pnpm install` (lockfile); commit the regenerated output.

**Single-lane files** — at most one in-flight issue touches these (note it
when grooming): `pnpm-lock.yaml`, Drizzle migrations (`db:schema:check`
enforces one-commit discipline), and the generated trees (`.opencode/`,
`.omp/`, `packages/*/api/`).

**Releases** stay trunk-based: `main` is always releasable; a release is a
milestone-driven act (CHANGELOG cut → tag → per-package publish), not a
branch. Incomplete features merge behind `@ndigo/flags` instead of living on
long-lived branches.

<!-- graft:start -->
## Graft — repo context graph

This repo is indexed in `graft/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `graft map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `graft ask "<your question>" --source` → ranked nodes with the relevant
  code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
  definitions when the crux isn't enough). Match the tool to the task shape:
  for understanding or editing, the top node IS the answer — cite its
  `covers:` file:line spans and edit straight from `--source`. For
  exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
  results are top-N, not complete — run `graft grep "<literal>"` instead
  (exhaustive over indexed files, grouped by enclosing symbol), falling back
  to raw `grep -rn` only for unindexed files.
- `graft skeleton <file>` → every definition's signature + span, ~10× cheaper
  than reading the file; use it to skim an API surface.
- `graft callers <symbol>` gives precomputed, exact edges — who calls this.
  Add `--direction out` for what it calls, or `--depth N` to walk
  transitively for the full blast radius. For structural questions, skip
  ranking and use this directly.
- Or browse: `graft/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
  hits carry `[scope/]` labels naming which one they're from. Narrow with
  `graft ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `graft build` (deterministic,
no API key, $0).
<!-- graft:end -->
