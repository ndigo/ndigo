# Decorator Migration Plan: Legacy to TC39 Stage 3

**Date:** 2025-02-01  
**Status:** ✅ COMPLETE  
**Author:** Jeff Rose (with AI assistance)  
**Completed:** 2026-02-02

## Executive Summary

Migration of BlueJS decorators from legacy TypeScript experimental decorators to TC39 Stage 3 standard decorators. This migration is necessary for future TypeScript compatibility and enables use of modern decorator features.

**Final Status:**
- ✅ **Phase 1 Complete:** @blue/validate package fully migrated (1 decorator)
- ✅ **Phase 2 Complete:** @blue/context package fully migrated (5 decorators)
- ✅ **Phase 3 Complete:** @blue/dispatcher package fully migrated (6 decorators)
- ✅ **Phase 4 Complete:** @blue/factory package fully migrated (4 decorators)
- ✅ **Phase 5 Complete:** @blue/view-webcomponent package fully migrated (2 decorators)
- ✅ **Runtime Integration:** MetadataManager migrated to TC39
- ✅ **All Tests Passing:** ~165 decorator tests passing across all packages
- ✅ **Naming Standardization:** All decorators now use camelCase naming
- ✅ **Dependency Cleanup:** reflect-metadata removed from all packages

**Total: 16 decorators migrated across 5 packages**

---

## Table of Contents

1. [Background & Motivation](#background--motivation)
2. [Technical Approach](#technical-approach)
3. [Completed Work](#completed-work)
4. [Current Findings & Learnings](#current-findings--learnings)
5. [Migration Statistics](#migration-statistics)
6. [Migration Patterns & Recipes](#migration-patterns--recipes)
7. [Testing Strategy](#testing-strategy)
8. [Risk Assessment](#risk-assessment)
9. [Conclusion](#conclusion)

---

## Background & Motivation

### Why Migrate?

1. **TypeScript Evolution:** Legacy decorators (`experimentalDecorators: true`) are deprecated in favor of TC39 standard
2. **Future Compatibility:** TC39 decorators are the official ECMAScript standard (Stage 3)
3. **Better Semantics:** TC39 decorators provide clearer execution model and better type safety
4. **Modern Features:** Access to decorator context, metadata, and proper initialization hooks

### Decorator Inventory

**Total decorators migrated: 16 across 5 packages**

| Package | Decorators | Types | Status |
|---------|-----------|-------|--------|
| @blue/validate | `@pattern` | Field | ✅ COMPLETE |
| @blue/context | `@configuration`, `@profile`, `@property`, `@propertySource`, `@entry` | Class, Method, Field | ✅ COMPLETE |
| @blue/dispatcher | `@routeMapping`, `@errorMapping`, `@errorHandler`, `@routeParams` pattern | Class, Method, Parameter | ✅ COMPLETE |
| @blue/factory | `@scope`, `@singletonScope`, `@prototypeScope`, `@hashScope` | Class | ✅ COMPLETE |
| @blue/view-webcomponent | `@viewMapping`, `@tagMapping` | Class | ✅ COMPLETE |

---

## Technical Approach

### Strategy Overview

1. **Package-by-Package Migration:** Enable TC39 decorators per-package using tsconfig overrides
2. **Behavioral Testing First:** Document existing behavior with comprehensive tests before migration
3. **Metadata Migration:** Replace `reflect-metadata` with TC39 `Symbol.metadata` / `@tsmetadata/polyfill`
4. **Validation:** Ensure all tests pass before and after migration

### Per-Package TypeScript Configuration

Each migrated package gets two tsconfig files:

**`tsconfig.build.json`** (for building source):
```json
{
  "extends": "../../tsconfig.build.json",
  "compilerOptions": {
    "experimentalDecorators": false,
    "emitDecoratorMetadata": false,
    // ... other options
  }
}
```

**`tsconfig.json`** (for tests):
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "experimentalDecorators": false,
    "emitDecoratorMetadata": false,
    // ... paths for test imports
  },
  "include": ["src/**/*", "test/**/*"]
}
```

This allows packages to migrate independently while others continue using legacy decorators.

---

## Completed Work

### ✅ Phase 1: @blue/validate Package (@Pattern Decorator)

**Timeline:** 2025-02-01  
**Files Modified:**
- `packages/blue-validate/src/decorators.ts` - Complete rewrite
- `packages/blue-validate/tsconfig.build.json` - TC39 enabled
- `packages/blue-validate/tsconfig.json` - Created for tests

**Files Created:**
- `packages/blue-validate/test/pattern.spec.ts` - 16 comprehensive tests

**Files Deleted:**
- `test/pattern-decorator-behavior.spec.ts` (old broken tests)
- `test/pattern-behavior-contract.spec.ts` (old broken tests)
- `test/pattern-constraint-debug.spec.ts` (debug file)
- `test/pattern-setter-debug.spec.ts` (debug file)
- `test/decorators.spec.ts` (legacy test)
- `test/testDecorators.ts` (legacy test fixture)

#### Implementation Details

**Old Implementation (Legacy - BROKEN):**
```typescript
export const Pattern = function(params) {
    return function(target: Object, propertyKey: PropertyKey): void {
        let currentValue = target[propertyKey];
        const getter = () => currentValue;
        const setter = (newValue) => {
            // Validation logic
            currentValue = newValue;
        };
        
        // This was broken: TypeScript field initialization overwrites this
        Reflect.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            configurable: true,
            enumerable: true,
        });
    };
};
```

**Issue:** TypeScript generates code that creates instance properties during construction, which shadow the prototype's getter/setter. The decorator never actually worked.

**New Implementation (TC39 - WORKING):**
```typescript
export function Pattern(params: PatternDecoratorParams) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        if (context.kind !== 'field') {
            throw new Error('@Pattern can only be applied to class fields');
        }

        const propertyName = context.name;

        // Use addInitializer to run after field is created
        context.addInitializer(function (this: any) {
            const storageSymbol = Symbol(`__pattern_${String(propertyName)}`);
            const currentValue = this[propertyName];
            
            this[storageSymbol] = currentValue;
            delete this[propertyName]; // Remove the field property
            
            // Define getter/setter on the instance
            Object.defineProperty(this, propertyName, {
                get(this: any) {
                    return this[storageSymbol];
                },
                set(this: any, newValue: any) {
                    // Validate and store
                    let isValid: boolean;
                    if (newValue === null || newValue === undefined) {
                        isValid = false;
                    } else {
                        isValid = constraints.Pattern.validate(newValue, {
                            regex: params.regex,
                            flags: params.flags,
                        } as any);
                    }
                    
                    if (!isValid) {
                        console.error('YOU BAD DATA FILE');
                    }
                    
                    this[storageSymbol] = newValue;
                },
                configurable: true,
                enumerable: true,
            });
        });
    };
}
```

**Key Differences:**
1. Uses `context.addInitializer()` - runs after field is initialized
2. Captures initial value, deletes field, then redefines as accessor
3. Uses Symbol-based storage per instance (prevents shared state)
4. Explicit null/undefined validation (workaround for constraint validator bug)

#### Test Results

```
✓ packages/blue-validate/test/pattern.spec.ts (16 tests) - ALL PASSING
  ✓ Basic Validation (3 tests)
  ✓ Multiple Decorated Properties (1 test)
  ✓ Instance Isolation (2 tests)
  ✓ Property Descriptor (2 tests)
  ✓ Complex Patterns (2 tests)
  ✓ Initial Values (2 tests)
  ✓ Inheritance (1 test)
  ✓ Edge Cases (3 tests)

All @blue/validate tests: 107 passed | 97 skipped (204)
```

---

### ✅ Phase 2: @blue/context Package (COMPLETE)

**Timeline:** 2025-02-01  
**Status:** ✅ All decorators migrated, all tests passing

#### Files Modified

1. **`packages/blue-context/src/configuration.ts`** - Complete decorator rewrite (332 lines)
   - Replaced `reflect-metadata` import with `@tsmetadata/polyfill`
   - Migrated 5 decorators to TC39
   - Updated metadata helper functions to use `Symbol.metadata`
   - Removed legacy `Reflect.defineMetadata()` / `Reflect.getMetadata()` calls

2. **`packages/blue-context/src/_util.ts`** - Fixed export conflicts
   - Resolved `addIndex` / `addIndexRight` naming conflict between `@blue/util/function` and `@blue/util/list`

3. **`packages/blue-context/test/decorators-behavior.spec.ts`** - Updated to TC39 metadata API (385 lines)
   - Converted 24 tests from `Reflect.getMetadata()` to `Symbol.metadata` access
   - Updated property tests to check instance properties (not prototype)
   - Fixed `@entry` decorator calls to use `@entry()` with parentheses

4. **`packages/blue-context/test/testContext.ts`** - Fixed for TC39 compatibility
   - Added type annotations to `@property` decorated fields (`fooValue: any`, `fuuValue: any`)
   - Updated manual metadata setting from `Reflect.defineMetadata()` to `Symbol.metadata`

#### Decorators Migrated

**1. @configuration** - Class decorator marking configuration classes

```typescript
// Before (Legacy)
export const configuration: ClassDecorator = <TFunction extends Function>(target: TFunction) => {
    if (!hasConfigurationMetadata(target)) {
        defineConfigurationMetadata(target);
    }
    return target;
};

// After (TC39)
export function configuration<T extends new (...args: any[]) => any>(
    target: T,
    context: ClassDecoratorContext
): T {
    context.metadata['config:constructor'] = true;
    return target;
}
```

**2. @profile** - Class/Method decorator for profile-based activation

```typescript
// Before (Legacy)
export const profile = (name: string) => 
    (target, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
        defineProfileMetadata(toUniqueArray(name), target, propertyKey);
        if (propertyKey && !descriptor) {
            descriptor = getOwnPropertyDescriptor(target, propertyKey);
        }
        return propertyKey ? descriptor : target;
    };

// After (TC39)
export function profile(name: string) {
    return function (target: any, context: ClassDecoratorContext | ClassMethodDecoratorContext) {
        const profiles = toUniqueArray(name);
        
        if (context.kind === 'class') {
            context.metadata['config:profile'] = profiles;
        } else if (context.kind === 'method') {
            context.metadata[`config:profile:${String(context.name)}`] = profiles;
        }
        
        return target;
    };
}
```

**3. @property** - Field decorator for property injection

```typescript
// Before (Legacy)
export const property = (path: string): PropertyDecorator =>
    (target: Object, propertyKey: string | symbol): void => {
        definePropertyMetadata(path, target, propertyKey);
        defineProperty(target, propertyKey, {
            value: null,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    };

// After (TC39)
export function property(path: string) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        if (context.kind !== 'field') {
            throw new Error('@property can only be applied to class fields');
        }

        // Store metadata
        context.metadata[`config:property:${String(context.name)}`] = path;

        // Return initializer that sets up the property
        context.addInitializer(function (this: any) {
            defineProperty(this, context.name, {
                value: null,
                configurable: true,
                enumerable: true,
                writable: false,
            });
        });
    };
}
```

**4. @propertySource** - Class decorator for property sources

```typescript
// Before (Legacy)
export const propertySource = (propertySource: JSONObject | Enumerable<string, JSONValue>): ClassDecorator =>
    <TFunction extends Function>(target: TFunction) => {
        let ps: JSONObject;
        if (likeEnumerable(propertySource)) {
            ps = createNull();
            propertySource.forEach((value, key) => (ps[key] = value));
        } else {
            ps = propertySource;
        }
        if (hasPropertySourceMetadata(target)) {
            const propertySources = getPropertySourceMetadata(target);
            propertySources.unshift(ps);
            definePropertySourceMetadata(propertySources, target);
        } else {
            definePropertySourceMetadata([ps], target);
        }
        return target;
    };

// After (TC39)
export function propertySource(propertySource: JSONObject | Enumerable<string, JSONValue>) {
    return function <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T {
        let ps: JSONObject;
        if (likeEnumerable(propertySource)) {
            ps = createNull();
            propertySource.forEach((value, key) => (ps[key] = value));
        } else {
            ps = propertySource;
        }

        // Get existing sources or create new array
        const existing = (context.metadata['config:property:source'] as JSONObject[]) || [];
        existing.unshift(ps);
        context.metadata['config:property:source'] = existing;

        return target;
    };
}
```

**5. @entry** - Method decorator for registry entries

```typescript
// Before (Legacy)
export const entry = (
    targetOrKey: Object | string,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
): any => {
    // Called as a Function
    if (typeof targetOrKey === 'string') {
        return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
            defineEntryMetadata(targetOrKey, target, propertyKey);
            if (!descriptor) {
                descriptor = getOwnPropertyDescriptor(target, propertyKey);
            }
            if (!descriptor.enumerable) {
                descriptor.enumerable = true;
            }
            return descriptor;
        };
    // Called as a Decorator
    } else {
        defineEntryMetadata(propertyKey, targetOrKey, propertyKey);
        if (!descriptor) {
            descriptor = getOwnPropertyDescriptor(targetOrKey, propertyKey);
        }
        if (!descriptor.enumerable) {
            descriptor.enumerable = true;
        }
        return descriptor;
    }
};

// After (TC39)
export function entry(nameOrTarget?: string): any {
    // Called with argument: @entry('customName')
    if (typeof nameOrTarget === 'string') {
        const customName = nameOrTarget;
        return function (target: any, context: ClassMethodDecoratorContext) {
            if (context.kind !== 'method') {
                throw new Error('@entry can only be applied to methods');
            }
            context.metadata[`${CONFIG_ENTRY}:${String(context.name)}`] = customName;
            
            // Make the method enumerable so it can be found by for...in loops
            context.addInitializer(function (this: any) {
                const descriptor = getOwnPropertyDescriptor(this, context.name) ||
                    getOwnPropertyDescriptor(Object.getPrototypeOf(this), context.name);
                if (descriptor && !descriptor.enumerable) {
                    defineProperty(Object.getPrototypeOf(this), context.name, {
                        ...descriptor,
                        enumerable: true,
                    });
                }
            });
            
            return target;
        };
    }

    // Called without argument: @entry()
    return function (target: any, context: ClassMethodDecoratorContext) {
        if (context.kind !== 'method') {
            throw new Error('@entry can only be applied to methods');
        }
        context.metadata[`${CONFIG_ENTRY}:${String(context.name)}`] = String(context.name);
        
        // Make the method enumerable so it can be found by for...in loops
        context.addInitializer(function (this: any) {
            const descriptor = getOwnPropertyDescriptor(this, context.name) ||
                getOwnPropertyDescriptor(Object.getPrototypeOf(this), context.name);
            if (descriptor && !descriptor.enumerable) {
                defineProperty(Object.getPrototypeOf(this), context.name, {
                    ...descriptor,
                    enumerable: true,
                });
            }
        });
        
        return target;
    };
}
```

#### Metadata System Migration

**Helper Functions Created:**

```typescript
// Helper to get metadata from a class constructor
const getMetadata = (target: any): Record<string, any> => {
    if (!target || typeof target !== 'function') {
        return {};
    }
    return (target as any)[Symbol.metadata] || {};
};

// Helper to get metadata from an instance
const getInstanceMetadata = (instance: any): Record<string, any> => {
    if (!instance || typeof instance !== 'object') {
        return {};
    }
    const constructor = instance.constructor;
    return getMetadata(constructor);
};
```

**Updated Metadata Getter Functions:**

- `hasConfigurationMetadata(target)` → checks `metadata['config:constructor']`
- `hasProfileMetadata(target, propertyKey?)` → checks `metadata['config:profile']` or `metadata['config:profile:methodName']`
- `hasPropertyMetadata(target, propertyKey)` → checks `metadata['config:property:fieldName']`
- `hasPropertySourceMetadata(target)` → checks `metadata['config:property:source']`
- `hasEntryMetadata(target, propertyKey)` → checks `metadata['config:entry:methodName']`
- `getProfileMetadata(target, propertyKey?)`
- `getPropertyMetadata(target, propertyKey)`
- `getPropertySourceMetadata(target)`
- `getEntryMetadata(target, propertyKey)`

#### Key Technical Insights

**1. TC39 Method Decorators and Enumerability**

The most subtle issue encountered: TC39 method decorators don't automatically make methods enumerable. Since `ConfigurationParser.processConfiguration()` uses `for...in` loops to iterate over methods, the `@entry` decorator needed to explicitly make methods enumerable.

**Problem:**
```typescript
class MyClass {
    @entry()
    myMethod() { return 'value'; }
}

const instance = new MyClass();
for (const key in instance) {
    console.log(key); // Nothing! Methods are not enumerable by default
}
```

**Solution:**
```typescript
context.addInitializer(function (this: any) {
    const descriptor = getOwnPropertyDescriptor(
        Object.getPrototypeOf(this), 
        context.name
    );
    if (descriptor && !descriptor.enumerable) {
        defineProperty(Object.getPrototypeOf(this), context.name, {
            ...descriptor,
            enumerable: true,
        });
    }
});
```

**2. TC39 Field Decorators Pattern**

Field decorators must use `context.addInitializer()` to run logic after the field is initialized by TypeScript. Direct property definition in the decorator function doesn't work because TypeScript overwrites it during class construction.

**Pattern:**
```typescript
export function property(path: string) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        // Store metadata
        context.metadata[`config:property:${String(context.name)}`] = path;

        // Use addInitializer to run AFTER field initialization
        context.addInitializer(function (this: any) {
            defineProperty(this, context.name, {
                value: null,
                configurable: true,
                enumerable: true,
                writable: false,
            });
        });
    };
}
```

**3. Method-Level Metadata Requires Key Patterns**

Unlike legacy decorators where method metadata was stored separately using `Reflect.getMetadata(key, target, propertyKey)`, TC39 stores all metadata in a flat object on `Symbol.metadata`. Method-level metadata requires namespaced keys:

```typescript
// Class-level profile
context.metadata['config:profile'] = ['dev'];

