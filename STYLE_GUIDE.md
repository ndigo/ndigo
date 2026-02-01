# BlueJS Style Guide

This document defines the concrete implementation rules, naming conventions, and formatting standards for the BlueJS codebase. For architectural principles and design patterns, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Purpose and Scope

**This guide answers:** "How do I name this file/variable/class?" and "How should this code be formatted?"

**See ARCHITECTURE.md for:** "Why is the system designed this way?" and "What are the architectural patterns?"

## 1. Formatting Rules

These rules are enforced by Prettier (`prettier.config.mjs`). When Prettier configuration changes, this section must be updated.

### Indentation

- **TypeScript/JavaScript:** 4 spaces
- **JSON/YAML:** 2 spaces
- **Never use tabs** (`useTabs: false`)

**Examples:**

```typescript
// ✅ Correct: 4 spaces for TS/JS
function example() {
    const value = 42;
    return value;
}
```

```json
{
  "name": "@blue/core",
  "version": "3.0.0-alpha.0"
}
```

### Line Endings

- **Always use LF** (`\n`) on all platforms
- **Never use CRLF** (`\r\n`)
- Configured: `endOfLine: 'lf'`

### Semicolons

- **Always required** at the end of statements
- Configured: `semi: true`

```typescript
// ✅ Correct
const value = 42;
export default MyClass;

// ❌ Wrong
const value = 42
export default MyClass
```

### Quotes

- **Single quotes** for strings in TypeScript/JavaScript
- **Double quotes** for JSX attributes
- Configured: `singleQuote: true`, `jsxSingleQuote: false`

```typescript
// ✅ Correct
const message = 'Hello, world!';
import { foo } from '@blue/util';

// ❌ Wrong
const message = "Hello, world!";
import { foo } from "@blue/util";
```

### Trailing Commas

- **ES5 style** - Use trailing commas where valid in ES5
- Helps with cleaner git diffs
- Configured: `trailingComma: 'es5'`

```typescript
// ✅ Correct
const obj = {
    name: 'example',
    value: 42,  // ← trailing comma
};

const arr = [
    'first',
    'second',
    'third',  // ← trailing comma
];

// ❌ Wrong: No trailing comma in function parameters (not valid in ES5)
function example(
    arg1: string,
    arg2: number,  // ← Prettier will remove this
) {}
```

### Print Width

- **Maximum 120 characters** per line
- Prettier will automatically wrap at this width
- Configured: `printWidth: 120`

### Arrow Functions

- **Always use parentheses** around parameters
- Configured: `arrowParens: 'always'`

```typescript
// ✅ Correct
const fn = (x) => x * 2;
const fn2 = (x, y) => x + y;

// ❌ Wrong
const fn = x => x * 2;
```

### Bracket Spacing

- **Use spaces inside object literal braces**
- **Arrays do not get spaces** (standard JavaScript)
- Configured: `bracketSpacing: true`

```typescript
// ✅ Correct
const obj = { name: 'example', value: 42 };  // spaces around braces
const arr = [1, 2, 3];  // no spaces in arrays

// ❌ Wrong
const obj = {name: 'example', value: 42};  // missing spaces
const arr = [ 1, 2, 3 ];  // extra spaces
```

### Markdown Files

- **Preserve prose wrapping** - Do not reflow markdown text
- Configured: `proseWrap: 'preserve'`

---

## 2. File Naming Conventions

### Source Files

**Pattern:** `kebab-case.ts`

All TypeScript source files use lowercase with hyphens separating words.

**Examples:**

```
✅ media-type.ts
✅ content-negotiation-view-resolver.ts
✅ to-camel.ts
✅ is-constructor.ts
✅ rand-int.ts
```

**Rationale:** Kebab-case is URL-friendly, avoids case-sensitivity issues across file systems, and is widely adopted in JavaScript/TypeScript ecosystems.

### Internal/Private Files

**Pattern:** `_kebab-case.ts`

Files prefixed with underscore are internal implementation details.

**Rules:**
- ❌ **Never export** in public API (`index.ts`)
- ❌ **Never import** across package boundaries
- ✅ **Only use** within the same package
- ✅ **Document** purpose in file-level JSDoc

**Examples:**

```
✅ _util.ts          // Internal utilities
✅ _parser.ts        // Internal parser helpers
✅ _natural-sort.ts  // Internal sorting implementation
✅ _xprod.ts         // Internal cross-product logic
```

