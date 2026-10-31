# BlueJS Architecture & Philosophy

BlueJS is a JavaScript-first application framework built on the enduring architectural principles that modern DI-and-dispatch frameworks share — inversion of control, declarative metadata, a layered object graph, and platform portability — adapted for the multi-paradigm (OOP + FP) JavaScript ecosystem.

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Foundational Principles](#foundational-principles)
    - [SOLID Principles](#solid-principles)
    - [DRY Principle](#dry-principle)
3. [Layered Architecture](#layered-architecture)
4. [Paradigm Selection Rules](#paradigm-selection-rules)
5. [Dependency Management Strategy](#dependency-management-strategy)
6. [Design Patterns](#design-patterns)
7. [Decorators & Separation of Concerns](#decorators--separation-of-concerns)
    - [Cross-Cutting Concerns](#cross-cutting-concerns)
    - [Decorator Metadata](#decorator-metadata)
    - [Performance Considerations](#performance-considerations)
    - [Creating Custom Decorators](#creating-custom-decorators)
    - [Standards Compliance](#standards-compliance)
8. [Naming Conventions](#naming-conventions)
9. [Module Visibility & API Design](#module-visibility--api-design)
10. [Node Platform & Application Lifecycle](#node-platform--application-lifecycle)
11. [Roadmap](#roadmap)

## Core Philosophy

1. **Universal JavaScript**: Designed to run anywhere—browser, Node.js, or hybrid environments.
2. **Composition Over Inheritance**: Leveraging mixins and functional composition for flexibility.
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
// @blue/util - the integration layer for its encapsulated libraries.
// The imports live inside @blue/util (e.g. src/string/slugify.ts,
// src/math/random.ts, src/string/to-reg-exp.ts) and are re-exported through
// stable category surfaces:
import slug from 'slug';
import alea from 'seedrandom/lib/alea.js';
import safeRegex from 'safe-regex';

export function uniqueSlug(title: string): string {
    return `${slug(title)}-${alea().toString(36).slice(2, 8)}`;
}

export function assertSafeRegex(source: string): boolean {
    return safeRegex(source);
}

// Application code imports from @blue/util, not from the encapsulated libraries
import { string, math } from '@blue/util';

string.slugify('Hello World');
math.random();
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

| Layer                      | Packages                                                                                                                                                                                                                                                   | Description                                                                                                                                                                                       | Design Analogue                       |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------ |
| **7: Bootstrap**           | `@blue/boot`                                                                                                                                                                                                                                               | Application bootstrap, startup orchestration, and context assembly                                                                                                                                | Application bootstrap entrypoint      |
| **6: Application**         | `@blue/service`, `@blue/management`, `@blue/openapi`, `@blue/platform-node`, `@blue/cluster`, `@blue/platform-web`, `@blue/auth-core`, `@blue/auth-client`, `@blue/auth-server`, `@blue/host`, `@blue/telemetry-node`, `@blue/telemetry-web`, `@blue/test` | Business services, platform adapters, API docs generation, auth (contracts + client + server), process supervision, micro-frontend shell, Node/browser telemetry wiring, integration test harness | App services + platform adapters      |
| **5: Request Processing**  | `@blue/dispatcher`, `@blue/view`, `@blue/view-webcomponent`, `@blue/view-ejs`                                                                                                                                                                              | Front controller, handler execution, view resolution and rendering adapters (Web Components, EJS)                                                                                                 | Front controller + view resolution    |
| **4: Web & Runtime Infra** | `@blue/http`, `@blue/router`, `@blue/telemetry`, `@blue/socket`, `@blue/scheduler`, `@blue/jobs`, `@blue/locks`, `@blue/redis`                                                                                                                             | HTTP client/interceptors/transforms, routing primitives, websocket domain, cron scheduling, observability, durable jobs, distributed locks, distributed backends                                  | HTTP vocabulary + routing + telemetry |
| **3: Application Context** | `@blue/context`                                                                                                                                                                                                                                            | Application context, environment, events, configuration metadata                                                                                                                                  | DI container + application context    |
| **2: Infrastructure**      | `@blue/factory`, `@blue/content`, `@blue/content-i18next`, `@blue/cache`, `@blue/orm`, `@blue/orm-drizzle`, `@blue/proxy`, `@blue/resilience`                                                                                                              | IoC container internals, i18n/theming, caching, persistence abstractions + Drizzle adapter, method interception + resilience                                                                      | IoC container internals + theme/i18n  |
| **1: Foundation**          | `@blue/core`, `@blue/signals`, `@blue/log`                                                                                                                                                                                                                 | Core primitives, collection types, path matching, reactive state, logging core                                                                                                                    | Core primitives + reactive state      |
| **0: Integration Layer**   | `@blue/util`, `@blue/dom` (+ tooling: `@blue/oxlint-plugin`, `@blue/generators`)                                                                                                                                                                           | Encapsulated third-party libraries via stable BlueJS wrappers                                                                                                                                     | Third-party facade + utility layer    |

> **Package Map:** the canonical per-package reference (purpose · platform ·
> runtime deps) — see [§ Package Map](#package-map) below.

The `blue-todo` app sits above these layers as a reference implementation and integration proving ground.

### Platform Portability

BlueJS is intentionally designed for **platform portability**. The isomorphic core (factory/context/dispatcher/service/content with foundational packages) can execute in browser, Node.js, or hybrid deployments. Platform-specific behavior is isolated in adapter packages such as `@blue/platform-web` and `@blue/view-webcomponent`.

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
        Management[@blue/management]
        OpenAPI[@blue/openapi]
        PlatformNode[@blue/platform-node]
        PlatformWeb[@blue/platform-web]
        AuthCore[@blue/auth-core]
        AuthClient[@blue/auth-client]
        AuthServer[@blue/auth-server]
        Host[@blue/host]
        TelemetryNode[@blue/telemetry-node]
        TelemetryWeb[@blue/telemetry-web]
        Test[@blue/test]
    end

    subgraph L5["Layer 5: Request Processing"]
        Dispatcher[@blue/dispatcher]
        View[@blue/view]
        ViewWebComponent[@blue/view-webcomponent]
        ViewEJS[@blue/view-ejs]
    end

    subgraph L4["Layer 4: Web & Runtime Infrastructure"]
        Http[@blue/http]
        Router[@blue/router]
        Telemetry[@blue/telemetry]
        Socket[@blue/socket]
        Scheduler[@blue/scheduler]
        Redis[@blue/redis]
    end

    subgraph L3["Layer 3: Application Context"]
        Context[@blue/context]
    end

    subgraph L2["Layer 2: Infrastructure"]
        Factory[@blue/factory]
        Content[@blue/content]
        ContentI18Next[@blue/content-i18next]
        Cache[@blue/cache]
        Orm[@blue/orm]
        OrmDrizzle[@blue/orm-drizzle]
        Proxy[@blue/proxy]
        Resilience[@blue/resilience]
    end

    subgraph L1["Layer 1: Foundation"]
        Core[@blue/core]
        Signals[@blue/signals]
        Log[@blue/log]
    end

    subgraph L0["Layer 0: Integration Layer"]
        Util[@blue/util]
        Dom[@blue/dom]
    end

    Boot --> Core
    Boot --> Context
    Boot --> Router
    Host --> Core
    Host --> Context
    Host --> Router
    Test --> Context
    Test --> Dispatcher
    Test --> PlatformNode
    Test --> PlatformWeb
    Test --> Router
    Test --> Util
    Test --> View
    Management --> Core
    Management --> Context
    Management --> Dispatcher
    Management --> Telemetry
    Service --> Core
    Service --> Context
    Service --> Factory
    Service --> Http
    Service --> Util
    AuthClient --> AuthCore
    AuthClient --> Http
    AuthServer --> AuthCore
    AuthServer --> Dispatcher
    AuthServer --> Router
    TelemetryNode --> Telemetry
    TelemetryNode --> PlatformNode
    TelemetryNode --> Dispatcher
    TelemetryNode --> Router
    TelemetryNode --> Socket
    TelemetryNode --> View
    TelemetryNode --> Context
    TelemetryNode --> Core
    TelemetryWeb --> Telemetry
    TelemetryWeb --> PlatformWeb
    TelemetryWeb --> Dispatcher
    TelemetryWeb --> Router
    TelemetryWeb --> Socket
    TelemetryWeb --> Context
    PlatformNode --> AuthCore
    PlatformNode --> Cache
    PlatformNode --> Scheduler
    PlatformNode --> Socket
    PlatformNode --> Dispatcher
    PlatformNode --> Http
    PlatformNode --> Router
    PlatformNode --> View
    PlatformNode --> Context
    PlatformNode --> Core
    PlatformNode --> Factory
    PlatformNode --> Util
    PlatformWeb --> Content
    PlatformWeb --> Dispatcher
    PlatformWeb --> Http
    PlatformWeb --> Router
    PlatformWeb --> Signals
    PlatformWeb --> Socket
    PlatformWeb --> View
    PlatformWeb --> ViewWebComponent
    PlatformWeb --> Context
    PlatformWeb --> Core
    PlatformWeb --> Util
    Dispatcher --> Content
    Dispatcher --> Context
    Dispatcher --> Core
    Dispatcher --> Factory
    Dispatcher --> Http
    Dispatcher --> Router
    Dispatcher --> Socket
    Dispatcher --> Util
    Dispatcher --> View
    View --> Context
    View --> Core
    View --> Factory
    View --> Router
    View --> Util
    ViewWebComponent --> Context
    ViewWebComponent --> Core
    ViewWebComponent --> Factory
    ViewWebComponent --> Router
    ViewWebComponent --> View
    ViewEJS --> Content
    ViewEJS --> Context
    ViewEJS --> Core
    ViewEJS --> Router
    ViewEJS --> View
    Socket --> Core
    Socket --> Signals
    Scheduler --> Context
    Scheduler --> Core
    Scheduler --> Util
    Telemetry --> Context
    Telemetry --> Core
    Telemetry --> Dispatcher
    Telemetry --> Log
    Telemetry --> Router
    Router --> Core
    Router --> Factory
    Router --> Http
    Router --> Util
    Http --> Core
    Http --> Factory
    Http --> Util
    Orm --> Core
    Orm --> Factory
    OrmDrizzle --> Core
    OrmDrizzle --> Orm
    OrmDrizzle --> Socket
    Proxy --> Core
    Proxy --> Factory
    Resilience --> Proxy
    Redis --> Cache
    Redis --> Factory
    Redis --> Socket
    OpenAPI --> Core
    OpenAPI --> Dispatcher
    OpenAPI --> Http
    Content --> Core
    Content --> Factory
    Content --> Util
    ContentI18Next --> Content
    Context --> Content
    Context --> Core
    Context --> Factory
    Context --> Util
    Factory --> Core
    Factory --> Log
    Factory --> Util
    Core --> Util

    style Boot fill:#f0f0f0
    style Service fill:#fff4e1
    style Management fill:#fff4e1
    style PlatformNode fill:#fff4e1
    style PlatformWeb fill:#fff4e1
    style AuthCore fill:#fff4e1
    style AuthClient fill:#fff4e1
    style AuthServer fill:#fff4e1
    style Host fill:#fff4e1
    style TelemetryNode fill:#fff4e1
    style TelemetryWeb fill:#fff4e1
    style Test fill:#fff4e1
    style Dispatcher fill:#f5e1ff
    style View fill:#f5e1ff
    style ViewWebComponent fill:#f5e1ff
    style ViewEJS fill:#f5e1ff
    style Http fill:#e1f5ff
    style Router fill:#e1f5ff
    style Telemetry fill:#e1f5ff
    style Socket fill:#e1f5ff
    style Scheduler fill:#e1f5ff
    style Context fill:#e1ffe5
    style Factory fill:#ffe1e1
    style Content fill:#ffe1e1
    style ContentI18Next fill:#ffe1e1
    style Cache fill:#ffe1e1
    style Orm fill:#ffe1e1
    style OrmDrizzle fill:#ffe1e1
    style Core fill:#fff9e1
    style Signals fill:#fff9e1
    style Log fill:#fff9e1
    style Proxy fill:#ffe1e1
    style Resilience fill:#ffe1e1
    style Redis fill:#e1f5ff
    style OpenAPI fill:#fff4e1
    style Util fill:#e1f0ff
    style Dom fill:#e1f0ff
```

> Edges mirror runtime (`src/`) imports. `scripts/check-manifests.mjs` (CI)
> enforces import ↔ manifest consistency in both directions; keep this
> diagram and the Package Map in step with the manifests when they change.
> `@blue/cache`, `@blue/signals`, `@blue/dom`, `@blue/auth-core`,
> `@blue/util`, and `@blue/log` depend on no BlueJS package.

**Key Principle:** Higher layers depend on lower layers, never the reverse. Some cross-layer dependencies inside adjacent architectural tiers are intentional for integration and orchestration. The stack is acyclic — `pnpm build` fails on any cycle in the Nx task graph.

### Package Map

Canonical reference for every publishable package: purpose · layer · platform · runtime dependencies. The **Runtime deps** column lists BlueJS dependencies only; notable external libraries appear in parentheses in the **Purpose** column (illustrative, not exhaustive — the package manifest is the source of truth for externals). `scripts/check-manifests.mjs` (CI, `pnpm manifest:check`) enforces that every runtime import is declared and every declared dependency is used; the columns below are maintained by hand from the manifests — update this table whenever manifests or imports change.

| Package                   | Layer   | Platform | Purpose                                                                                                                                                                    | Runtime deps                                                                                      |
| :------------------------ | :------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `@blue/util`              | 0       | iso      | Utility helpers: types, string, math, object (`safe-regex`, `seedrandom`, `slug`)                                                                                          | —                                                                                                 |
| `@blue/dom`               | 0       | iso      | Isomorphic DOM parsing/creation (`linkedom`)                                                                                                                               | —                                                                                                 |
| `@blue/core`              | 1       | iso      | Primitives, collections, radix tree, metadata, events (`semver`, `zod`)                                                                                                    | `util`                                                                                            |
| `@blue/signals`           | 1       | iso      | Reactive state: signals, computed, effects (`@preact/signals-core`)                                                                                                        | `log`                                                                                             |
| `@blue/log`               | 1       | iso      | Logging core: logger abstraction, severity mappings, threshold filtering (`@opentelemetry/api`)                                                                            | —                                                                                                 |
| `@blue/factory`           | 2       | iso      | IoC container: scopes, lifecycle, entry/aware processors                                                                                                                   | `core`, `log`, `util`                                                                             |
| `@blue/content`           | 2       | iso      | i18n content keys, themes, `MessageSource` contract                                                                                                                        | `core`, `factory`, `util`                                                                         |
| `@blue/content-i18next`   | 2       | iso      | i18next `MessageSource` adapter (`i18next`)                                                                                                                                | `content`                                                                                         |
| `@blue/cache`             | 2       | iso      | Cache manager + `@cached` decorator (AD-24)                                                                                                                                | `context`, `factory`, `log`                                                                       |
| `@blue/orm`               | 2       | iso      | Repository/data-mapper persistence abstractions, `@entity` decorators (`zod`)                                                                                              | `core`, `factory`                                                                                 |
| `@blue/orm-drizzle`       | 2       | node     | Drizzle ORM adapter for `@blue/orm` (`drizzle-orm`, `drizzle-zod`, `@libsql/client`)                                                                                       | `auth-core`, `core`, `jobs`, `orm`, `socket`, `util`                                              |
| `@blue/proxy`             | 2       | iso      | Method interception: annotation-driven advice weaving (`@tsmetadata/polyfill`)                                                                                             | `core`, `factory`, `log`                                                                          |
| `@blue/resilience`        | 2       | iso      | Resilience policies: `@retry` + `@circuitBreaker` interceptors                                                                                                             | `proxy`                                                                                           |
| `@blue/rate-limit`        | 2       | iso      | Fixed-window rate limiting: `RateLimiter` SPI (async, AD-79), `FixedWindowRateLimiter`, `RATE_LIMITER` token (AD-33/AD-79)                                                 | `factory`                                                                                         |
| `@blue/flags`             | 2       | iso      | Feature flags (AD-82): `FlagEvaluator` SPI (typed, async, never-throw), `PropertyFlagProvider`, `@whenFeature` gate metadata, `FLAG_EVALUATOR` token                       | `factory`                                                                                         |
| `@blue/context`           | 3       | iso      | Application context, environments, configuration, events (`zod`)                                                                                                           | `content`, `core`, `factory`, `log`, `util`                                                       |
| `@blue/http`              | 4       | iso      | Fetch client, interceptors, content parsing, transforms (`@opentelemetry/api`)                                                                                             | `core`, `factory`, `util`                                                                         |
| `@blue/router`            | 4       | iso      | Route registry, path partitions, feature routing                                                                                                                           | `core`, `factory`, `http`, `log`, `util`                                                          |
| `@blue/telemetry`         | 4       | iso      | OTel surface: metrics, tracing decorators, framework instrumentations; re-exports `@blue/log`                                                                              | `context`, `core`, `dispatcher`, `log`, `router`                                                  |
| `@blue/socket`            | 4       | iso      | WebSocket domain: STOMP client, session contracts (AD-21/22/23)                                                                                                            | `core`, `signals`                                                                                 |
| `@blue/scheduler`         | 4       | node     | Cron scheduling: `@scheduled`, task registry, tracing (`croner`)                                                                                                           | `context`, `core`, `factory`, `locks`, `log`, `util`                                              |
| `@blue/jobs`              | 4       | node     | Durable job queues, worker execution, transactional outbox (AD-72) (`@opentelemetry/api`)                                                                                  | `context`, `core`, `factory`, `log`, `util`                                                       |
| `@blue/locks`             | 4       | node     | Distributed locks + fencing tokens (AD-73): in-process default driver, `@scheduled({lock})` seam                                                                           | `core`, `factory`                                                                                 |
| `@blue/redis`             | 4       | node     | Redis backends: shared cache + pub/sub fan-out + jobs/lock/rate-limit drivers (AD-79) (`@redis/client`; peers `cache`, `factory`, `jobs`, `locks`, `rate-limit`, `socket`) | `core`, `log`                                                                                     |
| `@blue/view`              | 5       | iso      | Views, `ViewTarget`s, content negotiation, serialization                                                                                                                   | `context`, `core`, `factory`, `http`, `router`, `util`                                            |
| `@blue/view-webcomponent` | 5       | browser  | Web Component view technology                                                                                                                                              | `context`, `core`, `factory`, `log`, `router`, `view`                                             |
| `@blue/view-ejs`          | 5       | node     | EJS server-side template view technology (`ejs`)                                                                                                                           | `view`, `content`, `context`, `core`, `router`                                                    |
| `@blue/dispatcher`        | 5       | iso      | Front controller: request dispatch, parameter binding, radix handler mappings (`zod`)                                                                                      | `view`, `router`, `http`, `socket`, `context`, `content`, `core`, `factory`, `log`, `util`        |
| `@blue/service`           | 6       | iso      | Typed service clients, SSE/streaming (`zod`)                                                                                                                               | `http`, `context`, `core`, `factory`, `util`                                                      |
| `@blue/management`        | 6       | node     | Actuator endpoints: `/health`, `/metrics` (meter snapshot — Prometheus text + JSON, AD-77)                                                                                 | `context`, `core`, `dispatcher`, `http`, `log`, `platform-node`, `telemetry`, `util`              |
| `@blue/openapi`           | 6       | iso      | OpenAPI 3.0.3 generation from dispatch metadata (`zod`)                                                                                                                    | `core`, `dispatcher`, `http`                                                                      |
| `@blue/host`              | 6       | browser  | Micro-frontend shell orchestration, feature mounting (AD-18)                                                                                                               | `context`, `core`, `router`                                                                       |
| `@blue/auth-core`         | 6       | iso      | Auth contracts: principal, sessions, password encoders, `@authenticated`/`@authorized`                                                                                     | —                                                                                                 |
| `@blue/auth-client`       | 6       | browser  | Client auth: `AuthClient`, `ClientAuthGuard`, OIDC (`jose`)                                                                                                                | `auth-core`, `http`, `util`                                                                       |
| `@blue/auth-server`       | 6       | node     | Server auth: `AuthServer`, `AuthRouteGuard`, JWT (`jose`)                                                                                                                  | `auth-core`, `dispatcher`, `router`, `util`                                                       |
| `@blue/platform-node`     | 6       | node     | Node platform: HTTP server adapter, auto-configuration, static files, multipart (`busboy`, `helmet`, `ws`)                                                                 | 18 BlueJS deps — hub                                                                              |
| `@blue/cluster`           | 6       | node     | Process supervisor: replicated worker slots, signal relay, bounded restarts (AD-74)                                                                                        | `log`                                                                                             |
| `@blue/cli`               | 6       | node     | Framework CLI: serve/dev/generate/db/inspect/doctor on `@oclif/core` ^5 (AD-75)                                                                                            | `cluster`, `@oclif/core`                                                                          |
| `@blue/platform-web`      | 6       | browser  | Browser platform glue: dispatcher, history/cookie/data-binding resolvers, theme                                                                                            | 12 BlueJS deps — hub                                                                              |
| `@blue/telemetry-node`    | 6       | node     | OTel NodeSDK wiring + Node instrumentations (10 OTel packages; peer `ws`)                                                                                                  | `telemetry`, `platform-node`, `router`, `socket`, `view`, `log`                                   |
| `@blue/telemetry-web`     | 6       | browser  | Browser SDK wiring + web instrumentations (8 OTel packages)                                                                                                                | `log`, `platform-web`, `socket`, `telemetry`                                                      |
| `@blue/test`              | 6       | iso      | In-process request dispatch test harness (MockMVC-style)                                                                                                                   | `platform-node`, `platform-web`, `dispatcher`, `router`, `view`, `context`, `http`, `log`, `util` |
| `@blue/boot`              | 7       | node     | Application bootstrap: profiles, typed config, `run()` (`zod`; peer `@toon-format/toon`)                                                                                   | `context`, `core`, `factory`, `log`, `router`, `util`                                             |
| `@blue/oxlint-plugin`     | tooling | —        | Architecture-enforcing oxlint rules (CI) (`@oxlint/plugins`; peer `oxlint`)                                                                                                | —                                                                                                 |
| `@blue/inspect`           | tooling | —        | App manifest: routes, handler mappings, declared configuration keys (programmatic API + demo script)                                                                       | `context`, `core`, `dispatcher`, `router`                                                         |
| `@blue/generators`        | tooling | —        | Nx generators: package/component/readme scaffolding (`@nx/devkit`)                                                                                                         | `util`                                                                                            |

**Standalone use:** every package resolves its own install closure — `npm install @blue/http` pulls exactly `core`, `factory`, `util` and its external deps; no hand-assembled peer list. `peerDependencies` is allowlisted per package for host-provided contracts (`oxlint-plugin → oxlint`, `telemetry-node → ws`, `platform-node → swagger-ui-dist`, `boot → @toon-format/toon`, `redis → cache`/`factory`/`jobs`/`locks`/`rate-limit`/`socket`). See [Manifest Dependency Sections](#manifest-dependency-sections).

## Paradigm Selection Rules

> The framework offers multiple facilities that can, superficially, solve the same problem. These rules define the single canonical use for each so developers do not invent competing idioms (see `docs/audits/2026-09-05_FRAMEWORK_ASSESSMENT.md`).

### Reactive state vs. application events

| Facility                                                                      | Canonical use                                                                                                                                           | Anti-pattern                                                                                        |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `@blue/signals` (`signal`/`computed`/`effect`)                                | **Local, synchronous, derived state** within one component or service — a value that other code reads and reacts to immediately.                        | Using signals to broadcast asynchronous cross-component notifications (a "signal as an event bus"). |
| `@blue/context` `EventEmitter` (`Emitter`, `AsEventEmitter`)                  | **Cross-component, asynchronous application events** — decoupled publish/subscribe with `:`-hierarchy dispatch (`ApplicationEvent` style).              | Using an emitter to model derived/inline state that components read synchronously.                  |
| SSE (`ServerSentEventView`, `serviceClient` `stream: true`)                   | **Server→client one-way event stream** — the island-reactivity channel; handler-owned, per-request state (AD-09).                                       | Using WebSockets for one-way notifications that SSE already covers.                                 |
| WebSocket + STOMP (`@socketMapping`, `SocketSession` rooms, STOMP `/topic/*`) | **Bidirectional, session-scoped channels** — rooms/broadcast, heartbeat reaping, STOMP destinations; cross-node via opt-in fanout (AD-21/22/23, AD-40). | Broadcasting application-wide events over a socket channel instead of the context event bus.        |
| Async iterables (`ServiceClient.stream`, `SocketSession.messages`)            | **Consumer-driven consumption of an open stream** — typed, backpressured iteration over pushed values.                                                  | Materializing a whole stream into an array before reading it.                                       |

**Rule of thumb:** derived value you read → signal; thing that happened that others should react to → event.

> **Removed (2026-09-05):** `@blue/model`'s `EventModel`/`asMinimalEventEmitter` — the legacy pre-signals "observable model" emitter — has been deleted. Reactive models are now `@blue/signals`' `@reactive`/`@signal` decorators, with validation via Zod schemas (AD-07).

### Validation

- **Zod is the canonical runtime-schema primitive** (`safeParse`/`parse` + `z.infer`). Schemas validate DTOs, route params, domain value objects, and signal state; `drizzle-zod` derives entity schemas from `blue-orm`'s decorator metadata so persistence, validation, and typing share one definition. See `docs/decisions/2026-09-05_AD07_ZOD_VALIDATION.md`.
- `blue-orm` entities stay decorator-annotated (`@entity`/`@column`/`@primaryColumn`); validation is _derived from_ those annotations, not a parallel decorator API.
- `blue-validate` (constraint/decorator system) and `blue-model` (objectmodel) were retired 2026-09-05 per AD-07; do not re-add them.

### Route → handler mapping

- **Radix** mapping (`RadixMetadataHandlerMapping`) is the **only** handler mapping — trie lookup, deterministic precedence, 40–63× faster than the retired linear scan (measured in `bench/routing.bench.ts`).
- `NamePathHandlerMapping` remains the first element of the default strategy chain (name-based lookup fallback); `SimplePathHandlerMapping` is internal.
- The former `LinearMetadataHandlerMapping` was deleted 2026-09-05 (radix proved faster in every benchmark scenario and is isomorphic — browser and node both default to radix).

## Dependency Management Strategy

### Library Integration Layer Pattern

**Core Principle:** External dependencies should be encapsulated by a single BlueJS package that acts as an **integration layer**. Other packages must import functionality from the integration layer, never directly from external libraries.

**Current Integration Layers:**

| Integration Layer | Encapsulated Libraries             | Purpose                                            |
| :---------------- | :--------------------------------- | :------------------------------------------------- |
| `@blue/util`      | `safe-regex`, `seedrandom`, `slug` | ReDoS-safe regex validation, randomness, URL slugs |
| `@blue/dom`       | `linkedom`                         | Isomorphic DOM parsing and element creation        |

The encapsulated-library set is the set enforced by the
`@blue/no-direct-integration-imports` oxlint rule (`INTEGRATION_LAYER_MAP` in
`@blue/oxlint-plugin`, wired through `.oxlintrc.json`; the lint lane runs
`--deny-warnings`, so a violation fails CI). Add the library there first, then
here.

### Manifest Dependency Sections

Every package declares exactly the dependencies it uses, in three enforced
sections (`scripts/check-manifests.mjs` — CI, `pnpm manifest:check`):

1. **`dependencies`** — every import made from `src/`, including `@blue/*`.
   This is the standalone-install closure: `npm install @blue/http` pulls
   `core`, `factory`, `util`, and OTel's API automatically.
2. **`devDependencies`** — imports used only by `test/`, `bench/`, and root
   `vitest.config.ts`/`vite.config.ts`, plus `@types/*` and build tooling.
3. **`peerDependencies`** — reserved for host-provided contracts, allowlisted
   per package in the checker (`PEER_ALLOWLIST` in
   `scripts/check-manifests.mjs` — the single source of truth): `@blue/oxlint-plugin
   → oxlint` (plugin contract), `@blue/telemetry-node → ws` (host-provided
   types), `@blue/platform-node → swagger-ui-dist` (asset-only docs UI),
   `@blue/redis → @blue/cache`/`@blue/factory`/`@blue/socket` (node-only
   capability subpaths), and `@blue/boot → @toon-format/toon` (optional; AD-66).
   Any new peer needs a deliberate decision + allowlist entry in the checker.

**Rule of thumb:** if a package cannot run right after `npm install <pkg>`,
the missing resolver is a manifest bug — not the consumer's job. There is no
"consumer must also install these" section.

### Usage Rules

1. **Only integration layer packages** may import from their encapsulated libraries
2. **All other packages** must import through the integration layer
3. **Test files** (`*.spec.ts`, `*.test.ts`) may import external libraries for mocking purposes
4. **Type-only imports** (`import type`) are permitted when the library is declared in `peerDependencies` — see [Type-Only Imports](#type-only-imports)

### Examples

**✅ Correct:**

```typescript
// In @blue/core or any non-integration package
import { slugify } from '@blue/util'; // ✅ Import from integration layer
```

**❌ Incorrect:**

```typescript
// In @blue/core or any non-integration package
import { random } from 'seedrandom'; // ❌ Direct import bypasses integration layer
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
- **oxlint Plugin** (implemented): Custom rule to detect direct imports of encapsulated libraries (`@blue/oxlint-plugin` loaded via oxlint JS Plugins)
- **CI Manifest Checker** (implemented): `scripts/check-manifests.mjs` runs in CI (`pnpm manifest:check`; `.github/workflows/ci.yml`) and enforces the [Manifest Dependency Sections](#manifest-dependency-sections) contract plus the `@blue/*` `~0.0.1` protocol

### Type-Only Imports

**Status:** Resolved. Type-only imports (`import type`) are permitted for
host-provided libraries when the library is declared in `peerDependencies`
(e.g. `@blue/telemetry-node → ws`) — the import is erased at build time and
the consumer opts into the host library explicitly. Runtime imports must go
through the integration layer; package-manager sections follow the
[Manifest Dependency Sections](#manifest-dependency-sections) policy.

### Maintenance Note

When adding or modifying integration layer rules, remember to update:

- This section in `ARCHITECTURE.md`
- The "Library Integration Layer Pattern" section in `AGENTS.md`
- The "Dependency Management Strategy" section in `ARCHITECTURE.md`

**See also:** [STYLE_GUIDE.md §4.5](./STYLE_GUIDE.md#45-utility-function-organization-convention-code-review) for concrete implementation guidelines on organizing utilities within packages, including the critical rule that internal files (`_util.ts`, `_parser.ts`) must contain actual local utilities, not just re-exports.

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

- **Decorators**: `@configuration`, `@entry`, `@property`, `@propertySource`, `@whenProfile`
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

Entity decorators carry validation metadata that the framework derives into a Zod schema — validation logic is co-located with the field it protects, and the derived schema is the single source of truth (AD-07).

- **Decorators**: `@column({ schema })`, `@primaryColumn`, `@generatedColumn`
- **Problem Solved**: Keeps validation with the data it protects while producing a runtime schema _and_ a static type (`z.infer`) from one declaration. Route params use `validatedBy(schema, dataBinderValue('query'))` from `@blue/dispatcher`; domain components override `validationSchemas`.

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

## Node Platform & Application Lifecycle

The Node server-side stack (`@blue/platform-node` + `@blue/boot` +
`@blue/http` + `@blue/dispatcher`) follows the same philosophy as the rest of
the framework — dependency injection, declarative metadata, and lifecycle
management — applied to HTTP services. The developer-facing story is covered
in the guides; this section captures the architecture.

### Bootstrap

Applications are assembled through `ApplicationBuilder.run()`
(`@blue/boot`): it prepares the environment, registers platform
auto-configuration (`NodeAutoConfiguration`) plus the app's
`@configuration` classes, and refreshes the context. Registration is
conditional on platform (`@whenNode`) and environment.

### Lifecycle model

The context drives two lifecycle passes:

- **Refresh** (`context.refresh()`) — after entries are created, the
  `LifecycleProcessor` starts `SmartLifecycle` beans that are
  `isAutoStartup` (mapping, dispatcher). Ordering is by phase; the mapping
  and dispatcher initialize before the server would start.
- **Close** (`context.close()`) — the processor stops running lifecycle
  beans in reverse order, then `_destroyValues()` tears down values that
  implement `Destroyable`/`Closeable` (including plain `@entry`/`setValue`
  instances, AD-10 fix). `HTTPServer` is a managed entry created by
  `NodeAutoConfiguration` (not manually); see
  `docs/reference/2026-08-22_CONTEXT_LIFECYCLE.md` for the full sequence.

### Request pipeline

```
NodeHTTPServerAdapter → NodeDispatcher → handler mapping → interceptors
   → argument resolvers (extractors + conversion) → handler → view/JSON
```

- Extractors bound via `@parameters` resolve + type-convert arguments; a
  post-conversion Zod hook runs in every platform resolver.
- Responses: plain objects → JSON; `ResponseEntity` → explicit
  status/headers/body; `ModelAndView`/`View` → view resolution.
- Errors: the adapter → dispatch error path → `RouteErrorResolver` chain →
  the last-resort resolver guarantees a deterministic status for anything
  unhandled.

### The HTTP error contract (RFC 9457)

Every 4xx/5xx response is an [`application/problem+json`][rfc9457] document
(decision: AD-10): `type` (`urn:blue:*` placeholder), `title`, `status`,
`detail`, `instance`, plus the `errors` extension for validation issues.
Status conventions are canonical — 400 binding, 401 + `WWW-Authenticate`,
403, 404, 405 + `Allow`, 413/408 transport, 415, 422 validation, 429, 503,
500 last-resort. Real HTTPS problem-type URIs replace the `urn:` scheme
before first public release.

### Modules at a glance (Node path)

| Package               | Responsibilities         | Key exported concepts                                                                                             |
| --------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `@blue/boot`          | Bootstrap primitives     | `ApplicationBuilder`, `Application`                                                                               |
| `@blue/context`       | DI container + lifecycle | `Configuration`, `@entry`, context hierarchy                                                                      |
| `@blue/factory`       | Bean lifecycle           | `SmartLifecycle`, `Destroyable`, `Closeable`                                                                      |
| `@blue/dispatcher`    | Routing + dispatch       | mappings, `@parameters` extractors, validation, interceptors, error resolvers                                     |
| `@blue/platform-node` | Node adapter             | `NodeAutoConfiguration`, `HTTPServer`, `NodeDispatcher`, argument resolvers, `ProblemDetails`, `gracefulShutdown` |
| `@blue/http`          | HTTP vocabulary          | `ResponseStatuses`, `HTTPHeaders`                                                                                 |
| `@blue/orm`           | Persistence + schema     | `@entity`/`@column`, `insertSchemaForEntity`                                                                      |
| `@blue/telemetry`     | Logging/tracing/metrics  | `getLogger`, `LoggerFactory`                                                                                      |

Guides: [`docs/guides/`](docs/guides/README.md).

**Environment/configuration docs** (sources, profiles, binding, validation):
[guide 03](docs/guides/03-environment-configuration.md),
[API reference](docs/reference/2026-09-08_ENVIRONMENT_API.md),
[architecture](docs/architecture/environment.md).

[rfc9457]: https://www.rfc-editor.org/rfc/rfc9457.html

## Roadmap

### Current Status (2026-10-06)

- **The 10-wave program shipped.** Foundation (`@blue/util`, `@blue/core`,
  `@blue/signals`), IoC/context, the web stack (`@blue/http`,
  `@blue/router`, `@blue/dispatcher`), observability, and the
  view/application layers are complete; the 1.0 checkpoint (Wave 10) is
  reached and the decision records are indexed in
  [`docs/decisions/README.md`](docs/decisions/README.md).
- **Auth shipped** (AD-33, AD-56): credentials + session stores (memory
  and durable LibSQL), OIDC authorization-code + PKCE, JWTs, role guards,
  rate limiting, trusted-proxy client-IP resolution.
- **ORM shipped** (AD-30/31/55): decorator entities, Drizzle adapter,
  relations, journaled migrations, Zod-derived schemas (AD-07).
- **Persistence baseline landed** (AD-40): durable sessions, shared Redis
  cache, cross-node WebSocket/STOMP fan-out; distributed scheduling
  explicitly deferred (AD-41).
- **The framework CLI shipped** (AD-75): `@blue/cli` (bin `blue`) on
  `@oclif/core` ^5 as an embedded library — `serve` (with the AD-74
  `--cluster` surface), `dev`, `generate` (fronting `@blue/generators`),
  `db:migrate`, `inspect` (the AD-70 entry), and `doctor`; scripts run
  shell-free so signals reach the app.
- **Clustering shipped** (AD-74): `@blue/cluster` supervises replicated
  worker slots — `SIGINT`/`SIGTERM` relay into each child's own graceful
  shutdown, bounded-backoff respawns behind a fail-closed crash-loop guard,
  `BLUE_CLUSTER_SLOT`/`SIZE` + `PORT` derivation. Coordination stays in the
  leases and locks (AD-72/73); the supervisor owns only the processes.
- **Distributed locks shipped** (AD-73): `@blue/locks` owns the `LockDriver`
  SPI (non-blocking acquire, TTL leases, monotonic fencing tokens) with the
  in-process driver and Redis driver (`@blue/redis/locks`, Lua
  compare-and-delete); `@scheduled({ lock })` runs one node per fire.
- **Jobs and the transactional outbox shipped** (AD-72): `@blue/jobs` owns the
  `JobDriver` SPI (lease-based at-least-once claims, retries, spans) with
  in-process, LibSQL, and Redis drivers, plus the outbox relay whose LibSQL
  store joins `@transactional` commits on the application's data source.
- **ConversionService shipped** (AD-38) — schema-target conversion is the
  supported binding/conversion path; the former handwritten
  `Converter<S,T>` design note is obsolete.

### Near-Term (1.0)

- **Full time-zone catalog generator** — conditional (AD-20 D6): only if
  the curated `@blue/scheduler` constants prove insufficient.
- **Page concept design** — the open AD-03 question (independently
  bootable presentation container) on its own design conversation if a
  concrete consumer appears.
- **Release gate** — changelog cuts `1.0.0`
  ([Keep a Changelog](./CHANGELOG.md)), package README/API docs
  re-verified (`pnpm doc:check`), CI gates green.

### Closed / Deferred

- API-freeze consistency review (AD-20 D8) — completed 2026-10-31: the full
  decorator taxonomy and naming conventions (AD-83); profile gates unified
  on `@whenProfile`.
- Distributed scheduling (AD-41) and cross-node queue consumption — closed
  with revisit triggers; not speculative scope.
- The 2026-03-08 architecture roadmap reference and the 2026-05-27
  feature-completeness roadmap (10-wave program) are archived history —
  the decision records carry the current design intent
  ([ADR index](./docs/decisions/README.md), [plans](./docs/plans/README.md)).

---

_© 2026 BlueJS Team. All rights reserved._