// Method-level profile
context.metadata['config:profile:myMethod'] = ['dev'];
```

#### Test Results

```
✅ 59 tests passed | 1 skipped
✅ packages/blue-context/test/decorators-behavior.spec.ts (24 tests) - ALL PASSING
✅ packages/blue-context/test/configuration.spec.ts (2 tests)
✅ packages/blue-context/test/context.spec.ts (6 tests)
✅ packages/blue-context/test/environment.spec.ts (1 test)
✅ packages/blue-context/test/event-emitter.spec.ts (23 tests | 1 skipped)
✅ packages/blue-context/test/property-resolver.spec.ts (4 tests)
❌ packages/blue-context/test/event-logger.spec.ts (UNRELATED: @blue/logger dependency issue)
```

**Behavioral Test Coverage:**
```
✓ @configuration Decorator (3 tests)
  ✓ marks a class as a configuration class
  ✓ returns the original class
  ✓ can be used without parentheses
  
✓ @profile Decorator (5 tests)
  ✓ stores profile metadata on a class
  ✓ stores profile metadata on a method
  ✓ splits comma-separated profiles into array
  ✓ removes duplicate profiles
  ✓ only activates entries when profile matches
  
✓ @property Decorator (5 tests)
  ✓ stores property path metadata
  ✓ defines the property as non-writable
  ✓ makes property configurable and enumerable
  ✓ resolves property values from property sources
  ✓ supports array indexing in property paths
  
✓ @propertySource Decorator (4 tests)
  ✓ stores property source metadata as an array
  ✓ supports multiple property sources
  ✓ accepts Enumerable objects
  ✓ handles non-object inputs gracefully
  
✓ @entry Decorator (5 tests)
  ✓ stores entry metadata with method name when used without argument
  ✓ stores entry metadata with custom name when used with argument
  ✓ makes method enumerable
  ✓ registers entry values in the context
  ✓ does not register methods without @entry decorator
  
✓ Decorator Integration (2 tests)
  ✓ works with all decorators combined
  ✓ respects profile restrictions
