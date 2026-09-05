# RouteRegistry — Type-Safe Routes from Decorator Metadata

**Date:** 2026-09-03  
**Package:** `@blue/router` (new `RouteRegistry` + `RouteDefinition` classes)  
**Status:** Design  
**Depends on:** Existing `@routeMapping` decorator, `LinearMetadataHandlerMapping`, `PathRoute`, `ApplicationContext`

---

## 1. Problem

The current routing system has type-safe **handler parameters** (`Route<{id: string}>`) but stringly-typed **URL generation**:

```ts
// Handler side — typed
@routeMapping('/users/{id}')
handle(route: Route<{id: string}>) { … }

// URL generation — untyped string concatenation
router.navigate('#/users/' + userId);
return new ModelAndView(new RerouteView('/users/' + userId));
const link = `#${toTodoShellRoute('/')}`;
```

Every URL is a stringly-typed concatenation. Typos, wrong param names, missing slashes — all caught at runtime or not at all.

---

## 2. Approach

Do not change the `@routeMapping` decorator. It is the single source of truth. A new `RouteRegistry` service reads the same `Symbol.metadata` that `LinearMetadataHandlerMapping` already reads and builds a typed route tree.

**The `@routeMapping` decorator already stores everything needed.** The registry is purely additive — it reads existing metadata and materializes a developer-facing API.

### Flow

```
@routeMapping decorators → Symbol.metadata
       ↓
ApplicationBuilder.run() → ApplicationContext
       ↓
RouteRegistry scans beans' constructor metadata
       ↓
RouteRegistry builds nested RouteDefinition tree
       ↓
RouteRegistry registers itself as a bean
       ↓
User injects RouteRegistry → routes.users.byId.url({id: '123'})
```

---

## 3. The Leaf Type — `RouteDefinition`

Each leaf in the route tree is an instance of `RouteDefinition<T>` — a single object that can act as a URL generator, redirect factory, navigator, and route matcher.

````ts
class RouteDefinition<TPattern extends string = string> {
    /** The raw route pattern, e.g. "/users/{id}" */
    readonly pattern: TPattern;

    /**
     * Generate a URL string from path parameters.
     * When there are no path parameters, call without arguments.
     *
     * ```ts
     * routes.users.byId.url({ id: '123' })
     * routes.index.url()
     * ```
     */
    url(): IsEmptyObject<RouteParams<TPattern>> extends true ? string : never;
    url(params: RouteParams<TPattern>): string;

    /**
     * Generate a full hash-anchored href for browser navigation.
     *
     * ```ts
     * <a href="${routes.users.byId.href({ id: '123' })}">
     * ```
     */
    href(): IsEmptyObject<RouteParams<TPattern>> extends true ? string : never;
    href(params: RouteParams<TPattern>): string;

    /**
     * Return a ModelAndView wrapping a RerouteView for controller redirects.
     *
     * ```ts
     * @routes.users.create
     * async handle(route: Route) {
     *     const user = await this.service.create(route.params);
     *     return routes.users.byId.redirect({ id: user.id });
     * }
     * ```
     */
    redirect(): IsEmptyObject<RouteParams<TPattern>> extends true ? ModelAndView : never;
    redirect(params: RouteParams<TPattern>): ModelAndView;

    /**
     * Navigate the router to this route. For use in services/interceptors
     * where returning a ModelAndView is not possible.
     *
     * ```ts
     * routes.login.navigate();
     * ```
     */
    navigate(): IsEmptyObject<RouteParams<TPattern>> extends true ? void : never;
    navigate(params: RouteParams<TPattern>): void;

    /**
     * Parse a raw URL path and extract typed parameters.
     * Returns null if the path does not match this route's pattern.
     *
     * ```ts
     * const result = routes.users.byId.parse('/users/123');
     * result.params.id // "123"
     * ```
     */
    parse(path: string): Route<RouteParams<TPattern>> | null;

    /**
     * Check whether a URL path matches this route's pattern.
     *
     * ```ts
     * routes.users.byId.matches('/users/123') // true
     * routes.users.byId.matches('/users')     // false
     * ```
     */
    matches(path: string): boolean;
}
````

### Type-Level Helpers

```ts
/**
 * Extract path parameters from a route pattern string.
 *
 * RouteParams<'/users/{id}'>           → { id: string }
 * RouteParams<'/users/{id}/posts/{p}'> → { id: string; p: string }
 * RouteParams<'/'>                     → {}
 * RouteParams<'/index'>                → {}
 */
