# BlueJS Agent Guidelines

This document provides essential instructions for AI agents (and human developers) working in the BlueJS repository.

## 1. Project Overview & Environment

- **Type:** Nx Monorepo with pnpm workspaces.
- **Module System:** **ESM Only**. No CommonJS (`require`) allowed.
- **Language:** TypeScript 5.7+ (Target: ES2022).
- **Package Manager:** pnpm >= 8.0.0.
- **Node Version:** >= 18.0.0.

## 2. Core Commands

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
# Linting (ESLint)
pnpm lint

# Formatting (Prettier)
pnpm format
```

## 3. Code Style & Conventions

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
- **Predicates:** Prefix with `is` (e.g., `isString`).
- **Duck Typing:** Prefix with `like` (e.g., `likeController`).
- **Mixins:**
    - Class Mixins: `PascalCase` with `As` prefix (e.g., `AsEventEmitter(Base)`).
    - Function Mixins: `camelCase` with `as` prefix (e.g., `asEventEmitter(target)`).

### TypeScript

- **Target:** `ES2022` (supports top-level await, private fields).
- **Module Resolution:** `Bundler`.
- **Types:** Avoid `any` where possible, though strictly enforced rules are currently relaxed. Use proper generics.
- **Documentation:** Use **TSDoc** syntax (`/** ... */`) for all public APIs.

### Dependency Import Rules

A common source of errors in this repository is incorrectly importing dependencies that have complex or inconsistent ESM/CJS dual-exports. To avoid this, follow these rules:

- **`ramda`**: This library's ESM type definitions are structured in a way that requires a namespace import.
    - ❌ **Incorrect**: `import R from 'ramda';`
    - ✅ **Correct**: `import * as R from 'ramda';`

This will prevent `TypeError` exceptions at runtime. The build process may not always catch this, so it is critical to adhere to this rule during development and code review.

### Library Integration Layer Pattern

**Critical Rule:** External dependencies must be imported through their designated integration layer packages, never directly.

**Integration Layer Packages:**

| Package | Encapsulates | Import From |
| :--- | :--- | :--- |
| `@blue/util` | `ramda`, `date-fns`, `date-fns-tz`, `seedrandom`, `slug` | `@blue/util` |
| `@blue/parser` | `arcsecond` | `@blue/parser` |
| `@blue/model` | `objectmodel` | `@blue/model` |

**Import Rules by Package Type:**

1. **Integration Layer Packages** (`@blue/util`, `@blue/parser`, `@blue/model`):
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
import * as R from '@blue/util';
import { parseDate, formatDate } from '@blue/util';
import { choice, sequenceOf } from '@blue/parser';

// ❌ INCORRECT: Direct import bypasses integration layer
import * as R from 'ramda';              // Wrong! Use @blue/util
import { format } from 'date-fns';       // Wrong! Use @blue/util
import { choice } from 'arcsecond';      // Wrong! Use @blue/parser

// ✅ CORRECT: Test files may import for mocking
// In test/my-service.spec.ts
import { vi } from 'vitest';
import * as R from 'ramda';  // OK in tests for mocking
vi.mock('ramda');
```

**Common Violations to Avoid:**

```typescript
// ❌ In @blue/core/src/container.ts
import * as R from 'ramda';  // WRONG: Not in integration layer

// ✅ Correct version:
import * as R from '@blue/util';

// ❌ In @blue/router/src/matcher.ts
import { choice, sequenceOf } from 'arcsecond';  // WRONG

// ✅ Correct version:
import { choice, sequenceOf } from '@blue/parser';
```

**Enforcement:**

When reviewing or writing code:

1. **Check imports** at the top of every file
2. **Verify** no direct imports from `ramda`, `date-fns`, `arcsecond`, `objectmodel`, etc.
3. **Use search** to find violations: `rg "from ['\"]ramda['\"]" --type ts`
4. **In tests**, direct imports are OK for mocking but document why

**Updating Rules:**

When adding new integration layers or encapsulated libraries:

1. Update this section with the new mapping
2. Update `ARCHITECTURE.md` "Dependency Management Strategy" section
3. Update `CLAUDE.md` "Critical Architectural Rules" section

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

## 4. Workflows

### Modifying Code

1.  **Read:** Analyze existing code and `package.json` first.
2.  **Plan:** Check `MIGRATION-2025.md` or `CLAUDE.md` for recent architectural shifts.
3.  **Implement:** Adhere to the ESM-only mandate.
4.  **Check Dependencies:** Verify imports follow the Library Integration Layer pattern (no direct imports from encapsulated libraries).
5.  **Verify:** Always run `pnpm build` and `pnpm test` (or specific package build/test) before finishing.

### Creating New Files

- Ensure standard file headers (author/copyright) if observed in adjacent files.
- Add to `exports` in `package.json` if the file needs to be part of the public API.
