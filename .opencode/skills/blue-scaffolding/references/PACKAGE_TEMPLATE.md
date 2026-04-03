# Package Templates

## `package.json`

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

## `tsconfig.json`

```json
{ "extends": "./tsconfig.build.json" }
```

## `tsconfig.build.json`

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

## `src/index.ts`

```typescript
/**
 * @author Jeff Rose
 * @module {name}
 */

export { ExampleClass } from './example-class';
```

## `src/example-class.ts`

```typescript
/**
 * @author Jeff Rose
 */

/**
 * Example class demonstrating standard BlueJS conventions.
 */
export class ExampleClass {
    /**
     * Returns the string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'ExampleClass';
    }

    /**
     * Performs an example operation.
     * @returns A greeting string.
     */
    public sayHello(): string {
        return 'Hello, BlueJS!';
    }
}
```