type RouteParams<T extends string> = T extends `${string}{${infer P}}${infer Rest}`
    ? Record<P, string> & RouteParams<Rest>
    : {};

/**
 * Check whether a type is an empty object.
 */
type IsEmptyObject<T> = keyof T extends never ? true : false;
```

### Relationship to Existing Classes

| Concern             | Existing                                         | RouteDefinition                            |
| ------------------- | ------------------------------------------------ | ------------------------------------------ |
| URL pattern storage | `Symbol.metadata` via `@routeMapping`            | Same — reads from the same source          |
| URL parsing         | `PathRoute` constructor                          | `.parse()` delegates to `PathRoute`        |
| URL generation      | String concatenation                             | `.url()` interpolates the pattern          |
| Redirect            | `new ModelAndView(new RerouteView(path))`        | `.redirect()` wraps `RerouteView`          |
| Navigation          | `router.navigate(path)`                          | `.navigate()` calls injected router        |
| Registration        | `@routeMapping` → `LinearMetadataHandlerMapping` | Unchanged — `RouteDefinition` is read-only |

**`RouteDefinition` is purely a consumer-facing convenience.** It delegates to `PathRoute`, `RerouteView`, and the `Router` under the hood. None of those classes change.

---

## 4. The Registry — `RouteRegistry`

### Path-to-Key Convention

The registry derives keys from route patterns by convention:

| Pattern           | Key          | Rationale                    |
| ----------------- | ------------ | ---------------------------- |
| `'/'`             | `'index'`    | Root — there can be only one |
| `'/users'`        | `'users'`    | Match the segment            |
| `'/users/{id}'`   | `'byId'`     | CamelCase of the param hint  |
| `'/users/create'` | `'create'`   | Match the segment            |
| `'/settings'`     | `'settings'` | Match the segment            |
| `'/login'`        | `'login'`    | Match the segment            |

**Class + Method Composition:**

```ts
@routeMapping('/')           // class-level → root namespace
class IndexController {
    @routeMapping('/index')  → routes.index
    @routeMapping('/about')  → routes.about
    handleIndex() {}
    handleAbout() {}
}

@routeMapping('/account')    // class-level → routes.account
class AccountController {
    @routeMapping('/')       → routes.account.index
    @routeMapping('/settings') → routes.account.settings
}

@routeMapping('/users')      // class-level → routes.users
class UsersController {
    @routeMapping('/')       → routes.users.index
    @routeMapping('/create') → routes.users.create
    @routeMapping('/{id}')   → routes.users.byId
}
```

The composition reuses `URLGlobPathMatcher.merge()` — the same method the dispatcher uses to combine class and method patterns. `/` acts as identity, so a class at `/` passes the method path through unchanged.

### Override via Decorator Config

The convention can be overridden by passing a `name` option to `@routeMapping`:

```ts
@routeMapping({ value: '/admin/users', name: 'userManagement' })
handle() {}
→ routes.userManagement

@routeMapping({ value: '/api/v2/users', name: 'apiUsers' })
handle() {}
→ routes.apiUsers
```

### Configuration for `'/'` → `'by*'` Pattern

Some routes don't map cleanly to their path segment:

```ts
@routeMapping({ value: '/{id}', name: 'byId' })  // → routes.users.byId
handle() {}

@routeMapping({ value: '/{userId}', name: 'byUserId' })  // → routes.users.byUserId
handle() {}
```

**Default naming for parameterized routes:** If no `name` is given and the pattern is a single param like `/{id}`, derive the key as `byId`. This is the most common pattern and deserves a sensible default.

### Implementation Sketch

```ts
class RouteRegistry {
    readonly #defs: Map<string, RouteDefinition>;
    readonly #tree: Record<string, unknown>;

    constructor(context: ApplicationContext) {
        this.#defs = new Map();
        this.#tree = {};

        // Scan all beans for @routeMapping metadata
        for (const bean of context.getBeans()) {
            this.#registerBean(bean);
        }

        // Build nested tree from flat def map
        this.#tree = this.#buildTree();
    }