**Usage:**

```typescript
// ✅ Correct: Import within same package
// In packages/blue-util/src/string/to-camel.ts
import { helper } from '../_util';

// ❌ Wrong: Import across packages
// In packages/blue-core/src/media-type.ts
import { helper } from '@blue/util/_util';  // NEVER DO THIS
```

### Test Files

**Pattern:** `kebab-case.spec.ts`

Test specifications use the same naming as their source files, with `.spec.ts` suffix.

**Examples:**

```
✅ media-type.spec.ts
✅ brace-expression.spec.ts
✅ to-camel.spec.ts
✅ is-valid-date.spec.ts
```

### Test Helper Files

**Pattern:** `_kebab-case.ts` (preferred) or `testCamelCase.ts` (legacy)

Test utilities and fixtures use underscore prefix (preferred) or camelCase (legacy, acceptable).

**Examples:**

```
✅ _expect.ts       // Custom test assertions (preferred)
✅ _worker.ts       // Test worker utilities (preferred)
✅ test-cases.ts    // Test data fixtures
⚠️  testDecorators.ts  // Legacy pattern (acceptable, not recommended for new files)
⚠️  testContext.ts     // Legacy pattern (acceptable, not recommended for new files)
```

### Type Declaration Files

**Pattern:** `kebab-case.d.ts`

TypeScript declaration files use kebab-case with `.d.ts` extension.

**Examples:**

```
✅ ramda.d.ts
✅ ramda-extensions.d.ts
```

### Configuration Files

**Pattern:** `kebab-case.config.ts` or `kebab-case.json`

Configuration files use kebab-case with appropriate extensions.

**Examples:**

```
✅ vitest.config.ts
✅ vite.config.lib.ts
✅ tsconfig.json
✅ tsconfig.build.json
✅ pnpm-workspace.yaml
✅ prettier.config.mjs
✅ eslint.config.mjs
```

### Documentation Files

**Pattern:** `UPPER_SNAKE_CASE.md` or `YYYY-MM-DD_DESCRIPTION.md`

Root-level documentation uses all caps, dated documentation uses ISO 8601 date with underscore separator.

**Root Documentation (Uppercase):**

```
✅ README.md
✅ ARCHITECTURE.md
✅ STYLE_GUIDE.md
✅ AGENTS.md
✅ CLAUDE.md
```

**Dated Documentation (ISO 8601 + Underscore):**

```
✅ 2025-01-23_DEPENDENCIES.md
✅ 2025-02-01_DEPENDENCY_AUDIT.md
✅ 2025-01-30_PARSER_ENHANCEMENT.md
✅ 2025-01-28_ESM_ONLY.md

❌ 2025-01-23-dependencies.md     // Wrong: lowercase, hyphen separator
❌ dependencies-2025.md            // Wrong: date at end
❌ 2025-01-23-DEPENDENCIES.md     // Wrong: hyphen separator
```

**Format:** `YYYY-MM-DD_DESCRIPTION.md`

Where:
- `YYYY-MM-DD` - ISO 8601 date with hyphens
- `_` - Underscore separator (consistent with UPPER_SNAKE_CASE)
- `DESCRIPTION` - ALL_CAPS with underscores for multi-word phrases

---

## 3. Code Naming Conventions

### Constants

**Pattern:** `UPPER_SNAKE_CASE` for true constants, `camelCase` for functional constants

**True Constants** (immutable primitive values):

```typescript
// ✅ Correct: Primitive constants use UPPER_SNAKE_CASE
const ALPHA_REGEX = /^[a-zA-Z]+$/;
const ALPHA_NUMERIC_REGEX = /^[a-zA-Z0-9]+$/;
const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY';
const WILDCARD: SupportedMediaType = '*';
const QUALITY_FACTOR_PARAM = 'q';
const MAX_RETRIES = 3;

export const APPLICATION_JSON = MediaType.for('application', 'json');
export const TEXT_HTML = MediaType.for('text', 'html');
export const IMAGE_PNG = MediaType.for('image', 'png');
```

**Functional Constants** (composed functions, still immutable):

