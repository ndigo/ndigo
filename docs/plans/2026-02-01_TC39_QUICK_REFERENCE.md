# TC39 Decorator Quick Reference

**Date:** 2025-02-01  
**For:** BlueJS Decorator Migration

---

## Import

```typescript
import '@tsmetadata/polyfill';
```

---

## Class Decorator

```typescript
export function configuration<T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T {
    context.metadata['config:constructor'] = true;
    return target;
}

// Usage
@configuration
class MyConfig {}
```

---

## Method Decorator (Simple)

```typescript
export function profile(name: string) {
    return function (target: any, context: ClassMethodDecoratorContext) {
        context.metadata[`config:profile:${String(context.name)}`] = name;
        return target;
    };
}

// Usage
class MyClass {
    @profile('dev')
    myMethod() {}
}
```

---

## Method Decorator (with Enumerability)

```typescript
export function entry(name?: string) {
    return function (target: any, context: ClassMethodDecoratorContext) {
        const entryName = name || String(context.name);
        context.metadata[`config:entry:${String(context.name)}`] = entryName;

        // Make method enumerable for for...in loops
        context.addInitializer(function (this: any) {
            const descriptor = Reflect.getOwnPropertyDescriptor(Object.getPrototypeOf(this), context.name);
            if (descriptor && !descriptor.enumerable) {
                Reflect.defineProperty(Object.getPrototypeOf(this), context.name, {
                    ...descriptor,
                    enumerable: true,
                });
            }
        });

        return target;
    };
}

// Usage
class MyClass {
    @entry()
    foo() {}

    @entry('customName')
    bar() {}
}
```

---

## Field Decorator (Property Definition)

```typescript
export function property(path: string) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        if (context.kind !== 'field') {
            throw new Error('@property can only be applied to class fields');
        }

        // Store metadata
        context.metadata[`config:property:${String(context.name)}`] = path;

        // Use addInitializer to run AFTER field initialization
        context.addInitializer(function (this: any) {
            Reflect.defineProperty(this, context.name, {
                value: null,
                configurable: true,
                enumerable: true,
                writable: false,
            });
        });
    };
}

// Usage
class MyClass {
    @property('foo.bar')
    myProp: any; // ⚠️ Type annotation required!
}
```

---

## Field Decorator (Validation Pattern)

```typescript
export function Pattern(params: { regex: string; flags?: string }) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        const propertyName = context.name;
        const storageSymbol = Symbol(`__pattern_${String(propertyName)}`);

        context.addInitializer(function (this: any) {
            // 1. Capture initial value
            const currentValue = this[propertyName];
            this[storageSymbol] = currentValue;

            // 2. Delete field property
            delete this[propertyName];

            // 3. Redefine as accessor
            Object.defineProperty(this, propertyName, {
                get(this: any) {
                    return this[storageSymbol];
                },
                set(this: any, newValue: any) {
                    // Validation logic here
                    const isValid = validatePattern(newValue, params);
                    if (!isValid) {
                        console.error('Validation failed');
                    }
                    this[storageSymbol] = newValue;
                },
                configurable: true,
                enumerable: true,
            });
        });
    };
}

// Usage
class MyClass {
    @Pattern({ regex: '^[a-z]+$' })
    username: string;
}
```

---

## Hybrid Class/Method Decorator

```typescript
export function profile(name: string) {
    return function (target: any, context: ClassDecoratorContext | ClassMethodDecoratorContext) {
        const profiles = name.split(',');

        if (context.kind === 'class') {
            context.metadata['config:profile'] = profiles;
        } else if (context.kind === 'method') {
            context.metadata[`config:profile:${String(context.name)}`] = profiles;
        }

        return target;
    };
}

// Usage
@profile('dev')
class MyClass {
    @profile('test')
    myMethod() {}
}
```

---

## Reading Metadata

### From Class Constructor

```typescript
const metadata = (MyClass as any)[Symbol.metadata];
const value = metadata['config:constructor'];
```

### From Instance

```typescript
const instance = new MyClass();
const metadata = (instance.constructor as any)[Symbol.metadata];
const value = metadata['config:entry:myMethod'];
```

### Helper Functions

