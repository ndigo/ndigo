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

## Roadmap

1. **Phase 1: Foundation (Current)**: Stabilize `@blue/util` and `@blue/parser` with 100% test coverage.
2. **Phase 2: Core**: Finalize dependency injection and lifecycle hooks in `@blue/core`.
3. **Phase 3: Dispatch**: Implement the universal event/request dispatcher.
4. **Phase 4: Ecosystem**: Develop ORM and Auth modules.
5. **Phase 5: Applications**: Release reference demos and documentation site.

---
*© 2026 BlueJS Team. All rights reserved.*