    #registerBean(bean: object): void {
        const ctor = bean.constructor;
        const classMeta = getRouteMapping(ctor);
        const classPath = classMeta?.value ?? '/';

        for (const method of Object.getOwnPropertyNames(ctor.prototype)) {
            const methodMeta = getRouteMapping(ctor.prototype, method);
            if (!methodMeta) continue;

            const methodPath = methodMeta.value;
            const mergedPath = URLGlobPathMatcher.merge(classPath, methodPath);

            // Derive key from the method's path segment
            const key = this.#deriveKey(methodMeta.name ?? methodPath);

            const def = new RouteDefinition(mergedPath, context);
            this.#defs.set(key, def);
        }
    }

    #deriveKey(path: string): string {
        if (path === '/' || path === '') return 'index';

        // Remove leading slash, take the last segment
        const segment = path.replace(/^\//, '').split('/').pop()!;

        // If it's a path param like {id}, derive as "byId"
        if (segment.startsWith('{') && segment.endsWith('}')) {
            const param = segment.slice(1, -1);
            return `by${param.charAt(0).toUpperCase()}${param.slice(1)}`;
        }

        return segment;
    }

    #buildTree(): Record<string, unknown> {
        // Convert flat key → path into a nested object
        // keys: ['users', 'users.byId', 'account.index', 'index']
        // structure:
        //   users: { byId: RouteDefinition, index: RouteDefinition }
        //   account: { index: RouteDefinition }
        //   index RouteDefinition
    }

    /**
     * Access a route definition by dotted path.
     * Used internally for property resolution.
     */
    get<T extends string>(path: string): RouteDefinition<T> | undefined {
        return this.#defs.get(path);
    }
}
```

### How the User Gets the Routes Object

```ts
// controllers/users-controller.ts
class UsersController {
    // Inject via the application context
    constructor(private routes: RouteRegistry) {}

    @routes.users.create // ← wait, this can't work at module scope
    async handle(route: Route) {
        const user = await this.service.create(route.params);
        return this.routes.users.byId.redirect({ id: user.id });
    }
}
```

**Key constraint:** The decorator `@routes.users.create` cannot be resolved at module scope because the `RouteRegistry` doesn't exist yet. The decorator must remain `@routeMapping(...)` — the `RouteRegistry` is for **navigation and URL generation**, not for registration.

The correct pattern:

```ts
@routeMapping('/users/create')
class UsersController {
    constructor(private routes: RouteRegistry) {}