```typescript
// ✅ Correct: Functional constants use camelCase
const removeSpaces = replace(spaces, '');
const removeDashesWithSpaces = replace(dashes, ' ');
const naturalComparison = comparator(naturalPredicate);
const specificityComparator = new SpecificityComparator();
const upperCaseCount: Counter = pipe(toString, removeLowerCase, lengthOf);
```

**Rationale:** Distinguishes primitive values from higher-order functions. While both are immutable, primitive constants represent data, while functional constants represent behavior.

### Variables and Functions

**Pattern:** `camelCase`

All non-constant variables, functions, parameters, and properties use camelCase.

**Functions:**

```typescript
// ✅ Correct
function toCamel(value: string): string { ... }
function toPascal(value: string): string { ... }
function isValidDate(value: temporal, format: string): boolean { ... }
function randInt(min: number, max: number): number { ... }
```

**Variables:**

```typescript
// ✅ Correct
const upperCaseCount: Counter = pipe(toString, removeLowerCase, lengthOf);
const patternConstraint = curry(({ regex, flags }: PatternParams, value: string) => ...);
const typeRegistry = new Map<string, MediaType>();
let currentIndex = 0;
```

**Arrow Functions:**

```typescript
// ✅ Correct
const transform = (value: string) => value.toUpperCase();
const add = (a: number, b: number) => a + b;
```

### Predicate Functions

**Pattern:** `isType` prefix for type/inheritance checks

Predicates that check types using `typeof`, `instanceof`, or similar runtime checks.

```typescript
// ✅ Correct: Type checking predicates
function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !Number.isNaN(value);
}

function isConstructor(value: unknown): value is Constructor {
    return typeof value === 'function' && value.prototype !== undefined;
}

function isValidDate(value: temporal, format: string): boolean {
    return !isNaN(Date.parse(value));
}
```

### Duck Typing Functions

**Pattern:** `likeType` prefix for structural/interface checks

Functions that check for expected properties/methods without using `typeof` or `instanceof`.

```typescript
// ✅ Correct: Duck typing predicates
function likeArray(value: unknown): value is ArrayLike<any> {
    return value != null && typeof value === 'object' && 'length' in value;
}

function likePromise(value: unknown): value is PromiseLike<any> {
    return value != null && typeof (value as any).then === 'function';
}

function likeController(value: unknown): value is ControllerLike {
    return value != null && 
           typeof value === 'object' &&
           'handle' in value &&
           typeof (value as any).handle === 'function';
}

function likeComparable<T>(value: unknown): value is Comparable<T> {
    return value != null && 
           typeof value === 'object' &&
           'compareTo' in value;
}
```

**Rationale:** Clear distinction between runtime type checks (`is`) and structural compatibility checks (`like`).

### Classes and Interfaces

**Pattern:** `PascalCase`

All class names, interface names, and type names use PascalCase.

**Classes:**

```typescript
// ✅ Correct
class MediaType extends Null implements Serializable { }
class DataBinder { }
class SpecificityComparator<T> implements Comparator<T> { }
class PredicateComparator<T> implements Comparator<T> { }
class EventModel { }
```

**Abstract Classes:**

```typescript
// ✅ Correct
abstract class AbstractValueComparator implements Comparator<string> { }
abstract class BaseController { }
```

**Interfaces:**

```typescript
// ✅ Correct
interface Comparable<T> { }
interface StringComparable<T> extends Comparable<T> { }
interface Comparator<T> { }
interface Serializable { }
interface ControllerLike { }
```

### Private Fields

**Pattern:** `#privateField` (modern) or `_legacyPrivate` (legacy)

Modern code uses `#` prefix for private class fields (ES2022). Legacy code may use `_` prefix.

**Modern (Preferred):**

```typescript
// ✅ Correct: Use # for private fields (ES2022)
class DataBinder {
    #name: string;
    #target: any;
    #result: any;
    #requiredFields: Set<string>;
    
    constructor(name: string) {
        this.#name = name;
    }
    
    get name() {
        return this.#name;  // Accessor for private field
    }
}
```

**Legacy (Being Phased Out):**

```typescript
// ⚠️ Legacy: Underscore prefix (old code only)
class OldComponent {
    private _enabled: boolean;
    private _hasView: boolean;
    
    // These are deprecated:
    __viewName: string;
    __enabled: boolean;
}
```

**Rationale:** `#` provides true privacy at the language level (ES2022+), while `_` is just a convention. New code should use `#`.

