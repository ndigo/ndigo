# BlueJS Architecture & Philosophy

BlueJS is a JavaScript-first application framework inspired by the design principles of Spring MVC, adapted for the modern, multi-paradigm (OOP + FP) JavaScript ecosystem.

## Core Philosophy

1. **Universal JavaScript**: Designed to run anywhere—browser, Node.js, or hybrid environments.
2. **Composition Over Inheritance**: Leveraging mixins and functional composition (via Ramda) for flexibility.
3. **Convention Over Configuration**: Sensible defaults with powerful override capabilities.
4. **Bottom-Up Development**: Building a rock-solid foundation of utility and parser layers before implementing high-level application logic.
5. **Test-Driven Robustness**: High test coverage (>80%) is a requirement, not an afterthought.

## Layered Architecture

The framework is organized into 7 distinct layers of increasing abstraction:

| Layer | Packages | Description | Spring MVC Analogue |
| :--- | :--- | :--- | :--- |
| **6: App** | `@blue/demo` | Reference implementations and applications | User Application |
| **5: Integration** | `@blue/orm`, `@blue/auth` | Persistence, Security, and external service connectors | Spring Data / Security |
| **4: Dispatch** | `@blue/dispatcher` | The request/event routing and handling engine | `DispatcherServlet` |
| **3: Component** | `@blue/controller` | Application components, services, and controllers | `@Controller` / `@Service` |
| **2: Core** | `@blue/core` | DI container, Lifecycle management, Events, and Errors | `ApplicationContext` |
| **1: Support** | `@blue/parser`, `@blue/router`, `@blue/validate` | Schema parsing, Routing logic, and Validation | `RequestMapping` / `Validator` |
| **0: Foundation** | `@blue/util`, `@blue/print` | Low-level utilities (Ramda/date-fns) and Terminal output | Commons / Core Utils |

## Dependency Management Strategy

### Library Integration Layer Pattern

**Core Principle:** External dependencies should be encapsulated by a single BlueJS package that acts as an **integration layer**. Other packages must import functionality from the integration layer, never directly from external libraries.

**Current Integration Layers:**

| Integration Layer | Encapsulated Libraries | Purpose |
| :--- | :--- | :--- |
| `@blue/util` | `ramda`, `date-fns`, `date-fns-tz`, `seedrandom`, `slug` | Functional utilities, date handling, randomness, URL slugs |
| `@blue/parser` | `arcsecond` | Parser combinators and parsing primitives |
| `@blue/model` | `objectmodel` | Runtime type validation and model definitions |

### Usage Rules

1. **Only integration layer packages** may import from their encapsulated libraries
2. **All other packages** must import through the integration layer
3. **Test files** (`*.spec.ts`, `*.test.ts`) may import external libraries for mocking purposes
4. **Type-only imports** (`import type`) are under evaluation—current status TBD

### Examples

**✅ Correct:**

```typescript
// In @blue/core or any non-integration package
import * as R from '@blue/util';           // ✅ Import from integration layer
import { parseDate } from '@blue/util';    // ✅ Import from integration layer
```

**❌ Incorrect:**

```typescript
// In @blue/core or any non-integration package
import * as R from 'ramda';                // ❌ Direct import bypasses integration layer
import { format } from 'date-fns';         // ❌ Direct import bypasses integration layer
```

**✅ Allowed Exception (Tests):**

```typescript
// In @blue/core/test/my-service.spec.ts
import { vi } from 'vitest';
import * as R from 'ramda';                // ✅ OK in test files for mocking
vi.mock('ramda');                          // ✅ OK to mock external dependencies
```

### Rationale

1. **Version Control**: Single source of truth for library versions across the monorepo
2. **API Stability**: Integration layer can smooth over breaking changes in external libraries
3. **Migration Safety**: Easier to swap or upgrade dependencies without touching consuming code
4. **Bundle Optimization**: Centralized imports enable better tree-shaking and code splitting
5. **Type Safety**: Integration layer can provide enhanced TypeScript definitions