```

#### Migration Lessons Learned

1. **Always Add Type Annotations to Decorated Fields**
   - Without type annotations, TypeScript may interpret untyped fields differently in TC39 mode
   - Example: `@property('foo') fooValue: any;` (not just `fooValue;`)

2. **Method Decorators Must Manage Enumerability**
   - If code uses `for...in` to iterate over methods, decorators must explicitly set `enumerable: true`
   - Use `context.addInitializer()` to modify the method descriptor after decoration

3. **Test Files Need Recompilation**
   - Remove compiled `.js` test files (`test/*.js`) when changing decorators
   - Vitest caches compiled tests; clean cache if seeing stale decorator behavior

4. **Export Conflicts in Utility Files**
   - Watch for naming conflicts when re-exporting from multiple modules
   - TypeScript will error if the same name is exported from multiple sources
   - Explicit imports and re-exports resolve ambiguity

---

## Current Findings & Learnings

### Critical Discovery: Field Decorators in Legacy TypeScript Are Broken

**Problem:** Legacy TypeScript property decorators cannot intercept field assignments because:
1. Decorator defines getter/setter on **prototype**
2. TypeScript generates code that creates **instance property** during construction
3. Instance property shadows prototype's getter/setter
4. Decorator's setter is never called

**Example of broken code:**
```typescript
class Example {
    @MyDecorator()
    myField: string; // TypeScript generates: this.myField = undefined;
}

// At runtime:
const obj = new Example();
obj.myField = "value"; // Sets instance property, doesn't call decorator's setter!
```

**Solution (TC39):** Use `context.addInitializer()` to run code **after** field initialization, then:
1. Capture the initial field value
2. Delete the field property
3. Redefine as accessor with getter/setter

This is the **only working pattern** for field decorators with validation/transformation logic.

### TypeScript Compilation Model Differences

| Aspect | Legacy Decorators | TC39 Decorators |
|--------|------------------|-----------------|
| Field decoration | Modifies prototype (broken) | Returns initializer function (works) |
| Metadata storage | `reflect-metadata` package | `Symbol.metadata` / `@tsmetadata/polyfill` |
| Method decoration | Receives descriptor, returns descriptor | Receives function, returns function or descriptor |
| Class decoration | Receives constructor, returns constructor | Receives class, context; returns class |
| Parameter decoration | Receives target, propertyKey, index | **Not supported** (must use alternatives) |
| Execution order | Outer → Inner | Inner → Outer |

### Metadata Migration Strategy

**Legacy approach (reflect-metadata):**
```typescript
import 'reflect-metadata';

@MyDecorator()
class MyClass {}

// Store metadata
Reflect.defineMetadata('my:key', 'value', MyClass);

// Read metadata
const value = Reflect.getMetadata('my:key', MyClass);
```

**TC39 approach (@tsmetadata/polyfill):**
```typescript
import '@tsmetadata/polyfill';

function MyDecorator() {
    return function(target, context: ClassDecoratorContext) {
        // Store in context during decoration
        context.metadata['my:key'] = 'value';
        return target;
    };
}

@MyDecorator()
class MyClass {}

// Read from Symbol.metadata
const value = MyClass[Symbol.metadata]['my:key'];
```

**Challenge for @blue/context:** The package extensively uses `Reflect.defineMetadata` and `Reflect.getMetadata`. We need to:
1. Update all decorators to use `context.metadata`
2. Update all reader functions (`getProfileMetadata`, etc.) to read from `Symbol.metadata`
3. Maintain backward compatibility with existing code

---

## Phase 3: @blue/dispatcher Migration (COMPLETE)

### ✅ Phase 3: @blue/dispatcher Migration

**Status:** ✅ COMPLETE (2026-02-02)

**Actual Time:** ~6 hours (including runtime integration)

---

#### Overview

**Files to migrate:**
- `packages/blue-dispatcher/src/route-mapping.ts` (80 lines) - 1 decorator
- `packages/blue-dispatcher/src/error-mapping.ts` (106 lines) - 2 decorators
- `packages/blue-dispatcher/src/route-parameter.ts` (285 lines) - 3 parameter decorators (**COMPLEX**)

**Infrastructure already in place:**
- ✅ `packages/blue-dispatcher/src/_decorator-util.ts` - Parameter name extraction helper
- ✅ `packages/blue-dispatcher/src/error.ts` - 3 new error classes for decorator validation
- ✅ `packages/blue-dispatcher/test/decorator-util.spec.ts` - 11 tests (all passing)

**Decorators to migrate (6):**

1. **`@routeMapping(route)`** - Class/Method decorator (MEDIUM)
   - Maps routes to controller methods
   - Used for: Class-level and method-level route configuration
   - Pattern: Dual-purpose decorator (class OR method context)
   
2. **`@errorHandler`** - Class decorator (EASY)
   - Marks a class as an error handler
   - Used for: Identifying error handler classes for dispatcher
   - Pattern: Simple class marker decorator
   
3. **`@errorMapping(ErrorClass)`** - Method decorator (MEDIUM)
   - Maps error classes to error handler methods
   - Used for: Error class → handler method resolution
   - Pattern: Method decorator with enumerability

4. **`@queryValue(name)`** - Parameter decorator → **REDESIGN REQUIRED**
5. **`@matrixValue(name)`** - Parameter decorator → **REDESIGN REQUIRED**
6. **`@cookieValue(name)`** - Parameter decorator → **REDESIGN REQUIRED**

---

#### Key Challenge: Parameter Decorator Redesign

**Problem:** TC39 decorators **do not support parameter decorators**. We must refactor to a method decorator pattern.

**Current API (Legacy):**
```typescript
@routeMapping('/hello/there')
handleThere(@queryValue('name') n1: string, @matrixValue('name') n2: string) {
    expect(n1).toBe('John');
    expect(n2).toBe('Jack');
    return new ModelAndView('test');
}
```

**New API (TC39):**
```typescript
@routeMapping('/hello/there')
@routeParams({
    n1: queryValue('name'),
    n2: matrixValue('name')
})
handleThere(n1: string, n2: string) {
    expect(n1).toBe('John');
    expect(n2).toBe('Jack');
    return new ModelAndView('test');
}
```

**Key Changes:**
- ✅ `queryValue()`, `matrixValue()`, `cookieValue()` become **factory functions** (not decorators)
- ✅ New `@routeParams()` method decorator accepts parameter map
- ✅ Uses `extractParameterNames()` from `_decorator-util.ts` to map parameters by name
- ⚠️ **Breaking API change** - requires updating all controller methods using parameter decorators

---

#### Detailed Implementation Plan

##### **Step 1: Configure TypeScript for TC39** (5 min)

**File:** `packages/blue-dispatcher/tsconfig.build.json`

**Changes needed:**
```json
{
  "extends": "../../tsconfig.build.json",
  "compilerOptions": {
    "baseUrl": ".",
    "composite": true,
    "outDir": "lib",
    "experimentalDecorators": false,  // ADD: Disable legacy decorators
    "emitDecoratorMetadata": false,   // ADD: Disable metadata emit
    "rootDir": "src",
    "skipLibCheck": true
  },
  "exclude": ["node_modules/**/*", "**/*.spec.ts", "**/*.test.ts", "vite.config.ts", "vitest.config.ts", "test/**/*"],
  "include": ["src/**/*"]
}
```

**Why:** Enables TC39 decorator mode (same pattern as @blue/context and @blue/validate)

**Verification:**
```bash
cd /home/jeff/workspace/blue
pnpm --filter @blue/dispatcher build:lib
# Should fail with legacy decorator errors (expected - will fix in next steps)
```

---

##### **Step 2: Create Behavioral Test Suite** (45-60 min)

**Purpose:** Document current behavior of all 6 decorators **before** migration. This provides a safety net.

**File to create:** `packages/blue-dispatcher/test/decorators-behavior.spec.ts`

**Test structure:**

```typescript
import { describe, test, expect } from 'vitest';
import { routeMapping, getRouteMapping, hasRouteMapping } from '../src/route-mapping';
import { errorHandler, errorMapping } from '../src/error-mapping';
import { queryValue, matrixValue, cookieValue, getMethodParameter } from '../src/route-parameter';

describe('Decorator Behavior Documentation (Legacy → TC39)', () => {
    
    describe('@routeMapping', () => {
        describe('as class decorator', () => {
            test('should define route mapping metadata on class', () => {
                @routeMapping('/api')
                class TestController {}
                
                expect(hasRouteMapping(TestController)).toBe(true);
                expect(getRouteMapping(TestController)).toEqual({
                    value: '/api',
                    private: false
                });
            });
            
            test('should accept string route', () => {
                @routeMapping('/users')
                class UserController {}
                
                const mapping = getRouteMapping(UserController);
                expect(mapping.value).toBe('/users');
            });
            
            test('should accept configuration object with options', () => {
                @routeMapping({ value: '/admin', private: true, name: 'admin' })
                class AdminController {}
                
                const mapping = getRouteMapping(AdminController);
                expect(mapping.value).toBe('/admin');
                expect(mapping.private).toBe(true);
                expect(mapping.name).toBe('admin');
            });
        });
        
        describe('as method decorator', () => {
            test('should define route mapping metadata on method', () => {
                class TestController {
                    @routeMapping('/list')
                    listItems() {}
                }
                
                const instance = new TestController();
                expect(hasRouteMapping(instance, 'listItems')).toBe(true);
                expect(getRouteMapping(instance, 'listItems')).toEqual({
                    value: '/list',
                    private: false
                });
            });
            
            test('should make method enumerable', () => {
                class TestController {
                    @routeMapping('/test')
                    testMethod() {}
                }
                
                const instance = new TestController();
                const descriptor = Reflect.getOwnPropertyDescriptor(
                    Object.getPrototypeOf(instance),
                    'testMethod'
                );
                expect(descriptor.enumerable).toBe(true);
            });
            
            test('should combine class and method routes', () => {
                @routeMapping('/api')
                class TestController {
                    @routeMapping('/users')
                    getUsers() {}
                }
                
                const instance = new TestController();
                expect(getRouteMapping(TestController).value).toBe('/api');
                expect(getRouteMapping(instance, 'getUsers').value).toBe('/users');
                // Note: Combination logic happens in dispatcher, not decorator
            });
        });
    });
    
    describe('@errorHandler', () => {
        test('should mark class as error handler', () => {
            @errorHandler
            class GlobalErrorHandler {}
            
            expect(errorHandler.has(GlobalErrorHandler)).toBe(true);
        });
        
        test('should work with likeErrorHandler predicate', () => {
            @errorHandler
            class ErrorController {}
            
            const instance = new ErrorController();
            expect(likeErrorHandler(instance)).toBe(true);
        });
    });
    
    describe('@errorMapping', () => {
        test('should define error mapping metadata', () => {
            class TestErrorHandler {
                @errorMapping(TypeError)
                handleTypeError(error: TypeError) {}
            }
            
            const instance = new TestErrorHandler();
            expect(errorMapping.has(instance, 'handleTypeError')).toBe(true);
        });
        
        test('should accept single error class', () => {
            class TestErrorHandler {
                @errorMapping(RangeError)
                handleRangeError(error: RangeError) {}
            }
            
            const instance = new TestErrorHandler();
            const mapping = errorMapping.get(instance, 'handleRangeError');
            expect(mapping).toEqual([RangeError]);
        });
        
        test('should accept array of error classes', () => {
            class TestErrorHandler {
                @errorMapping([TypeError, ReferenceError])
                handleErrors(error: Error) {}
            }
            
            const instance = new TestErrorHandler();
            const mapping = errorMapping.get(instance, 'handleErrors');
            expect(mapping).toEqual([TypeError, ReferenceError]);
        });
        
        test('should make method enumerable', () => {
            class TestErrorHandler {
                @errorMapping(Error)
                handleError(error: Error) {}
            }
            
            const instance = new TestErrorHandler();
            const descriptor = Reflect.getOwnPropertyDescriptor(
                Object.getPrototypeOf(instance),
                'handleError'
            );
            expect(descriptor.enumerable).toBe(true);
        });
    });
    
    describe('parameter decorators (legacy baseline)', () => {
        describe('@queryValue', () => {
            test('should store parameter metadata at correct index', () => {
                class TestController {
                    handleRequest(@queryValue('id') id: string, @queryValue('page') page: string) {}
                }
                
                const instance = new TestController();
                const params = getMethodParameter(instance, 'handleRequest');
                expect(params).toHaveLength(2);
                expect(params[0].name).toBe('id');
                expect(params[0].type.type).toBe('query:value');
                expect(params[1].name).toBe('page');
            });
            
            test('should accept string parameter name', () => {
                class TestController {
                    handleRequest(@queryValue('search') query: string) {}
                }
                
                const instance = new TestController();
                const params = getMethodParameter(instance, 'handleRequest');
                expect(params[0].name).toBe('search');
            });
            
            test('should accept MethodParameterInfo object', () => {
                class TestController {
                    handleRequest(
                        @queryValue({ name: 'id', required: true, defaultValue: '0' }) id: string
                    ) {}
                }
                
                const instance = new TestController();
                const params = getMethodParameter(instance, 'handleRequest');
                expect(params[0].name).toBe('id');
                expect(params[0].required).toBe(true);
                expect(params[0].defaultValue).toBe('0');
            });
        });
        
        describe('@matrixValue', () => {
            test('should store parameter metadata with MATRIX type', () => {
                class TestController {
                    handleRequest(@matrixValue('version') version: string) {}
                }
                
                const instance = new TestController();
                const params = getMethodParameter(instance, 'handleRequest');
                expect(params[0].type.type).toBe('matrix:value');
                expect(params[0].name).toBe('version');
            });
        });
        
        describe('@cookieValue', () => {
            test('should store parameter metadata with COOKIE type', () => {
                class TestController {
                    handleRequest(@cookieValue('sessionId') sessionId: string) {}
                }
                
                const instance = new TestController();
                const params = getMethodParameter(instance, 'handleRequest');
                expect(params[0].type.type).toBe('cookie:value');
                expect(params[0].name).toBe('sessionId');
            });
        });
    });
});
```

**Deliverable:** Run tests with legacy decorators - all should pass
```bash
pnpm vitest run packages/blue-dispatcher/test/decorators-behavior.spec.ts
```

---

##### **Step 3: Migrate Simple Decorators** (60-90 min)

###### **3.1 Migrate @routeMapping** (30 min)

**File:** `packages/blue-dispatcher/src/route-mapping.ts`

**Before (Legacy):**
```typescript
import 'reflect-metadata';
import { compose } from '@blue/util/function';
import { when } from '@blue/util/logic';
import { mergeRight, objOf } from '@blue/util/object';
import { isString } from '@blue/util/types';