    async handle(route: Route) {
        const user = await this.service.create(route.params);
        return this.routes.users.byId.redirect({ id: user.id });
    }
}
```

And in a view or service that gets access to the context:

```ts
// Access via injected RouteRegistry
render() {
    return `<a href="${this.routes.users.byId.href({ id: user.id })}">...</a>`;
}
```

---

## 5. RouteDefinition Implementation Details

### URL Generation (`.url()`)

```ts
class RouteDefinition<TPattern extends string> {
    url(params: RouteParams<TPattern>): string {
        let url = this.pattern;
        for (const [key, value] of Object.entries(params ?? {})) {
            url = url.replace(`{${key}}`, String(value));
        }
        return url;
    }
}
```

### HRef Generation (`.href()`)

```ts
href(params: RouteParams<TPattern>): string {
    return `#${this.url(params)}`;  // prefix matches HashRouter convention
}
```

### Redirect (`.redirect()`)

```ts
redirect(params: RouteParams<TPattern>): ModelAndView {
    return new ModelAndView(new RerouteView(this.url(params)));
}
```

The `RerouteView` already exists and the dispatcher already handles it. No new infrastructure.

### Navigation (`.navigate()`)

```ts
navigate(params: RouteParams<TPattern>): void {
    // The router is resolved from the application context
    const router = this.#context.getValue(ROUTER);
    const path = this.url(params);

    if (router.navigate) {
        router.navigate(path);
    }
}
```

### Parse (`.parse()`)

```ts
parse(path: string): Route<RouteParams<TPattern>> | null {
    const route = new PathRoute(path);
    if (route.path === this.url({} as any)) {  // simple match check
        return route as Route<RouteParams<TPattern>>;
    }
    return null;
}
```

---

## 6. Integration with the Application Context

### Boot-Time Registration

The `RouteRegistry` is constructed during `ApplicationBuilder.run()` after all beans are registered:

```ts
// In ApplicationBuilder or an auto-configuration class
@configuration
class RouteRegistryConfiguration {
    @entry
    routeRegistry(context: ApplicationContext): RouteRegistry {
        const registry = new RouteRegistry(context);
        return registry;
    }
}
```

### Shell / Feature Routing

Feature routes (like the current `toTodoShellRoute`, `toAccountShellRoute`) would be branches of the same tree. The `FeatureRoutingRegistry` already knows the prefix — it passes it to the `RouteRegistry` so that feature routes are namespaced:

```
routes
├── todo                     // routes.todo → todo feature
│   ├── index               //   routes.todo.index
│   ├── active              //   routes.todo.active
│   └── completed           //   routes.todo.completed
├── account                 // routes.account → account feature
│   ├── index               //   routes.account.index
│   └── settings            //   routes.account.settings
├── auth
│   ├── login
│   ├── profile
│   └── admin
└── index                   // routes.index → shell root
```

---

## 7. What Changes

### New Code

| File                                                       | Description                                                                                   |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `packages/blue-router/src/route-definition.ts`             | `RouteDefinition<T>` class with `.url()`, `.href()`, `.redirect()`, `.navigate()`, `.parse()` |
| `packages/blue-router/src/route-registry.ts`               | `RouteRegistry` class — scans bean metadata, builds route tree                                |
| `packages/blue-router/src/route-registry-configuration.ts` | Auto-configuration `@configuration` that creates and registers the `RouteRegistry`            |

### Modified Code

| File                                            | Change                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| `packages/blue-router/src/index.ts`             | Export `RouteDefinition`, `RouteRegistry`                              |
| `packages/blue-dispatcher/src/route-mapping.ts` | Accept optional `name` in `RouteMappingConfiguration` for key override |

|

### Unchanged

| `@routeMapping` decorator (existing behavior)|`PathRoute`, `RerouteView`, `MdelAndView`| `LnearMetadataHandlerMapping`, `AstractHandlerMethodMapping`| All interceptors, exeution chain, vie resolvers, eature routing|

---

## 8. Accepance Criteria

| Gate                                                           | Venification                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------- |
| `RoteDef.url()` interpolates path ars                          | `nex` `RoteDef<"/users/{id}">`.url({id: "123"})`→`"/users/123"` |
| `RoteDef.url()` with no pars                                   | `nex` `RoteDef<"/">`.url()`→`"/"`                               |
| `RoteDef.href()` adds hash refix                               | `.href()` → `"#/..."`                                           |
| `RoteDef.redirect()` returns `ModelAndView` with `RerouteView` | Type check + runtime check                                      |
| `RoteDef.parse()` parses a path back                           | `.parse('/users/123').params.id` → `"123"`                      |
| `RoeRegistry` scans `@routeMapping` metadata                   | Unit test with mock beans                                       |
| `RouteRegistry` drives keys by convention                      | `'/'` → `'index'`, `'/users'` → `'users'`, `'/{id}'` → `'byId'` |
| `Routeegistry` supports `name` override                        | `@routeMapping({ value:'/x', name:'customKey' })`               |

---

## 9. Open Questions

| Question                                                         | Cnsideration                                           | Recommendation                                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Should `{#x#}ijec` patter be supported for programmatic use?** | `@InjectRouts` on a consumer                           | Keep simple — inject the `RouteRegistry` from the context                                        |
| **Wht about non-hash routers (`BrowserRouter`)?**                | `href()` currently hardcodes `#` prefix                | Mak`href()` aware of the router type, or add a separate `path()` that returns the raw URL        |
| **Should feature routes be scoped?**                             | Feature spin-off contexts have their own RouteRegistry | Yes — the `FeaureRoutingRegistry` passes its prefix to the `RouteRegistry`                       |
| **ow are multi-segment method paths handled?**                   | `@routeMapping('/api/v2/users')` without a class       | N ot supported — single-segment-per-decorator. Class+method composition is the intended pattern. |
