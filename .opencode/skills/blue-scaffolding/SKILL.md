---
name: blue-scaffolding
description: Standard BlueJS package skeleton, file templates, and new-package checklist.
---

# Blue Scaffolding

Use this skill when creating new @blue/\* packages or adding files to existing packages.

## Standard Package Skeleton

```
packages/blue-{name}/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── src/
│   └── index.ts
└── test/
```

## package.json Template

```json
{
    "name": "@blue/{name}",
    "version": "0.0.1",
    "description": "Blue {Name} – {description}",
    "type": "module",
    "files": ["doc", "lib"],
    "exports": "./lib/index.js",
    "types": "lib/index.d.ts",
    "scripts": {
        "build:lib": "tsc -b tsconfig.build.json",
        "test": "vitest run",
        "test:watch": "vitest"
    },
    "author": "Jeff Rose <jeff_rose@outlook.com>",
    "license": "ISC",
    "sideEffects": false
}
```

Key rules:

- `"type": "module"` is mandatory (ESM-only).
- Cross-package `@blue/*` deps go in BOTH `devDependencies` AND `peerDependencies`.
- External runtime deps go in `dependencies` only.

## tsconfig.json

```json
{ "extends": "./tsconfig.build.json" }
```

## tsconfig.build.json

```json
{
    "extends": "../../tsconfig.build.json",
    "compilerOptions": {
        "baseUrl": ".",
        "composite": true,
        "outDir": "./lib",
        "rootDir": "./src",
        "skipLibCheck": true
    },
    "exclude": ["node_modules/**/*", "**/*.spec.ts", "**/*.test.ts", "vite.config.ts", "vitest.config.ts"],
    "include": ["src/**/*"]
}
```

## src/index.ts Header

```typescript
/**
 * @author Jeff Rose
 * @module {name}
 */
```

## New File Conventions

- Author header: `/** @author Jeff Rose */`
- `Symbol.toStringTag` getter on every class
- TSDoc (`/** ... */`) for all public APIs
- kebab-case filenames
- Internal files: `_` prefix (e.g., `_util.ts`)

## New Package Checklist

- [ ] Create package directory under `packages/blue-{name}/`
- [ ] Add `package.json`, `tsconfig.json`, `tsconfig.build.json`
- [ ] Create `src/index.ts` with author header
- [ ] Create `test/` directory
- [ ] Add `@blue/{name}` alias to root `vitest.config.ts`
- [ ] Run `pnpm install` to create workspace symlinks
- [ ] Run `pnpm build` to verify compilation
