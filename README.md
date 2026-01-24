# BlueJS

A modular JavaScript/TypeScript framework organized as a Lerna monorepo with Yarn workspaces.

## Requirements

- **Node.js:** ≥18.0.0
- **npm:** ≥9.0.0
- **Yarn:** ≥1.22.0 (Yarn 4 enabled via corepack)

## Technology Stack

- **TypeScript:** 5.7.2 (ES2022 target)
- **ESLint:** 9.17.0 (flat config)
- **Lerna:** 8.2.4 (monorepo management)
- **webpack:** 5.97.1 (bundling)
- **Jest:** 29.7.0 (testing)

## Getting Started

```bash
# Enable Yarn via corepack (first time only)
corepack enable
corepack prepare yarn@stable --activate

# Install dependencies
yarn install

# Build all packages
npx lerna run build:lib --stream

# Lint code
npx eslint .
```

## Packages

- [blue-content](packages/blue-content/README.md)
- [blue-context](packages/blue-context/README.md)
- [blue-core](packages/blue-core/README.md)
- [blue-demo](packages/blue-demo/README.md)
- [blue-dispatcher](packages/blue-dispatcher/README.md)
- [blue-domain](packages/blue-domain/README.md)
- [blue-factory](packages/blue-factory/README.md)
- [blue-fill](packages/blue-fill/README.md)
- [blue-has](packages/blue-has/README.md)
- [blue-http](packages/blue-http/README.md)
- [blue-logger](packages/blue-logger/README.md)
- [blue-model](packages/blue-model/README.md)
- [blue-parser](packages/blue-parser/README.md)
- [blue-platform-web](packages/blue-platform-web/README.md)
- [blue-print](packages/blue-print/README.md)
- [blue-router](packages/blue-router/README.md)
- [blue-util](packages/blue-util/README.md)
- [blue-validate](packages/blue-validate/README.md)
- [blue-view](packages/blue-view/README.md)
- [blue-view-ractive](packages/blue-view-ractive/README.md)
- [blue-view-webcomponent](packages/blue-view-webcomponent/README.md)

# Development

## Build Commands

```bash
# Build a single package (from package directory)
yarn build:lib        # Compile TypeScript to ESM in lib/
yarn build:bundle     # Create webpack bundle as index.js
yarn build:all        # Both lib and bundle

# Build all packages in parallel
yarn on:all build:lib
yarn on:all build:bundle

# Build in dependency order (recommended)
npx lerna run build:lib --stream
```

## Testing

```bash
# Run tests for a single package (from package directory)
yarn test             # Uses Karma for browser testing

# Run tests for all packages
yarn on:all test
```

## Code Style

The project uses ESLint 9 with flat config (`eslint.config.mjs`):
- Space in parens: `( value )` not `(value)`
- Template string spacing: `${ value }` not `${value}`
- Array bracket spacing: `[ 1, 2, 3 ]` not `[1, 2, 3]`
- No space after keywords: `if(`, `for(`, `while(`, `switch(`, `catch(`
- Space before/after arrows: `( x ) => x + 1`
- Semicolons required

# Terminology

## Naming Conventions

* **PascalCase** for classes and class mixins, e.g. `MyClass`
* **camelCase** for variables, properties, and methods, e.g. `myMethod`
* **is** prefix for type/inheritance checks (uses `typeof` or `instanceof`), e.g. `isString( value )`
* **like** prefix for duck-typing/interface checks, e.g. `likeController( value )` checks for expected properties
* **as** prefix for mixins that apply functionality:
    * Class mixins: `AsEventEmitter( Component )` produces a new class with combined capabilities
    * Function mixins: `asEventEmitter( component )` adds event emitter methods to the instance
* **Configurable** suffix denotes interfaces/classes with setters for normally readonly properties