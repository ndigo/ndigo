# BlueJS Agent Guidelines

This document provides essential instructions for AI agents (and human developers) working in the BlueJS repository.

## Quick Start for AI Agents

**Essential Commands:**

```bash
pnpm install          # Install dependencies
pnpm build           # Build all packages (~30s)
pnpm test            # Run all tests (~2min)
pnpm lint            # Check code quality
```

**Critical - Read Before Coding:**

⚠️ **Section 5 (Research Workflow)** - ALWAYS perform two-step reconnaissance before writing code. This repo is graft-indexed: run `graft ask`/`graft callers` (see the Graft section at the end) to understand code or trace callers before grepping/reading; use raw grep only for unindexed files or exhaustive checks.

⚠️ **Section 4.4 (Library Integration Layer)** - Most common error: importing seedrandom/slug directly instead of through @blue/util

⚠️ **Section 4.7 (Decorator Naming)** - All decorators MUST use camelCase

⚠️ **STYLE_GUIDE.md Sections 3.5–3.6 (is\* vs like\*)** - `is*` for type/identity checks (`typeof`, `instanceof`); `like*` for structural/duck-typing checks (property shape). Never use `instanceof` in a `like*` function.

⚠️ **STYLE_GUIDE.md Section 3.9 (Acronym Casing)** - Use all-uppercase in types (HTTPTransformer), all-lowercase or all-uppercase in identifiers (httpTransformer or myHTTPData)

⚠️ **STYLE_GUIDE.md Section 3.10 (Interfaces/Abstract Classes)** - Use description-first pattern (UserDataTransformer implements DataTransformer), Abstract prefix for abstract classes

⚠️ **STYLE_GUIDE.md Section 3.11 (Role-Based Suffixes)** - Use semantic suffixes: *Handler (processes), *Resolver (locates), *Strategy (algorithm), *Factory (creates)

⚠️ **STYLE_GUIDE.md Section 3.12 (Properties vs Methods)** - Properties for cheap/intrinsic data (O(1), no side effects), get-methods for external lookups (may fail/return null), to-methods for transformations

⚠️ **STYLE_GUIDE.md Section 3.13 (Method Naming)** - Use conventional prefixes: get* (retrieve), is* (type check), has* (presence), set* (mutate), from*/to* (convert), with\* (immutable copy). Factory functions: create* (no global state) vs get* (global state affects result).

⚠️ **STYLE_GUIDE.md Section 3.14 (Type-Safe Enums)** - Use class-based pattern for enums with methods/inheritance, built-in enums for simple constants

⚠️ **STYLE_GUIDE.md Section 9 (Self-Documenting Code)** - Names carry meaning, comments carry rationale. Document _why_, not _what_. Bare `as any`/`as unknown as T`/`// @ts-ignore` need a one-line reason; `// NOTE:` is technical debt; one public type per file, files under 300 lines.

**Pre-Commit Validation:**

```bash
# Integration layer, internal imports, and internal exports are enforced by @blue/oxlint-plugin.
# Run `pnpm lint` to check — no manual rg needed for those.

# Verify no mixed-case acronyms
rg "(class|interface|type) \w*(Http|Json|Xml|Url|Api|Html|Dto|Uuid|Uri)\w*" --type ts  # Should return nothing

# Verify Abstract prefix usage
rg "^(export )?abstract class [A-Z]" --type ts | rg -v "^(export )?abstract class Abstract"  # Should return nothing

# Verify no UPPER_SNAKE_CASE RegExp constants (objects, not primitives per @blue/core/primitive.ts)
rg "^export const [A-Z_]+.*= /" packages/*/src --type ts  # Should return nothing
rg "^const [A-Z_]+.*= /" packages/*/src --type ts        # Should return nothing

# Verify factory function naming (create* vs get*)
rg "export function get[A-Z]" packages/blue-*/src --type ts | rg -v "LoggerFactory.getLogger"  # Should return nothing
```

---

## 1. Project Overview & Environment