### Type Definitions

**Pattern:** `PascalCase` for complex types, `camelCase` for simple type aliases

**Complex Types (PascalCase):**

```typescript
// ✅ Correct: Complex types use PascalCase
type SampleFunction = {
    <T = any>(n: number, list: ArrayLike<T>): T[];
    <T = any>(n: number): (list: ArrayLike<T>) => T[];
};

type MediaTypeParameters = {
    [name: string]: string | number | boolean;
};

type QualityFactor = `;q=${0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0}`;

type SerializableValue = string | number | boolean | null | undefined;
```

**Simple Type Aliases (camelCase):**

```typescript
// ✅ Correct: Simple/functional type aliases use camelCase
type comparison<T> = (value1: T, value2: T) => number;
type predicate<T> = (value1: T, value2: T) => boolean;
type constraint<T = serializable> = (value: T, params?: Params) => boolean;
type temporal = string | Date;
type pattern = string | RegExp;
type serializable = string | number | boolean | null | undefined;
```

**Rationale:** Complex structural types are treated like interfaces (PascalCase), while simple type aliases and functional types use camelCase for consistency with function naming.

---

## 4. Module Organization

### Directory Structure

```
packages/
└── package-name/
    ├── src/
    │   ├── index.ts              # Public API barrel export
    │   ├── _util.ts              # Internal utilities
    │   ├── module-name.ts        # Public modules
    │   └── category/
    │       ├── index.ts          # Category barrel export
    │       ├── _helper.ts        # Category-internal utilities
    │       └── specific-module.ts
    ├── test/
    │   ├── _expect.ts            # Test framework helpers
    │   ├── test-cases.ts         # Test data
    │   └── module-name.spec.ts   # Test specs
    ├── lib/                      # Compiled output (generated)
    ├── package.json
    ├── tsconfig.json
    └── tsconfig.build.json
```

### Barrel Exports (index.ts)

**Public API Definition:**

```typescript
// packages/blue-core/src/index.ts
// Only export public API - never export underscore files

export { MediaType } from './media-type';
export { DataBinder } from './data-binder';
export type { Comparable, Comparator } from './interfaces';

// ❌ NEVER do this:
// export { helper } from './_util';  // Internal files never exported
```

**Category Barrel:**

```typescript
// packages/blue-util/src/string/index.ts
// Re-export all public modules in this category

export { toCamel } from './to-camel';
export { toPascal } from './to-pascal';
export { toKebab } from './to-kebab';
export { slugify } from './slugify';

// Internal utilities stay private
// (no export for _helpers.ts)
```

### Internal vs Public Modules

**Public Modules:**
- Exported via `src/index.ts`
- Stable API subject to semantic versioning
- Documented with TSDoc
- Safe for cross-package use

**Internal Modules (_prefix):**
- NOT exported in `index.ts`
- Implementation details
- Can change without notice
- Package-private only

---

## 5. Special Patterns

### Mixin Naming

**Pattern:** `As*` for class mixins, `as*` for function mixins

**Class Mixins (PascalCase with `As` prefix):**

```typescript
// ✅ Correct: Class mixins
const EventEmitterMixin = AsEventEmitter(Base);

class MyService extends AsEventEmitter(BaseService) {
    constructor() {
        super();
        this.emit('initialized');  // From mixin
    }
}

// Pattern: AsEventEmitter(Component) produces new class
```

**Function Mixins (camelCase with `as` prefix):**

```typescript
// ✅ Correct: Function mixins
const component = {};
asEventEmitter(component);  // Adds event emitter methods to instance

component.on('event', handler);
component.emit('event', data);

// Pattern: asEventEmitter(target) adds methods to existing object
```

**Rationale:** Capitalized `As*` indicates class-level composition (returns new class), lowercase `as*` indicates instance-level augmentation (modifies existing object).

### Configurable Suffix

**Pattern:** `*Configurable` for interfaces/classes with setters

Interfaces or classes that provide setters for normally readonly properties.

```typescript
// ✅ Correct: Configurable suffix
interface MediaTypeConfigurable extends MediaType {
    setType(type: string): void;
    setSubtype(subtype: string): void;
    setParameters(params: MediaTypeParameters): void;
}

interface ViewResolverConfigurable extends ViewResolver {
    setPrefix(prefix: string): void;
    setSuffix(suffix: string): void;
}
```

