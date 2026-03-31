# BlueJS Architecture & Philosophy

BlueJS is a JavaScript-first application framework inspired by the design principles of Spring MVC, adapted for the modern, multi-paradigm (OOP + FP) JavaScript ecosystem.

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Foundational Principles](#foundational-principles)
    - [SOLID Principles](#solid-principles)
    - [DRY Principle](#dry-principle)
3. [Layered Architecture](#layered-architecture)
4. [Dependency Management Strategy](#dependency-management-strategy)
5. [Design Patterns](#design-patterns)
6. [Transducers](#transducers)
    - [Overview](#overview)
    - [Philosophy](#philosophy)
    - [The Transducer Protocol](#the-transducer-protocol)
    - [Factory Patterns](#factory-patterns)
    - [Composition](#composition)
    - [Stateful Transducers](#stateful-transducers)
    - [Early Termination](#early-termination)
    - [Interoperability](#interoperability)
    - [Performance Considerations](#performance-considerations-1)
    - [Testing Transducers](#testing-transducers)
    - [Further Reading](#further-reading)
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

| Layer                      | Packages                                                             | Description                                                                 | Spring MVC Analogue                           |
| :------------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------------------- | :-------------------------------------------- |
| **7: Bootstrap**           | `@blue/boot`                                                         | Application bootstrap, startup orchestration, and site/app lifecycle        | `SpringApplication`                           |
| **6: Application**         | `@blue/service`, `@blue/domain`, `@blue/platform-web`, `@blue/print` | Business services, domain model, platform adapters, browser fingerprinting  | User application + platform adapters          |
| **5: Request Processing**  | `@blue/dispatcher`, `@blue/view`, `@blue/view-webcomponent`          | Front controller, handler execution, and view resolution/rendering adapters | `DispatcherServlet` + `ViewResolver`          |
| **4: Web Infrastructure**  | `@blue/http`, `@blue/router`, `@blue/telemetry`                      | HTTP client/interceptors/transforms, routing primitives, observability      | HTTP stack + routing + observability          |
| **3: Application Context** | `@blue/context`                                                      | Application context, environment, events, configuration metadata            | `ApplicationContext`                          |
| **2: Infrastructure**      | `@blue/factory`, `@blue/content`, `@blue/validate`, `@blue/orm`      | IoC container internals, i18n/theming, validation, persistence abstractions | `BeanFactory` + `MessageSource` + `Validator` |
| **1: Foundation**          | `@blue/core`                                                         | Core primitives, collection types, transducers, path matching, errors       | Spring Core                                   |
| **0: Integration Layer**   | `@blue/util`, `@blue/parser`, `@blue/model`                          | Encapsulated third-party libraries via stable BlueJS wrappers               | Commons / utility integration layer           |

The `blue-demo` app sits above these layers as a reference implementation and integration proving ground.

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
        Domain[@blue/domain]
        PlatformWeb[@blue/platform-web]
        Print[@blue/print]
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
        Validate[@blue/validate]
    end

    subgraph L1["Layer 1: Foundation"]
        Core[@blue/core]
    end

    subgraph L0["Layer 0: Integration Layer"]
        Util[@blue/util]
        Parser[@blue/parser]
        Model[@blue/model]
    end

    Boot --> Context
    Boot --> Dispatcher
    Service --> Http
    Service --> Telemetry
    Domain --> Core
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
    Validate --> Core
    Core --> Util
    Parser --> Util
    Model --> Util

    style Boot fill:#f0f0f0
    style Service fill:#fff4e1
    style Domain fill:#fff4e1
    style PlatformWeb fill:#fff4e1
    style Print fill:#fff4e1
    style Dispatcher fill:#f5e1ff
    style View fill:#f5e1ff
    style ViewWebComponent fill:#f5e1ff
    style Http fill:#e1f5ff
    style Router fill:#e1f5ff
    style Telemetry fill:#e1f5ff
    style Context fill:#e1ffe5
    style Factory fill:#ffe1e1
    style Content fill:#ffe1e1
    style Validate fill:#ffe1e1
    style Core fill:#fff9e1
    style Util fill:#e1f0ff
    style Parser fill:#e1f0ff
    style Model fill:#e1f0ff
```

**Key Principle:** Higher layers depend on lower layers, never the reverse. Some cross-layer dependencies inside adjacent architectural tiers are intentional for integration and orchestration.

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
5. **Update** `AGENTS.md` and `ARCHITECTURE.md` with the new rule

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

## Transducers

### Overview

Transducers are composable algorithmic transformations that decouple transformation operations from data structure traversal. They provide an efficient, memory-friendly way to build data processing pipelines without creating intermediate collections.

**Key Benefits:**

- **Composable**: Build complex transformations from simple, reusable pieces
- **Efficient**: Process data in a single pass without creating intermediate collections
- **Polymorphic**: Same transformation works across different collection types (arrays, strings, sets, maps)
- **Lazy**: Transformations only execute when data flows through the pipeline
- **Interoperable**: Compatible with Ramda, RxJS, and the broader JavaScript transducer ecosystem

### Philosophy

BlueJS embraces transducers as a functional programming pattern for building efficient, composable data transformation pipelines. Unlike traditional array methods (`map`, `filter`, `reduce`), which create intermediate arrays at each step, transducers compose transformations algebraically and execute them in a single pass.

**Traditional Approach (Intermediate Collections):**

```javascript
// ❌ Creates 3 intermediate arrays
const numbers = [1, 2, 3, 4, 5, 6];
const doubled = numbers.map((x) => x * 2); // [2, 4, 6, 8, 10, 12]
const evens = doubled.filter((x) => x % 2 === 0); // [2, 4, 6, 8, 10, 12]
const sum = evens.reduce((a, b) => a + b, 0); // 42
```

**Transducer Approach (Single Pass):**

```javascript
// ✅ Single pass, no intermediate arrays
const xf = compose(
    map((x) => x * 2),
    filter((x) => x % 2 === 0)
);
const sum = transduce(xf, add, 0, [1, 2, 3, 4, 5, 6]); // 42
```

### The Transducer Protocol

Transducers follow a three-arity protocol with three required methods:

**Protocol Methods:**

| Method                | Purpose                  | Required     | Signature                                                   |
| :-------------------- | :----------------------- | :----------- | :---------------------------------------------------------- |
| `@@transducer/init`   | Initialize accumulator   | Optional     | `() => TResult`                                             |
| `@@transducer/step`   | Process each input item  | **Required** | `(result: TResult, input: TInput) => MaybeReduced<TResult>` |
| `@@transducer/result` | Finalize/complete result | Optional     | `(result: TResult) => TComplete`                            |

**Additional Protocol Symbols:**

| Symbol                 | Purpose                                   | Usage                             |
| :--------------------- | :---------------------------------------- | :-------------------------------- |
| `@@transducer/reduced` | Mark value as reduced (early termination) | Set to `true` on result object    |
| `@@transducer/value`   | Extract value from reduced result         | Contains the actual reduced value |

**Example Implementation:**

```typescript
class XCount<T = any> implements Transformer<number, T> {
    // Initialize accumulator to 0
    ['@@transducer/init']?(): number {
        return 0;
    }

    // Finalize result (identity in this case)
    ['@@transducer/result']?(result: number): number {
        return result;
    }

    // Process each input by incrementing count
    ['@@transducer/step'](result: number, input: T): MaybeReduced<number> {
        return result + 1;
    }
}
```

### Factory Patterns

BlueJS uses two distinct factory patterns for transducers, chosen based on whether the transformer requires configuration parameters.

#### Pattern 1: Three-Tier (Zero-Argument Factories)

For transformers that require no configuration, use a three-tier pattern with an intermediate factory layer.

**Structure:**

```
Transformer Class → Factory Function → Convenience Wrapper
    XCount      →     xCount()     →      count()
```

**Implementation:**

```typescript
// Transformer class
export class XCount<T = any> implements Transformer<number, T> {
    ['@@transducer/init']?(): number {
        return 0;
    }
    ['@@transducer/result']?(result: number): number {
        return result;
    }
    ['@@transducer/step'](result: number): MaybeReduced<number> {
        return result + 1;
    }
}

// Intermediate factory
export const xCount = <T = any>(): Transformer<number, T> => new XCount<T>();

// Convenience wrapper
export const count = () => xCount;

// Usage
import { into } from '@blue/util/list';
import { count } from '@blue/core';

const total = into([], count(), [1, 2, 3, 4]); // 4
```

**Rationale:**

- **Clarity**: Three distinct layers make the API structure explicit
- **Ramda Compatibility**: Matches Ramda's transducer conventions
- **Consistency**: Uniform pattern across zero-argument transducers

#### Pattern 2: Two-Tier (Parameterized Factories)

For transformers requiring configuration, use a two-tier pattern that skips the intermediate layer.

**Structure:**

```
Transformer Class → Parameterized Factory
    XToMap      →  toMap(getKey, getValue)
```

**Implementation:**

```typescript
// Transformer class
export class XToMap<T, K, V> implements Transformer<Map<K, V>, T> {
    constructor(
        private readonly _getKey: (item: T) => K,
        private readonly _getValue: (item: T) => V
    ) {}

    ['@@transducer/init']?(): Map<K, V> {
        return new Map<K, V>();
    }
    ['@@transducer/result']?(result: Map<K, V>): Map<K, V> {
        return result;
    }
    ['@@transducer/step'](result: Map<K, V>, input: T): MaybeReduced<Map<K, V>> {
        result.set(this._getKey(input), this._getValue(input));
        return result;
    }
}

// Parameterized factory (no intermediate layer)
export const toMap =
    <T, K, V>(getKey: (item: T) => K, getValue: (item: T) => V) =>
    (): Transformer<Map<K, V>, T> =>
        new XToMap<T, K, V>(getKey, getValue);

// Usage
import { into } from '@blue/util/list';
import { toMap } from '@blue/core';

const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];
const userMap = into(
    new Map(),
    toMap(
        (u) => u.id,
        (u) => u.name
    ),
    users
); // Map { 1 => 'Alice', 2 => 'Bob' }
```

**Rationale:**

- **Simplicity**: Avoids redundant wrapper when parameters are required
- **Ergonomics**: Direct parameter passing is clearer than curried factories
- **Performance**: One less function call in the chain

**Pattern Selection Criteria:**

| Criteria             | Three-Tier               | Two-Tier                        |
| :------------------- | :----------------------- | :------------------------------ |
| Parameters required? | No                       | Yes                             |
| Examples             | `XCount`, `XToArray`     | `XToMap`, `XToRecord`, `XToSet` |
| API clarity          | Higher (explicit layers) | Higher (direct parameters)      |

### Composition

Transducers compose using standard function composition, applying transformations from **right to left** (standard mathematical composition order).

**Basic Composition:**

```typescript
import { compose } from '@blue/util/function';
import { into } from '@blue/util/list';

// Define custom transducers
class XDouble extends DelegatingTransformer {
    ['@@transducer/step'](result: any, input: any): any {
        return this.xf['@@transducer/step'](result, input * 2);
    }
}

class XEven extends DelegatingTransformer {
    ['@@transducer/step'](result: any, input: any): any {
        return input % 2 === 0 ? this.xf['@@transducer/step'](result, input) : result;
    }
}

const xDouble = (xf: any) => new XDouble(xf);
const xEven = (xf: any) => new XEven(xf);

// Compose: xEven filters BEFORE xDouble doubles
// Order: right-to-left (xDouble applied first, then xEven filters)
const xf = compose(xEven, xDouble);

const result = into([], xf, [1, 2, 3, 4]); // [4, 8]
// Explanation: [1,2,3,4] → double → [2,4,6,8] → filterEven → [4,8]
```

**Delegation Pattern:**

The `DelegatingTransformer` base class enables composition by delegating `step` calls to an inner transformer (`xf`):

```typescript
export class DelegatingTransformer<TResult, TComplete, TInput>
    implements CompletingTransformer<TResult, TComplete, TInput>
{
    readonly xf: CompletingTransformer<TResult, TComplete, TInput>;

    constructor(xf: CompletingTransformer<TResult, TComplete, TInput>) {
        this.xf = xf;
    }

    ['@@transducer/step'](result: TResult, input: TInput): MaybeReduced<TResult> {
        return this.xf['@@transducer/step'](result, input);
    }
}
```

**Composition Order:**

```typescript
// Right-to-left composition (standard mathematical order)
const xf = compose(f, g, h); // Applies h, then g, then f

// Equivalent to:
const xf = (x) => f(g(h(x)));
```

### Stateful Transducers

Transducers can maintain internal state across transformation steps.

**Example: Deduplication**

```typescript
class XDedupe<T> extends DelegatingTransformer<T[], T[], T> {
    private seen = new Set<T>();

    ['@@transducer/step'](result: T[], input: T): MaybeReduced<T[]> {
        if (this.seen.has(input)) {
            return result; // Skip duplicate
        }
        this.seen.add(input);
        return this.xf['@@transducer/step'](result, input);
    }

    ['@@transducer/result']?(result: T[]): T[] {
        this.seen.clear(); // Clean up state
        return this.xf['@@transducer/result']?.(result) ?? result;
    }
}

const xDedupe = <T>(xf: any) => new XDedupe<T>(xf);

// Usage
const result = into([], xDedupe, [1, 2, 2, 3, 3, 3, 4]); // [1, 2, 3, 4]
```

**Example: Windowing**

```typescript
class XTake<T> extends DelegatingTransformer<T[], T[], T> {
    private taken = 0;

    constructor(
        private readonly n: number,
        xf: CompletingTransformer<T[], T[], T>
    ) {
        super(xf);
    }

    ['@@transducer/step'](result: T[], input: T): MaybeReduced<T[]> {
        if (this.taken >= this.n) {
            return reduce(result); // Early termination
        }
        this.taken++;
        return this.xf['@@transducer/step'](result, input);
    }
}

const xTake =
    <T>(n: number) =>
    (xf: any) =>
        new XTake<T>(n, xf);

// Usage
const result = into([], xTake(3), [1, 2, 3, 4, 5]); // [1, 2, 3]
```

### Early Termination

Transducers can signal early termination using the `reduced` protocol.

**Reduced Values:**

A reduced value signals that the transformation is complete and no further inputs should be processed:

```typescript
export type Reduced<T> = {
    ['@@transducer/reduced']: boolean;
    ['@@transducer/value']: T;
};

export function reduce<T = any>(value: T): Reduced<T> {
    return likeReduced(value)
        ? value
        : {
              ['@@transducer/reduced']: true,
              ['@@transducer/value']: value,
          };
}
```

**Example: Find First Match**

```typescript
class XFindFirst<T> extends DelegatingTransformer<T | undefined, T | undefined, T> {
    constructor(
        private readonly predicate: (item: T) => boolean,
        xf: CompletingTransformer<T | undefined, T | undefined, T>
    ) {
        super(xf);
    }

    ['@@transducer/step'](result: T | undefined, input: T): MaybeReduced<T | undefined> {
        if (this.predicate(input)) {
            return reduce(input); // Found! Terminate early
        }
        return result;
    }
}

const xFindFirst =
    <T>(predicate: (item: T) => boolean) =>
    (xf: any) =>
        new XFindFirst<T>(predicate, xf);

// Usage
const firstEven = into(
    undefined,
    xFindFirst((x: number) => x % 2 === 0),
    [1, 3, 5, 6, 7, 8]
); // 6 (stops processing after finding first match)
```

### Interoperability

BlueJS transducers are compatible with the broader JavaScript transducer ecosystem.

**Ramda Integration:**

```typescript
import { transduce, map, filter, add } from 'ramda';
import { xCount } from '@blue/core';

// Use BlueJS transducers with Ramda's transduce
const xf = xCount();
const result = transduce(xf, add, 0, [1, 2, 3, 4]); // 4

// Use Ramda transducers with BlueJS utilities
import { into } from '@blue/util/list';
const xf2 = compose(
    map((x) => x * 2),
    filter((x) => x > 5)
);
const result2 = into([], xf2, [1, 2, 3, 4, 5]); // [6, 8, 10]
```

**RxJS Integration:**

RxJS operators can be adapted to work with transducers:

```typescript
import { map, filter } from 'rxjs/operators';
import { xCount } from '@blue/core';

// BlueJS transducers work alongside RxJS operators
// (requires adapter implementation)
```

**transducers-js Compatibility:**

BlueJS follows the same protocol as [cognitect-labs/transducers-js](https://github.com/cognitect-labs/transducers-js):

- `@@transducer/init`, `@@transducer/step`, `@@transducer/result` methods
- `@@transducer/reduced` and `@@transducer/value` for early termination
- Compatible with any library following the transducer protocol

### Performance Considerations

**When to Use Transducers:**

✅ **Good Fit:**

- Processing large collections where memory efficiency matters
- Complex transformation pipelines with multiple steps
- Need to avoid intermediate collections
- Transformations that work across different collection types
- Performance-critical code paths

❌ **Not Always Necessary:**

- Small collections (< 100 items) where overhead exceeds benefits
- Simple single-step transformations (use `map`/`filter` directly)
- Transformations that only work on specific data structures
- Prototyping where readability trumps performance

**Performance Characteristics:**

| Operation         | Traditional    | Transducers    |
| :---------------- | :------------- | :------------- |
| Memory            | O(n) per step  | O(1) constant  |
| Passes            | Multiple       | Single         |
| Overhead          | Array creation | Function calls |
| Early termination | Full traversal | Immediate stop |

**Benchmarks (Conceptual):**

```typescript
// Traditional: 3 passes, 2 intermediate arrays
const result1 = [1, 2, 3, 4, 5]
    .map((x) => x * 2) // [2,4,6,8,10]
    .filter((x) => x > 5) // [6,8,10]
    .reduce((a, b) => a + b, 0); // 24

// Transducers: 1 pass, 0 intermediate arrays
const xf = compose(
    map((x) => x * 2),
    filter((x) => x > 5)
);
const result2 = transduce(xf, add, 0, [1, 2, 3, 4, 5]); // 24

// For large datasets (10,000+ items):
// Traditional: ~2-3x slower, ~2-3x memory usage
// Transducers: Faster, constant memory
```

### Testing Transducers

**Unit Testing Strategy:**

```typescript
import { describe, test, expect } from 'vitest';
import { into } from '@blue/util/list';
import { XCount, count } from '@blue/core';

describe('XCount', () => {
    test('counts items in array', () => {
        const result = into([], count(), [1, 2, 3, 4]);
        expect(result).toBe(4);
    });

    test('counts characters in string', () => {
        const result = into([], count(), 'hello');
        expect(result).toBe(5);
    });

    test('handles empty collections', () => {
        const result = into([], count(), []);
        expect(result).toBe(0);
    });
});
```

**Testing Composition:**

```typescript
describe('Transducer composition', () => {
    test('composes transformations correctly', () => {
        const xf = compose(xEven, xDouble);
        const result = into([], xf, [1, 2, 3, 4]);
        expect(result).toEqual([4, 8]); // Only even numbers, doubled
    });

    test('maintains composition order', () => {
        const xf1 = compose(xDouble, xEven); // Filter then double
        const xf2 = compose(xEven, xDouble); // Double then filter

        const result1 = into([], xf1, [1, 2, 3, 4]);
        const result2 = into([], xf2, [1, 2, 3, 4]);

        expect(result1).not.toEqual(result2); // Different orders yield different results
    });
});
```

**Testing Early Termination:**

```typescript
describe('Early termination', () => {
    test('stops processing on reduced value', () => {
        const processSpy = vi.fn();

        class XSpyTransformer extends DelegatingTransformer {
            ['@@transducer/step'](result: any, input: any): any {
                processSpy(input);
                if (input === 3) return reduce(result);
                return this.xf['@@transducer/step'](result, input);
            }
        }

        const xSpy = (xf: any) => new XSpyTransformer(xf);
        into([], xSpy, [1, 2, 3, 4, 5]);

        expect(processSpy).toHaveBeenCalledTimes(3); // Only 1, 2, 3
        expect(processSpy).not.toHaveBeenCalledWith(4);
        expect(processSpy).not.toHaveBeenCalledWith(5);
    });
});
```

### Further Reading

**Core Concepts:**

- [Clojure Transducers Reference](https://clojure.org/reference/transducers) - Original transducer design
- [Rich Hickey: Transducers Talk](https://www.youtube.com/watch?v=6mTbuzafcII) - Conceptual foundation
- [Eric Elliott: Transducers in JavaScript](https://medium.com/javascript-scene/transducers-efficient-data-processing-pipelines-in-javascript-7985330fe73d) - JavaScript-specific introduction

**Implementations:**

- [cognitect-labs/transducers-js](https://github.com/cognitect-labs/transducers-js) - JavaScript reference implementation
- [Ramda Transducers](https://ramdajs.com/docs/#transduce) - Ramda's transducer support
- [transducers.js](https://github.com/jlongster/transducers.js) - Alternative implementation

**Related Patterns:**

- [Iterator Protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) - JavaScript iteration
- [Generator Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) - Lazy evaluation
- [Pipeline Operator](https://github.com/tc39/proposal-pipeline-operator) - Proposed JavaScript feature

**BlueJS Documentation:**

- [STYLE_GUIDE.md Section 3.10](./STYLE_GUIDE.md#310-transducers-convention-code-review) - Transducer naming conventions
- [packages/blue-core/src/transducer.ts](../packages/blue-core/src/transducer.ts) - Source implementation
- [packages/blue-core/test/transducer.spec.ts](../packages/blue-core/test/transducer.spec.ts) - Test examples

## Type-Safe Enum Pattern

### Overview

The **Type-Safe Enum Pattern** (also known as the Java Enum Pattern or Class-Based Enum Pattern) is a design pattern that uses classes to create type-safe enumeration constants with capabilities beyond built-in enums. This pattern provides methods, inheritance, factory functions, and full control over serialization—features unavailable in TypeScript's built-in `enum` keyword.

**Historical Context:**

This pattern was popularized by Joshua Bloch in "Effective Java" (Item 21) before Java 5 introduced built-in enums in 2004. Even after enums became standard, the pattern remained valuable for scenarios requiring rich behavior. In TypeScript, where built-in enums have [well-documented limitations](https://www.typescriptlang.org/docs/handbook/enums.html), the type-safe enum pattern provides a powerful alternative for complex enumeration requirements.

**Key Characteristics:**

- **Singleton Instances**: Each enum constant is a singleton instance of the enum class
- **Immutability**: Properties are immutable using `Reflect.defineProperty`
- **Type Safety**: Reference equality checks (`===`) provide reliable identity
- **Rich Behavior**: Support for methods, interfaces, and inheritance
- **Serialization Control**: Full control via `toJSON()` and `toString()`
- **Factory Methods**: Static methods for lookup and conversion

**BlueJS Usage:**

The pattern is actively used in `@blue/dispatcher`, with a related factory-registry variant in `@blue/http`:

- **@blue/dispatcher**: `MethodParameterType` (3 constants: COOKIE, MATRIX, QUERY)
- **@blue/http**: `ResponseStatus` and `response-statuses` (factory registry variant for large constant sets)

The former `@blue/logger` package also used a rich inheritance-based type-safe enum hierarchy. That package was removed in favor of `@blue/telemetry`, which now uses functional severity mappings (`SeverityMapping`, `levelToSeverityNumber()`, `severityNumberToLevel()`).

### When to Use

Understanding when to use the Type-Safe Enum Pattern versus built-in enums is critical for maintaining appropriate complexity levels.

#### Use Type-Safe Enum Pattern When:

✅ **Instance methods needed** - equals(), compareTo(), or custom business logic  
✅ **Factory methods needed** - fromType(), fromValue(), or conversion methods  
✅ **Rich data model** - Multiple properties per enum constant (name, value, metadata)  
✅ **Inheritance hierarchies** - Shared behavior across enum families  
✅ **Public API** - External contracts requiring predictable serialization  
✅ **Type-safe identity** - Reference equality checks (===) for comparisons  
✅ **Large value sets** - 8+ values requiring organization and documentation  
✅ **Runtime extensibility** - Ability to subclass for custom variants

**Historical example from the former `@blue/logger` package (removed in favor of `@blue/telemetry`):**

```typescript
// ✅ Good: Type-Safe Enum with ordering and conversion
export class Level implements Comparable<Level>, Serializable {
    static OFF = new Level('off', 0);
    static ALL = new Level('all', Number.MAX_VALUE);

    readonly name: string;
    readonly value: number;

    constructor(name: string, value: number) {
        Reflect.defineProperty(this, 'name', { value: name, writable: false, enumerable: false, configurable: true });
        Reflect.defineProperty(this, 'value', { value: value, writable: false, enumerable: false, configurable: true });
    }

    compareTo(other: Level): number {
        return this.value - other.value;
    }

    toJSON(): string {
        return this.name;
    }

    toString(): string {
        return this.name;
    }
}

// Specialized subclass with conversion methods
export class SyslogLevel extends Level {
    static EMERG = new Level('emerg', 10000);
    static ERROR = new Level('error', 40000);
    // ... 6 more levels

    static toSeverity(level: Level): SeverityNumber {
        // Convert to OpenTelemetry severity
    }

    static fromSeverity(severity: SeverityNumber): Level {
        // Convert from OpenTelemetry severity
    }
}
```

#### Use Built-in TypeScript Enum When:

✅ **Simple constants** - No additional behavior beyond the values themselves  
✅ **Internal use only** - Not exposed in public API (enums have serialization quirks)  
✅ **Small value sets** - 2-5 values that are self-explanatory  
✅ **No methods needed** - Pure data constants without logic  
✅ **Compile-time only** - No runtime lookup, conversion, or validation needed

**Example from codebase:**

```typescript
// ✅ Good: Built-in enum for simple internal constants
enum RouteAccess {
    PUBLIC,
    PRIVATE,
}

enum RouteSource {
    EXTERNAL,
    INTERNAL,
}

// Used internally in RouteTransaction
class RouteTransaction {
    constructor(route: string, access: RouteAccess, source: RouteSource) {
        // Simple usage, no methods, no conversion
    }
}
```

#### Quick Decision Matrix

| Criterion                 | Built-in Enum | Type-Safe Enum    | Factory Registry\* |
| :------------------------ | :------------ | :---------------- | :----------------- |
| **Complexity**            | Simple        | Medium            | Complex            |
| **Value Count**           | 2-5           | 6-20              | 20+                |
| **Methods Needed**        | No            | Yes               | Yes                |
| **Factory Methods**       | No            | Optional          | Required           |
| **Inheritance**           | No            | Yes               | Optional           |
| **Runtime Creation**      | No            | No                | Yes                |
| **Public API**            | Avoid         | ✅ Preferred      | ✅ Preferred       |
| **Serialization Control** | Limited       | ✅ Full           | ✅ Full            |
| **Identity Checks**       | Unreliable    | ✅ Reliable (===) | ✅ Reliable (===)  |

\* See [Related Pattern: Factory Registry](#related-pattern-factory-registry) below

### Pattern Variations

The Type-Safe Enum Pattern has two implementation styles in the BlueJS codebase. Both are valid; the inline style is preferred for new code.

#### Variation 1: Inline Static Assignment (Recommended)

Static properties are initialized inline with `new ClassName()`. This is the more modern ES2022+ style:

```typescript
export class Level implements Comparable<Level>, Serializable {
    static OFF = new Level('off', 0);
    static ALL = new Level('all', Number.MAX_VALUE);

    readonly name: string;
    readonly value: number;

    get [Symbol.toStringTag](): string {
        return `Level:${this.name}`;
    }

    constructor(name: string, value: number) {
        Reflect.defineProperty(this, 'name', {
            value: name,
            writable: false,
            enumerable: false,
            configurable: true,
        });
        Reflect.defineProperty(this, 'value', {
            value: value,
            writable: false,
            enumerable: false,
            configurable: true,
        });
    }

    compareTo(other: Level): number {
        return this.value - other.value;
    }

    toJSON(): string {
        return this.name;
    }

    toString(): string {
        return this.name;
    }
}
```

**Characteristics:**

- ✅ More concise and readable
- ✅ Modern ES2022+ style
- ✅ Preferred for new implementations
- ✅ No separate initialization step

**Historical Example:** The `Level` hierarchy (`Level`, `SyslogLevel`, `CLILevel`, `NPMLevel`, `ApacheLevel`) existed in the former `@blue/logger` package. It was replaced by functional severity mappings in `@blue/telemetry/severity`.

#### Variation 2: Post-Class Assignment

Static properties are forward-declared without initialization, then assigned after the class definition:

```typescript
export class MethodParameterType implements Equatable, Serializable {
    static COOKIE: MethodParameterType;
    static MATRIX: MethodParameterType;
    static QUERY: MethodParameterType;

    readonly type: string;

    get [Symbol.toStringTag](): string {
        return `MethodParameterType:${this.type}`;
    }

    constructor(type: string) {
        Reflect.defineProperty(this, 'type', {
            value: type,
            writable: false,
            enumerable: false,
            configurable: true,
        });
    }

    equals(other: any): boolean {
        return other instanceof MethodParameterType && other.type === this.type;
    }

    toJSON(): string {
        return this.type;
    }

    toString(): string {
        return this.type;
    }
}

// Post-class assignment
MethodParameterType.COOKIE = new MethodParameterType('cookie:value');
MethodParameterType.MATRIX = new MethodParameterType('matrix:value');
MethodParameterType.QUERY = new MethodParameterType('query:value');
```

**Characteristics:**

- More verbose
- Traditional pre-ES2022 style
- Allows forward references in constructor (rare need)
- Still valid but less preferred

**Example:** `MethodParameterType` in `@blue/dispatcher`

**Recommendation:** Use inline assignment for new code. Both styles are acceptable in existing code.

### Inheritance Hierarchies

One of the key advantages of the Type-Safe Enum Pattern is support for inheritance, enabling shared behavior across enum families.

**Note:** The logging hierarchy below is an architectural reference from the former `@blue/logger` package (now removed). It remains a useful example of when inheritance-based enums are appropriate.

**Example: Logging Level Hierarchy**

```typescript
// Base class with common behavior
export class Level implements Comparable<Level>, Serializable {
    static OFF = new Level('off', 0);
    static ALL = new Level('all', Number.MAX_VALUE);

    readonly name: string;
    readonly value: number;

    constructor(name: string, value: number) {
        Reflect.defineProperty(this, 'name', { value: name, writable: false, enumerable: false, configurable: true });
        Reflect.defineProperty(this, 'value', { value: value, writable: false, enumerable: false, configurable: true });
    }

    // Shared comparison logic
    compareTo(other: Level): number {
        return this.value - other.value;
    }

    toJSON(): string {
        return this.name;
    }

    toString(): string {
        return this.name;
    }
}

// Specialized subclass for Syslog standard
export class SyslogLevel extends Level {
    static EMERG = new Level('emerg', 10000);
    static ALERT = new Level('alert', 20000);
    static CRIT = new Level('crit', 30000);
    static ERROR = new Level('error', 40000);
    static WARNING = new Level('warning', 50000);
    static NOTICE = new Level('notice', 60000);
    static INFO = new Level('info', 70000);
    static DEBUG = new Level('debug', 80000);

    // Conversion to OpenTelemetry format
    static toSeverity(level: Level): SeverityNumber {
        if (level.compareTo(SyslogLevel.EMERG) === 0) return SeverityNumber.FATAL;
        if (level.compareTo(SyslogLevel.ERROR) <= 0) return SeverityNumber.ERROR;
        if (level.compareTo(SyslogLevel.WARNING) <= 0) return SeverityNumber.WARN;
        if (level.compareTo(SyslogLevel.INFO) <= 0) return SeverityNumber.INFO;
        return SeverityNumber.DEBUG;
    }

    // Conversion from OpenTelemetry format
    static fromSeverity(severity: SeverityNumber): Level {
        if (severity >= SeverityNumber.FATAL) return SyslogLevel.EMERG;
        if (severity >= SeverityNumber.ERROR) return SyslogLevel.ERROR;
        if (severity >= SeverityNumber.WARN) return SyslogLevel.WARNING;
        if (severity >= SeverityNumber.INFO) return SyslogLevel.INFO;
        return SyslogLevel.DEBUG;
    }
}

// Additional specializations with different level sets
export class CLILevel extends Level {
    /* 10 CLI-specific levels */
}
export class NPMLevel extends Level {
    /* 7 NPM-style levels */
}
export class ApacheLevel extends Level {
    /* 6 Log4j-style levels */
}
```

**Use Case (historical):** Multiple logging standards (Syslog, CLI, NPM, Apache) shared comparison and serialization logic while providing standard-specific levels and conversion methods.

### Factory Methods

Static factory methods enable runtime lookup and conversion, a common requirement for enum patterns.

#### Pattern 1: Lookup by String Value

```typescript
export class MethodParameterType {
    static COOKIE = new MethodParameterType('cookie:value');
    static MATRIX = new MethodParameterType('matrix:value');
    static QUERY = new MethodParameterType('query:value');

    static fromType(type: string): MethodParameterType | null {
        const keys = Object.keys(this);
        for (const key of keys) {
            const paramType: MethodParameterType = MethodParameterType[key];
            if (paramType && paramType.type === type) {
                return paramType;
            }
        }
        return null;
    }

    readonly type: string;
    constructor(type: string) {
        /* ... */
    }
}

// Usage
const paramType = MethodParameterType.fromType('cookie:value');
if (paramType === MethodParameterType.COOKIE) {
    // Type-safe comparison
}
```

#### Pattern 2: Bidirectional Conversion

This pattern was previously used by `@blue/logger`. In current BlueJS, `@blue/telemetry` performs bidirectional conversion using `SeverityMapping` implementations and helper functions.

```typescript
export class SyslogLevel extends Level {
    // Convert TO external format (OpenTelemetry)
    static toSeverity(level: Level): SeverityNumber {
        if (level.compareTo(SyslogLevel.EMERG) === 0) return SeverityNumber.FATAL;
        if (level.compareTo(SyslogLevel.ERROR) <= 0) return SeverityNumber.ERROR;
        // ...
    }

    // Convert FROM external format (OpenTelemetry)
    static fromSeverity(severity: SeverityNumber): Level {
        if (severity >= SeverityNumber.FATAL) return SyslogLevel.EMERG;
        if (severity >= SeverityNumber.ERROR) return SyslogLevel.ERROR;
        // ...
    }
}

// Usage
const otelSeverity = SyslogLevel.toSeverity(level); // Level → SeverityNumber
const syslogLevel = SyslogLevel.fromSeverity(otelSeverity); // SeverityNumber → Level
```

### Common Interfaces

Type-safe enums typically implement one or more standard interfaces to provide expected behavior:

#### Equatable - Value Equality

```typescript
interface Equatable {
    equals(other: any): boolean;
}

export class MethodParameterType implements Equatable {
    equals(other: any): boolean {
        return other instanceof MethodParameterType && other.type === this.type;
    }
}

// Usage
const type1 = MethodParameterType.COOKIE;
const type2 = getParameterType();
if (type1.equals(type2)) {
    // Value-based equality
}
```

#### Serializable - JSON Representation

```typescript
interface Serializable {
    toJSON(): string | JSONObject;
    toString(): string;
}

export class Level implements Serializable {
    toJSON(): string {
        return this.name; // Serialize as simple string
    }

    toString(): string {
        return this.name;
    }
}

// Usage
const json = JSON.stringify({ level: Level.INFO });
// Result: {"level":"info"}
```

#### Comparable - Ordering

```typescript
interface Comparable<T> {
    compareTo(other: T): number;
}

export class Level implements Comparable<Level> {
    compareTo(other: Level): number {
        return this.value - other.value;
    }
}

// Usage
const levels = [Level.ERROR, Level.INFO, Level.DEBUG];
levels.sort((a, b) => a.compareTo(b)); // Sort by severity
```

### Implementation Checklist

When creating a new type-safe enum:

- [ ] **Class Definition**: Declare class implementing appropriate interfaces (Equatable, Serializable, Comparable)
- [ ] **Static Constants**: Define enum values as static properties (UPPER_SNAKE_CASE)
- [ ] **Constructor**: Accept parameters for enum properties
- [ ] **Immutability**: Use `Reflect.defineProperty` with `writable: false` for all properties
- [ ] **Symbol.toStringTag**: Add getter for better debugging (`EnumType:${value}`)
- [ ] **equals()**: Implement value-based equality check (if Equatable)
- [ ] **compareTo()**: Implement ordering logic (if Comparable)
- [ ] **toJSON()**: Define JSON serialization format (if Serializable)
- [ ] **toString()**: Define string representation (if Serializable)
- [ ] **Factory Methods**: Add static `from*()` methods for lookup/conversion (if needed)
- [ ] **Documentation**: Document each enum constant and its meaning with JSDoc
- [ ] **Tests**: Write tests for equality, serialization, ordering, and factory methods

### Related Pattern: Factory Registry

For very large or dynamic enum sets (50+ values), consider the **Factory Registry Pattern** as an alternative. This pattern uses a factory method with internal caching instead of predefined static constants.

**Key Differences:**

| Aspect        | Type-Safe Enum                | Factory Registry               |
| :------------ | :---------------------------- | :----------------------------- |
| **Constants** | Static properties on class    | Separate constants file        |
| **Creation**  | Fixed at definition time      | Dynamic at runtime             |
| **Caching**   | Implicit (singletons)         | Explicit (Map/WeakMap)         |
| **Use Case**  | Known fixed set (6-20 values) | Large/dynamic set (50+ values) |

**Example: ResponseStatus**

```typescript
// Class with factory method (response-status.ts)
export class ResponseStatus implements Comparable<ResponseStatus>, Equatable, Serializable {
    private static cache = new Map<string, ResponseStatus>();

    static for(code: number, reason: string): ResponseStatus {
        const key = `${code}:${reason}`;
        if (!this.cache.has(key)) {
            this.cache.set(key, new ResponseStatus(code, reason));
        }
        return this.cache.get(key)!;
    }

    readonly code: number;
    readonly reason: string;

    private constructor(code: number, reason: string) {
        Reflect.defineProperty(this, 'code', { value: code, writable: false, enumerable: false, configurable: true });
        Reflect.defineProperty(this, 'reason', {
            value: reason,
            writable: false,
            enumerable: false,
            configurable: true,
        });
    }

    // ... equals, compareTo, toJSON, toString
}

// Separate constants file (response-statuses.ts)
export const OK = ResponseStatus.for(200, 'OK');
export const CREATED = ResponseStatus.for(201, 'Created');
export const NOT_FOUND = ResponseStatus.for(404, 'Not Found');
// ... 60+ more HTTP status codes
```

**When to Use Factory Registry:**

- ✅ 50+ possible values (e.g., HTTP status codes 100-599)
- ✅ Runtime instance creation needed (dynamic values)
- ✅ Caching required to ensure identity (singleton behavior)
- ✅ Separate constant definition beneficial (organization)

**Example in BlueJS:** `ResponseStatus` in `@blue/http` manages 60+ HTTP status codes using this pattern.

### Usage Examples

#### Identity Checks (Reference Equality)

```typescript
// ✅ Correct: Reference equality for identity
if (paramType === MethodParameterType.COOKIE) {
    // Process cookie parameter
}

// ✅ Correct: Value equality for comparison
if (paramType.equals(otherType)) {
    // Types are semantically equal
}

// ❌ Wrong: String comparison (fragile, bypasses type safety)
if (paramType.toString() === 'cookie:value') {
    // Don't do this - loses type safety
}
```

#### Ordering and Comparison

```typescript
// ✅ Correct: Use compareTo() for ordering
const levels = [Level.ERROR, Level.INFO, Level.DEBUG];
levels.sort((a, b) => a.compareTo(b));

if (currentLevel.compareTo(Level.ERROR) <= 0) {
    // Critical or error level
}

// ❌ Wrong: Direct comparison operators don't work
if (level1 > level2) {
    // Won't work as expected
}
```

#### Serialization

```typescript
// ✅ Correct: Automatic serialization via toJSON()
const config = {
    level: Level.INFO,
    paramType: MethodParameterType.QUERY,
};
const json = JSON.stringify(config);
// Result: {"level":"info","paramType":"query:value"}

// ✅ Correct: Manual string conversion
const levelString = level.toString(); // "info"
```

#### Factory Method Lookup

```typescript
// ✅ Correct: Parse external input to enum constant
const paramType = MethodParameterType.fromType(request.paramType);
if (paramType === null) {
    throw new Error(`Unknown parameter type: ${request.paramType}`);
}

// ✅ Correct: Conversion between formats
const severity = SyslogLevel.toSeverity(level);
const level = SyslogLevel.fromSeverity(severity);
```

### Examples from Codebase

**Simple Type-Safe Enum:**

- `MethodParameterType` - [@blue/dispatcher/src/route-parameter.ts](../packages/blue-dispatcher/src/route-parameter.ts) (lines 45-95)

**Enum Hierarchy with Inheritance:**

- Historical reference: Inheritance hierarchy existed in removed `@blue/logger`
- Current replacement approach: `SeverityMapping` interface - [@blue/telemetry/src/severity/severity-mapping.ts](../packages/blue-telemetry/src/severity/severity-mapping.ts)
- Mapping implementations (syslog/npm/apache/cli) - [@blue/telemetry/src/severity/\_severity-mappings.ts](../packages/blue-telemetry/src/severity/_severity-mappings.ts)
- Conversion helpers - [@blue/telemetry/src/severity/severity.ts](../packages/blue-telemetry/src/severity/severity.ts)

**Factory Registry Pattern:**

- `ResponseStatus` - [@blue/http/src/response-status.ts](../packages/blue-http/src/response-status.ts)
- HTTP Status Constants - [@blue/http/src/response-statuses.ts](../packages/blue-http/src/response-statuses.ts)

**Built-in Enum (Appropriate Use):**

- `RouteAccess` and `RouteSource` - [@blue/router/src/hash-router.ts](../packages/blue-router/src/hash-router.ts) (lines 16-24)

### See Also

- [STYLE_GUIDE.md Section 3.15](./STYLE_GUIDE.md#315-type-safe-enums-convention-code-review) - Type-Safe Enum naming conventions (class names, constants, methods)
- [Decorators & Separation of Concerns](#decorators--separation-of-concerns) - Using enums with decorators
- [Design Patterns](#design-patterns) - Related patterns (Factory, Singleton)

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

**For comprehensive naming guidelines, see:**

- **STYLE_GUIDE.md Section 3.13** - Properties vs Methods (when to use properties, get-methods, or to-methods)
- **STYLE_GUIDE.md Section 3.14** - Method Naming Conventions (get\*, is\*, has\*, set\*, from\*, to\*, with\*, etc.)

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

- **Foundation is stable**: `@blue/util`, `@blue/parser`, `@blue/model`, and `@blue/core` are mature and broadly reusable.
- **IoC/context are functional**: `@blue/factory` and `@blue/context` provide working DI/context patterns, with some infrastructure stubs still open.
- **Web stack is operational**: `@blue/http`, `@blue/router`, and `@blue/dispatcher` support a complete dispatch flow demonstrated in `blue-demo`.
- **Observability migrated**: `@blue/telemetry` now owns tracing/metrics/logging concerns; `@blue/logger` has been removed.
- **View/application layers are partial**: `@blue/view`, `@blue/view-webcomponent`, `@blue/service`, `@blue/domain`, and `@blue/boot` require focused completion work.

### Near-Term Priorities

1. ~~End-to-end telemetry integration in `blue-demo`~~ ✅
2. ~~Convention automation via `@blue/eslint-plugin`~~ ✅
3. `@blue/auth` MVP definition and implementation
4. ~~`@blue/orm` MVP definition and implementation~~ ✅

For strategic architecture direction (platform portability, boot lifecycle, boundary decisions, and package maturity), see [2026-03-08_ARCHITECTURE_ROADMAP.md](./docs/reference/2026-03-08_ARCHITECTURE_ROADMAP.md).

---

_© 2026 BlueJS Team. All rights reserved._
