# Feature Shared Dependency Contract — Micro Frontend Integration

**Date:** 2026-09-03
**Package:** `@blue/context` (core), `@blue/factory` (ContextToken/version annotations), `@blue/core` (new `@shared` decorator)
**Status:** Spec
**Depends on:** Existing `ApplicationContext` hierarchy, `FeatureContextMountManager`, `ContextToken`, `Registration`

---

## 1. Problem

A Blue micro frontend shell may host multiple feature contexts, each with its own bean registry. Without guardrails, two features can each register their own copy of a singleton bean (router, dispatcher, auth client, telemetry), and the application behaves incorrectly — duplicate router subscriptions, conflicting state, wasted memory.

Module Federation solves this at the **build level** with its `shared` / `shareScope` config. Blue needs an equivalent at the **runtime level**, using its existing context hierarchy as the dependency resolution chain.

**The core insight:** Blue's context hierarchy is already a shared-scope tree. A child context's `getValue()` walks up to the parent. The gap is that **nothing prevents a child from registering its own copy** of a bean that was intended to be a shell-wide singleton. The fix is a declaration system: "this bean is shared by the shell; features must not shadow it."

---

## 2. Design

### 2.1 The `@shared` Decorator

A decorator that marks a bean class as "shell-managed singleton — features resolve this from the parent, never create locally."

```ts
import { shared } from '@blue/core';

@shared()
class ShellRouter implements Router {
    // this bean lives in the shell context only
}

@shared({ singleton: true, version: '^1.0.0' })
class TelemetryService {
    // with optional version constraint
}
```

**Behavior at registration time** (in `_prepareFactory` or `registerBean`):

- If `@shared` is present on a bean registered in a feature (child) context, the factory skips registration and logs a warning: the instance is resolved from the parent chain at use time.
- The bean is **not duplicated** — it's resolved upward when injected via constructor or `getValue()`.

**Edge cases:**

| Scenario                                                    | Behavior                                                                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Feature registers `@shared` bean that parent doesn't have   | Warning, but registration proceeds (no parent to resolve from → feature needs its own)               |
| Feature registers non-`@shared` bean with same key as shell | Feature's copy shadows shell — **this is the current behavior**, preserved for intentional overrides |
| Two features declare the same `@shared` dependency          | Neither creates a copy; both resolve from shell                                                      |

**Implementation sketch:**

```ts
// packages/blue-core/src/shared.ts
import { SHARED_METADATA } from './shared-metadata';

interface SharedOptions {
    singleton?: boolean; // default true
    version?: string; // semver range like "^1.0.0"
}

const SHARED_KEY = Symbol('blue:shared');

export function shared(options?: SharedOptions) {
    return function (target: Function) {
        Reflect.defineMetadata(SHARED_KEY, options ?? { singleton: true }, target);
    };
}

export function isShared(target: Function): boolean {
    return Reflect.hasMetadata(SHARED_KEY, target);
}

export function getSharedOptions(target: Function): SharedOptions {
    return Reflect.getMetadata(SHARED_KEY, target) ?? {};
}
```

### 2.2 Version-Aware ContextToken

Extend `ContextToken<T>` to carry an optional semver range:

```ts
// Current
export const ROUTER = new ContextToken<Router>('router');

// New
export const ROUTER = new ContextToken<Router>('router', { requiredVersion: '^1.0.0' });
```

**During `getValue()`,** the factory checks the resolved bean's version against the token's `requiredVersion`. If the version is missing or mismatched, a warning fires. The bean is still used (soft enforcement — like Module Federation).

```ts
export class ContextToken<_T> {
    readonly description: string;
    readonly requiredVersion?: string;

    constructor(description: string, options?: { requiredVersion?: string }) {
        this.description = description;
        this.requiredVersion = options?.requiredVersion;
    }
}
```

**Version source:** Beans can carry their version via a static property or metadata:

```ts
@shared({ version: '1.2.0' })
class MyService {}

// or via a convention:
MyService.version = '1.2.0';
```

### 2.3 Shell's Shared Dependency Manifest

The shell declares which beans are shared singletons. Features declare what they consume. This is a **declared contract**, validated at mount time.

**Shell manifest:**