### Adding New Dependencies

When adding a new external dependency:

1. **Evaluate** if it should be in an existing integration layer or needs a new one
2. **Add** the dependency to the appropriate integration layer package
3. **Re-export** the necessary APIs through the integration layer's `src/index.ts`
4. **Document** the integration layer in this table
5. **Update** `AGENTS.md` and `CLAUDE.md` with the new rule

### Enforcement

- **Manual Review**: Check imports during code review
- **ESLint Plugin** (planned): Custom rule to detect direct imports of encapsulated libraries
- **CI Dependency Checker** (planned): Script to scan codebase and fail on violations

### Type-Only Imports

**Status:** Under investigation. Type-only imports (`import type { Foo } from 'ramda'`) may be permitted since they don't affect runtime bundles. Decision pending after codebase audit.

### Maintenance Note

When adding or modifying integration layer rules, remember to update:
- This section in `ARCHITECTURE.md`
- The "Library Integration Layer Pattern" section in `AGENTS.md`
- The "Critical Architectural Rules" section in `CLAUDE.md`

## Design Patterns

- **Strategy Pattern**: Used extensively in parsers and routers.
- **Factory Pattern**: Central to component instantiation in `@blue/core`.
- **Observer Pattern**: The backbone of the `@blue/core` event system.
- **Decorator/Mixin Pattern**: Used for horizontal feature composition (e.g., `AsEventEmitter`).
- **Template Method**: Used in base controller and service classes.

## Naming Conventions

- **Predicates**: `is*` (e.g., `isString`, `isNumber`) for strict type checks.
- **Duck Typing**: `like*` (e.g., `likeController`, `likePromise`) for structural compatibility.
- **Mixins**:
    - `As*` (PascalCase) for Class Mixins: `class MyService extends AsEventEmitter(Base)`.
    - `as*` (camelCase) for Function Mixins: `asEventEmitter(target)`.

## Module Visibility & API Design

### Public API Surface

Each package defines its public API through `src/index.ts`. Only modules explicitly exported are considered:
- **Stable**: Subject to semantic versioning
- **Documented**: Included in API documentation
- **Supported**: Safe for cross-package and external use

### Internal Modules (Underscore-Prefix Convention)

Files beginning with underscore (`_`) are **internal implementation details**:

| Type | Location | Purpose | Examples |
| :--- | :--- | :--- | :--- |
| **Utilities** | `src/_util.ts` | Internal helper re-exports, package-specific utilities | Parser utilities, string helpers |
| **Helpers** | `src/_parser.ts` | Low-level building blocks used by public modules | Parser primitives, internal combinators |
| **Implementations** | `src/_natural-sort.ts` | Internal algorithms not exposed directly | Sorting logic, encoding details |
| **Test Helpers** | `test/_expect.ts` | Custom test assertions and utilities | Parser test helpers, mock factories |

**Enforcement:**
1. Underscore files MUST NOT be exported in `index.ts`
2. Underscore files MUST NOT be imported across package boundaries
3. Underscore files SHOULD have JSDoc explaining their internal purpose
4. Linters/scripts MAY enforce this convention (future enhancement)

**Rationale:**
- Provides clear API boundaries without exposing implementation details
- Allows internal refactoring without breaking external consumers
- Reduces cognitive load when exploring package capabilities

## Roadmap

1. **Phase 1: Foundation (Current)**: Stabilize `@blue/util` (100% coverage) and execute the [Parser Enhancement Plan](./docs/plans/2025-01-30_PARSER_ENHANCEMENT.md) for `@blue/parser`.
2. **Phase 2: Core**: Finalize dependency injection and lifecycle hooks in `@blue/core`.
3. **Phase 3: Dispatch**: Implement the universal event/request dispatcher.
4. **Phase 4: Ecosystem**: Develop ORM and Auth modules.
5. **Phase 5: Applications**: Release reference demos and documentation site.

---
*© 2026 BlueJS Team. All rights reserved.*