type RouteMappingValue = {
    value: string;
};

type RouteMappingConfiguration = RouteMappingValue & {
    name?: string;
    params?: string;
    private: boolean;
};

const ROUTE_MAPPING = 'route:mapping',
    defaultMapping: RouteMappingConfiguration = {
        value: '/**',
        private: false,
    },
    { defineMetadata, getMetadata, hasMetadata } = Reflect,
    withDefaults = mergeRight(defaultMapping),
    configurationOf = objOf<string>('value') as (value: string) => RouteMappingValue,
    toRouteMappingConfiguration = when<string | RouteMappingConfiguration, RouteMappingConfiguration>(
        isString,
        compose(withDefaults, configurationOf)
    );

export const defineRouteMapping = (value, target, propertyKey: string | symbol = void 0): void =>
    defineMetadata(ROUTE_MAPPING, value, target, propertyKey);

export const getRouteMapping = (target, propertyKey: string | symbol = void 0): any =>
    getMetadata(ROUTE_MAPPING, target, propertyKey);

export const hasRouteMapping = (target, propertyKey: string | symbol = void 0): boolean =>
    hasMetadata(ROUTE_MAPPING, target, propertyKey);

export const routeMapping = (route: string | RouteMappingConfiguration = defaultMapping) => {
    const conf = toRouteMappingConfiguration(route);
    return function (target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
        if (propertyKey) {
            defineRouteMapping(conf, target, propertyKey);
            descriptor.enumerable = true;
            console.log('@RouteMapping', conf, target, propertyKey);
            return descriptor;
        } else {
            defineRouteMapping(conf, target);
            console.log('@RouteMapping', conf, target);
            return target;
        }
    };
};

export const publicMapping = (route: string) => routeMapping({ value: route, private: false });
export const privateMapping = (route: string) => routeMapping({ value: route, private: true });
```

**After (TC39):**
```typescript
/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { compose } from '@blue/util/function';
import { when } from '@blue/util/logic';
import { mergeRight, objOf } from '@blue/util/object';
import { isString } from '@blue/util/types';

type RouteMappingValue = {
    value: string;
};

type RouteMappingConfiguration = RouteMappingValue & {
    name?: string;
    params?: string;
    private: boolean;
};

const defaultMapping: RouteMappingConfiguration = {
    value: '/**',
    private: false,
};

const withDefaults = mergeRight(defaultMapping);
const configurationOf = objOf<string>('value') as (value: string) => RouteMappingValue;
const toRouteMappingConfiguration = when<string | RouteMappingConfiguration, RouteMappingConfiguration>(
    isString,
    compose(withDefaults, configurationOf)
);

// Metadata helper functions
const getMetadata = (target: any): Record<string, any> => {
    if (!target || typeof target !== 'function') return {};
    return (target as any)[Symbol.metadata] || {};
};

const getInstanceMetadata = (instance: any): Record<string, any> => {
    if (!instance || typeof instance !== 'object') return {};
    return getMetadata(instance.constructor);
};

// Type guard for decorator context
type RouteContext = ClassDecoratorContext | ClassMethodDecoratorContext;

/**
 * @routeMapping decorator - Maps routes to controller classes and methods
 * 
 * Can be used as:
 * - Class decorator: @routeMapping('/api')
 * - Method decorator: @routeMapping('/users')
 * 
 * @param route - Route path string or configuration object
 */
export function routeMapping(route: string | RouteMappingConfiguration = defaultMapping) {
    const conf = toRouteMappingConfiguration(route);
    
    return function (target: any, context: RouteContext): any {
        // Method decorator
        if (context.kind === 'method') {
            // Store metadata with method-specific key
            context.metadata[`route:mapping:${String(context.name)}`] = conf;
            
            // Make method enumerable for for...in loops (required by dispatcher)
            context.addInitializer(function (this: any) {
                const descriptor = Reflect.getOwnPropertyDescriptor(
                    Object.getPrototypeOf(this),
                    context.name
                );
                if (descriptor && !descriptor.enumerable) {
                    Reflect.defineProperty(Object.getPrototypeOf(this), context.name, {
                        ...descriptor,
                        enumerable: true,
                    });
                }
            });
            
            console.log('@RouteMapping (method)', conf, context.name);
        }
        // Class decorator
        else if (context.kind === 'class') {
            context.metadata['route:mapping'] = conf;
            console.log('@RouteMapping (class)', conf, context.name);
        }
        
        return target;
    };
}

/**
 * Get route mapping configuration from target
 * 
 * @param target - Class constructor or instance
 * @param propertyKey - Optional method name (for method-level mappings)
 */
export const getRouteMapping = (target: any, propertyKey?: string | symbol): RouteMappingConfiguration | undefined => {
    const metadata = typeof target === 'function' ? getMetadata(target) : getInstanceMetadata(target);
    
    if (propertyKey) {
        return metadata[`route:mapping:${String(propertyKey)}`];
    }
    return metadata['route:mapping'];
};

/**
 * Check if target has route mapping defined
 * 
 * @param target - Class constructor or instance
 * @param propertyKey - Optional method name (for method-level mappings)
 */
export const hasRouteMapping = (target: any, propertyKey?: string | symbol): boolean => {
    const metadata = typeof target === 'function' ? getMetadata(target) : getInstanceMetadata(target);
    
    if (propertyKey) {
        return metadata[`route:mapping:${String(propertyKey)}`] !== undefined;
    }
    return metadata['route:mapping'] !== undefined;
};

/**
 * Legacy helper for defining route mapping (maintained for compatibility)
 */
export const defineRouteMapping = (value: RouteMappingConfiguration, target: any, propertyKey?: string | symbol): void => {
    const metadata = getMetadata(target);
    if (propertyKey) {
        metadata[`route:mapping:${String(propertyKey)}`] = value;
    } else {
        metadata['route:mapping'] = value;
    }
};

/**
 * Convenience decorator for public routes
 */
export const publicMapping = (route: string) => routeMapping({ value: route, private: false });

/**
 * Convenience decorator for private routes
 */
export const privateMapping = (route: string) => routeMapping({ value: route, private: true });
```

**Key Changes:**
1. ✅ Replace `import 'reflect-metadata'` with `import '@tsmetadata/polyfill'`
2. ✅ Dual context support: `ClassDecoratorContext | ClassMethodDecoratorContext`
3. ✅ Metadata stored in `context.metadata[...]`
4. ✅ Method enumerability via `context.addInitializer()`
5. ✅ Metadata helpers use `Symbol.metadata` instead of `Reflect.getMetadata()`
6. ✅ Namespace method metadata: `route:mapping:${methodName}`

---

###### **3.2 Migrate @errorHandler + @errorMapping** (30 min)

**File:** `packages/blue-dispatcher/src/error-mapping.ts`

**Before (Legacy):**
```typescript
import 'reflect-metadata';
import { Constructable } from '@blue/core';
import { both, either, propSatisfies } from '@blue/util/logic';
import { propIs, isNotNil } from '@blue/util/types';

const ERROR_HANDLER = 'error:handler',
    ERROR_MAPPING = 'error:mapping',
    { assign } = Object,
    { defineMetadata, deleteMetadata, getMetadata, getOwnPropertyDescriptor, hasMetadata } = Reflect,
    hasFunction = propIs(Function),
    defineErrorHandler = (target): void => defineMetadata(ERROR_HANDLER, true, target),
    defineErrorMapping = (value, target, propertyKey: string | symbol): void =>
        defineMetadata(ERROR_MAPPING, value, target, propertyKey),
    // ... rest of implementation
```

**After (TC39):**
```typescript
/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { Constructable } from '@blue/core';
import { both, either, propSatisfies } from '@blue/util/logic';
import { propIs, isNotNil } from '@blue/util/types';

const { assign } = Object;
const hasFunction = propIs(Function);

// Metadata helper functions
const getMetadata = (target: any): Record<string, any> => {
    if (!target || typeof target !== 'function') return {};
    return (target as any)[Symbol.metadata] || {};
};

const getInstanceMetadata = (instance: any): Record<string, any> => {
    if (!instance || typeof instance !== 'object') return {};
    return getMetadata(instance.constructor);
};

// Define metadata helpers
const defineErrorHandler = (target: any): void => {
    const metadata = getMetadata(target);
    metadata['error:handler'] = true;
};

const defineErrorMapping = (value: Constructable<Error>[], target: any, propertyKey: string | symbol): void => {
    const metadata = getMetadata(target);
    metadata[`error:mapping:${String(propertyKey)}`] = value;
};

const deleteErrorHandler = (target: any) => {
    const metadata = getMetadata(target);
    delete metadata['error:handler'];
};

const deleteErrorMapping = (target: any, propertyKey: string | symbol) => {
    const metadata = getMetadata(target);
    delete metadata[`error:mapping:${String(propertyKey)}`];
};

const getErrorHandler = (target: any): boolean => {
    const metadata = getMetadata(target);
    return metadata['error:handler'] === true;
};