```ts
// In shell auto-configuration
@configuration
class ShellConfiguration {
    @entry
    registerSharedDependencies(registry: SharedDependencyRegistry): void {
        registry.declare({
            services: {
                ROUTER: { singleton: true, version: '^1.0.0' },
                DISPATCHER: { singleton: true, version: '^1.0.0' },
                AUTH_CLIENT: { singleton: true, version: '^2.0.0' },
            },
        });
    }
}
```

**Feature manifest:**

```ts
// In feature registration
featureMountManager.registerFeature({
    name: 'todo',
    createContext: () => todoContext,
    dependencies: {
        requires: {
            ROUTER: '^1.0.0',
            DISPATCHER: '^1.0.0',
        },
        optional: {
            AUTH_CLIENT: '^2.0.0',
        },
    },
});
```

**Validation at mount time:** Before `mount()` returns, the manager checks:

1. Every `requires` dependency is present in the ancestor chain (walking up to shell root).
2. Semver ranges are compatible.
3. Missing required dependencies throw; missing optional dependencies warn.

This catches deployment skew — if the shell was updated but a feature was not, or vice versa — before the feature runs.

### 2.4 SharedDependencyRegistry

A new service in `@blue/context` that:

- Lives in the shell context (registered at init)
- Accepts declarations from auto-configuration
- Validates feature dependency manifests at mount time
- Exposes `getDependency(name: ContextToken): { version: string } | undefined` for runtime inspection

```ts
interface SharedDependencyEntry {
    singleton: boolean;
    version: string;
}

interface SharedDependencyRegistry {
    declare(manifest: { services: Record<string, SharedDependencyEntry> }): void;
    validate(featureDeps: {
        requires: Record<string, string>;
        optional: Record<string, string>;
    }): DependencyValidationResult;
    getDependency(token: ContextToken): SharedDependencyEntry | undefined;
}
```

### 2.5 DependencyValidationResult

```ts
interface DependencyValidationResult {
    valid: boolean;
    missing: string[]; // required deps not found in ancestor chain
    versionMismatches: Array<{
        name: string;
        required: string;
        found: string;
    }>;
    warnings: string[]; // optional deps not found
}
```

---

## 3. Integration Points

### 3.1 FeatureRegistrationOptions Extension

```ts
// Current
interface FeatureRegistrationOptions extends FeatureContextOptions {
    unmountPolicy?: FeatureUnmountPolicy;
}

// New
interface FeatureRegistrationOptions extends FeatureContextOptions {
    unmountPolicy?: FeatureUnmountPolicy;
    dependencies?: {
        requires?: Record<string, string>; // token description → semver
        optional?: Record<string, string>;
    };
}
```

### 3.2 Factory Change: `getValue()` with Version Check

In `AbstractFactory.getValue()`, after resolving the value upward through the parent chain:

```ts
getValue<T>(nameOrToken: string | ContextToken<T>, args: any[] = []): T {
    const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;
    const token = typeof nameOrToken === 'object' ? nameOrToken : undefined;

    // Existing resolution logic...
    const value = /* resolved through hierarchy */;

    // New: version check
    if (token?.requiredVersion) {
        const actualVersion = getVersion(value);
        if (actualVersion && !semver.satisfies(actualVersion, token.requiredVersion)) {
            console.warn(
                `Dependency '${name}' version ${actualVersion} does not satisfy ` +
                `required range '${token.requiredVersion}'`
            );
        }
    }

    return value;
}
```

### 3.3 FeatureContextMountManager Validation

In `mount()`, after the feature context is created but before returning the composition:

```ts
mount(name: string): FeatureContextComposition {
    const registration = this.#requireRegistration(name);

    // New: validate shared dependencies
    if (registration.options.dependencies) {
        const registry = this.#getSharedDependencyRegistry();
        const result = registry.validate(registration.options.dependencies);

        if (!result.valid) {
            throw new DependencyValidationError(
                `Feature '${name}' has unmet dependencies`,
                result
            );
        }

        result.warnings.forEach(w => console.warn(`[${name}] ${w}`));
    }

    // ...existing mount logic...
}
```

---

## 4. Compatibility with FeatureRegistrationOptions.createContext

When a feature uses a custom `createContext` factory (instead of `parent.newChild`), the validation still works — the `SharedDependencyRegistry` lives in the shell/root context and walks the ancestor chain regardless of how the feature context was created. The factory hook is orthogonal.

---

## 5. What Changes

### New Files

