# Migration Guide: Legacy → BlueJS 1.0

**Date:** 2026-08-22  
**Applies to:** Projects migrating from BlueJS pre-1.0 patterns to the stable 1.0 API surface.

---

## 1. Decorator API (Breaking)

### TC39 Stage 3 Decorators

BlueJS 1.0 uses standard TC39 Stage 3 decorators only. Legacy `experimentalDecorators` and `reflect-metadata` are **not supported**.

**Before (legacy):**

```typescript
@RouteMapping('/users')
class UsersController {}
```

**After (modern):**

```typescript
@routeMapping('/users')
class UsersController {}
```

**Migration:**

- Replace PascalCase decorators with camelCase equivalents
- Replace `@RouteMapping` → `@routeMapping`
- Replace `@ErrorHandler` → `@errorHandler`
- Replace `@ErrorMapping` → `@errorMapping`
- Replace `@Configuration` → `@configuration`
- Replace `@Bean` / `@Entry` → `@entry`
- Remove `reflect-metadata` imports; use `@tsmetadata/polyfill` instead

### Validation Decorators

Validation decorators now support group-aware evaluation, custom error messages, and backend selection.

```typescript
@validated({ groups: [onCreate], backend: 'zod' })
class User {
    @notBlank({ groups: [onCreate] })
    name: string;
}
```

---

## 2. OXC Linting

The project has migrated from ESLint to `oxlint` as the primary linter.

**Before:**

```bash
npx eslint .
```

**After:**

```bash
oxlint .
```

Custom rules are provided by `@blue/eslint-plugin` as oxlint-compatible JS plugins. The `eslint.config.mjs` file is no longer used.

---

## 3. Package Reorganization

### New Packages

| Package                   | Purpose                                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `@blue/auth-core`         | Shared auth interfaces (`Principal`, `Session`, `AuthAdapter`)                                                 |
| `@blue/auth-client`       | Client-side auth (`AuthClient`, `ClientAuthGuard`, `OIDCAdapter`, `AuthHeaderInterceptor`)                     |
| `@blue/auth-server`       | Server-side auth (`AuthServer`, `AuthRouteGuard`, `JWTAdapter`)                                                |
| `@blue/orm-drizzle`       | SQL persistence via Drizzle ORM (`DrizzleDataSource`, `DrizzleEntityManager`)                                  |
| `@blue/platform-node`     | Node.js platform support (`NodeEnvironment`, argument resolvers, `FileSystemRouter`)                           |
| `@blue/platform-web`      | Browser platform support (`HashRouter`, `BrowserRouter`, `OfflineInterceptor`, argument resolvers)             |
| `@blue/view-webcomponent` | Web Component view engine and custom element bindings                                                          |
| `@blue/host`              | Centralized micro frontend orchestration (`HostManager` + `HOST_MANAGER_TOKEN`; one-call feature registration) |

### Removed/Consolidated

- `@blue/logger` replaced by `@blue/telemetry`
- Legacy `.legacy.js` files removed from all packages
- `eslint.config.mjs` removed (oxlint is the linter)
- Demo app `apps/blue-host` npm name renamed `@blue/host` → `@blue/host-demo` (scope name now the framework package `@blue/host`)

---

## 4. Build Configuration

### TypeScript

- Target: `ES2022` (was `ES2015` or `ES2017` in legacy configs)
- Module: `ESNext` (ESM only — no CommonJS output)
- Module resolution: `Bundler`
- Decorators: Standard TC39 (not `experimentalDecorators`)
- `erasableSyntaxOnly: true` signals the codebase is transform-safe

### Build Pipeline

```bash
# Development
pnpm build          # Build all packages
pnpm test           # Run all tests
pnpm lint           # Lint with oxlint

# Single package
cd packages/blue-core && pnpm build:lib
```

The build uses `tsc -b` (project references) with per-package `tsconfig.build.json` files. No bundler (esbuild/rollup) is involved in library builds.

---

## 5. Validation API

The `@validated` class decorator now supports backend selection and custom error formatting.

```typescript
import { validated, email, min, setErrorMessageFormatter } from '@blue/validate';

// Custom error messages
setErrorMessageFormatter((constraint, field, value, msg) => {
    return msg ?? `Field "${field}" failed "${constraint}" with value "${value}"`;
});

@validated({ backend: 'zod' })
class User {
    @email({ message: 'Invalid email address' })
    email: string;

    @min({ value: 18 })
    age: number;
}
```

---

## 6. Content & Theme API

Content sources now support priority-ordered merging and Accept-Language negotiation.

```typescript
import { PriorityContentSource, NegotiatingContentSource, StaticContentSource } from '@blue/content';

// Priority-ordered content (higher priority overrides lower)
const merged = new PriorityContentSource([overrides, base]);

// Accept-Language negotiation
const negotiator = new NegotiatingContentSource(base, 'en');
negotiator.getContent('title', 'fr-CH, fr;q=0.9, en;q=0.8');
```