- **Type:** Nx Monorepo with pnpm workspaces.
- **Module System:** **ESM Only**. No CommonJS (`require`) allowed.
- **Language:** TypeScript 5.7+ (Target: ES2022).
- **Package Manager:** pnpm >= 8.0.0.
- **Node Version:** >= 18.0.0.

## 2. Documentation Guide

### STYLE_GUIDE vs ARCHITECTURE

The project maintains two complementary documentation files for different purposes:

**STYLE_GUIDE.md - "How to Write Code"**

- **Focus:** Concrete implementation rules, naming, and formatting conventions
- **Audience:** All developers (including AI agents) writing code daily
- **Content:**
    - File naming conventions (kebab-case, underscore prefix, etc.)
    - Code naming conventions (camelCase, PascalCase, UPPER_SNAKE_CASE)
    - Prettier formatting rules (indentation, quotes, semicolons, etc.)
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
| Dependency Management | "Use Library Integration Layer pattern"                   | "Import from @blue/util, not from ramda"                  |
| Code Organization     | "Use Strategy Pattern for parsers"                        | "Name parser files: kebab-case.ts in src/"                |
| Module Visibility     | "Internal modules are implementation details"             | "Prefix internal files with underscore: \_util.ts"        |
| Naming Philosophy     | "Use `is` prefix for type checks, `like` for duck-typing" | "isString checks with typeof, returns boolean"            |
| Decorators            | "Decorators enable separation of concerns"                | "@routeMapping uses camelCase, stores in Symbol.metadata" |

**Maintenance Note:** When updating the dividing line explanation, update it in both `README.md` and `AGENTS.md` to keep them synchronized.

### Package Documentation

Every package must meet the documentation standard:

- **README.md** — required sections (tagline, Installation, Getting Started,
  Usage, API *link only*, Development, Contributing, License). No internal
  tracking IDs or decision-record links in package READMEs. Template:
  `packages/blue-generators/src/generators/readme/files/README.md.template`.
- **Generated API reference** — `pnpm doc:api` writes
  `packages/<name>/doc/api/` per package (zero-warning TypeDoc standard,
  CI-enforced). After public API changes: regenerate, commit the tree.
- **Cross-package JSDoc links** — add an entry to
  `scripts/external-symbol-links.json`; never sprinkle links into package code.
- **Enforcement** — `pnpm manifest:check` (README/metadata/files), CI
  freshness diff. Full rules: `docs/guides/12-package-documentation.md`.

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
nx run @blue/core:build:lib
# OR directly in the directory
cd packages/blue-core && pnpm build:lib
```

### Testing

We use **Vitest**.

```bash
# Run all tests
pnpm test

# Run tests for a specific package
nx run @blue/core:test

# Run a SINGLE test file (Fastest)
pnpm vitest run packages/blue-core/test/deferred.spec.ts
```

### Code Quality

```bash
# Linting (oxlint)
pnpm lint

# Formatting (Prettier)
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

- **Standard:** BlueJS uses modern **TC39 Stage 3 decorators**.
- **Polyfill:** The `@tsmetadata/polyfill` is used to support `Symbol.metadata`.
- **Legacy:** `reflect-metadata` and the old `experimentalDecorators` flag are **no longer used**.
- **Further Reading:** For a deep dive into the architecture, see the "Decorators & Separation of Concerns" section in `ARCHITECTURE.md`.

### Dependency Import Rules

A common source of errors in this repository is incorrectly importing dependencies that have complex or inconsistent ESM/CJS dual-exports. To avoid this, follow these rules:

- **`ramda`**: This library's ESM type definitions are structured in a way that requires a namespace import.
    - ❌ **Incorrect**: `import R from 'ramda';`
    - ✅ **Correct**: `import * as R from 'ramda';`

This will prevent `TypeError` exceptions at runtime. The build process may not always catch this, so it is critical to adhere to this rule during development and code review.

### Library Integration Layer Pattern

**Critical Rule:** External dependencies must be imported through their designated integration layer packages, never directly.

**Integration Layer Packages:**