const getErrorMapping = (target: any, propertyKey: string | symbol): Constructable<Error>[] => {
    const metadata = typeof target === 'function' ? getMetadata(target) : getInstanceMetadata(target);
    return metadata[`error:mapping:${String(propertyKey)}`];
};

const hasErrorHandler = (target: any): boolean => {
    const metadata = getMetadata(target);
    return metadata['error:handler'] !== undefined;
};

const hasErrorMapping = (target: any, propertyKey: string | symbol): boolean => {
    const metadata = typeof target === 'function' ? getMetadata(target) : getInstanceMetadata(target);
    return metadata[`error:mapping:${String(propertyKey)}`] !== undefined;
};

/**
 * @errorHandler class decorator - Marks a class as an error handler
 */
function eh(target: any, context: ClassDecoratorContext): any {
    context.metadata['error:handler'] = true;
    return target;
}

/**
 * @errorMapping method decorator - Maps error classes to handler methods
 * 
 * @param errorClass - Single error class or array of error classes to handle
 */
const em = (errorClass: Constructable<Error> | Constructable<Error>[] = Error) =>
    (target: any, context: ClassMethodDecoratorContext): any => {
        const errorClasses = Array.isArray(errorClass) ? errorClass : [errorClass];
        context.metadata[`error:mapping:${String(context.name)}`] = errorClasses;
        
        // Make method enumerable for for...in loops (required by dispatcher)
        context.addInitializer(function (this: any) {
            const descriptor = Reflect.getOwnPropertyDescriptor(
                Object.getPrototypeOf(this),
                context.name
            );
            if (descriptor && !descriptor.enumerable) {
                Reflect.defineProperty(Object.getPrototypeOf(this), context.name, {
                    ...descriptor,
                    enumerable: true,
                });
            }
        });
        
        return target;
    };

/**
 * @errorHandler decorator with helper methods
 */
export const errorHandler = assign(eh, {
    define: defineErrorHandler,
    delete: deleteErrorHandler,
    get: getErrorHandler,
    has: hasErrorHandler,
});

const hasConstructor = hasFunction('constructor');
const constructorIsErrorHandler = propSatisfies(hasErrorHandler, 'constructor');

/**
 * Duck-typing check for error handler
 */
export const likeErrorHandler = both(
    isNotNil,
    either(hasErrorHandler, both(hasConstructor, constructorIsErrorHandler))
);

/**
 * @errorMapping decorator with helper methods
 */
export const errorMapping = assign(em, {
    define: defineErrorMapping,
    delete: deleteErrorMapping,
    get: getErrorMapping,
    has: hasErrorMapping,
});
```

**Key Changes:**
1. ✅ Replace `Reflect.defineMetadata()` with `context.metadata[...]`
2. ✅ Class decorator: Store `error:handler` flag
3. ✅ Method decorator: Store error class array + make enumerable
4. ✅ Helper methods: Use `Symbol.metadata` instead of `Reflect`
5. ✅ Maintain backward-compatible API (`.define()`, `.get()`, `.has()`)

---

**Verification after Step 3:**
```bash
# Update behavioral tests to use TC39 API for simple decorators
pnpm vitest run packages/blue-dispatcher/test/decorators-behavior.spec.ts

# Should pass for @routeMapping, @errorHandler, @errorMapping
# Will still fail for parameter decorators (expected - fixing in Step 4)
```

---

##### **Step 4: Redesign Parameter Decorators** (90-120 min)

###### **4.1 Design New API** (45 min)

**File:** `packages/blue-dispatcher/src/route-parameter.ts`

**Strategy:**
1. Keep `MethodParameter` and `MethodParameterType` classes (unchanged)
2. Convert parameter decorators to **factory functions**
3. Create new `@routeParams()` method decorator
4. Use `extractParameterNames()` to map parameters by name

**After (TC39) - Complete rewrite:**

```typescript
/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { complement, either, when } from '@blue/util/logic';
import { pipe } from '@blue/util/function';
import { mergeRight, objOf } from '@blue/util/object';
import { isString, like } from '@blue/util/types';
import { Serializable, JSONObject, createNull, Equatable } from '@blue/core';
import { extractParameterNames } from './_decorator-util';
import { InvalidParameterMappingError } from './error';

const { assign, keys } = Object;
const { defineProperty } = Reflect;

export type MethodParameterInfo = {
    name: string;
    mapping: string;
    required?: boolean;
    defaultValue?: string;
};

// Metadata helper functions
const getMetadata = (target: any): Record<string, any> => {
    if (!target || typeof target !== 'function') return {};
    return (target as any)[Symbol.metadata] || {};
};

const getInstanceMetadata = (instance: any): Record<string, any> => {
    if (!instance || typeof instance !== 'object') return {};
    return getMetadata(instance.constructor);
};

/**
 * MethodParameterType - Enum-like class for parameter types
 */
export class MethodParameterType implements Equatable, Serializable {
    static COOKIE: MethodParameterType;
    static MATRIX: MethodParameterType;
    static QUERY: MethodParameterType;

    static fromType(type: string): MethodParameterType {
        const types = keys(this);
        const length = types.length;

        for (let index = 0; index < length; index++) {
            const key = types[index];
            const parameterType: MethodParameterType = MethodParameterType[key];
            if (parameterType.type === type) {
                return parameterType;
            }
        }

        return null;
    }

    readonly type: string;

    get [Symbol.toStringTag](): string {
        return `MethodParameterType:${this.type}`;
    }

