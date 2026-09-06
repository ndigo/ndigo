# BlueJS Architecture & Philosophy

BlueJS is a JavaScript-first application framework inspired by the design principles of Spring MVC, adapted for the modern, multi-paradigm (OOP + FP) JavaScript ecosystem.

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Foundational Principles](#foundational-principles)
    - [SOLID Principles](#solid-principles)
    - [DRY Principle](#dry-principle)
3. [Layered Architecture](#layered-architecture)
4. [Paradigm Selection Rules](#paradigm-selection-rules)
5. [Dependency Management Strategy](#dependency-management-strategy)
6. [Design Patterns](#design-patterns)
7. [Type-Safe Enum Pattern](#type-safe-enum-pattern)
    - [Overview](#overview-1)
    - [When to Use](#when-to-use)
    - [Pattern Variations](#pattern-variations)
    - [Inheritance Hierarchies](#inheritance-hierarchies)
    - [Factory Methods](#factory-methods)
    - [Common Interfaces](#common-interfaces)
    - [Implementation Checklist](#implementation-checklist)
    - [Related Pattern: Factory Registry](#related-pattern-factory-registry)
    - [Usage Examples](#usage-examples)
    - [Examples from Codebase](#examples-from-codebase)
8. [Decorators & Separation of Concerns](#decorators--separation-of-concerns)
    - [Cross-Cutting Concerns](#cross-cutting-concerns)
    - [Decorator Metadata](#decorator-metadata)
    - [Performance Considerations](#performance-considerations-2)
    - [Creating Custom Decorators](#creating-custom-decorators)
    - [Standards Compliance](#standards-compliance)
9. [Naming Conventions](#naming-conventions)
10. [Module Visibility & API Design](#module-visibility--api-design)
11. [Roadmap](#roadmap)

## Core Philosophy

1. **Universal JavaScript**: Designed to run anywhere—browser, Node.js, or hybrid environments.
2. **Composition Over Inheritance**: Leveraging mixins and functional composition (via Ramda) for flexibility.
3. **Convention Over Configuration**: Sensible defaults with powerful override capabilities.
4. **Bottom-Up Development**: Building a rock-solid foundation of utility and parser layers before implementing high-level application logic.
5. **Test-Driven Robustness**: High test coverage (>80%) is a requirement, not an afterthought.

## Foundational Principles

BlueJS architecture is built upon industry-standard design principles adapted for JavaScript/TypeScript's unique characteristics. Understanding these principles is essential for maintaining code quality, enabling extensibility, and facilitating collaboration.

### SOLID Principles

SOLID is a mnemonic for five object-oriented design principles that, when applied correctly, make software more maintainable, flexible, and scalable. While originating from traditional OOP languages, these principles are highly applicable to JavaScript/TypeScript with appropriate adaptations for its multi-paradigm nature.

#### Single Responsibility Principle (SRP)

**Definition:** A class, function, or module should have one, and only one, reason to change.

**Application in JavaScript/TypeScript:**

In JavaScript/TypeScript, SRP applies at multiple levels:

- **Classes**: Each class should encapsulate a single concern
- **Functions**: Pure functions naturally follow SRP by doing one thing well
- **Modules**: Each module should address one specific domain or feature

**BlueJS Example:**

```typescript
// ❌ Violates SRP - mixing multiple concerns
class UserController {
    validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    hashPassword(password: string): string {
        return bcrypt.hashSync(password, 10);
    }

    saveToDatabase(user: User): void {
        db.users.insert(user);
    }

    sendWelcomeEmail(user: User): void {
        emailService.send(user.email, 'Welcome!');
    }
}

// ✅ Follows SRP - separated concerns
class EmailValidator {
    validate(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

class PasswordHasher {
    hash(password: string): string {
        return bcrypt.hashSync(password, 10);
    }
}

class UserRepository {
    save(user: User): Promise<void> {
        return db.users.insert(user);
    }
}

class EmailService {
    sendWelcome(user: User): Promise<void> {
        return this.send(user.email, 'Welcome to BlueJS!');
    }
}
```

**Benefits:**

- **Easier testing**: Each class has a focused scope
- **Improved maintainability**: Changes to validation don't affect email sending
- **Better reusability**: Components can be used independently

**See also:** [Decorators & Separation of Concerns](#decorators--separation-of-concerns) for how BlueJS uses decorators to achieve SRP.

---

#### Open-Closed Principle (OCP)

**Definition:** Software entities should be open for extension but closed for modification.

**Application in JavaScript/TypeScript:**

JavaScript's dynamic nature and TypeScript's structural typing provide multiple ways to achieve OCP:

- **Composition over inheritance**: Favor object composition
- **Strategy pattern**: Pass behavior as functions or objects
- **TypeScript generics**: Type-safe extensibility
- **Higher-order functions**: Functions that return or accept functions

**BlueJS Example:**

```typescript
// ❌ Violates OCP - requires modification for new payment methods
class PaymentProcessor {
    process(payment: Payment): void {
        if (payment.method === 'stripe') {
            // Stripe-specific logic
            stripeApi.charge(payment.amount);
        } else if (payment.method === 'paypal') {
            // PayPal-specific logic
            paypalApi.charge(payment.amount);
        }
        // Adding a new method requires modifying this class
    }
}

// ✅ Follows OCP - extensible without modification
interface PaymentMethod {
    process(payment: Payment): Promise<void>;
}

class StripePayment implements PaymentMethod {
    async process(payment: Payment): Promise<void> {
        await stripeApi.charge(payment.amount);
    }
}

class PayPalPayment implements PaymentMethod {
    async process(payment: Payment): Promise<void> {
        await paypalApi.charge(payment.amount);
    }
}

class CryptoPayment implements PaymentMethod {
    async process(payment: Payment): Promise<void> {
        await blockchainApi.transfer(payment.amount);
    }
}

// Payment processor is closed for modification
class PaymentProcessor {
    constructor(private methods: Map<string, PaymentMethod>) {}

    async process(payment: Payment): Promise<void> {
        const method = this.methods.get(payment.method);
        if (!method) throw new Error(`Unknown payment method: ${payment.method}`);
        await method.process(payment);
    }
}

// Registration happens at application startup
const processor = new PaymentProcessor(
    new Map([
        ['stripe', new StripePayment()],
        ['paypal', new PayPalPayment()],
        ['crypto', new CryptoPayment()], // New method added without changing processor
    ])
);
```

**Benefits:**

- **Reduces risk**: Existing code remains untouched
- **Encourages decoupling**: New features are isolated
- **Supports plugins**: Easy to add new implementations

**See also:** [Design Patterns](#design-patterns) for Strategy and Factory patterns that enable OCP.

---

#### Liskov Substitution Principle (LSP)

**Definition:** Objects of a superclass should be replaceable with objects of a subclass without breaking the application.

**Application in JavaScript/TypeScript:**

LSP is particularly important in TypeScript due to its structural type system:

- **Structural typing**: Types are compatible if their structures match
- **Duck typing in JavaScript**: "If it walks like a duck and quacks like a duck..."
- **Contract adherence**: Subclasses must honor the base class contract

**Common Violation - Rectangle/Square Problem:**

```typescript
// ❌ Violates LSP - Square breaks Rectangle's contract
class Rectangle {
    constructor(
        protected width: number,
        protected height: number
    ) {}

    setWidth(width: number): void {
        this.width = width;
    }

    setHeight(height: number): void {
        this.height = height;
    }

    getArea(): number {
        return this.width * this.height;
    }
}

class Square extends Rectangle {
    setWidth(width: number): void {
        this.width = width;
        this.height = width; // Unexpected side effect!
    }

    setHeight(height: number): void {
        this.width = height;
        this.height = height; // Unexpected side effect!
    }
}

// Code that works with Rectangle breaks with Square
function resizeRectangle(rect: Rectangle): void {
    rect.setWidth(10);
    rect.setHeight(5);
    console.assert(rect.getArea() === 50); // ❌ Fails with Square!
}

// ✅ Follows LSP - proper abstraction
interface Shape {
    area(): number;
}

class Rectangle implements Shape {
    constructor(
        private width: number,
        private height: number
    ) {}
    area(): number {
        return this.width * this.height;
    }
}

class Square implements Shape {
    constructor(private side: number) {}
    area(): number {
        return this.side * this.side;
    }
}

function calculateTotalArea(shapes: Shape[]): number {
    return shapes.reduce((sum, shape) => sum + shape.area(), 0);
}
```

**Benefits:**

- **Predictable behavior**: Polymorphism works as expected
- **Type safety**: TypeScript catches violations at compile time
- **Reliable abstraction**: Base class contracts are honored

---

#### Interface Segregation Principle (ISP)

**Definition:** Clients should not be forced to depend on interfaces they don't use.

**Application in JavaScript/TypeScript:**

ISP is especially relevant in TypeScript with its interface system:

- **Small, focused interfaces**: Break large interfaces into smaller ones
- **Role interfaces**: Interfaces based on client needs, not implementer structure
- **Composition**: Combine small interfaces for complex types

**BlueJS Example:**

```typescript
// ❌ Violates ISP - fat interface forces unnecessary dependencies
interface DatabaseConnection {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string): Promise<any[]>;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    backup(): Promise<void>;
    restore(backupId: string): Promise<void>;
    optimize(): Promise<void>;
}

// Simple read-only service forced to implement everything
class ReportGenerator implements DatabaseConnection {
    async query(sql: string): Promise<any[]> {
        /* ... */
    }

    // Unused methods throw errors
    async beginTransaction(): Promise<void> {
        throw new Error('Transactions not supported');
    }
    async backup(): Promise<void> {
        throw new Error('Backup not supported');
    }
    // ... etc
}

// ✅ Follows ISP - segregated interfaces
interface Queryable {
    query(sql: string): Promise<any[]>;
}

interface Transactional {
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
}

interface Maintainable {
    backup(): Promise<void>;
    restore(backupId: string): Promise<void>;
    optimize(): Promise<void>;
}

// Clients depend only on what they need
class ReportGenerator {
    constructor(private db: Queryable) {}

    async generate(): Promise<Report> {
        const data = await this.db.query('SELECT * FROM reports');
        return this.formatReport(data);
    }
}

class OrderService {
    constructor(private db: Queryable & Transactional) {}

    async createOrder(order: Order): Promise<void> {
        await this.db.beginTransaction();
        try {
            await this.db.query('INSERT INTO orders ...');
            await this.db.commitTransaction();
        } catch (error) {
            await this.db.rollbackTransaction();
            throw error;
        }
    }
}
```

**Benefits:**

- **Reduced coupling**: Clients don't depend on unused functionality
- **Clearer intent**: Interface names express specific roles
- **Easier testing**: Mock only what's needed

---

#### Dependency Inversion Principle (DIP)

**Definition:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Application in JavaScript/TypeScript:**

DIP is fundamental to BlueJS's architecture:

- **Dependency injection**: Constructor or function parameter injection
- **Interface-based design**: Depend on TypeScript interfaces, not concrete classes
- **ApplicationContext**: BlueJS's DI container manages dependencies

**BlueJS Example:**

```typescript
// ❌ Violates DIP - high-level code depends on low-level implementation
import { MongoDatabase } from './mongo-database';

class UserService {
    private db = new MongoDatabase(); // Hardcoded dependency!

    async createUser(user: User): Promise<void> {
        await this.db.insert('users', user);
    }
}

// ✅ Follows DIP - depends on abstraction
interface Database {
    insert(collection: string, document: any): Promise<void>;
    find(collection: string, query: any): Promise<any[]>;
}

// High-level policy
class UserService {
    constructor(private db: Database) {} // Injected abstraction

    async createUser(user: User): Promise<void> {
        await this.db.insert('users', user);
    }
}

// Low-level implementations
class MongoDatabase implements Database {
    async insert(collection: string, document: any): Promise<void> {
        await mongoClient.collection(collection).insertOne(document);
    }

    async find(collection: string, query: any): Promise<any[]> {
        return await mongoClient.collection(collection).find(query).toArray();
    }
}

class PostgresDatabase implements Database {
    async insert(collection: string, document: any): Promise<void> {
        await pgClient.query(`INSERT INTO ${collection} ...`, document);
    }

    async find(collection: string, query: any): Promise<any[]> {
        return await pgClient.query(`SELECT * FROM ${collection} ...`, query);
    }
}

// BlueJS ApplicationContext wires dependencies
@configuration
class AppConfig {
    @entry
    database(): Database {
        return new MongoDatabase(); // Can switch to PostgresDatabase easily
    }

    @entry
    userService(db: Database): UserService {
        return new UserService(db); // Dependency injected
    }
}
```

**Benefits:**

- **Testability**: Easy to inject mocks
- **Flexibility**: Swap implementations without changing dependent code
- **Decoupling**: High-level logic independent of low-level details

**See also:** `@blue/core` package documentation for ApplicationContext and dependency injection patterns.

---

### SOLID in Functional Programming

BlueJS embraces both OOP and FP paradigms. SOLID principles have functional equivalents:

| SOLID Principle | Functional Equivalent                      |
| --------------- | ------------------------------------------ |
| **SRP**         | Single-purpose functions                   |
| **OCP**         | Higher-order functions, composition        |
| **LSP**         | Function signature consistency             |
| **ISP**         | Small, focused functions                   |
| **DIP**         | Function parameters (dependency injection) |

**Example - Functional Approach:**

```typescript
// SRP: Each function does one thing
const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hashPassword = (password: string): string => bcrypt.hashSync(password, 10);
const saveUser = (user: User): Promise<void> => db.users.insert(user);

// OCP: Extend through composition
const pipe =
    <T>(...fns: Array<(arg: T) => T>) =>
    (x: T): T =>
        fns.reduce((v, f) => f(v), x);

const processUser = pipe(normalizeUser, validateUser, enrichUserData);

// DIP: Dependencies injected as parameters
const createUserService = (repository: UserRepository, emailService: EmailService) => ({
    async register(email: string, password: string): Promise<User> {
        const hashedPassword = await hashPassword(password);
        const user = await repository.save({ email, password: hashedPassword });
        await emailService.sendWelcome(email);
        return user;
    },
});
```

---

### DRY Principle

**Definition:** "Don't Repeat Yourself" - Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.

The DRY principle aims to reduce repetition of code patterns, business logic, or configuration. However, it must be balanced with other concerns to avoid premature abstraction.

#### When to Apply DRY

**The Rule of Three:**

1. **First occurrence**: Write the code
2. **Second occurrence**: Note the similarity, but resist abstraction
3. **Third occurrence**: NOW consider abstracting

**Rationale:** You need at least three examples to understand the true axes of variability. Abstracting too early leads to the wrong abstraction, which is harder to fix than duplication.

#### Acceptable Duplication

**Accidental vs. Essential Duplication:**

```typescript
// These LOOK similar but change for different reasons
// Order confirmation email
function sendOrderConfirmation(order: Order): Promise<void> {
    return emailService.send({
        to: order.customerEmail,
        subject: 'Order #' + order.id + ' Confirmed',
        body: formatOrderDetails(order),
    });
}

// Password reset email
function sendPasswordReset(user: User, token: string): Promise<void> {
    return emailService.send({
        to: user.email,
        subject: 'Reset Your Password',
        body: formatResetLink(token),
    });
}
```

**Why duplication is acceptable:** These represent different business concerns (order processing vs. authentication). Centralizing them creates coupling between unrelated features.

**Low Rate of Change:**

```typescript
// Guard clauses that rarely change
if (user === null) {
    throw new ArgumentNullException('user');
}
if (order === null) {
    throw new ArgumentNullException('order');
}
```

Mark Seemann's formula: **Cost of duplication = C × p** where:

- **C** = Cost when change is needed
- **p** = Probability of change

If **p ≈ 0**, duplication cost is effectively zero.

#### AHA Programming: Avoid Hasty Abstractions

Coined by Cher Scarlett, popularized by Kent C. Dodds. **AHA programming** recognizes that both WET (Write Everything Twice) and overly-DRY solutions can create rigid, difficult-to-maintain software.

**Core Principle:** Optimize for change first. Abstract when duplication itself becomes the barrier, not when you think you see a pattern.

**Sandi Metz's Wisdom:** "Prefer duplication over the wrong abstraction."

**Recovering from Wrong Abstractions:**

1. **Re-introduce duplication** by inlining the abstraction
2. **Within each caller**, identify what actually executes
3. **Delete unused code** for that caller
4. **Let new patterns emerge** from simplified code
5. **Extract new abstractions** only when pattern is clear

#### Techniques for Eliminating Duplication

**1. Extract Function (Simple Cases):**

```typescript
// BEFORE: Duplicated validation
function processOrder(order: Order): void {
    if (!order || !order.id || !order.items?.length) {
        throw new Error('Invalid order');
    }
    // process...
}

function shipOrder(order: Order): void {
    if (!order || !order.id || !order.items?.length) {
        throw new Error('Invalid order');
    }
    // ship...
}

// AFTER: Extracted
function validateOrder(order: Order): void {
    if (!order || !order.id || !order.items?.length) {
        throw new Error('Invalid order');
    }
}

function processOrder(order: Order): void {
    validateOrder(order);
    // process...
}
```

**2. Strategy Pattern (Behavioral Variation):**

```typescript
interface ShippingStrategy {
    calculate(order: Order): number;
}

class StandardShipping implements ShippingStrategy {
    calculate(order: Order): number {
        return order.weight * 0.5 + 5;
    }
}

class ExpressShipping implements ShippingStrategy {
    calculate(order: Order): number {
        return order.weight * 1.5 + 10;
    }
}

const strategies: Record<string, ShippingStrategy> = {
    standard: new StandardShipping(),
    express: new ExpressShipping(),
};
```

**3. TypeScript Utility Types (Type-Level DRY):**

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    age: number;
    createdAt: Date;
}

// Derive types from single source
type UserForm = Omit<User, 'id' | 'createdAt'>;
type UserDTO = Pick<User, 'name' | 'email' | 'age'>;
type UserUpdate = Partial<UserDTO>;
```

**4. Library Integration Layer (BlueJS Pattern):**

```typescript
// @blue/util - encapsulates date-fns
export { format, parseISO, addDays } from 'date-fns';

// Custom utilities built on top
export function formatUserDate(date: Date, timezone: string): string {
    return formatInTimeZone(date, timezone, 'PP');
}

// Application code imports from @blue/util, not date-fns directly
import { formatUserDate } from '@blue/util';
```

**See also:** [Dependency Management Strategy](#dependency-management-strategy) for the Library Integration Layer pattern.

#### DRY vs. Other Principles

**DRY vs. KISS (Keep It Simple):**

When these conflict, favor simplicity over cleverness. Dan Abramov: "Sometimes duplication is simpler than the wrong abstraction."

**DRY vs. SRP:**

When removing duplication forces unrelated code into the same abstraction, **prefer SRP over DRY**. Sandi Metz: "Duplication is far cheaper than the wrong abstraction."

**DRY vs. YAGNI (You Aren't Gonna Need It):**

Don't create abstractions for hypothetical future use. Abstract when you have actual duplication, not anticipated duplication.

#### Utility Function Organization

From STYLE_GUIDE.md Section 4.5, BlueJS uses a hierarchical approach:

1. **1 file uses** → Keep inline (regex patterns, constants)
2. **3+ files (same category)** → Extract to dedicated file (`email-validator.ts`)
3. **4+ files (cross-category)** → Add to internal file (`_util.ts`, `_validators.ts`)
4. **Multiple packages** → Promote to `@blue/util`

**Critical Rule:** Internal files must contain **actual local utility functions**, not just pass-through re-exports.

**See also:** STYLE_GUIDE.md Section 4.5 for detailed examples and file size guidelines.

---

### Practical Guidelines

#### Applying SOLID and DRY in BlueJS

**1. Start with Interfaces (TypeScript):**

```typescript
// Define contracts first
export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<void>;
}

// Implement later
export class MongoUserRepository implements IUserRepository {
    // Implementation
}
```

**2. Prefer Composition Over Inheritance:**

```typescript
// ❌ Avoid deep hierarchies
class Animal {}
class Mammal extends Animal {}
class Dog extends Mammal {}

// ✅ Prefer composition
interface Behavior {
    execute(): void;
}

class Dog {
    constructor(private behaviors: Behavior[]) {}
    act(): void {
        this.behaviors.forEach((b) => b.execute());
    }
}
```

**3. Use Dependency Injection:**

```typescript
// BlueJS ApplicationContext manages this
@configuration
class AppConfig {
    @entry
    userService(repository: UserRepository, validator: UserValidator): UserService {
        return new UserService(repository, validator);
    }
}
```

**4. Avoid Over-Engineering:**

```typescript
// ❌ Over-engineered for simple case
interface INumberAdder {
    add(a: number, b: number): number;
}

class NumberAdder implements INumberAdder {
    add(a: number, b: number): number {
        return a + b;
    }
}

// ✅ Simple is better
const add = (a: number, b: number): number => a + b;
```

**5. Balance All Principles:**

- **SOLID** provides structure and extensibility
- **DRY** reduces maintenance burden
- **KISS** keeps code understandable
- **YAGNI** prevents over-engineering

The art is knowing when to apply which principle. Use pragmatism and team consensus.

#### Code Review Checklist

When reviewing code, check for:

**SOLID:**

- [ ] Does each class/function have a single, clear responsibility? (SRP)
- [ ] Can new behavior be added without modifying existing code? (OCP)
- [ ] Are subclasses truly substitutable for their base types? (LSP)
- [ ] Are interfaces small and focused on client needs? (ISP)
- [ ] Do dependencies flow toward abstractions, not concretions? (DIP)

**DRY:**

- [ ] Is duplicated code actually representing the same knowledge? (Not accidental similarity)
- [ ] Has the Rule of Three been satisfied before abstracting?
- [ ] Will the abstraction make future changes easier, not harder?
- [ ] Does the abstraction have a clear, focused purpose?

**Balance:**

- [ ] Is the code simple enough to understand quickly? (KISS)
- [ ] Are we solving actual problems, not hypothetical ones? (YAGNI)
- [ ] Do benefits of abstraction outweigh its complexity?

---

## Layered Architecture

The framework is organized into 8 architectural layers with clear dependency direction and platform-aware boundaries:

| Layer                      | Packages                                                    | Description                                                                 | Spring MVC Analogue                  |
| :------------------------- | :---------------------------------------------------------- | :-------------------------------------------------------------------------- | :----------------------------------- |
| **7: Bootstrap**           | `@blue/boot`                                                | Application bootstrap, startup orchestration, and site/app lifecycle        | `SpringApplication`                  |
| **6: Application**         | `@blue/service`, `@blue/platform-web`                       | Business services, platform adapters                                        | User application + platform adapters |
| **5: Request Processing**  | `@blue/dispatcher`, `@blue/view`, `@blue/view-webcomponent` | Front controller, handler execution, and view resolution/rendering adapters | `DispatcherServlet` + `ViewResolver` |
| **4: Web Infrastructure**  | `@blue/http`, `@blue/router`, `@blue/telemetry`             | HTTP client/interceptors/transforms, routing primitives, observability      | HTTP stack + routing + observability |
| **3: Application Context** | `@blue/context`                                             | Application context, environment, events, configuration metadata            | `ApplicationContext`                 |
| **2: Infrastructure**      | `@blue/factory`, `@blue/content`, `@blue/orm`               | IoC container internals, i18n/theming, persistence abstractions             | `BeanFactory` + `MessageSource`      |
| **1: Foundation**          | `@blue/core`, `@blue/signals`                               | Core primitives, collection types, path matching, reactive state            | Spring Core                          |
| **0: Integration Layer**   | `@blue/util`, `@blue/parser`, `@blue/dom`                   | Encapsulated third-party libraries via stable BlueJS wrappers               | Commons / utility integration layer  |

The `blue-todo` app sits above these layers as a reference implementation and integration proving ground.

### Platform Portability

BlueJS is intentionally designed for **platform portability**. The isomorphic core (factory/context/dispatcher/domain/service/content/validate with foundational packages) can execute in browser, Node.js, or hybrid deployments. Platform-specific behavior is isolated in adapter packages such as `@blue/platform-web` and `@blue/view-webcomponent`.

This architecture supports multiple deployment topologies:

1. **Full-browser**: Dispatch, service, and view all run client-side
2. **Hybrid split**: View in browser with dispatch/service in Node.js
3. **Configurable split point**: Boundary can shift based on latency, security, and UX requirements

Future platform bindings (for example `@blue/platform-node`) can provide server-specific router/environment/resource implementations without changing isomorphic core contracts.

### Architecture Overview

The following diagram illustrates dependency flow and major package groupings:

```mermaid
graph TD
    subgraph L7["Layer 7: Bootstrap"]
        Boot[@blue/boot]
    end

    subgraph L6["Layer 6: Application"]
        Service[@blue/service]
        PlatformWeb[@blue/platform-web]
    end

    subgraph L5["Layer 5: Request Processing"]
        Dispatcher[@blue/dispatcher]
        View[@blue/view]
        ViewWebComponent[@blue/view-webcomponent]
    end

    subgraph L4["Layer 4: Web Infrastructure"]
        Http[@blue/http]
        Router[@blue/router]
        Telemetry[@blue/telemetry]
    end

    subgraph L3["Layer 3: Application Context"]
        Context[@blue/context]
    end

    subgraph L2["Layer 2: Infrastructure"]
        Factory[@blue/factory]
        Content[@blue/content]
        Orm[@blue/orm]
    end

    subgraph L1["Layer 1: Foundation"]
        Core[@blue/core]
        Signals[@blue/signals]
    end

    subgraph L0["Layer 0: Integration Layer"]
        Util[@blue/util]
        Parser[@blue/parser]
        Dom[@blue/dom]
    end

    Boot --> Context
    Boot --> Dispatcher
    Service --> Http
    Service --> Telemetry
    PlatformWeb --> Context
    PlatformWeb --> Router
    Dispatcher --> Context
    Dispatcher --> Router
    Dispatcher --> View
    ViewWebComponent --> View
    Http --> Core
    Http --> Parser
    Router --> Core
    Context --> Factory
    Context --> Core
    Factory --> Core
    Content --> Core
    Core --> Util
    Signals --> Util
    Parser --> Util

    style Boot fill:#f0f0f0
    style Service fill:#fff4e1
    style PlatformWeb fill:#fff4e1
    style Dispatcher fill:#f5e1ff
    style View fill:#f5e1ff
    style ViewWebComponent fill:#f5e1ff
    style Http fill:#e1f5ff
    style Router fill:#e1f5ff
    style Telemetry fill:#e1f5ff
    style Context fill:#e1ffe5
    style Factory fill:#ffe1e1
    style Content fill:#ffe1e1
    style Core fill:#fff9e1
    style Util fill:#e1f0ff
    style Parser fill:#e1f0ff
    style Dom fill:#e1f0ff
```

**Key Principle:** Higher layers depend on lower layers, never the reverse. Some cross-layer dependencies inside adjacent architectural tiers are intentional for integration and orchestration.

## Paradigm Selection Rules

> The framework offers multiple facilities that can, superficially, solve the same problem. These rules define the single canonical use for each so developers do not invent competing idioms (see `docs/audits/2026-09-05_FRAMEWORK_ASSESSMENT.md`).

### Reactive state vs. application events

| Facility                                                     | Canonical use                                                                                                                              | Anti-pattern                                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `@blue/signals` (`signal`/`computed`/`effect`)               | **Local, synchronous, derived state** within one component or service — a value that other code reads and reacts to immediately.           | Using signals to broadcast asynchronous cross-component notifications (a "signal as an event bus"). |
| `@blue/context` `EventEmitter` (`Emitter`, `AsEventEmitter`) | **Cross-component, asynchronous application events** — decoupled publish/subscribe with `:`-hierarchy dispatch (`ApplicationEvent` style). | Using an emitter to model derived/inline state that components read synchronously.                  |

**Rule of thumb:** derived value you read → signal; thing that happened that others should react to → event.

> **Removed (2026-09-05):** `@blue/model`'s `EventModel`/`asMinimalEventEmitter` — the legacy pre-signals "observable model" emitter — has been deleted. Reactive models are now `@blue/signals`' `@reactive`/`@signal` decorators, with validation via Zod schemas (AD-7).

### Validation

- **Zod is the canonical runtime-schema primitive** (`safeParse`/`parse` + `z.infer`). Schemas validate DTOs, route params, domain value objects, and signal state; `drizzle-zod` derives entity schemas from `blue-orm`'s decorator metadata so persistence, validation, and typing share one definition. See `docs/decisions/2026-09-05_AD7_ZOD_VALIDATION.md`.
- `blue-orm` entities stay decorator-annotated (`@entity`/`@column`/`@primaryColumn`); validation is _derived from_ those annotations, not a parallel decorator API.
- `blue-validate` (constraint/decorator system) and `blue-model` (objectmodel) were retired 2026-09-05 per AD-7; do not re-add them.

### Route → handler mapping

- **Radix** mapping (`RadixMetadataHandlerMapping`) is the **only** handler mapping — trie lookup, deterministic precedence, 40–63× faster than the retired linear scan (measured in `bench/routing.bench.ts`).
- `NamePathHandlerMapping` remains the first element of the default strategy chain (name-based lookup fallback); `SimplePathHandlerMapping` is internal.
- The former `LinearMetadataHandlerMapping` was deleted 2026-09-05 (radix proved faster in every benchmark scenario and is isomorphic — browser and node both default to radix).

## Dependency Management Strategy

### Library Integration Layer Pattern

**Core Principle:** External dependencies should be encapsulated by a single BlueJS package that acts as an **integration layer**. Other packages must import functionality from the integration layer, never directly from external libraries.

**Current Integration Layers:**

| Integration Layer | Encapsulated Libraries | Purpose                                     |
| :---------------- | :--------------------- | :------------------------------------------ |
| `@blue/util`      | `seedrandom`, `slug`   | Randomness, URL slugs                       |
| `@blue/parser`    | `arcsecond`            | Parser combinators and parsing primitives   |
| `@blue/dom`       | `linkedom`             | Isomorphic DOM parsing and element creation |

### Usage Rules

1. **Only integration layer packages** may import from their encapsulated libraries
2. **All other packages** must import through the integration layer
3. **Test files** (`*.spec.ts`, `*.test.ts`) may import external libraries for mocking purposes
4. **Type-only imports** (`import type`) are under evaluation—current status TBD

### Examples

**✅ Correct:**

```typescript
// In @blue/core or any non-integration package
import { slugify } from '@blue/util'; // ✅ Import from integration layer
```

**❌ Incorrect:**

```typescript
// In @blue/core or any non-integration package
import { format } from 'date-fns'; // ❌ Direct import bypasses integration layer
```

**✅ Allowed Exception (Tests):**

```typescript
// In @blue/core/test/my-service.spec.ts
import { vi } from 'vitest';
// Mock external dependencies if needed for testing
vi.mock('@blue/util');
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
5. **Update** `AGENTS.md` and `ARCHITECTURE.md` with the new rule

### Enforcement

- **Manual Review**: Check imports during code review
- **oxlint Plugin** (implemented): Custom rule to detect direct imports of encapsulated libraries (`@blue/eslint-plugin` loaded via oxlint JS Plugins)
- **CI Dependency Checker** (planned): Script to scan codebase and fail on violations

### Type-Only Imports

**Status:** Under investigation. Type-only imports (`import type { Foo } from 'ramda'`) may be permitted since they don't affect runtime bundles. Decision pending after codebase audit.

### Maintenance Note

When adding or modifying integration layer rules, remember to update:

- This section in `ARCHITECTURE.md`
- The "Library Integration Layer Pattern" section in `AGENTS.md`
- The "Dependency Management Strategy" section in `ARCHITECTURE.md`

**See also:** [STYLE_GUIDE.md Section 4.5](./STYLE_GUIDE.md#45-utility-function-organization) for concrete implementation guidelines on organizing utilities within packages, including the critical rule that internal files (`_util.ts`, `_parser.ts`) must contain actual local utilities, not just re-exports.

## Design Patterns

BlueJS leverages established design patterns to achieve flexibility, extensibility, and maintainability. These patterns directly support the [SOLID principles](#solid-principles) documented above.

- **Strategy Pattern**: Used extensively in parsers and routers. Enables [Open-Closed Principle](#open-closed-principle-ocp) by allowing behavior to be swapped without modifying existing code.
- **Factory Pattern**: Central to component instantiation in `@blue/core`. Supports [Dependency Inversion Principle](#dependency-inversion-principle-dip) by abstracting object creation.
- **Observer Pattern**: The backbone of the `@blue/core` event system. Achieves [Open-Closed Principle](#open-closed-principle-ocp) by allowing new observers without modifying subjects.
- **Decorator/Mixin Pattern**: Used for horizontal feature composition (e.g., `AsEventEmitter`). Promotes [Single Responsibility Principle](#single-responsibility-principle-srp) by separating concerns across decorators.
- **Template Method**: Used in base controller and service classes. Follows [Open-Closed Principle](#open-closed-principle-ocp) by defining extension points.

**See also:** [Foundational Principles](#foundational-principles) for detailed SOLID and DRY guidance, including when and how to apply these patterns.

### Constructor-Factory Dual Pattern

BlueJS employs a **Constructor-Factory Dual Pattern** in several core classes, where the constructor is optimized for dependency injection scenarios, and a static factory method provides a cleaner API for direct instantiation.

#### Pattern Structure

```typescript
class Service {
    // Constructor: Optimized for DI - accepts pre-configured dependencies
    constructor(dependency1: Dependency1, dependency2: Dependency2, config: Config) {
        // Dependencies are injected by container
    }

    // Static Factory: Optimized for direct use - accepts simple config
    static create(options: Options = {}): Service {
        // Factory creates dependencies from options
        const dependency1 = new Dependency1(options.dep1Config);
        const dependency2 = new Dependency2(options.dep2Config);
        return new Service(dependency1, dependency2, options.config);
    }
}
```

#### When to Use Each Pattern

**Use Constructor When:**

- Working with ApplicationContext or DI containers
- Dependencies are managed by framework
- Following IoC (Inversion of Control) principles
- Multiple dependencies need separate configuration

**Use Static Factory When:**

- Direct instantiation in tests or scripts
- Standalone usage without DI
- Creating multiple configured instances
- Simpler API is preferred

#### Example: HTTP Client

The `HTTP` class in `@blue/http` demonstrates this pattern:

**DI Pattern (Constructor):**

```typescript
// In AsHTTPStrategy mixin (packages/blue-dispatcher)
class Application extends AsHTTPStrategy(StrategyInitializer) {
    initHTTP(context: ApplicationContext): void {
        // Framework collects interceptors from DI container
        this.initCollectionStrategy(
            context,
            'httpInterceptors',
            'httpInterceptor',
            HTTP_INTERCEPTORS,
            defaultHTTPInterceptors // 5 built-in interceptors
        );
        // Framework loads settings from configuration
        this.initStrategy(context, 'httpSettings', HTTP_SETTINGS, {});
    }

    getHTTP(fetch?: Fetch): HTTP {
        // Three separate concerns, managed by DI container
        return new HTTP(
            this.httpInterceptors, // From DI container
            this.httpSettings, // From config
            fetch // Injected for testability
        );
    }
}
```

**Direct Pattern (Static Factory):**

```typescript
// In tests, scripts, or standalone usage
const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    headers: { Authorization: 'Bearer token' },
    params: { version: 'v2' },
    interceptors: [new TimeoutInterceptor(5000), new LoggingInterceptor()],
});
```

#### Benefits

1. **Separation of Concerns**: Constructor parameters represent distinct concerns (behavior, configuration, implementation)
2. **Flexibility**: Both DI and direct usage patterns are supported
3. **Testability**: Constructor allows full control over dependencies for testing
4. **Ergonomics**: Static factory provides clean API for common use cases
5. **Backward Compatibility**: Adding factory method doesn't break existing constructor usage

#### Implementation Guidelines

When implementing this pattern:

1. **Constructor signature**: Design for DI - accept fully-constructed dependencies
2. **Factory signature**: Design for convenience - accept simple options/config objects
3. **Documentation**: Clearly document which pattern to use when
4. **Consistency**: Use consistent naming (`create()` for factory methods)
5. **Defaults**: Provide sensible defaults in factory, require explicit values in constructor

**See also:** `@blue/http` package for a complete implementation example.

## Decorators & Separation of Concerns

### Overview

Decorators are a metaprogramming feature in JavaScript and TypeScript that allow behavior to be added to classes, methods, fields, or parameters at design time. They are functions that are invoked with the decorated item as an argument, enabling them to inspect, modify, or even replace the target.

In BlueJS, decorators are the primary mechanism for achieving **separation of concerns** and **reducing boilerplate**. They enable a declarative programming style where complex, cross-cutting logic—such as routing, dependency injection, and lifecycle management—is cleanly separated from core business logic. This directly supports the [Single Responsibility Principle](#single-responsibility-principle-srp) by allowing each class to focus on its core purpose while decorators handle cross-cutting concerns.

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

Entity decorators carry validation metadata that the framework derives into a Zod schema — validation logic is co-located with the field it protects, and the derived schema is the single source of truth (AD-7).

- **Decorators**: `@column({ schema })`, `@primaryColumn`, `@generated`
- **Problem Solved**: Keeps validation with the data it protects while producing a runtime schema _and_ a static type (`z.infer`) from one declaration. Route params use `validatedBy(schema, bindValue(...))` from `@blue/dispatcher`; domain components override `validationSchemas`.

**Example:**

```typescript
import { z } from 'zod';
import { entity, column, primaryColumn } from '@blue/orm';

@entity('users')
class User {
    @primaryColumn()
    id: number;

    @column({ type: 'varchar', schema: z.string().email() })
    email: string;

    @column({ type: 'varchar', schema: z.string().regex(/^[A-Za-z\s]+$/) })
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

- **Predicates**: `is*` (e.g., `isString`, `isContextToken`) for type/identity checks using `typeof` or `instanceof`. Asks: "Is this _an instance of_ X?"
- **Duck Typing**: `like*` (e.g., `likeController`, `likeFactory`) for structural/shape checks using property presence. Asks: "Does this _behave like_ X?" Never use `instanceof` as the primary check in a `like*` function.
- **Mixins**:
    - `As*` (PascalCase) for Class Mixins: `class MyService extends AsEventEmitter(Base)`.
    - `as*` (camelCase) for Function Mixins: `asEventEmitter(target)`.

**For comprehensive naming guidelines, see:**

- **STYLE_GUIDE.md Section 3.12** - Properties vs Methods (when to use properties, get-methods, or to-methods)
- **STYLE_GUIDE.md Section 3.13** - Method Naming Conventions (get\*, is\*, has\*, set\*, from\*, to\*, with\*, etc.)
- **STYLE_GUIDE.md Section 9** - Self-Documenting Code (names carry meaning, comments carry rationale; _why_-not-_what_ comments; assertion rationale; `// NOTE:` as technical debt; one public type per file under 300 lines)

These sections provide detailed decision matrices, examples from the codebase, and rationale for choosing between different API design patterns.

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

### Current Status (March 2026)

- **Foundation is stable**: `@blue/util`, `@blue/parser`, `@blue/core`, and `@blue/signals` are mature and broadly reusable.
- **IoC/context are functional**: `@blue/factory` and `@blue/context` provide working DI/context patterns, with some infrastructure stubs still open.
- **Web stack is operational**: `@blue/http`, `@blue/router`, and `@blue/dispatcher` support a complete dispatch flow demonstrated in `blue-todo`.
- **Observability migrated**: `@blue/telemetry` now owns tracing/metrics/logging concerns; `@blue/logger` has been removed.
- **View/application layers are partial**: `@blue/view`, `@blue/view-webcomponent`, `@blue/service`, `@blue/domain`, and `@blue/boot` require focused completion work.

### Near-Term Priorities

1. ~~End-to-end telemetry integration in `blue-todo`~~ ✅
2. ~~Convention automation via `@blue/eslint-plugin`~~ ✅
3. `@blue/auth` MVP definition and implementation
4. ~~`@blue/orm` MVP definition and implementation~~ ✅

### Future Architectural Items

- **`ConversionService`** — A registry-backed type conversion service (modelled on Spring's `ConversionService`) for registering `Converter<S,T>` implementations and resolving them by source/target type at runtime. Primarily useful for HTTP argument binding (e.g. `String → UUID`, `String → Date`, `String → domain type`) and `@ConfigurationProperties`-style binding. Would be registered in `ApplicationContext` and consumed by the dispatcher's argument resolver chain. The `Converter<S, T>`, `Parser<T>`, and `Stringifier<T>` types in `@blue/core` form the intended foundation.

For strategic architecture direction (platform portability, boot lifecycle, boundary decisions, and package maturity), see [2026-03-08_ARCHITECTURE_ROADMAP.md](./docs/reference/2026-03-08_ARCHITECTURE_ROADMAP.md).

---

_© 2026 BlueJS Team. All rights reserved._