| Package        | Encapsulates         | Import From    |
| :------------- | :------------------- | :------------- |
| `@blue/util`   | `seedrandom`, `slug` | `@blue/util`   |
| `@blue/dom`    | `linkedom`           | `@blue/dom`    |

**Import Rules by Package Type:**

1. **Integration Layer Packages** (`@blue/util`, `@blue/dom`):

    - ✅ May import directly from their encapsulated libraries
    - ✅ Must re-export functionality through `src/index.ts`

2. **All Other Packages** (`@blue/core`, `@blue/context`, etc.):

    - ✅ Must import from integration layer packages
    - ❌ Must never import directly from encapsulated libraries

3. **Test Files** (`*.spec.ts`, `*.test.ts`):
    - ✅ May import external libraries for mocking purposes
    - ✅ May import directly for test utilities (e.g., `vitest`, `jsdom`)

**Code Examples:**

```typescript
// ✅ CORRECT: Import from integration layer
import { slugify } from '@blue/util';
import { createDOMProvider } from '@blue/dom';

// ❌ INCORRECT: Direct import bypasses integration layer
import { format } from 'date-fns'; // Wrong! Use @blue/util
import { parseHTML } from 'linkedom'; // Wrong! Use @blue/dom
```

**Common Violations to Avoid:**

```typescript
// ❌ In @blue/core/src/container.ts
import { format } from 'date-fns'; // WRONG: Not in integration layer

// ✅ Correct version:
import { format } from '@blue/util';

// ❌ In @blue/view/src/renderer.ts
import { parse } from 'linkedom'; // WRONG

// ✅ Correct version:
import { createDOMProvider } from '@blue/dom';
```

**Enforcement:**

These rules are **automatically enforced** by `@blue/oxlint-plugin`, which provides three oxlint rules:

| Rule                                  | Severity | Description                                                                                                                                                           |
| :------------------------------------ | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@blue/no-direct-integration-imports` | warn     | Forbids importing encapsulated libraries (seedrandom, slug, linkedom, etc.) outside their integration layer packages. Allows in integration packages and test files. |
| `@blue/no-internal-file-imports`      | error    | Forbids `@blue/<pkg>/_*` cross-package imports of internal files.                                                                                                     |
| `@blue/no-internal-file-exports`      | error    | Forbids `export * from './_*'` barrel re-exports in `*/src/index.ts`. Named re-exports (`export { foo } from './_*'`) are allowed (deliberate/controlled).            |

Run `pnpm lint` to check for violations. These rules are integrated into the root `.oxlintrc.json`.

When reviewing or writing code:

1. **Run `pnpm lint`** to catch violations automatically
2. **Check imports** at the top of every file
3. **In tests**, direct imports are OK for mocking but document why

**Updating Rules:**

When adding new integration layers or encapsulated libraries:

1. Update this section with the new mapping
2. Update `@blue/oxlint-plugin` constants in `packages/blue-oxlint-plugin/src/_constants.ts`
3. Update `ARCHITECTURE.md` "Dependency Management Strategy" section

### Decorator Naming and Conventions

**Critical Rule:** All decorators must use `camelCase` to align with standard TypeScript method and function naming. PascalCase is reserved for classes and types.

- ✅ **Correct:** `@routeMapping`, `@injectable`
- ❌ **Incorrect:** `@RouteMapping`, `@Injectable`

This convention is detailed in **STYLE_GUIDE.md Section 3.8**. Adherence is critical for distinguishing decorators from classes at a glance.

### Architecture & File Structure

- **Location:** Source code in `packages/<package-name>/src/`.
- **Output:** Compiled ESM files in `packages/<package-name>/lib/`.
- **Imports:** Use path aliases `@blue/*` where applicable, or relative paths within the same package.
- **Dependencies:**
    - **Runtime:** Add to `dependencies`.
    - **Development:** Add to `devDependencies`.
    - **Cross-Package:** List `@blue/*` dependencies in both `devDependencies` and `peerDependencies`.

### Internal vs Public Modules

- **Public Modules:** Exported via `packages/<package-name>/src/index.ts`. These form the stable, documented API.
- **Internal Modules:** Files prefixed with underscore (`_*.ts`) are implementation details:
    - **Source:** `src/_*.ts` - Internal utilities, helpers, re-exports
    - **Tests:** `test/_*.ts` - Test helpers, fixtures, custom assertions
    - ❌ **Never export** underscore files in public API
    - ❌ **Never import** underscore files across packages
    - ✅ **Only use** within the same package

### Error Handling

- Use specific error classes (e.g., `IllegalStateError` from `@blue/core`) rather than generic `Error` where possible.

### Utility Function Organization

When organizing helper functions and utilities, follow the extraction hierarchy:

**Decision Tree:**

1. **1 file uses** → Keep inline (regexes, functional constants)
2. **3+ files (same category)** → Extract to dedicated file (e.g., `remove-non-word.ts`)
3. **4+ files (cross-category)** → Add to internal file (e.g., `_util.ts`, `_validators.ts`)
4. **Multiple packages** → Promote to `@blue/util`

**Critical Rule:** Internal files (`_util.ts`, `_parser.ts`, etc.) must contain **actual local utility functions**, not just pass-through re-exports.

> Decision rule: If deleting all re-export lines leaves an empty file, don't create it.

**Internal File Naming:**

- `_util.ts` - Mixed-purpose utilities (often with `@blue/util` re-exports)
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

**Example:** While working in `@blue/telemetry`, you notice `formatTimestamp` appears in 5 files → create `_formatters.ts` following the guidelines in STYLE_GUIDE.md Section 4.5.

## 5. Workflows

### Modifying Code

1.  **Read:** Analyze existing code and `package.json` first.
2.  **Research:** Before writing code, understand the relevant code and avoid duplication. This repo is graft-indexed — prefer the graph:
    - **Understand first (graft):** Run `graft ask "<question>" --source` for ranked context with inlined spans, `graft callers <symbol>` for who-calls-what, `graft skeleton <file>` to skim an API. Only open a source file at the exact span the graph cites. See the Graft section at the end of this file.
    - **Fallback (unindexed/exhaustive):** When the graph lacks a detail or you need _every_ occurrence, grep the target:
        - **Step 1 - Scan target package:** Search for related functionality, established patterns, internal utilities (`_util.ts`, `_parsers.ts`), naming conventions, and design patterns currently in use.
        - **Step 2 - Scan related packages:** Check common utilities and specialized tools:
            - `@blue/util` - Common utilities (string utils, seedrandom, slug) - **Check first!**
            - `@blue/dom` - Isomorphic DOM parsing/creation (linkedom wrappers) - For HTML parsing, element creation
            - `@blue/validate` - (retired 2026-09-05 per AD-7; use `zod` via `@blue/orm` entity schemas / `@blue/dispatcher` `validatedBy`)
            - `@blue/core` - Core primitives, containers, patterns - Use for application context, DI, base types
    - **After big changes:** refresh the graph with `graft build`.
3.  **Plan:** Check `docs/migrations/` or `ARCHITECTURE.md` for recent architectural shifts.
4.  **Design Decisions:** Consider API design patterns:
    - **Property vs Method:** Use properties for cheap/intrinsic data (O(1), no side effects), get-methods for external lookups (may fail/return null), to-methods for transformations (STYLE_GUIDE.md Section 3.12)
    - **Method Naming:** Use conventional prefixes: get\* (retrieve), is\* (type check), has\* (presence), set\* (mutate), from\*/to\* (convert), with\* (immutable copy) (STYLE_GUIDE.md Section 3.13)
5.  **Implement:** Adhere to the ESM-only mandate and follow patterns discovered in research phase.
6.  **Check Dependencies:** Verify imports follow the Library Integration Layer pattern (no direct imports from encapsulated libraries).
7.  **Verify:** Always run `pnpm build` and `pnpm test` (or specific package build/test) before finishing.

### Creating New Files

- Match the standard file-header style observed in adjacent files (TSDoc module doc when the file is a module; no author/copyright lines).
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