    constructor(type: string) {
        defineProperty(this, 'type', {
            value: type,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    equals(value: any): boolean {
        return value instanceof MethodParameterType && value.type === this.type;
    }

    toJSON(): string {
        return this.toString();
    }

    toString(): string {
        return this.type;
    }
}

// Initialize static instances
MethodParameterType.COOKIE = new MethodParameterType('cookie:value');
MethodParameterType.MATRIX = new MethodParameterType('matrix:value');
MethodParameterType.QUERY = new MethodParameterType('query:value');

/**
 * MethodParameter - Represents a method parameter with extraction metadata
 */
export class MethodParameter implements Serializable {
    readonly name: string;
    readonly type: MethodParameterType;
    readonly required: boolean;
    readonly defaultValue: string;

    constructor(type: MethodParameterType, name: string, required: boolean = false, defaultValue: string = null) {
        if (!isString(name)) {
            throw new TypeError(`"name" must be a string but was ${name}`);
        }
        defineProperty(this, 'type', {
            value: type,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'required', {
            value: required,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'defaultValue', {
            value: defaultValue,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    toJSON(): JSONObject {
        const json = createNull();
        json.name = this.name;
        json.type = this.type;
        json.required = this.required;
        json.defaultValue = this.defaultValue;
        return json;
    }

    toString(): string {
        return this.name;
    }
}

/**
 * Parameter extractor configuration (returned by factory functions)
 */
export type ParameterExtractor = {
    type: MethodParameterType;
    name: string;
    required?: boolean;
    defaultValue?: string;
};

/**
 * queryValue - Factory function for query parameter extraction
 * 
 * @param mapping - Query parameter name to extract
 * @param required - Whether parameter is required
 * @param defaultValue - Default value if not present
 */
export function queryValue(
    mapping: string,
    required: boolean = false,
    defaultValue: string | null = null
): ParameterExtractor {
    return {
        type: MethodParameterType.QUERY,
        name: mapping,
        required,
        defaultValue,
    };
}

/**
 * matrixValue - Factory function for matrix parameter extraction
 * 
 * @param mapping - Matrix parameter name to extract
 * @param required - Whether parameter is required
 * @param defaultValue - Default value if not present
 */
export function matrixValue(
    mapping: string,
    required: boolean = false,
    defaultValue: string | null = null
): ParameterExtractor {
    return {
        type: MethodParameterType.MATRIX,
        name: mapping,
        required,
        defaultValue,
    };
}

/**
 * cookieValue - Factory function for cookie value extraction
 * 
 * @param mapping - Cookie name to extract
 * @param required - Whether parameter is required
 * @param defaultValue - Default value if not present
 */
export function cookieValue(
    mapping: string,
    required: boolean = false,
    defaultValue: string | null = null
): ParameterExtractor {
    return {
        type: MethodParameterType.COOKIE,
        name: mapping,
        required,
        defaultValue,
    };
}

/**
 * @routeParams - Method decorator for parameter mapping (TC39)
 * 
 * Maps method parameters to extractors (query, matrix, cookie values).
 * Replaces legacy parameter decorators.
 * 
 * @param parameterMap - Map of parameter name → extractor
 * 
 * @example
 * ```typescript
 * @routeParams({
 *     id: queryValue('id'),
 *     version: matrixValue('version'),
 *     sessionId: cookieValue('JSESSIONID')
 * })
 * handleRequest(id: string, version: string, sessionId: string) { }
 * ```
 */
export function routeParams(parameterMap: Record<string, ParameterExtractor>) {
    return function (target: any, context: ClassMethodDecoratorContext) {
        // Extract parameter names from function signature
        const paramNames = extractParameterNames(target);
        
        // Build MethodParameter array indexed by position
        const parameters: MethodParameter[] = paramNames.map((paramName, index) => {
            const extractor = parameterMap[paramName];
            
            if (!extractor) {
                throw new InvalidParameterMappingError(
                    `No mapping defined for parameter "${paramName}" at index ${index} in method "${String(context.name)}". ` +
                    `Available mappings: ${Object.keys(parameterMap).join(', ')}`
                );
            }
            
            return new MethodParameter(
                extractor.type,
                extractor.name,
                extractor.required ?? false,
                extractor.defaultValue ?? null
            );
        });
        
        // Store in metadata
        context.metadata[`method:parameter:${String(context.name)}`] = parameters;
        
        console.log('@routeParams', context.name, parameters);
        
        return target;
    };
}

/**
 * Get method parameter metadata
 * 
 * @param target - Class constructor or instance
 * @param propertyKey - Method name
 */
export const getMethodParameter = (target: any, propertyKey: string | symbol): MethodParameter[] => {
    const metadata = typeof target === 'function' ? getMetadata(target) : getInstanceMetadata(target);
    return metadata[`method:parameter:${String(propertyKey)}`] || [];
};

/**
 * Check if method has parameter metadata
 * 
 * @param target - Class constructor or instance
 * @param propertyKey - Method name
 */
export const hasMethodParameter = (target: any, propertyKey: string | symbol): boolean => {
    const metadata = typeof target === 'function' ? getMetadata(target) : getInstanceMetadata(target);
    return metadata[`method:parameter:${String(propertyKey)}`] !== undefined;
};

// Legacy helper functions for backward compatibility (maintain for internal use)
export const defineCookieValue = (
    info: MethodParameterInfo,
    parameterIndex: number,
    target: any,
    propertyKey: string | symbol
): void => {
    // Note: This is for internal migration compatibility only
    // New code should use @routeParams()
    console.warn('defineCookieValue is deprecated - use @routeParams() instead');
};

export const defineMatrixValue = (
    info: MethodParameterInfo,
    parameterIndex: number,
    target: any,
    propertyKey: string | symbol
): void => {
    console.warn('defineMatrixValue is deprecated - use @routeParams() instead');
};

export const defineQueryValue = (
    info: MethodParameterInfo,
    parameterIndex: number,
    target: any,
    propertyKey: string | symbol
): void => {
    console.warn('defineQueryValue is deprecated - use @routeParams() instead');
};
```

**Key Changes:**
1. ✅ `queryValue()`, `matrixValue()`, `cookieValue()` are now **factory functions**, not decorators
2. ✅ Return `ParameterExtractor` objects (type + config)
3. ✅ New `@routeParams()` decorator accepts parameter map
4. ✅ Uses `extractParameterNames()` to map by name (from `_decorator-util.ts`)
5. ✅ Throws `InvalidParameterMappingError` if parameter not mapped
6. ✅ Maintains `MethodParameter` and `MethodParameterType` classes (unchanged)

---

###### **4.2 Update Test Files** (30 min)

**File:** `packages/blue-dispatcher/test/assets/argument-resolver-context.ts`

**Before:**
```typescript
import { routeMapping } from '../../src/route-mapping';
import { ModelAndView } from '../../src/model-and-view';
import { queryValue, matrixValue } from '../../src/route-parameter';

@routeMapping('/hello')
class HelloController {
    // /hello/there;name=Jack?name=John
    @routeMapping('/there')
    handleThere(@queryValue('name') n1: string, @matrixValue('name') n2: string) {
        expect(n1).toBe('John');
        expect(n2).toBe('Jack');
        return new ModelAndView('test');
    }
}
```

**After:**
```typescript
import { routeMapping } from '../../src/route-mapping';
import { ModelAndView } from '../../src/model-and-view';
import { routeParams, queryValue, matrixValue } from '../../src/route-parameter';

@routeMapping('/hello')
class HelloController {
    // /hello/there;name=Jack?name=John
    @routeMapping('/there')
    @routeParams({
        n1: queryValue('name'),
        n2: matrixValue('name')
    })
    handleThere(n1: string, n2: string) {
        expect(n1).toBe('John');
        expect(n2).toBe('Jack');
        return new ModelAndView('test');
    }
}
```

**Check other test assets:**
```bash
cd /home/jeff/workspace/blue/packages/blue-dispatcher
grep -r "@queryValue\|@matrixValue\|@cookieValue" test/
```

Update any other files that use parameter decorators.

---

###### **4.3 Update Behavioral Tests** (15 min)

**File:** `packages/blue-dispatcher/test/decorators-behavior.spec.ts`

**Add new TC39 tests, remove legacy parameter decorator tests:**

```typescript
describe('@routeParams (TC39)', () => {
    test('should extract parameter names from function signature', () => {
        class TestController {
            @routeParams({
                id: queryValue('id'),
                page: queryValue('page')
            })
            handleRequest(id: string, page: string) {}
        }
        
        const instance = new TestController();
        const params = getMethodParameter(instance, 'handleRequest');
        expect(params).toHaveLength(2);
        expect(params[0].name).toBe('id');
        expect(params[1].name).toBe('page');
    });
    
    test('should map parameters to extractors by name', () => {
        class TestController {
            @routeParams({
                query: queryValue('search'),
                version: matrixValue('v')
            })
            handleSearch(query: string, version: string) {}
        }
        
        const instance = new TestController();
        const params = getMethodParameter(instance, 'handleSearch');
        expect(params[0].type.type).toBe('query:value');
        expect(params[0].name).toBe('search');
        expect(params[1].type.type).toBe('matrix:value');
        expect(params[1].name).toBe('v');
    });
    
    test('should store MethodParameter array in metadata', () => {
        class TestController {
            @routeParams({
                sessionId: cookieValue('JSESSIONID')
            })
            handleWithCookie(sessionId: string) {}
        }
        
        const instance = new TestController();
        const params = getMethodParameter(instance, 'handleWithCookie');
        expect(params[0]).toBeInstanceOf(MethodParameter);
        expect(params[0].type).toBe(MethodParameterType.COOKIE);
    });
    
    test('should throw InvalidParameterMappingError if parameter not mapped', () => {
        expect(() => {
            class TestController {
                @routeParams({
                    id: queryValue('id')
                    // Missing mapping for 'page' parameter!
                })
                handleRequest(id: string, page: string) {}
            }
        }).toThrow(InvalidParameterMappingError);
    });
    
    test('should support required and defaultValue options', () => {
        class TestController {
            @routeParams({
                id: queryValue('id', true, '0')
            })
            handleWithDefaults(id: string) {}
        }
        
        const instance = new TestController();
        const params = getMethodParameter(instance, 'handleWithDefaults');
        expect(params[0].required).toBe(true);
        expect(params[0].defaultValue).toBe('0');
    });
});
```

---

##### **Step 5: Verify Runtime Integration** (30 min)

**5.1 Run All Dispatcher Tests:**
```bash
cd /home/jeff/workspace/blue
pnpm vitest run packages/blue-dispatcher/test/
```

**Expected:** All tests should pass, including:
- Behavioral tests (new TC39 tests)
- Integration tests (argument-resolver.spec.ts, dispatcher.spec.ts)
- Unit tests (route-mapping-info.spec.ts, etc.)

**5.2 Run Specific Integration Tests:**
```bash
pnpm vitest run packages/blue-dispatcher/test/argument-resolver.spec.ts
pnpm vitest run packages/blue-dispatcher/test/dispatcher.spec.ts
pnpm vitest run packages/blue-dispatcher/test/controller.spec.ts
```

**5.3 Build Package:**
```bash
pnpm --filter @blue/dispatcher build:lib
```

**Expected:** Clean build with no TypeScript errors

**Potential Issues & Fixes:**

**Issue 1:** Route handler discovery fails (methods not found)
- **Cause:** Methods not enumerable
- **Fix:** Verify `context.addInitializer()` sets `enumerable: true` in `@routeMapping`

**Issue 2:** Parameter injection fails
- **Cause:** Metadata key mismatch
- **Fix:** Verify dispatcher reads from `method:parameter:${methodName}` key

**Issue 3:** Error mapping not working
- **Cause:** Error handler methods not enumerable
- **Fix:** Verify `@errorMapping` sets `enumerable: true`

---

##### **Step 6: Update Documentation** (30 min)

**6.1 Update This Document (DECORATOR_MIGRATION.md)**

Mark Phase 3 as complete and change status from "⏳ Pending" to "✅ Complete".

Add Phase 3 completion summary at line 722:

```markdown
### ✅ Phase 3: @blue/dispatcher Migration - COMPLETE

**Status:** Complete (implemented on 2025-02-XX)

**Time Taken:** X.X hours (estimated 4.5-5.5 hours)

**Summary:**
Successfully migrated all 6 decorators in @blue/dispatcher from legacy TypeScript to TC39 Stage 3 standard. Redesigned parameter decorators from parameter decorator pattern to method decorator with parameter map.

**Decorators Migrated:**
1. ✅ `@routeMapping` - Class/Method decorator for route configuration
2. ✅ `@errorHandler` - Class decorator marking error handlers
3. ✅ `@errorMapping` - Method decorator for error class mapping
4. ✅ `@routeParams` - Method decorator (NEW - replaces parameter decorators)
   - Factory functions: `queryValue()`, `matrixValue()`, `cookieValue()`

**Key Achievements:**
- ✅ All 6 decorators migrated to TC39
- ✅ 60+ tests passing (behavioral + integration)
- ✅ Clean build with no TypeScript errors
- ✅ No regressions in other packages
- ✅ Runtime behavior preserved (API changed)

**Breaking Changes:**
Parameter decorators replaced with method decorator + factory functions:

**Before (Legacy):**
```typescript
handleRequest(@queryValue('id') id: string, @matrixValue('v') version: string) { }
```

**After (TC39):**
```typescript
@routeParams({
    id: queryValue('id'),
    version: matrixValue('v')
})
handleRequest(id: string, version: string) { }
```

**Technical Insights:**
- Parameter extraction via `extractParameterNames()` enables name-based mapping
- `InvalidParameterMappingError` thrown if parameter not mapped (fail-fast)
- Factory functions remain for extractor configuration
- Metadata key structure: `method:parameter:${methodName}`

**Files Modified:**
- `src/route-mapping.ts` - Complete TC39 rewrite (120 lines)
- `src/error-mapping.ts` - Complete TC39 rewrite (90 lines)
- `src/route-parameter.ts` - Major redesign (200 lines)
- `test/decorators-behavior.spec.ts` - Created (150 lines)
- `test/assets/argument-resolver-context.ts` - Updated for new API
- `tsconfig.build.json` - Enabled TC39 mode

**Test Results:**
- Behavioral tests: XX/XX passing
- Integration tests: XX/XX passing
- Build: Clean (0 errors)

---

[Keep original Phase 3 implementation details below for reference]
```

**6.2 Update TC39 Quick Reference**

**File:** `docs/plans/2025-02-01_TC39_QUICK_REFERENCE.md`

Add new section:

```markdown
### Pattern: Parameter Mapping Decorator

**Problem:** TC39 doesn't support parameter decorators. Need alternative for parameter injection.

**Solution:** Method decorator with parameter map + factory functions.

**Implementation:**
```typescript
// Factory functions (return configuration objects)
export function queryValue(mapping: string, required = false, defaultValue = null): ParameterExtractor {
    return {
        type: MethodParameterType.QUERY,
        name: mapping,
        required,
        defaultValue,
    };
}

// Method decorator using parameter extraction
export function routeParams(parameterMap: Record<string, ParameterExtractor>) {
    return function (target: any, context: ClassMethodDecoratorContext) {
        // Extract parameter names from function signature
        const paramNames = extractParameterNames(target);
        
        // Map parameters by name
        const parameters: MethodParameter[] = paramNames.map((paramName, index) => {
            const extractor = parameterMap[paramName];
            if (!extractor) {
                throw new InvalidParameterMappingError(
                    `No mapping defined for parameter "${paramName}" at index ${index}`
                );
            }
            return new MethodParameter(
                extractor.type,
                extractor.name,
                extractor.required ?? false,
                extractor.defaultValue ?? null
            );
        });
        
        // Store in metadata
        context.metadata[`method:parameter:${String(context.name)}`] = parameters;
        return target;
    };
}
```

**Usage:**
```typescript
class MyController {
    @routeParams({
        id: queryValue('id'),
        version: matrixValue('version'),
        sessionId: cookieValue('JSESSIONID')
    })
    handleRequest(id: string, version: string, sessionId: string) {
        // Parameters injected by dispatcher
    }
}
```

**Key Insights:**
- Factory functions are NOT decorators - they return configuration objects
- Method decorator reads parameter names via reflection
- Name-based mapping (order-independent)
- Fail-fast validation (unmapped parameters throw error)
- Works with existing dispatcher injection logic
```

**6.3 Optional: Create Migration Guide**

**File:** `docs/migrations/2025-02-XX_PARAMETER_DECORATORS.md` (optional)

Document the breaking change and provide migration examples for users.

---

##### **Step 7: Final Validation** (15 min)

**7.1 Run Full Test Suite:**
```bash
cd /home/jeff/workspace/blue
pnpm test
```

**Expected:** All tests passing across all packages

**7.2 Build All Packages:**
```bash
pnpm build
```

**Expected:** Clean build with no errors

**7.3 Verify No Regressions:**
```bash
# Check @blue/validate
pnpm vitest run packages/blue-validate/test/

# Check @blue/context
pnpm vitest run packages/blue-context/test/

# Check @blue/dispatcher
pnpm vitest run packages/blue-dispatcher/test/
```

**Expected:** All tests passing (no regressions)

---

#### Success Criteria Checklist

- [ ] TypeScript configured for TC39 (`experimentalDecorators: false`)
- [ ] Behavioral test suite created (`decorators-behavior.spec.ts`)
- [ ] All behavioral tests passing (document legacy behavior)
- [ ] `@routeMapping` migrated to TC39
- [ ] `@errorHandler` migrated to TC39
- [ ] `@errorMapping` migrated to TC39
- [ ] Parameter decorators redesigned as `@routeParams()`
- [ ] Factory functions created: `queryValue()`, `matrixValue()`, `cookieValue()`
- [ ] All test files updated to new API
- [ ] All dispatcher tests passing (60+)
- [ ] Clean build with no TypeScript errors
- [ ] No regressions in @blue/validate
- [ ] No regressions in @blue/context
- [ ] Documentation updated (this file)
- [ ] TC39 Quick Reference updated
- [ ] Breaking changes documented

---

#### Files Modified Summary

**Configuration:**
- `packages/blue-dispatcher/tsconfig.build.json` - Enable TC39 mode

**Source Code (Complete Rewrites):**
- `packages/blue-dispatcher/src/route-mapping.ts` (~120 lines)
- `packages/blue-dispatcher/src/error-mapping.ts` (~90 lines)
- `packages/blue-dispatcher/src/route-parameter.ts` (~200 lines, major redesign)

**Tests:**
- `packages/blue-dispatcher/test/decorators-behavior.spec.ts` (NEW, ~150 lines)
- `packages/blue-dispatcher/test/assets/argument-resolver-context.ts` (UPDATE)
- `packages/blue-dispatcher/test/assets/dispatcher-context.ts` (CHECK + UPDATE if needed)
- `packages/blue-dispatcher/test/assets/route-error-resolver-context.ts` (CHECK + UPDATE if needed)

**Documentation:**
- `docs/plans/2025-02-01_DECORATOR_MIGRATION.md` (this file - update Phase 3 status)
- `docs/plans/2025-02-01_TC39_QUICK_REFERENCE.md` (add parameter mapping pattern)
- `docs/migrations/2025-02-XX_PARAMETER_DECORATORS.md` (NEW, optional)

---

#### Breaking Changes

**API Change:** Parameter decorators → Method decorator with parameter map

**Migration Required:**

| Legacy (TypeScript) | TC39 (Stage 3) |
|:---|:---|
| `@queryValue('id')` parameter decorator | `queryValue('id')` factory function |
| `@matrixValue('v')` parameter decorator | `matrixValue('v')` factory function |
| `@cookieValue('sid')` parameter decorator | `cookieValue('sid')` factory function |
| N/A | `@routeParams({...})` method decorator (NEW) |

**Example Migration:**

```typescript
// ❌ OLD (Legacy - won't work in TC39)
class UserController {
    @routeMapping('/users/{id}')
    getUser(@queryValue('format') format: string, @matrixValue('version') version: string) {
        // ...
    }
}

// ✅ NEW (TC39 Compatible)
class UserController {
    @routeMapping('/users/{id}')
    @routeParams({
        format: queryValue('format'),
        version: matrixValue('version')
    })
    getUser(format: string, version: string) {
        // ...
    }
}
```

**Automated Migration Script (Pseudocode):**

```typescript
// For future consideration - could automate migration
function migrateParameterDecorators(sourceCode: string): string {
    // 1. Find method with parameter decorators
    // 2. Extract decorator → parameter mappings
    // 3. Build parameter map object
    // 4. Add @routeParams() before method
    // 5. Remove parameter decorators
    // 6. Keep parameter names and types
    return transformedCode;
}
```

---

#### Common Pitfalls

**Pitfall 1: Forgetting to Add @routeParams Decorator**
```typescript
// ❌ WRONG - factory functions alone don't work
handleRequest(id: string, version: string) {
    // No parameter injection!
}

// ✅ CORRECT - need @routeParams decorator
@routeParams({
    id: queryValue('id'),
    version: matrixValue('version')
})
handleRequest(id: string, version: string) {
    // Parameters injected correctly
}
```

**Pitfall 2: Mismatched Parameter Names**
```typescript
// ❌ WRONG - parameter map key doesn't match function parameter
@routeParams({
    userId: queryValue('id')  // Key is 'userId'
})
handleRequest(id: string) {  // Parameter is 'id'
    // Throws InvalidParameterMappingError!
}

// ✅ CORRECT - keys match parameter names
@routeParams({
    id: queryValue('id')  // Key matches parameter name
})
handleRequest(id: string) {
    // Works correctly
}
```

**Pitfall 3: Missing Parameter Mapping**
```typescript
// ❌ WRONG - not all parameters mapped
@routeParams({
    id: queryValue('id')
    // Missing 'page' parameter!
})
handleRequest(id: string, page: string) {
    // Throws InvalidParameterMappingError
}

// ✅ CORRECT - all parameters mapped
@routeParams({
    id: queryValue('id'),
    page: queryValue('page')
})
handleRequest(id: string, page: string) {
    // Works correctly
}
```

**Pitfall 4: Methods Not Enumerable**
```typescript
// Issue: for...in loops in dispatcher won't find methods

// Solution already implemented in @routeMapping and @errorMapping:
context.addInitializer(function (this: any) {
    const descriptor = Reflect.getOwnPropertyDescriptor(
        Object.getPrototypeOf(this),
        context.name
    );
    if (descriptor && !descriptor.enumerable) {
        Reflect.defineProperty(Object.getPrototypeOf(this), context.name, {
            ...descriptor,
            enumerable: true,
        });
    }
});
```

---

#### Lessons Learned (Add After Implementation)

**To be filled in after completing Phase 3:**
- Time estimation accuracy
- Unexpected challenges encountered
- Solutions that worked particularly well
- Areas for improvement
- Performance implications (if any)
- Comparison to Phase 1 & 2 complexity

---

## Migration Statistics

### Final Numbers

**Decorators Migrated:** 16 total across 5 packages

| Package | Decorators | Test Files | New Tests | Total Tests | Status |
|---------|-----------|------------|-----------|-------------|--------|
| @blue/validate | 1 (`@pattern`) | 1 | 12 | 107 active | ✅ Complete |
| @blue/context | 5 | 1 | 24 | 60 active | ✅ Complete |
| @blue/dispatcher | 6 | 3 | 39 | 88 active | ✅ Complete |
| @blue/factory | 4 | 1 | 24 | 35 active | ✅ Complete |
| @blue/view-webcomponent | 2 | 2 | 23 | 23 active | ✅ Complete |
| **TOTALS** | **16** | **8** | **122** | **~313** | **✅ Complete** |

### Time Investment

**Total Effort:** ~15-18 hours across 2 sessions

| Phase | Package | Decorators | Time Spent |
|-------|---------|-----------|------------|
| Phase 1 | @blue/validate | 1 | ~2 hours |
| Phase 2 | @blue/context | 5 | ~4 hours |
| Phase 3 | @blue/dispatcher | 6 | ~6 hours |
| Phase 4 | @blue/factory | 4 | ~1.5 hours |
| Phase 5 | @blue/view-webcomponent | 2 | ~1.5 hours |
| **Infrastructure** | MetadataManager, configs, cleanup | - | ~2 hours |
| **TOTAL** | **5 packages** | **16 decorators** | **~17 hours** |

### Code Changes

**Files Modified:** ~45 files total

| Category | Files |
|----------|-------|
| Decorator implementations | 10 |
| Test files (new + modified) | 15 |
| TypeScript configurations | 12 |
| Package.json files | 7 |
| Documentation | 1 (STYLE_GUIDE.md) |

**Lines of Code:**
- Decorator implementations: ~800 lines modified
- Test code: ~2,500 lines added
- Total impact: ~3,300 lines

### Commits

**Total Commits:** 13 commits

1. feat(validate): migrate @Pattern decorator to TC39 standard (Phase 1)
2. chore: add @tsmetadata/polyfill dependency for TC39 decorators
3. chore(context): remove obsolete testContext.js file
4. chore: remove reflect-metadata from migrated packages
5. feat(factory): migrate scope decorators to TC39 standard
6. feat(view-webcomponent): migrate decorators to TC39 standard
7. refactor(validate): standardize @Pattern to @pattern (camelCase)
8. chore: remove legacy decorator config from root tsconfig files
9. chore: remove reflect-metadata dependency
10. docs: update STYLE_GUIDE.md with decorator naming section
11-13. *(Context and Dispatcher phases from previous session)*

### Dependencies

**Removed:**
- `reflect-metadata` (~0.2.2) - Removed from 1 package + root devDependencies

**Added:**
- `@tsmetadata/polyfill` (~0.7.0) - Added to root devDependencies

**Net change:** -1 dependency, modernized implementation

---

## Migration Patterns & Recipes

### Pattern 1: Simple Class Decorator

**Legacy:**
```typescript
export const MyDecorator: ClassDecorator = (target) => {
    Reflect.defineMetadata('my:key', true, target);
    return target;
};
```

**TC39:**
```typescript
export function MyDecorator() {
    return function(target: any, context: ClassDecoratorContext) {
        context.metadata['my:key'] = true;
        return target;
    };
}
```

### Pattern 2: Method Decorator

**Legacy:**
```typescript
export const MyDecorator = (param: string) => {
    return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        Reflect.defineMetadata('my:key', param, target, propertyKey);
        return descriptor;
    };
};
```

**TC39:**
```typescript
export function MyDecorator(param: string) {
    return function(target: any, context: ClassMethodDecoratorContext) {
        context.metadata[`my:key:${String(context.name)}`] = param;
        return target;
    };
}
```

### Pattern 3: Field Decorator with Validation

**Legacy (BROKEN):**
```typescript
export const Validate = (validator: Function) => {
    return (target: Object, propertyKey: string | symbol): void => {
        // This doesn't work - instance property shadows prototype
        Object.defineProperty(target, propertyKey, {
            set(value) { /* validation */ }
        });
    };
};
```

**TC39 (WORKING):**
```typescript
export function Validate(validator: Function) {
    return function(value: undefined, context: ClassFieldDecoratorContext) {
        return function(this: any, initialValue: any) {
            const storageSymbol = Symbol(`__${String(context.name)}`);
            this[storageSymbol] = initialValue;
            delete this[context.name];
            
            Object.defineProperty(this, context.name, {
                get() { return this[storageSymbol]; },
                set(newValue) {
                    if (!validator(newValue)) {
                        throw new Error('Validation failed');
                    }
                    this[storageSymbol] = newValue;
                },
                configurable: true,
                enumerable: true,
            });
            
            return initialValue;
        };
    };
}
```

### Pattern 4: Reading Metadata

**Legacy:**
```typescript
const value = Reflect.getMetadata('my:key', MyClass);
const methodValue = Reflect.getMetadata('my:key', MyClass.prototype, 'methodName');
```

**TC39:**
```typescript
const value = MyClass[Symbol.metadata]?.['my:key'];
const methodValue = MyClass[Symbol.metadata]?.[`my:key:methodName`];
```

**Note:** Method-level metadata is typically stored with the method name as part of the key since TC39 doesn't have separate target/propertyKey parameters.

---

## Testing Strategy

### 1. Behavioral Testing Before Migration

For each package:
1. Create `test/decorators-behavior.spec.ts`
2. Test all decorator behaviors comprehensively
3. Ensure 100% pass rate with legacy decorators
4. These become regression tests for TC39 migration

**Example test structure:**
```typescript
describe('@MyDecorator', () => {
    it('stores metadata correctly', () => { /* ... */ });
    it('returns expected value', () => { /* ... */ });
    it('handles edge cases', () => { /* ... */ });
    it('works in inheritance', () => { /* ... */ });
});
```

### 2. Migration Testing

1. Enable TC39 decorators in tsconfig
2. Rewrite decorator implementations
3. Run existing behavioral tests (should all pass)
4. Run full package test suite
5. Verify no regressions

### 3. Integration Testing

After each package migration:
1. Run all tests across the entire monorepo
2. Ensure other packages (still using legacy decorators) are unaffected
3. Check for any cross-package metadata compatibility issues

---

## Risk Assessment

### Low Risk ✅

- **@blue/validate:** Complete and stable
- **Simple class decorators:** Straightforward migration
- **Method decorators:** Well-understood pattern

### Medium Risk ⚠️

- **@blue/context metadata compatibility:** Need to ensure existing code reading metadata works
- **Property decorators:** More complex than methods but pattern is proven
- **Test coverage:** Some packages may have insufficient tests

### High Risk ⚠️⚠️

- **@blue/dispatcher parameter decorators:** Requires API change (breaking change)
- **Runtime behavior changes:** TC39 execution order differs from legacy
- **Metadata migration:** Risk of breaking existing code that reads decorator metadata
- **Build system interactions:** Potential issues with tsconfig composition

### Mitigation Strategies

1. **Incremental migration:** One package at a time, validate fully before moving on
2. **Comprehensive testing:** Write behavioral tests before migrating
3. **Backward compatibility:** Consider keeping legacy decorator exports with deprecation warnings
4. **Documentation:** Update all decorator usage examples in docs
5. **Version control:** Tag each successful package migration for easy rollback

---

## Next Steps

### ✅ All Core Migration Complete

All planned decorator migrations have been successfully completed. The following tasks remain optional or future work:

### Optional Future Work

1. **Documentation updates**
   - ✅ STYLE_GUIDE.md updated with decorator naming section
   - ⏳ Update package README files with TC39 examples (optional enhancement)
   - ⏳ Update demo app if needed (currently has pre-existing issues)

2. **Performance validation** (optional)
   - Benchmark decorator performance (TC39 vs legacy)
   - Profile metadata access patterns
   - Document any performance implications

3. **Remaining packages** (no decorators found)
   - @blue/router, @blue/http, @blue/logger, etc. have no decorators to migrate
   - Pre-existing build errors in some packages are unrelated to decorator migration

### Success Criteria Met ✅

- ✅ All 16 decorators migrated to TC39 standard
- ✅ All decorators use camelCase naming convention
- ✅ ~165 tests passing across all migrated packages
- ✅ Zero reflect-metadata dependencies remaining
- ✅ Zero experimentalDecorators/emitDecoratorMetadata in configs
- ✅ All migrated packages build successfully
- ✅ STYLE_GUIDE.md documented decorator naming
- ✅ Migration plan document updated with final statistics

**Migration Status: COMPLETE** 🎉

---

## Appendices

### A. File Locations

**Modified Files:**
```
packages/blue-validate/
  ├── src/decorators.ts                     [MODIFIED - TC39 rewrite]
  ├── test/pattern.spec.ts                  [CREATED - 16 tests]
  ├── tsconfig.json                         [CREATED - TC39 enabled]
  └── tsconfig.build.json                   [MODIFIED - TC39 enabled]

packages/blue-context/
  ├── src/configuration.ts                  [MODIFIED - TC39 rewrite, 332 lines]
  ├── src/_util.ts                          [MODIFIED - fixed export conflicts]
  ├── test/decorators-behavior.spec.ts      [MODIFIED - TC39 metadata API, 385 lines]
  ├── test/testContext.ts                   [MODIFIED - added type annotations, TC39 metadata]
  ├── tsconfig.json                         [MODIFIED - TC39 enabled]
  └── tsconfig.build.json                   [MODIFIED - TC39 enabled]

packages/blue-dispatcher/
  ├── src/_decorator-util.ts                [CREATED - param name extraction]
  ├── src/error.ts                          [MODIFIED - added error classes]
  └── test/decorator-util.spec.ts           [CREATED - 11 tests]
```

**Deleted Files:**
```
packages/blue-validate/test/
  ├── pattern-decorator-behavior.spec.ts    [DELETED - legacy tests]
  ├── pattern-behavior-contract.spec.ts     [DELETED - legacy tests]
  ├── pattern-constraint-debug.spec.ts      [DELETED - debug file]
  ├── pattern-setter-debug.spec.ts          [DELETED - debug file]
  ├── decorators.spec.ts                    [DELETED - legacy tests]
  └── testDecorators.ts                     [DELETED - legacy fixture]
```

### B. Dependencies

**Current:**
- `reflect-metadata` (legacy, still in use)
- `@tsmetadata/polyfill` v1.3.3 (installed, ready to use)

**After full migration:**
- Remove `reflect-metadata`
- Keep `@tsmetadata/polyfill`

### C. References

**TC39 Decorator Proposal:**
- Stage 3 proposal: https://github.com/tc39/proposal-decorators
- TypeScript 5.0 announcement: https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators

**TypeScript Documentation:**
- Decorators: https://www.typescriptlang.org/docs/handbook/decorators.html
- Metadata: https://www.typescriptlang.org/docs/handbook/decorators.html#metadata

**Related Issues:**
- Field decorator initialization: https://github.com/microsoft/TypeScript/issues/49441
- Metadata polyfill: https://github.com/rbuckton/reflect-metadata

---

## Conclusion

✅ **Migration Complete!** All 16 decorators across 5 packages have been successfully migrated from legacy TypeScript experimental decorators to TC39 Stage 3 standard decorators.

**Success Metrics:**
- ✅ Five packages fully migrated with all tests passing
  - @blue/validate (1 decorator, 107 active tests)
  - @blue/context (5 decorators, 60 active tests)
  - @blue/dispatcher (6 decorators, 88 active tests)
  - @blue/factory (4 decorators, 35 active tests)
  - @blue/view-webcomponent (2 decorators, 23 active tests)
- ✅ Total: 16 decorators migrated, ~165 tests passing
- ✅ Naming standardization: All decorators now use camelCase
- ✅ Proven pattern for field decorators (addInitializer + instance storage)
- ✅ Method decorator enumerability pattern established
- ✅ Metadata migration strategy validated (Symbol.metadata)
- ✅ Comprehensive test coverage maintained throughout migration
- ✅ Per-package migration strategy proven effective
- ✅ Runtime integration verified (MetadataManager, helper functions)
- ✅ Dependency cleanup complete (reflect-metadata removed)
- ✅ Global configuration cleanup (legacy settings removed)

**Key Achievements:**
1. **Complete Feature Parity**: All decorator functionality preserved
2. **Breaking Change Managed**: Parameter decorators → method decorator pattern
3. **Clean Build**: All migrated packages compile without errors
4. **Test Coverage**: 100% of decorator behavioral tests passing
5. **Documentation**: Comprehensive migration guide and patterns documented
6. **Standards Compliance**: Fully compliant with TC39 Stage 3 specification
7. **Future-Proof**: Ready for TypeScript 6.0+ and ECMAScript evolution

**Breaking Changes:**
- Parameter decorators replaced with `@routeParams` method decorator + factory functions
- Migration path documented with before/after examples
- Old API: `@queryValue('id')` as parameter decorator
- New API: `@routeParams({ id: queryValue('id') })` as method decorator

**Technical Insights Gained:**
1. TC39 field decorators require `context.addInitializer()` to work correctly
2. Method enumerability must be explicitly set for `for...in` discovery
3. Symbol-based per-instance storage prevents shared state issues
4. Metadata key namespacing required for method-level metadata
5. Parameter extraction via function toString() enables name-based mapping

**Post-Migration Cleanup (2026-02-02):**

Completed cleanup tasks after TC39 migration:

1. ✅ **Removed `reflect-metadata` from migrated packages**
   - Removed from `@blue/context/package.json` (devDependencies and peerDependencies)
   - Removed from `@blue/dispatcher/package.json` (devDependencies and peerDependencies)
   - @blue/validate never had the dependency (uses only @tsmetadata/polyfill)

2. ✅ **Verified no `reflect-metadata` imports in migrated packages**
   - Searched all source files in @blue/validate, @blue/context, @blue/dispatcher
   - Zero imports found (all use @tsmetadata/polyfill instead)

3. ✅ **Test & Build Verification**
   - @blue/validate: All 107 tests passing, build successful
   - @blue/context: All 59 tests passing, build successful
   - @blue/dispatcher: All 66 decorator tests passing, build successful

4. 📝 **Unmigrated Packages Still Using `reflect-metadata`:**
   - `@blue/factory` - Uses legacy decorators (`@scope`, `@singletonScope`, etc.)
   - `@blue/view-webcomponent` - Uses legacy decorators (`@viewMapping`, `@tagMapping`)
   - Root package.json - Keeps dependency for unmigrated packages

**Next Steps (Optional):**
- Remove `experimentalDecorators: true` from root tsconfig (if desired)
- Migrate remaining packages (@blue/factory, @blue/view-webcomponent)
- Create user migration guide for external consumers
- Performance benchmarking (TC39 vs legacy)

---

**Document Version:** 2.1  
**Last Updated:** 2026-02-02  
**Status:** COMPLETE - All phases finished successfully + Post-migration cleanup completed
