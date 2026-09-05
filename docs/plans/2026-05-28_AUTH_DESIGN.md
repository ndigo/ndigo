# 2026-05-28 Auth & ORM Post-MVP Design

## Overview

Wave 9 adds `@blue/auth` (new package) and extends `@blue/orm` with relation decorators, lifecycle hooks, `@transactional`, and the `@blue/orm-drizzle` adapter.

## 9a. `@blue/auth`

### Goals

- Authentication strategy abstraction (pluggable, injectable)
- `Principal` and `Session` as first-class domain types
- `@authenticated` / `@authorized(role)` TC39 decorators for route guarding
- `AuthHeaderInterceptor` for `@blue/http` (injects `Authorization: Bearer <token>`)
- `AuthRouteGuard` for `@blue/dispatcher` (pre-handle guard)

### Package Dependencies

- peerDependencies: `@blue/core`, `@blue/context`, `@blue/dispatcher`, `@blue/http`, `@blue/router`

### Core Interfaces

```typescript
// principal.ts
interface Principal {
    readonly id: string;
    readonly name: string;
    readonly roles: ReadonlyArray<string>;
    hasRole(role: string): boolean;
    hasAnyRole(...roles: string[]): boolean;
}

class AnonymousPrincipal implements Principal {
    /* id='anonymous', name='Anonymous', roles=[] */
}

// session.ts
interface Session {
    readonly principal: Principal | null;
    readonly token: string | null;
    readonly isAuthenticated: boolean;
    setPrincipal(principal: Principal, token: string): void;
    clear(): void;
}

class DefaultSession implements Session {
    /* #principal, #token private fields */
}

// authentication-strategy.ts
interface AuthenticationStrategy<C = unknown> {
    supports(credentials: unknown): credentials is C;
    authenticate(credentials: C): Promise<Principal | null>;
}

// authentication-manager.ts
class AuthenticationManager {
    register(strategy: AuthenticationStrategy<any>): void;
    async authenticate(credentials: unknown): Promise<Principal | null>;
}
```

### Decorators (TC39 camelCase)

Metadata key constants (in `_constants.ts`):

- `AUTH_REQUIRED_KEY = 'auth:required'`
- `AUTH_ROLES_KEY = 'auth:roles'`

```typescript
// @authenticated — class or method decorator
// class: stores metadata[AUTH_REQUIRED_KEY] = true
// method: stores metadata[`${AUTH_REQUIRED_KEY}:${methodName}`] = true
function authenticated(target, context: ClassDecoratorContext | ClassMethodDecoratorContext): void;

// @authorized(role) — class or method decorator factory
// class: appends role to metadata[AUTH_ROLES_KEY]
// method: appends role to metadata[`${AUTH_ROLES_KEY}:${methodName}`]
function authorized(role: string): (target, context) => void;
```

### AuthRouteGuard

Implements `RouteHandlerInterceptor` from `@blue/dispatcher`. Receives `Session` via constructor.

In `preHandle(route, handler)`:

1. `handler.handler.constructor[Symbol.metadata]` → class metadata
2. `handler.method` → method name string
3. Check class-level + method-level `auth:required` and `auth:roles`
4. If no auth required and no roles required → return `true`
5. If not `session.isAuthenticated` → return `false`
6. If roles required → check all roles via `session.principal.hasRole(role)`

### AuthHeaderInterceptor

Implements `RequestAwareHTTPInterceptor` from `@blue/http`. Receives `Session` via constructor.

In `preRequest(request, http)`:

1. If `!session.isAuthenticated || !session.token` → return void (no-op)
2. Clone request with `Authorization: Bearer ${session.token}` header set
3. Return the cloned `Request`

### Public API (`index.ts` exports)

- Types: `Principal`, `Session`, `AuthenticationStrategy`
- Classes: `AnonymousPrincipal`, `DefaultSession`, `AuthenticationManager`, `AuthRouteGuard`, `AuthHeaderInterceptor`
- Decorators: `authenticated`, `authorized`

---

## 9b. `@blue/orm` Post-MVP

### Relation Decorators

All store metadata on the class using the same array-accumulation pattern as `@column`. Metadata keys in `_constants.ts`:

```typescript
RELATIONS_KEY = 'orm:relations';

interface RelationMetadata {
    kind: 'oneToMany' | 'manyToOne' | 'manyToMany' | 'oneToOne';
    fieldName: string;
    targetEntity: () => new (...args: any[]) => any; // lazy ref to avoid circular deps
    options?: RelationOptions;
}
```

Decorators:

- `@oneToMany(targetEntity, options?)` — field decorator
- `@manyToOne(targetEntity, options?)` — field decorator
- `@manyToMany(targetEntity, options?)` — field decorator
- `@oneToOne(targetEntity, options?)` — field decorator

### Entity Lifecycle Hooks

Metadata key: `LIFECYCLE_HOOKS_KEY = 'orm:lifecycle'`

```typescript
type LifecycleEvent = 'prePersist' | 'postLoad' | 'preUpdate' | 'postRemove';
```

Decorators (method decorators):

- `@prePersist` — called before insert/update
- `@postLoad` — called after entity is loaded from store
- `@preUpdate` — called before update only
- `@postRemove` — called before delete

Each stores `{ event: LifecycleEvent, methodName: string }` into a `LIFECYCLE_HOOKS_KEY` array in metadata.

The `InMemoryEntityManager` must call lifecycle hooks at appropriate points.

### `@transactional` Method Decorator

Wraps the target method in a `unitOfWork.begin()` / `unitOfWork.commit()` / `unitOfWork.rollback()` transaction. Stores `'orm:transactional'` flag in method-level metadata.

---

## 9c. `@blue/orm-drizzle` Adapter

### Package

- New package `packages/blue-orm-drizzle/`
- IS the integration layer for drizzle-orm (can import drizzle directly)
- peerDependencies: `@blue/orm`, `@blue/core`
- dependencies: `drizzle-orm`, `better-sqlite3`
- devDependencies: `@types/better-sqlite3`

### Key Concepts

Dynamic schema: reads `@entity`/`@column` metadata at runtime → builds drizzle table via `sqliteTable()`.

```typescript
class DrizzleDataSource implements DataSource {
    // wraps BetterSQLite3Database (drizzle db instance)
    constructor(db: BetterSQLite3Database);
}

class DrizzleEntityManager implements EntityManager {
    // Uses DrizzleDataSource + dynamically-built table schema
    // Implements: find, findAll, save, delete
}
```

### Schema Builder (`_schema-builder.ts`)

- Reads `entityNameMetadataKey` and `columnsMetadataKey` from entity constructor `[Symbol.metadata]`
- Maps column `type` string to drizzle column type ('text' → `text()`, 'integer'/'number' → `integer()`, etc.)
- Returns `SQLiteTableWithColumns<...>` — used by `DrizzleEntityManager` for queries

---

## Demo Gate

Extend `apps/blue-demo-node/` with two new routes:

1. `POST /auth/login` — accepts `{ username, password }`, authenticates, returns `{ token }`
2. `GET /notes` — `@authenticated` guard, returns all `Note` entities from DB
3. `POST /notes` — `@authenticated` guard, saves a new `Note` entity via `@blue/orm-drizzle`

`Note` entity: `@entity`, `@primaryColumn` id, `@column` title, `@column` body, `@column` createdAt.