| File                                                        | Description                                                     |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| `packages/blue-core/src/shared.ts`                          | `@shared()` decorator, `isShared()`, `getSharedOptions()`       |
| `packages/blue-context/src/shared-dependency-registry.ts`   | `SharedDependencyRegistry` interface and default implementation |
| `packages/blue-context/src/dependency-validation-result.ts` | Validation result type                                          |
| `packages/blue-context/src/dependency-validation-error.ts`  | Error class for failed validation                               |

### Modified Files

| File                                                         | Change                                                      |
| ------------------------------------------------------------ | ----------------------------------------------------------- |
| `packages/blue-factory/src/context-token.ts`                 | Add optional `requiredVersion` to constructor               |
| `packages/blue-factory/src/factory.ts`                       | `getValue()` checks `requiredVersion` against resolved bean |
| `packages/blue-context/src/feature-context-mount-manager.ts` | `mount()` validates deps before proceeding                  |
| `packages/blue-context/src/context-hierarchy.ts`             | `FeatureContextOptions` gains `dependencies` field          |
| `packages/blue-context/src/index.ts`                         | Export new symbols                                          |

### Unchanged

| `@blue/context` ApplicationContext / GenericApplicationContext | `@blue/router` SiteRouter / FeatureRoutingRegistry |
| -------------------------------------------------------------- | -------------------------------------------------- |
| Event gateway                                                  | Router interceptors                                |
| `@blue/boot` ApplicationBuilder                                | Existing tests                                     |

---

## 6. Packaging & Dependencies

The version check requires semver parsing. Options:

| Approach                                        | Pros                                | Cons                                     |
| ----------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| **(a) Depend on `semver`**                      | Full semver range support, standard | Adds ~7 KB to bundle                     |
| **(b) Depend on `semver-compare`**              | Lighter (~1 KB)                     | No range matching — exact or prefix only |
| **(c) Build simple range matcher**              | Zero deps                           | Reimplement semver poorly                |
| **(d) `require('semver')` with dynamic import** | Only loaded when check fires        | Async complication                       |

**Recommendation:** (a) — `semver` is the standard, already a transitive dep in most projects. Bundle impact is negligible for a framework package. Can be imported synchronously in factory code.

---

## 7. Open Questions

| Question                                                                | Options                                                  | Recommendation                                                                                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Should `@shared` validation be **opt-in** or **opt-out**?               | (a) Always enforced, (b) Enabled by config flag          | **Opt-in via manifest** — not all features will declare deps immediately                                                  |
| Version check: **hard error** or **soft warning**?                      | (a) Throw, (b) Warn + continue                           | **Warning** — same as Module Federation. Breaking a feature because of a minor version mismatch is too aggressive for 1.0 |
| Who owns the `SharedDependencyRegistry`?                                | (a) Shell context, (b) `@blue/boot`                      | **Shell context** — it's a shell-level concern                                                                            |
| Should version be extracted from `package.json` or explicit annotation? | (a) Auto-read `package.json`, (b) `@shared({ version })` | **Explicit annotation** — `package.json` is unreliable in bundled output                                                  |
| Rollout: add to existing `FeatureContextMountManager` or new package?   | (a) In-place, (b) New `@blue/mfe`                        | **In-place** — the feature mount manager is the right home. A separate package adds import overhead for no gain           |

---

## 8. Acceptance Criteria

| Gate                                                          | Verification                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `@shared()` decorator marks a class as shared                 | `isShared(MyService)` returns `true`                                 |
| Factory skips registration of `@shared` bean on child context | Bean not duplicated in child; `getValue()` resolves from parent      |
| `ContextToken` with `requiredVersion` warns on mismatch       | Token with `^1.0.0` + bean at `2.0.0` triggers console.warn          |
| `FeatureRegistrationOptions.dependencies` accepted            | Type check passes                                                    |
| `mount()` validates deps against `SharedDependencyRegistry`   | Missing required dep throws; missing optional dep warns              |
| `SharedDependencyRegistry` accepts shell manifest             | `registry.declare({...})` + `registry.validate({...})` returns valid |
| Existing features without `dependencies` field work unchanged | `mount()` skips validation when deps omitted                         |
| `pnpm build && pnpm test` passes                              | All 29 targets green                                                 |
| Existing `blue-demo` Todo feature compiles without change     | No regression                                                        |
