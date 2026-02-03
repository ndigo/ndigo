# BlueJS Architecture & Philosophy

BlueJS is a JavaScript-first application framework inspired by the design principles of Spring MVC, adapted for the modern, multi-paradigm (OOP + FP) JavaScript ecosystem.

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Layered Architecture](#layered-architecture)
3. [Dependency Management Strategy](#dependency-management-strategy)
4. [Design Patterns](#design-patterns)
5. [Decorators & Separation of Concerns](#decorators--separation-of-concerns)
    - [Cross-Cutting Concerns](#cross-cutting-concerns)
    - [Decorator Metadata](#decorator-metadata)
    - [Performance Considerations](#performance-considerations)
    - [Creating Custom Decorators](#creating-custom-decorators)
    - [Standards Compliance](#standards-compliance)
6. [Naming Conventions](#naming-conventions)
7. [Module Visibility & API Design](#module-visibility--api-design)
8. [Roadmap](#roadmap)

## Core Philosophy

1. **Universal JavaScript**: Designed to run anywhere—browser, Node.js, or hybrid environments.
2. **Composition Over Inheritance**: Leveraging mixins and functional composition (via Ramda) for flexibility.
3. **Convention Over Configuration**: Sensible defaults with powerful override capabilities.
4. **Bottom-Up Development**: Building a rock-solid foundation of utility and parser layers before implementing high-level application logic.
5. **Test-Driven Robustness**: High test coverage (>80%) is a requirement, not an afterthought.

## Layered Architecture

The framework is organized into 7 distinct layers of increasing abstraction:

| Layer              | Packages                                         | Description                                              | Spring MVC Analogue            |
| :----------------- | :----------------------------------------------- | :------------------------------------------------------- | :----------------------------- |
| **6: App**         | `@blue/demo`                                     | Reference implementations and applications               | User Application               |
| **5: Integration** | `@blue/orm`, `@blue/auth`                        | Persistence, Security, and external service connectors   | Spring Data / Security         |
| **4: Dispatch**    | `@blue/dispatcher`                               | The request/event routing and handling engine            | `DispatcherServlet`            |
| **3: Component**   | `@blue/controller`                               | Application components, services, and controllers        | `@Controller` / `@Service`     |
| **2: Core**        | `@blue/core`                                     | DI container, Lifecycle management, Events, and Errors   | `ApplicationContext`           |
| **1: Support**     | `@blue/parser`, `@blue/router`, `@blue/validate` | Schema parsing, Routing logic, and Validation            | `RequestMapping` / `Validator` |
| **0: Foundation**  | `@blue/util`, `@blue/print`                      | Low-level utilities (Ramda/date-fns) and Terminal output | Commons / Core Utils           |

## Dependency Management Strategy

### Library Integration Layer Pattern

**Core Principle:** External dependencies should be encapsulated by a single BlueJS package that acts as an **integration layer**. Other packages must import functionality from the integration layer, never directly from external libraries.

**Current Integration Layers:**

| Integration Layer | Encapsulated Libraries                                   | Purpose                                                    |
| :---------------- | :------------------------------------------------------- | :--------------------------------------------------------- |
| `@blue/util`      | `ramda`, `date-fns`, `date-fns-tz`, `seedrandom`, `slug` | Functional utilities, date handling, randomness, URL slugs |
| `@blue/parser`    | `arcsecond`                                              | Parser combinators and parsing primitives                  |
| `@blue/model`     | `objectmodel`                                            | Runtime type validation and model definitions              |

### Usage Rules

1. **Only integration layer packages** may import from their encapsulated libraries
2. **All other packages** must import through the integration layer
3. **Test files** (`*.spec.ts`, `*.test.ts`) may import external libraries for mocking purposes
4. **Type-only imports** (`import type`) are under evaluation—current status TBD

### Examples

**✅ Correct:**

```typescript
// In @blue/core or any non-integration package
import * as R from '@blue/util'; // ✅ Import from integration layer
import { parseDate } from '@blue/util'; // ✅ Import from integration layer
```

**❌ Incorrect:**

```typescript
// In @blue/core or any non-integration package
import * as R from 'ramda'; // ❌ Direct import bypasses integration layer
import { format } from 'date-fns'; // ❌ Direct import bypasses integration layer
```

**✅ Allowed Exception (Tests):**

```typescript
// In @blue/core/test/my-service.spec.ts
import { vi } from 'vitest';
import * as R from 'ramda'; // ✅ OK in test files for mocking
vi.mock('ramda'); // ✅ OK to mock external dependencies
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

**See also:** [STYLE_GUIDE.md Section 4.5](./STYLE_GUIDE.md#45-utility-function-organization) for concrete implementation guidelines on organizing utilities within packages, including the critical rule that internal files (`_util.ts`, `_parser.ts`) must contain actual local utilities, not just re-exports.

## Design Patterns

- **Strategy Pattern**: Used extensively in parsers and routers.
- **Factory Pattern**: Central to component instantiation in `@blue/core`.
- **Observer Pattern**: The backbone of the `@blue/core` event system.
- **Decorator/Mixin Pattern**: Used for horizontal feature composition (e.g., `AsEventEmitter`).
- **Template Method**: Used in base controller and service classes.

## Decorators & Separation of Concerns

### Overview

Decorators are a metaprogramming feature in JavaScript and TypeScript that allow behavior to be added to classes, methods, fields, or parameters at design time. They are functions that are invoked with the decorated item as an argument, enabling them to inspect, modify, or even replace the target.

In BlueJS, decorators are the primary mechanism for achieving **separation of concerns** and **reducing boilerplate**. They enable a declarative programming style where complex, cross-cutting logic—such as routing, dependency injection, and lifecycle management—is cleanly separated from core business logic.

By annotating a class or its members, you instruct the framework to apply specific behaviors, turning complex imperative setup into a simple, readable declaration. This is all accomplished using the official **TC39 Stage 3 decorator** standard, ensuring future compatibility and adherence to the JavaScript language evolution.

### Decorators in BlueJS

BlueJS provides 16 decorators across 5 core packages, each designed to address a common cross-cutting concern. Their key benefits include:

- **Declarative Configuration**: Define component behavior with simple annotations instead of complex setup code.
- **Metadata-Driven**: Decorators attach metadata to classes, which the framework uses at runtime to wire together behavior.
- **Separation of Concerns**: Keep routing, validation, and lifecycle logic out of your business components.
- **Reduced Boilerplate**: Eliminate repetitive setup code for common tasks like component registration and dependency wiring.

### Cross-Cutting Concerns

BlueJS decorators are organized around five key cross-cutting concerns:

#### 1. Configuration & Dependency Injection

These decorators manage application configuration and dependency injection, allowing components to receive their dependencies and configuration properties without needing to know where they come from.

- **Decorators**: `@configuration`, `@entry`, `@property`, `@propertySource`, `@profile`
- **Problem Solved**: Eliminates manual dependency wiring, external configuration loading, and factory management.

**Example:**

```typescript
@configuration
class AppConfig {
    @property('database.url')
    dbUrl: string;

    @entry
    databaseConnection() {
        // This method's return value is automatically registered
        // as an injectable dependency in the application context.
        return new DatabaseConnection(this.dbUrl);
    }
}
```

#### 2. Request Routing & Dispatching

These decorators map incoming requests (e.g., HTTP requests) to specific controller methods, simplifying the creation of APIs and web controllers.

- **Decorators**: `@routeMapping`, `@errorMapping`, `@errorHandler`
- **Problem Solved**: Removes the need for manual route tables or large switch statements. Provides a declarative way to handle routing and errors.

**Example:**

```typescript
@routeMapping('/api/users')
class UserController {
    @routeMapping('/:id')
    getUserById(id: string) {
        return this.userService.findById(id);
    }

    @errorHandler(UserNotFoundError)
    handleNotFound(error: UserNotFoundError) {
        return { status: 404, message: error.message };
    }
}
```

#### 3. Lifecycle & Scope Management

These decorators control the instantiation and lifecycle of objects within the application context, defining whether an object is a singleton, a new instance per request, etc.

- **Decorators**: `@scope`, `@singletonScope`, `@prototypeScope`, `@hashScope`
- **Problem Solved**: Manages object lifecycles automatically, ensuring predictable and efficient use of resources.

**Example:**

```typescript
@singletonScope
class UserService {
    // A single instance of UserService is shared across the entire application.
}

@prototypeScope
class RequestHandler {
    // A new instance of RequestHandler is created for each request.
}
```

#### 4. Data Validation

Validation decorators attach validation rules directly to model properties, keeping validation logic co-located with the data it protects.

- **Decorators**: `@pattern`
- **Problem Solved**: Avoids scattering validation logic throughout the codebase. Provides a single source of truth for data integrity rules.

**Example:**

```typescript
class User {
    @pattern({ regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i })
    email: string;

    @pattern({ regex: /^[A-Za-z\s]+$/ })
    name: string;
}
```

#### 5. View Resolution

View decorators link components to their corresponding view templates or custom element tags, simplifying UI rendering.

- **Decorators**: `@viewMapping`, `@tagMapping`
- **Problem Solved**: Automates the registration of UI components and their association with specific views or DOM elements.

**Example:**

```typescript
@viewMapping('user-profile')
@tagMapping('user-profile')
class UserProfileComponent extends HTMLElement {
    // This class is automatically registered as the <user-profile>
    // custom element and linked to the 'user-profile' view.
}
```

### Decorator Metadata

BlueJS decorators work by attaching metadata to classes, which is then read by the framework at runtime. This process follows the TC39 standard, using the `Symbol.metadata` property on class constructors.

The flow is as follows:

```mermaid
flowchart LR
    A[Decorator Applied] --> B[Metadata Stored]
    B --> C[Symbol.metadata]
    C --> D[Runtime System]
    D --> E[Metadata Retrieved]
    E --> F[Behavior Applied]

    style A fill:#e1f5ff
    style C fill:#fff4e1
    style F fill:#e8f5e9
```

**Metadata Keys**: To avoid collisions and provide a clear structure, metadata keys follow a consistent pattern:

| Pattern                    | Example                      | Usage                 |
| -------------------------- | ---------------------------- | --------------------- |
| `concern:type`             | `'route:mapping'`            | Class-level metadata  |
| `concern:type:member`      | `'route:mapping:getUser'`    | Method-level metadata |
| `concern:parameter:member` | `'method:parameter:getUser'` | Parameter metadata    |

**MetadataManager**: The `@blue/dispatcher` package provides a `MetadataManager` class that efficiently scans, caches (in a `WeakMap`), and retrieves this metadata, acting as the bridge between declarative decorators and the framework's runtime behavior.

### Performance Considerations

While decorators are powerful, they introduce a small amount of overhead at class definition time. To ensure optimal performance, follow these best practices:

✅ **Do:**

- Keep decorator functions lightweight and focused on storing simple metadata values.
- Defer expensive logic (e.g., compiling a regex, fetching data) to the runtime components that consume the metadata.
- Use caching (like the `WeakMap` in `MetadataManager`) for repeated metadata access.

❌ **Don't:**

- Perform heavy computations or I/O operations inside a decorator function.
- Store large, complex objects or instances directly in metadata.
- Create unnecessary decorator instances in loops or high-frequency code paths.

**Example:**

```typescript
// ✅ Good: Lightweight metadata storage
function route(path: string) {
    return function (target, context) {
        // Only stores a simple string in metadata.
        context.metadata['route:path'] = path;
        return target;
    };
}

// ❌ Bad: Heavy computation at class definition time
function route(path: string) {
    return function (target, context) {
        // Don't compile regex or fetch data here! This runs
        // every time a class with this decorator is defined.
        const compiledPattern = compileComplexRoutePattern(path);
        context.metadata['route:path'] = compiledPattern;
        return target;
    };
}
```

### Creating Custom Decorators

To create a custom decorator compatible with BlueJS, adhere to the following:

1.  **Follow the TC39 Signature**: Ensure your decorator function matches the standard signature (e.g., `(target, context)`).
2.  **Use `context.metadata`**: Store metadata on the provided `context.metadata` object.
3.  **Follow Key Conventions**: Use the `concern:type:member` naming pattern for metadata keys.
4.  **Keep it Lightweight**: Defer heavy logic to a runtime processor that reads the metadata.

**Minimal Example:**

```typescript
export function customDecorator(value: string) {
    return function (target: any, context: ClassDecoratorContext) {
        context.metadata['custom:value'] = value;
        return target;
    };
}
```

### Standards Compliance

BlueJS is fully compliant with modern JavaScript standards for decorators:

- **TC39 Stage 3 Decorators**: All 16 framework decorators use the official TC39 Stage 3 decorator specification.
- **`Symbol.metadata`**: Metadata is stored in the standard `Symbol.metadata` property.
- **`@tsmetadata/polyfill`**: This polyfill is used to ensure `Symbol.metadata` is available across all supported JavaScript environments, providing a seamless and standards-compliant experience.

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

| Type                | Location               | Purpose                                                | Examples                                |
| :------------------ | :--------------------- | :----------------------------------------------------- | :-------------------------------------- |
| **Utilities**       | `src/_util.ts`         | Internal helper re-exports, package-specific utilities | Parser utilities, string helpers        |
| **Helpers**         | `src/_parser.ts`       | Low-level building blocks used by public modules       | Parser primitives, internal combinators |
| **Implementations** | `src/_natural-sort.ts` | Internal algorithms not exposed directly               | Sorting logic, encoding details         |
| **Test Helpers**    | `test/_expect.ts`      | Custom test assertions and utilities                   | Parser test helpers, mock factories     |

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

_© 2026 BlueJS Team. All rights reserved._