**Rationale:** Clear signal that this variant allows mutation of normally immutable properties.

### Legacy Code Markers

**Pattern:** `*.legacy.js` or `Old*` prefix

Files or classes marked as deprecated/legacy code.

```typescript
// ⚠️ Legacy marker in filename
old-component.legacy.js

// ⚠️ Legacy marker in class name
class OldComponent {
    // Deprecated implementation
}
```

**Rationale:** Clearly identifies code scheduled for removal or refactoring. New code should not follow this pattern.

---

## 6. Complete Example

Here's a complete example demonstrating all conventions:

```typescript
/**
 * Media type parser and comparator.
 * 
 * @module
 */

// Imports: Always use single quotes
import * as R from '@blue/util';
import { AbstractValueComparator } from './_util';  // Internal import OK in same package

// True constants: UPPER_SNAKE_CASE
const DEFAULT_QUALITY = 1.0;
const WILDCARD = '*';
const QUALITY_PARAM = 'q';

// Functional constants: camelCase
const sortBySpecificity = R.sortBy(R.prop('specificity'));
const compareQuality = R.descend(R.prop('quality'));

// Type definitions
type MediaTypeParams = {
    [key: string]: string | number;
};

type qualityValue = number;  // Simple alias: camelCase

// Interfaces: PascalCase
interface Comparable<T> {
    compareTo(other: T): number;
}

// Classes: PascalCase
class MediaType implements Comparable<MediaType> {
    // Private fields: # prefix (modern)
    #type: string;
    #subtype: string;
    #parameters: MediaTypeParams;
    
    // Constructor
    constructor(type: string, subtype: string, parameters: MediaTypeParams = {}) {
        this.#type = type;
        this.#subtype = subtype;
        this.#parameters = parameters;
    }
    
    // Getters: camelCase
    get type(): string {
        return this.#type;
    }
    
    get subtype(): string {
        return this.#subtype;
    }
    
    // Methods: camelCase
    compareTo(other: MediaType): number {
        return this.specificity - other.specificity;
    }
    
    getParameter(name: string): string | number | undefined {
        return this.#parameters[name];
    }
    
    // Predicate method: is* prefix
    isWildcard(): boolean {
        return this.#type === WILDCARD || this.#subtype === WILDCARD;
    }
    
    // Static factory: camelCase
    static for(type: string, subtype: string): MediaType {
        return new MediaType(type, subtype);
    }
}

// Functions: camelCase
function parseMediaType(value: string): MediaType {
    const [type, subtype] = value.split('/');
    return MediaType.for(type, subtype);
}

// Predicate function: is* prefix
function isValidMediaType(value: string): boolean {
    return /^[\w-]+\/[\w-]+$/.test(value);
}

// Duck typing function: like* prefix
function likeComparable<T>(value: unknown): value is Comparable<T> {
    return (
        value != null &&
        typeof value === 'object' &&
        'compareTo' in value &&
        typeof (value as any).compareTo === 'function'
    );
}

// Export: Only public API
export { MediaType, parseMediaType, isValidMediaType, likeComparable };
export type { MediaTypeParams, Comparable };

// Never export internal utilities:
// ❌ export { helper } from './_util';
```

---

## 7. Maintenance

### When Prettier Config Changes

**IMPORTANT:** When `prettier.config.mjs` is modified, update Section 1 of this guide to reflect the new formatting rules.

**Process:**
1. Make changes to `prettier.config.mjs`
2. Update corresponding section in `STYLE_GUIDE.md`
3. Run `pnpm format` to apply new formatting
4. Document the change in commit message:
   ```
   style: update prettier config and style guide
   
   Changed [setting] from [old] to [new].
   
   Updated STYLE_GUIDE.md Section 1 to document the new formatting rule.
   ```

### When Establishing New Patterns

If a new naming pattern or convention is established:

1. Document it in the appropriate section of this guide
2. Provide rationale and examples
3. Update `AGENTS.md` if agents need to follow the pattern
4. Update `README.md` if it affects user-facing conventions
5. Note the change in commit message

### Style Decisions

When making style decisions, document the rationale in git commit messages and consider adding to this guide if it establishes a precedent.

---

**Last Updated:** February 1, 2025

*This guide is a living document. When code style evolves, update this guide to reflect current practices.*