---

## 7. Application Boot

```typescript
import { ApplicationBuilder, ConfigurationProperties } from '@blue/boot';
import { property } from '@blue/context';

@ConfigurationProperties('server')
class ServerConfig {
    @property('port')
    port: number = 8080;
}

// From JSON config
const app = await ApplicationBuilder.fromConfig('/config.json');
const context = app.run();

// Resolve typed config
const { instance } = resolveConfigurationProperties(ServerConfig, context);
console.log(instance.port); // → from environment
```

---

## 8. Deprecated APIs

| API                                 | Replacement                                | Removed In |
| ----------------------------------- | ------------------------------------------ | ---------- |
| `reflect-metadata` import           | `@tsmetadata/polyfill`                     | 1.0        |
| `eslint.config.mjs`                 | `.oxlintrc.json`                           | 1.0        |
| `@blue/logger`                      | `@blue/telemetry`                          | Pre-1.0    |
| `.legacy.js` files                  | Modern TypeScript equivalents              | Pre-1.0    |
| `experimentalDecorators: true`      | TC39 Stage 3 decorators (default)          | 1.0        |
| `SiteBuilder`                       | `@experimental` — use `ApplicationBuilder` | Post-1.0   |
| `SiteRouter`                        | `PartitionRouter` (rename, see §8.1)       | Pre-1.0    |
| `FeatureRoutingRegistry.siteRouter` | `partitionRouter` getter                   | Pre-1.0    |
| `CompositionTransformer`            | Use named transformer classes              | Future     |

---

### 8.1 `SiteRouter` → `PartitionRouter` (Pre-1.0)

The micro frontend route partitioner was renamed to match the
`route-partition.ts` vocabulary (`matchesPartitionPath`,
`normalizePartitionPrefix`, `stripPartitionPrefix`,
`restorePartitionPrefix`) and retires the last "Site" identifier (the Site
model was retired.

**Before (legacy):**

```typescript
import { SiteRouter } from '@blue/router';
const router = new SiteRouter();
router.mount('/todo', callback);
```

**After (modern):**

```typescript
import { PartitionRouter } from '@blue/router';
const router = new PartitionRouter();
router.mount('/todo', callback);
```

**Migration:**

- `SiteRouter` → `PartitionRouter`
- `FeatureRoutingRegistry.siteRouter` getter/constructor param → `partitionRouter`
- Demo-only `createTodoSiteRouter`/`createTodoPartitionRouter` helpers removed — use `PartitionRouter.mount` directly or `HostManager.registerFeature`
- New additive capabilities: `PartitionRouter.unmount(prefix)`,
  `FeatureRoutingRegistry.unregister(name)`, `FeatureContextMountManager.unregister(name)`

### 8.2 Host orchestration via `@blue/host` (Pre-1.0)

Micro frontend hosts compose the shell through `@blue/host` `HostManager`
instead of hand-wiring `FeatureContextMountManager` +
`FeatureRoutingRegistry` with closure joins.

**Before (legacy):**

```typescript
const mountManager = new FeatureContextMountManager(shell);
const featureRouter = new FeatureRoutingRegistry(undefined, { activationPolicy: 'exclusive' });
mountManager.registerFeature({ name: 'catalog', loader: () => import('./catalog') });
featureRouter.registerFeature({
    name: 'catalog',
    prefix: '/catalog',
    onActivate: () => mountManager.mountLazy('catalog'),
    onDeactivate: () => mountManager.unmount('catalog'),
    onRoute: () => {},
});
```

**After (modern):**

```typescript
import { HostManager, HOST_MANAGER_TOKEN } from '@blue/host';
const host = new HostManager(shell, { activationPolicy: 'exclusive' });
host.registerFeature({
    name: 'catalog',
    prefix: '/catalog',
    loader: () => import('./catalog'),
    dependencies: { requires: { router: '^1.0.0' } },
});
shell.setValue(HOST_MANAGER_TOKEN, host);
```

**Migration:**

- Replace the two-registry registration pair with one
  `HostManager.registerFeature` call per feature
- Resolve the orchestrator from the shell context via `HOST_MANAGER_TOKEN`
- `onRoute` (feature-local route dispatch) and `onDeactivate` (post-unmount
  hook) are available as registration options

---

## 9. Testing

```bash
# Run all tests
pnpm test

# Single package
pnpm vitest run packages/blue-core/test

# Single file
pnpm vitest run packages/blue-core/test/primitive.spec.ts
```

Tests use Vitest with `jsdom` environment for browser-dependent code. All new code should target ≥85% line coverage.

---

## 10. Quick Reference

| Command               | Purpose                           |
| --------------------- | --------------------------------- |
| `pnpm build`          | Build all 27 packages             |
| `pnpm test`           | Run all test suites               |
| `pnpm lint`           | Lint entire workspace with oxlint |
| `pnpm format`         | Format with Prettier              |
| `pnpm approve-builds` | Approve native build dependencies |