```typescript
// Get metadata from class constructor
const getMetadata = (target: any): Record<string, any> => {
    if (!target || typeof target !== 'function') {
        return {};
    }
    return (target as any)[Symbol.metadata] || {};
};

// Get metadata from instance
const getInstanceMetadata = (instance: any): Record<string, any> => {
    if (!instance || typeof instance !== 'object') {
        return {};
    }
    return getMetadata(instance.constructor);
};

// Check if metadata exists
const hasConfigurationMetadata = (target): boolean => getMetadata(target)['config:constructor'] === true;

// Get specific metadata
const getEntryMetadata = (target, propertyKey: string | symbol): string => {
    const metadata = getInstanceMetadata(target) || getMetadata(target);
    return metadata[`config:entry:${String(propertyKey)}`];
};
```

---

## Metadata Key Patterns

### Class-Level Metadata

```typescript
context.metadata['config:constructor'] = true;
context.metadata['config:profile'] = ['dev', 'test'];
context.metadata['config:property:source'] = [{ foo: 'bar' }];
```

### Method-Level Metadata

```typescript
context.metadata[`config:entry:${String(context.name)}`] = 'entryName';
context.metadata[`config:profile:${String(context.name)}`] = ['dev'];
```

### Field-Level Metadata

```typescript
context.metadata[`config:property:${String(context.name)}`] = 'foo.bar';
```

---

## Common Mistakes

### ❌ Forgetting Type Annotations

```typescript
// BAD - May fail in TC39 mode
@property('foo')
myField;

// GOOD - Explicit type
@property('foo')
myField: any;
```

### ❌ Not Using addInitializer for Fields

```typescript
// BAD - Property definition is overwritten by TypeScript
export function property(path: string) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        // This doesn't work!
        return function (initialValue: any) {
            return null;
        };
    };
}

// GOOD - Use addInitializer
export function property(path: string) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        context.addInitializer(function (this: any) {
            // This works!
            Reflect.defineProperty(this, context.name, { value: null });
        });
    };
}
```

### ❌ Assuming Methods Are Enumerable

```typescript
// BAD - Won't find methods
const instance = new MyClass();
for (const key in instance) {
    console.log(key); // Nothing!
}

// GOOD - Make methods enumerable in decorator if needed
context.addInitializer(function (this: any) {
    const descriptor = Reflect.getOwnPropertyDescriptor(Object.getPrototypeOf(this), context.name);
    Reflect.defineProperty(Object.getPrototypeOf(this), context.name, {
        ...descriptor,
        enumerable: true,
    });
});
```

---

## TypeScript Configuration

### Package-Specific tsconfig.build.json

```json
{
    "extends": "../../tsconfig.build.json",
    "compilerOptions": {
        "experimentalDecorators": false,
        "emitDecoratorMetadata": false,
        "outDir": "./lib",
        "rootDir": "./src"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "lib", "test"]
}
```

### Package-Specific tsconfig.json (for tests)

```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "experimentalDecorators": false,
        "emitDecoratorMetadata": false,
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": ["src/**/*", "test/**/*"]
}
```

---

## Testing Patterns

### Test Metadata Storage

```typescript
it('stores metadata correctly', () => {
    @myDecorator('value')
    class TestClass {}

    const metadata = (TestClass as any)[Symbol.metadata];
    expect(metadata['my:key']).toBe('value');
});
```

### Test Instance Properties

```typescript
it('creates property on instance', () => {
    class TestClass {
        @property('foo')
        myProp: any;
    }

    const instance = new TestClass();
    const descriptor = Object.getOwnPropertyDescriptor(instance, 'myProp');
    expect(descriptor).toBeDefined();
    expect(descriptor!.writable).toBe(false);
});
```

### Test Method Enumerability

```typescript
it('makes method enumerable', () => {
    class TestClass {
        @entry()
        myMethod() {}
    }

    const instance = new TestClass();
    const keys = [];
    for (const key in instance) {
        keys.push(key);
    }
    expect(keys).toContain('myMethod');
});
```

---

## Build Commands

```bash
# Build package
pnpm --filter @blue/package-name build:lib

# Run tests
pnpm vitest run packages/package-name/test/

# Run specific test file
pnpm vitest run packages/package-name/test/my-test.spec.ts

# Clean compiled test files (if decorators cached incorrectly)
rm packages/package-name/test/*.js
```

---

**Last Updated:** 2025-02-01  
**Reference:** `docs/plans/2025-02-01_DECORATOR_MIGRATION.md`
