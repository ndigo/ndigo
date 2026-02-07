# BlueJS Style Guide

This document defines the concrete implementation rules, naming conventions, and formatting standards for the BlueJS codebase. For architectural principles and design patterns, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Purpose and Scope

**This guide answers:** "How do I name this file/variable/class?" and "How should this code be formatted?"

**See ARCHITECTURE.md for:** "Why is the system designed this way?" and "What are the architectural patterns?"

## 1. Formatting Rules

These rules are enforced by Prettier (`prettier.config.mjs`). When Prettier configuration changes, this section must be updated.

### Indentation [AUTOMATED: Prettier]

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

### Line Endings [AUTOMATED: Prettier]

- **Always use LF** (`\n`) on all platforms
- **Never use CRLF** (`\r\n`)
- Configured: `endOfLine: 'lf'`

### Semicolons [AUTOMATED: Prettier]

- **Always required** at the end of statements
- Configured: `semi: true`

```typescript
// ✅ Correct
const value = 42;
export default MyClass;

// ❌ Wrong
const value = 42;
export default MyClass;
```

### Quotes [AUTOMATED: Prettier]

- **Single quotes** for strings in TypeScript/JavaScript
- **Double quotes** for JSX attributes
- Configured: `singleQuote: true`, `jsxSingleQuote: false`

```typescript
// ✅ Correct
const message = 'Hello, world!';
import { foo } from '@blue/util';

// ❌ Wrong
const message = 'Hello, world!';
import { foo } from '@blue/util';
```

### Trailing Commas [AUTOMATED: Prettier]

- **ES5 style** - Use trailing commas where valid in ES5
- Helps with cleaner git diffs
- Configured: `trailingComma: 'es5'`

```typescript
// ✅ Correct
const obj = {
    name: 'example',
    value: 42, // ← trailing comma
};

const arr = [
    'first',
    'second',
    'third', // ← trailing comma
];

// ❌ Wrong: No trailing comma in function parameters (not valid in ES5)
function example(
    arg1: string,
    arg2: number // ← Prettier will remove this
) {}
```

### Print Width [AUTOMATED: Prettier]

- **Maximum 120 characters** per line
- Prettier will automatically wrap at this width
- Configured: `printWidth: 120`

### Arrow Functions [AUTOMATED: Prettier]

- **Always use parentheses** around parameters
- Configured: `arrowParens: 'always'`

```typescript
// ✅ Correct
const fn = (x) => x * 2;
const fn2 = (x, y) => x + y;

// ❌ Wrong
const fn = (x) => x * 2;
```

### Bracket Spacing [AUTOMATED: Prettier]

- **Use spaces inside object literal braces**
- **Arrays do not get spaces** (standard JavaScript)
- Configured: `bracketSpacing: true`

```typescript
// ✅ Correct
const obj = { name: 'example', value: 42 }; // spaces around braces
const arr = [1, 2, 3]; // no spaces in arrays

// ❌ Wrong
const obj = { name: 'example', value: 42 }; // missing spaces
const arr = [1, 2, 3]; // extra spaces
```

### Markdown Files [AUTOMATED: Prettier]

- **Preserve prose wrapping** - Do not reflow markdown text
- Configured: `proseWrap: 'preserve'`

---

## 2. File Naming Conventions

### Source Files [CONVENTION: Code Review]

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

### Internal/Private Files [CONVENTION: Code Review]

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
import { helper } from '@blue/util/_util'; // NEVER DO THIS
```

### Test Files [CONVENTION: Code Review]

**Unit Tests:**

- **Pattern:** `kebab-case.spec.ts`
- **Location:** `test/` directory at package root
- Test specifications use the same naming as their source files, with `.spec.ts` suffix

**Examples:**

```
✅ test/media-type.spec.ts
✅ test/brace-expression.spec.ts
✅ test/to-camel.spec.ts
✅ test/is-valid-date.spec.ts
```

**Benchmark/Performance Tests:**

- **Pattern:** `*.js` (JavaScript)
- **Location:** `benchmark/` directory at package root
- **Note:** Currently JavaScript; may migrate to `*.bench.ts` in future

**Examples:**

```
✅ benchmark/emitting.js
✅ benchmark/logging.js
```

### Test Helper Files [CONVENTION: Code Review]

**Pattern:** `_kebab-case.ts` (preferred) or `testCamelCase.ts` (legacy)

Test utilities and fixtures use underscore prefix (preferred) or camelCase (legacy, acceptable).

**Location:** `test/` directory

**Purpose:** Shared fixtures, custom assertions, test utilities

**Important:** Test helper files must contain actual helper functions (same rule as src `_*.ts` files). Never import test helpers across packages.

**Examples:**

```
✅ test/_expect.ts       // Custom test assertions (preferred)
✅ test/_worker.ts       // Test worker utilities (preferred)
✅ test/_fixtures.ts     // Shared test data
✅ test/test-cases.ts    // Test data fixtures
⚠️  test/testDecorators.ts  // Legacy pattern (acceptable, not recommended for new files)
⚠️  test/testContext.ts     // Legacy pattern (acceptable, not recommended for new files)
```

**Example:**

```typescript
// ✅ test/_expect.ts
export const expectSuccess = <T>(parser: Parser<T>, input: string) => {
    const result = parser.run(input);
    expect(result.isOk).toBe(true);
};
```

### Type Declaration Files [CONVENTION: Code Review]

**Pattern:** `kebab-case.d.ts`

TypeScript declaration files use kebab-case with `.d.ts` extension.

**Examples:**

```
✅ ramda.d.ts
✅ ramda-extensions.d.ts
```

### Configuration Files [CONVENTION: Code Review]

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

### Documentation Files [CONVENTION: Code Review]

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

### Constants [CONVENTION: Code Review]

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

**Regular Expression Patterns** (primitive regex constants):

```typescript
// ✅ Correct: Regex patterns use UPPER_SNAKE_CASE
const QUERY_KEY_PATTERN = /^[A-Za-z+:/?[\]0-9%]+/;
const MATRIX_VALUE_PATTERN = /^[^;]*/;
const ALPHA_REGEX = /^[a-zA-Z]+$/;
const PERCENT_ENCODED_PATTERN = /(%[0-9A-Za-z]{2})+/g;

// Used in parser combinators
const queryKey = regex(QUERY_KEY_PATTERN).map(replacePlusWithSpace).map(decode);

// ❌ Wrong: Inline patterns instead of named constants
const queryKey = regex(/^[A-Za-z+:/?[\]0-9%]+/) // Bad: inline pattern
    .map(replacePlusWithSpace)
    .map(decode);
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

**Rationale:** Distinguishes primitive values (including regex patterns) from higher-order functions. While both are immutable, primitive constants represent data, while functional constants represent behavior. Regular expression patterns use `UPPER_SNAKE_CASE` to match the convention in `@blue/validate` (e.g., `ALPHA_REGEX`, `NUMERIC_REGEX`) and make them easily identifiable.

### Variables and Functions [CONVENTION: Code Review]

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

### Predicate Functions [CONVENTION: Code Review]

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

### Duck Typing Functions [CONVENTION: Code Review]

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
    return (
        value != null && typeof value === 'object' && 'handle' in value && typeof (value as any).handle === 'function'
    );
}

function likeComparable<T>(value: unknown): value is Comparable<T> {
    return value != null && typeof value === 'object' && 'compareTo' in value;
}
```

**Rationale:** Clear distinction between runtime type checks (`is`) and structural compatibility checks (`like`).

### Classes and Interfaces [CONVENTION: Code Review]

**Pattern:** `PascalCase`

All class names, interface names, and type names use PascalCase.

**Classes:**

```typescript
// ✅ Correct
class MediaType extends Null implements Serializable {}
class DataBinder {}
class SpecificityComparator<T> implements Comparator<T> {}
class PredicateComparator<T> implements Comparator<T> {}
class EventModel {}
```

**Abstract Classes:**

```typescript
// ✅ Correct
abstract class AbstractValueComparator implements Comparator<string> {}
abstract class BaseController {}
```

**Interfaces:**

```typescript
// ✅ Correct
interface Comparable<T> {}
interface StringComparable<T> extends Comparable<T> {}
interface Comparator<T> {}
interface Serializable {}
interface ControllerLike {}
```

### Private Fields [CONVENTION: Code Review]

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
        return this.#name; // Accessor for private field
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

### Type Definitions [CONVENTION: Code Review]

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

### 3.8. Decorators [CONVENTION: Code Review]

**Pattern:** `camelCase`

Decorator functions follow standard function naming conventions (camelCase).

**Examples:**

```typescript
// ✅ Correct: Decorators use camelCase
@configuration
class AppConfig {
    @entry
    databaseConnection() { }
}

@routeMapping('/api/users')
class UserController { }

@pattern({ regex: /^[A-Z][a-z]+$/ })
firstName: string;

@scope('singleton')
class UserService { }

@viewMapping('user-profile')
class UserProfileView { }
```

**Rationale:** Decorators are functions that modify classes, methods, fields, or parameters. Following standard function naming conventions (camelCase) maintains consistency with JavaScript/TypeScript ecosystem patterns and TC39 decorator standards.

### 3.9. Acronym Casing [CONVENTION: Code Review]

**Pattern:** Consistent casing for acronyms across all contexts

Acronyms must use **consistent casing**: all-uppercase in type names (classes/interfaces), and all-lowercase OR all-uppercase in identifiers (variables/parameters/functions). Never use mixed-case acronyms like `Http`, `Json`, or `Xml`.

**Type Names (Classes/Interfaces/Types):**

```typescript
// ✅ Correct: All-uppercase acronyms in types
class HTTPTransformer {}
interface JSONParser {}
type XMLDocument = string;
class URLBuilder {}
interface APIClient {}
class HTMLRenderer {}
interface DTOMapper {}

// Real examples from @blue/http
export class HTTP {}
export interface HTTPConfig {}
export interface HTTPInterceptor {}
export class HTTPAppender {}
export interface JSONObject {}
export interface JSONArray {}
export class XMLLayout {}
export class URLResource<T> {}

// ❌ Wrong: Mixed-case acronyms
class HttpTransformer {} // Should be HTTPTransformer
interface JsonParser {} // Should be JSONParser
type XmlDocument = string; // Should be XMLDocument
class UrlBuilder {} // Should be URLBuilder
```

**Variable Names (camelCase):**

```typescript
// ✅ Correct: All-lowercase acronyms at start, all-uppercase in middle/end
const httpTransformer: HTTPTransformer = new HTTPTransformer();
const jsonParser: JSONParser = new JSONParser();
const xmlDocument: XMLDocument = '<root></root>';
const urlBuilder: URLBuilder = new URLBuilder();

// ✅ Also correct: All-uppercase acronyms in variable names
const myHTTPConfig: HTTPConfig = { timeout: 5000 };
const userJSONData: JSONObject = { name: 'Alice' };
const rawHTMLContent: string = '<div>content</div>';

// Real examples from codebase
const httpAppender: HTTPAppender = new HTTPAppender();
const jsonLayout: JSONLayout = new JSONLayout();
const urlResource: URLResource = new URLResource('/path');

// ❌ Wrong: Mixed-case in variables
const hTTPTransformer = ...;   // Should be httpTransformer or myHTTPTransformer
const jSONParser = ...;        // Should be jsonParser or userJSONData
const xMLDocument = ...;       // Should be xmlDocument or rawXMLContent
```

**Function Names (camelCase):**

```typescript
// ✅ Correct: Same rules as variables
function parseHTTPRequest(request: Request): HTTPRequest {}
function formatJSONResponse(data: object): JSONObject {}
function buildURL(base: string, params: object): URL {}
function renderHTML(template: string): HTMLElement {}

// ❌ Wrong: Mixed-case in function names
function parseHttpRequest() {} // Should be parseHTTPRequest
function formatJsonResponse() {} // Should be formatJSONResponse
```

**Constants (UPPER_SNAKE_CASE):**

```typescript
// ✅ Correct: All-uppercase for both acronym and constant
const HTTP_TIMEOUT = 5000;
const JSON_MIME_TYPE = 'application/json';
const XML_ENCODING = 'utf-8';
const API_BASE_URL = 'https://api.example.com';
const HTML_DOCTYPE = '<!DOCTYPE html>';

// ❌ Wrong: Mixed-case in constants
const Http_Timeout = 5000; // Should be HTTP_TIMEOUT
const JSON_Mime_Type = '...'; // Should be JSON_MIME_TYPE
```

**Common Acronyms in BlueJS:**

Examples from the codebase (not an exhaustive list):

- **HTTP** - HyperText Transfer Protocol
- **JSON** - JavaScript Object Notation
- **XML** - eXtensible Markup Language
- **URL** / **URI** - Uniform Resource Locator/Identifier
- **API** - Application Programming Interface
- **HTML** - HyperText Markup Language
- **CSS** - Cascading Style Sheets
- **DTO** - Data Transfer Object
- **DAO** - Data Access Object
- **UUID** - Universally Unique Identifier
- **OTEL** - OpenTelemetry

**Rationale:** Consistent acronym casing improves readability and prevents confusion. Modern tooling (autocomplete, minification) eliminates concerns about verbosity. The all-uppercase pattern in type names clearly identifies acronyms, while the all-lowercase or all-uppercase pattern in identifiers maintains readability.

**Note:** This rule applies to ALL code contexts—classes, interfaces, types, variables, functions, parameters, and constants.

### 3.10. Transducers [CONVENTION: Code Review]

**Pattern:** `X*` for transformer classes, `x*` for factories (when applicable)

Transducers enable composable, efficient data transformations using a three-arity protocol (`init`, `step`, `result`). BlueJS follows the naming conventions established in Clojure and Ramda.js.

**Transformer Classes:**

Transformer classes implement the transducer protocol and use the `X*` prefix (capital X).

```typescript
// ✅ Correct: Transformer classes use X* prefix
class XCount<T = any> implements Transformer<number, T> {
    ['@@transducer/init']?(): number {
        return 0;
    }

    ['@@transducer/result']?(result: number): number {
        return result;
    }

    ['@@transducer/step'](result: number): MaybeReduced<number> {
        return result + 1;
    }
}

class XToArray<T = any> implements Transformer<T[], T> {
    ['@@transducer/step'](result: T[], input: T): MaybeReduced<T[]> {
        result.push(input);
        return result;
    }
}

// Custom transducer extending base
class XDoubleTransformer extends DelegatingTransformer {
    ['@@transducer/step'](result: any, input: any): any {
        return this.xf['@@transducer/step'](result, input * 2);
    }
}

// ❌ Wrong: Missing X prefix
class CountTransformer {} // Should be XCount
class ToArrayTransformer {} // Should be XToArray
class DoubleTransformer {} // Should be XDoubleTransformer
```

**Factory Functions: Two Valid Patterns**

BlueJS recognizes two valid factory patterns based on whether the factory requires parameters:

**Pattern 1: Three-Tier (Zero-Argument Factories)**

Use for transformers that require no configuration. The intermediate factory layer improves API clarity.

```typescript
// ✅ Correct: Three-tier pattern for zero-argument factories
class XCount<T = any> {
    /* ... */
}
export const xCount = <T = any>(): Transformer<number, T> => new XCount<T>();
export const count = () => xCount;

// Usage
const result = into([], count(), [1, 2, 3, 4]); // 4

class XToArray<T = any> {
    /* ... */
}
export const xToArray = <T = any>(): Transformer<T[], T> => new XToArray<T>();
export const toArray = () => xToArray;

// Usage
const result = into([], toArray(), 'abc'); // ['a', 'b', 'c']
```

**Pattern 2: Two-Tier (Parameterized Factories)**

Use for transformers that require configuration parameters. Skip the intermediate layer to avoid redundant wrapper functions.

```typescript
// ✅ Correct: Two-tier pattern for parameterized factories
class XToMap<T, K, V> {
    constructor(
        private readonly _getKey: (item: T) => K,
        private readonly _getValue: (item: T) => V
    ) {}
    /* ... */
}

export const toMap =
    <T, K, V>(getKey: (item: T) => K, getValue: (item: T) => V) =>
    (): Transformer<Map<K, V>, T> =>
        new XToMap<T, K, V>(getKey, getValue);

// Usage
const items = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];
const result = into(
    new Map(),
    toMap(
        (item) => item.id,
        (item) => item.name
    ),
    items
); // Map { 1 => 'Alice', 2 => 'Bob' }

// ❌ Wrong: Redundant intermediate layer for parameterized factory
const xToMap =
    <T, K, V>(getKey, getValue) =>
    (): Transformer =>
        new XToMap(getKey, getValue);
const toMap = <T, K, V>(getKey, getValue) => xToMap(getKey, getValue); // Unnecessary!
```

**Selection Criteria:**

| Factory Type        | Use Pattern | Rationale                                        |
| :------------------ | :---------- | :----------------------------------------------- |
| Zero-argument       | Three-tier  | Clearer API, follows Ramda/Clojure convention    |
| Requires parameters | Two-tier    | Avoids redundant wrapper, simpler implementation |

**Real Examples from `@blue/core`:**

- **Three-tier:** `XCount → xCount() → count()`, `XToArray → xToArray() → toArray()`
- **Two-tier:** `XToMap → toMap(getKey, getValue)`, `XToRecord → toRecord(getKey, getValue)`, `XToSet → toSet(initialSet?)`

**Variable Naming:**

Use `xf` (preferred) or `xform` for transducer variables.

```typescript
// ✅ Correct: Use xf for transducer variables
const xf = compose(map(double), filter(isEven));
const result = into([], xf, [1, 2, 3, 4]);

class DelegatingTransformer<TResult, TComplete, TInput> {
    readonly xf: CompletingTransformer<TResult, TComplete, TInput>;

    constructor(xf: CompletingTransformer<TResult, TComplete, TInput>) {
        this.xf = xf;
    }

    ['@@transducer/step'](result: TResult, input: TInput): MaybeReduced<TResult> {
        return this.xf['@@transducer/step'](result, input);
    }
}

// ✅ Acceptable: Use xform for clarity in complex contexts
const xform = pipe(
    filter(isValid),
    map(normalize),
    dedupe()
);

// ❌ Wrong: Non-standard variable names
const transformer = compose(...);  // Use xf
const transducer = map(double);    // Use xf
const t = filter(isEven);          // Too cryptic, use xf
```

**Protocol Method Names:**

Use `@@transducer/*` symbol-based protocol methods to ensure interoperability with the JavaScript transducer ecosystem.

```typescript
// ✅ Correct: Use protocol method names
class XCustomTransformer implements Transformer<TResult, TInput> {
    ['@@transducer/init']?(): TResult {
        // Initialize accumulator
    }

    ['@@transducer/result']?(result: TResult): TResult {
        // Finalize result (optional completion step)
    }

    ['@@transducer/step'](result: TResult, input: TInput): MaybeReduced<TResult> {
        // Transform and accumulate
    }
}

// ✅ Correct: Use protocol symbols for reduced values
const reduced = {
    ['@@transducer/reduced']: true,
    ['@@transducer/value']: finalValue,
};

// ❌ Wrong: Non-standard method names
class BadTransformer {
    init() {} // Should be ['@@transducer/init']
    step(result, input) {} // Should be ['@@transducer/step']
    result(value) {} // Should be ['@@transducer/result']
}
```

**Protocol Methods:**

| Method                 | Purpose                                   | Required |
| :--------------------- | :---------------------------------------- | :------- |
| `@@transducer/init`    | Initialize the accumulator                | Optional |
| `@@transducer/step`    | Process each input and update accumulator | Required |
| `@@transducer/result`  | Finalize/complete the result              | Optional |
| `@@transducer/reduced` | Mark value as reduced (early termination) | Protocol |
| `@@transducer/value`   | Extract value from reduced result         | Protocol |

**Descriptive Term Composition:**

When composing transducer class names with descriptive terms:

**Add Domain Context When:**

- The transducer is specific to a domain package (`@blue/http`, `@blue/router`)
- The transformation involves domain-specific concepts (query strings, routes, headers)

**Omit Domain Context When:**

- The transducer is generic and reusable across packages (`@blue/core`)
- The transformation is a common operation (count, toArray, filter)

**Naming Pattern:** `X[Domain][Action][Target]`

```typescript
// ✅ Generic utilities (no domain context)
class XCount {} // Simple count operation
class XToArray {} // Generic array conversion
class XFilter {} // Generic filtering

// ✅ Domain-specific (add context)
class XToQueryString {} // HTTP query string conversion (in @blue/http)
class XParseJSON {} // JSON parsing (HTTP context)
class XToRoutePath {} // Router path conversion (in @blue/router)
class XMatchRoute {} // Router matching operation

// ✅ Protocol-specific (protocol prefix)
class XHTTPToJSON {} // HTTP-to-JSON conversion
class XWSMessage {} // WebSocket message handling

// ❌ Wrong: Over-specified
class XHTTPQueryStringToJSON {} // Too verbose, context clear from package

// ❌ Wrong: Under-specified in domain package
class XToString {} // Too generic in @blue/http (should be XToQueryString)
```

**Rationale:** Import paths provide package context (`@blue/http/XToQueryString`), so names only need enough specificity to be clear within their package.

**Helper Functions:**

Transducer helper functions use descriptive names without prefixes.

```typescript
// ✅ Correct: Descriptive helper function names
function reduce<T>(value: T): Reduced<T> {
    return likeReduced(value)
        ? value
        : {
              ['@@transducer/reduced']: true,
              ['@@transducer/value']: value,
          };
}

const likeReduced = like({ '@@transducer/reduced': true }) as (value) => value is Reduced<any>;
const likeTransformer = like({ '@@transducer/step': Function }) as (value) => value is Transformer;

// ❌ Wrong: Unnecessary prefixes
function xReduce(value) {} // Just reduce()
function transducerLikeReduced(value) {} // Just likeReduced()
```

**Complete Example:**

```typescript
// From packages/blue-core/src/transducer.ts

// Base class for delegation pattern
export class DelegatingTransformer<TResult, TComplete, TInput>
    implements CompletingTransformer<TResult, TComplete, TInput>
{
    readonly xf: CompletingTransformer<TResult, TComplete, TInput>;

    constructor(xf: CompletingTransformer<TResult, TComplete, TInput>) {
        this.xf = xf;
    }

    ['@@transducer/step'](result: TResult, input: TInput): MaybeReduced<TResult> {
        return this.xf['@@transducer/step'](result, input);
    }
}

// ✅ Three-tier pattern (zero-argument)
export class XCount<T = any> implements Transformer<number, T> {
    ['@@transducer/init']?(): number {
        return 0;
    }
    ['@@transducer/result']?(result: number): number {
        return result;
    }
    ['@@transducer/step'](result: number): MaybeReduced<number> {
        return result + 1;
    }
}

export const xCount = <T = any>(): Transformer<number, T> => new XCount<T>();
export const count = () => xCount;

// ✅ Two-tier pattern (parameterized)
export class XToMap<T, K, V> implements Transformer<Map<K, V>, T> {
    constructor(
        private readonly _getKey: (item: T) => K,
        private readonly _getValue: (item: T) => V
    ) {}

    ['@@transducer/init']?(): Map<K, V> {
        return new Map<K, V>();
    }
    ['@@transducer/result']?(result: Map<K, V>): Map<K, V> {
        return result;
    }
    ['@@transducer/step'](result: Map<K, V>, input: T): MaybeReduced<Map<K, V>> {
        result.set(this._getKey(input), this._getValue(input));
        return result;
    }
}

export const toMap =
    <T, K, V>(getKey: (item: T) => K, getValue: (item: T) => V) =>
    (): Transformer<Map<K, V>, T> =>
        new XToMap<T, K, V>(getKey, getValue);

// Usage in application code
import { into } from '@blue/util/list';
import { compose } from '@blue/util/function';
import { count, toArray, toMap } from '@blue/core';

// Zero-argument transducers
const total = into([], count(), [1, 2, 3, 4]); // 4
const items = into([], toArray(), 'abc'); // ['a', 'b', 'c']

// Parameterized transducers
const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];
const userMap = into(
    new Map(),
    toMap(
        (u) => u.id,
        (u) => u.name
    ),
    users
); // Map { 1 => 'Alice', 2 => 'Bob' }

// Composition
class XDouble extends DelegatingTransformer {
    ['@@transducer/step'](result: any, input: any): any {
        return this.xf['@@transducer/step'](result, input * 2);
    }
}

class XEven extends DelegatingTransformer {
    ['@@transducer/step'](result: any, input: any): any {
        return input % 2 === 0 ? this.xf['@@transducer/step'](result, input) : result;
    }
}

const xDouble = (xf: any) => new XDouble(xf);
const xEven = (xf: any) => new XEven(xf);

const result = into([], compose(xEven, xDouble), [1, 2, 3, 4]); // [4, 8]
```

**See also:** [ARCHITECTURE.md Section 6](./ARCHITECTURE.md#transducers) for detailed design philosophy, composition patterns, and interoperability guidance.

### 3.11. Interfaces and Abstract Classes [CONVENTION: Code Review]

**Pattern:** Description-first for classes, Abstract prefix for abstract classes

**Interface Naming:**

Interfaces use the `[Domain][Role]` pattern to indicate their responsibility within a specific domain.

```typescript
// ✅ Correct: Interface naming with domain context
interface HTTPTransformer {
    transform(request: HTTPRequest): HTTPResponse;
}

interface DataTransformer {
    transform(data: RawData): CleanData;
}

interface ViewResolver {
    resolve(name: string): View;
}

interface RouteHandlerAdapter {
    handle(route: Route): void;
}

// Real examples from codebase
export interface MediaTypeFileExtensionResolver {
    resolveFileExtensions(mediaType: MediaType): string[];
}

export interface RouteHandlerMapping {
    getHandler(route: Route): Handler | null;
}

// ❌ Wrong: Too generic (causes import conflicts)
interface Transformer {} // Use HTTPTransformer, DataTransformer, etc.
interface Resolver {} // Use ViewResolver, PropertyResolver, etc.
interface Handler {} // Use RouteHandler, ErrorHandler, etc.
```

**Concrete Class Naming:**

Concrete classes implementing interfaces use the **description-first pattern**: `[Description][Role]`

The description comes BEFORE the role/interface name to prevent import conflicts and provide clear semantic meaning.

```typescript
// ✅ Correct: Description BEFORE role
class UserDataTransformer implements DataTransformer {
    transform(data: UserRawData): User {
        return new User(data.name, data.email);
    }
}

class OrderDataTransformer implements DataTransformer {
    transform(data: OrderRawData): Order {
        return new Order(data.id, data.items);
    }
}

class PaymentHTTPTransformer implements HTTPTransformer {
    transform(request: HTTPRequest): HTTPResponse {
        // Payment-specific transformation
    }
}

// Real examples from codebase
export class MappingMediaTypeFileExtensionResolver implements MediaTypeFileExtensionResolver {
    // Maps media types to file extensions
}

export class ContentNegotiationViewResolver implements ViewResolver {
    // Resolves views based on content negotiation
}

export class ControllerHandlerAdapter implements RouteHandlerAdapter {
    // Adapts controller methods to route handlers
}

// ❌ Wrong: Role before description
class DataTransformerUser {} // Should be UserDataTransformer
class TransformerUserData {} // Should be UserDataTransformer
class HandlerPaymentHTTP {} // Should be PaymentHTTPHandler
```

**Abstract Class Naming:**

Abstract classes use the `Abstract` prefix followed by the description-first pattern: `Abstract[Description][Role]`

```typescript
// ✅ Correct: Abstract prefix with description-first
abstract class AbstractUserDataTransformer implements DataTransformer {
    // Common transformation logic for user data
    abstract transform(data: UserRawData): User;

    protected validateData(data: UserRawData): boolean {
        return data != null && data.name && data.email;
    }
}

abstract class AbstractHandlerMapping implements RouteHandlerMapping {
    // Base implementation for handler mappings
    abstract getHandler(route: Route): Handler | null;

    protected logMapping(route: Route): void {
        console.log(`Mapping route: ${route.path}`);
    }
}

// Real examples from codebase
export abstract class AbstractCachingViewResolver implements ViewResolver {
    // Base class with caching logic for view resolvers
}

export abstract class AbstractPathBasedViewResolver extends AbstractCachingViewResolver {
    // Path-based view resolution with caching
}

export abstract class AbstractHandlerMethodAdapter implements RouteHandlerAdapter {
    // Base adapter for handler methods
}

// ❌ Wrong: No Abstract prefix (looks like concrete class)
abstract class UserDataTransformer {} // Should be AbstractUserDataTransformer
abstract class HandlerMapping {} // Should be AbstractHandlerMapping

// ❌ Wrong: Using "Base" instead of "Abstract"
abstract class BaseUserDataTransformer {} // Use Abstract, not Base
```

**Inheritance Chains:**

When building inheritance hierarchies, maintain the description-first and Abstract prefix patterns:

```typescript
// ✅ Correct: Clear inheritance chain
abstract class AbstractHandlerMapping implements RouteHandlerMapping {
    abstract getHandler(route: Route): Handler | null;
}

abstract class AbstractPathHandlerMapping extends AbstractHandlerMapping {
    // Adds path matching logic
    protected matchPath(pattern: string, path: string): boolean {
        // Implementation
    }
}

abstract class AbstractDetectingPathHandlerMapping extends AbstractPathHandlerMapping {
    // Adds auto-detection logic
    protected detectHandlers(): Handler[] {
        // Implementation
    }
}

class NamePathHandlerMapping extends AbstractDetectingPathHandlerMapping {
    // Concrete implementation using name-based path mapping
    getHandler(route: Route): Handler | null {
        // Implementation
    }
}

// Real example from @blue/view
export abstract class AbstractCachingViewResolver implements ViewResolver {
    // Base with caching
}

export abstract class AbstractPathBasedViewResolver extends AbstractCachingViewResolver {
    // Adds path-based resolution
}

export class ImportViewResolver extends AbstractPathBasedViewResolver {
    // Concrete implementation using ES6 imports
}
```

**Multiple Interface Implementation:**

The description-first pattern prevents conflicts when implementing multiple interfaces:

```typescript
// ✅ Correct: No import conflicts with description-first pattern
import { HTTPTransformer } from '@blue/http';
import { DataTransformer } from '@blue/data';

class PaymentProcessor implements HTTPTransformer, DataTransformer {
    // Implements both interfaces
    transform(request: HTTPRequest): HTTPResponse {
        // HTTP transformation
    }

    transform(data: RawData): CleanData {
        // Data transformation (overload)
    }
}

// ✅ Correct: Multiple interfaces from different packages
import { ViewResolver } from '@blue/view';
import { ResourceLoader } from '@blue/context';

class TemplateViewResolver implements ViewResolver, ResourceLoader {
    resolve(name: string): View {}
    loadResource(path: string): Resource {}
}
```

**Pattern Summary:**

| Pattern                       | Example                                     | Used For         |
| :---------------------------- | :------------------------------------------ | :--------------- |
| `[Domain][Role]`              | `HTTPTransformer`, `ViewResolver`           | Interfaces       |
| `[Description][Role]`         | `UserDataTransformer`, `PaymentHTTPHandler` | Concrete classes |
| `Abstract[Description][Role]` | `AbstractUserDataTransformer`               | Abstract classes |

**Rationale:**

1. **Description-first prevents import conflicts** - Multiple packages can define `DataTransformer` interface without collision when implementing classes use descriptive prefixes
2. **Abstract prefix signals inheritance** - Immediately identifies base classes vs concrete implementations
3. **Consistent with Spring Framework** - Follows established enterprise patterns (e.g., `AbstractHandlerMapping`, `AbstractPathMatchingResourcePatternResolver`)
4. **Autocomplete-friendly** - Modern IDEs make long names effortless; clarity trumps brevity

### 3.12. Role-Based Suffixes [CONVENTION: Code Review]

**Pattern:** Use semantic suffixes to convey component responsibility

BlueJS uses role-based suffixes inspired by Spring Framework to indicate the responsibility and behavior of classes/interfaces. These suffixes provide instant semantic understanding and create a shared vocabulary across the codebase.

**Core Suffixes and Their Meanings:**

**Processing & Handling:**

| Suffix         | Meaning                                                              | Examples                                          |
| :------------- | :------------------------------------------------------------------- | :------------------------------------------------ |
| `*Handler`     | Processes requests, events, or commands; orchestrates handling logic | `RouteHandler`, `ErrorHandler`, `EventHandler`    |
| `*Processor`   | Executes specific operations or transformations; processes inputs    | `EntryProcessor`, `DestructionAwareProcessor`     |
| `*Interceptor` | Intercepts calls to add cross-cutting concerns (logging, auth, etc.) | `HTTPInterceptor`, `ResponseClassHTTPInterceptor` |

**Adaptation & Translation:**

| Suffix         | Meaning                                                       | Examples                                        |
| :------------- | :------------------------------------------------------------ | :---------------------------------------------- |
| `*Adapter`     | Adapts one interface to another; translates between protocols | `RouteHandlerAdapter`, `MetadataHandlerAdapter` |
| `*Transformer` | Transforms data structure (NOT transducers; see Section 3.10) | `DataTransformer`, `PayloadTransformer`         |
| `*Converter`   | Converts between types or formats; typically bidirectional    | `MessageConverter`, `TypeConverter`             |

**Resolution & Discovery:**

| Suffix      | Meaning                                                      | Examples                                               |
| :---------- | :----------------------------------------------------------- | :----------------------------------------------------- |
| `*Resolver` | Resolves, determines, or locates values based on criteria    | `ViewResolver`, `PropertyResolver`, `ArgumentResolver` |
| `*Strategy` | Encapsulates algorithm or behavior choice (Strategy pattern) | `ContentNegotiationStrategy`, `HTTPStrategy`           |

**Creation & Lifecycle:**

| Suffix     | Meaning                                                   | Examples                                          |
| :--------- | :-------------------------------------------------------- | :------------------------------------------------ |
| `*Factory` | Creates instances or manages object creation lifecycle    | `Factory`, `HierarchicalFactory`, `ScopedFactory` |
| `*Builder` | Constructs complex objects step-by-step (Builder pattern) | `QueryBuilder`, `URLBuilder`                      |

**Storage & Coordination:**

| Suffix        | Meaning                                                      | Examples                                       |
| :------------ | :----------------------------------------------------------- | :--------------------------------------------- |
| `*Registry`   | Stores and retrieves registered objects; acts as catalog     | `Registry`, `MappingRegistry`                  |
| `*Manager`    | Manages lifecycle or coordinates multiple components         | `ContentNegotiationManager`, `MetadataManager` |
| `*Repository` | Abstracts data access/persistence layer (Repository pattern) | `UserRepository`, `OrderRepository`            |

**Application Layer (MVC):**

| Suffix        | Meaning                                             | Examples                            |
| :------------ | :-------------------------------------------------- | :---------------------------------- |
| `*Controller` | Handles web requests and routes (MVC pattern)       | `UserController`, `ErrorController` |
| `*Service`    | Contains business logic and orchestrates operations | `UserService`, `PaymentService`     |

**Usage Examples:**

```typescript
// ✅ Correct: Suffixes convey clear responsibility

// Handler processes requests/events
interface ErrorHandler {
    handle(error: Error): void;
}

class RouteErrorHandler implements ErrorHandler {
    handle(error: Error): void {
        // Error handling logic
    }
}

// Adapter adapts one interface to another
interface RouteHandlerAdapter {
    handle(route: Route): void;
}

class ControllerHandlerAdapter implements RouteHandlerAdapter {
    handle(route: Route): void {
        // Adapt controller method to handler
    }
}

// Resolver determines/locates values
interface ViewResolver {
    resolve(name: string): View;
}

class ContentNegotiationViewResolver implements ViewResolver {
    resolve(name: string): View {
        // Resolve view based on content negotiation
    }
}

// Strategy encapsulates algorithm choice
interface ContentNegotiationStrategy {
    negotiate(request: Request): MediaType;
}

class PathExtensionContentNegotiationStrategy implements ContentNegotiationStrategy {
    negotiate(request: Request): MediaType {
        // Negotiate based on path extension
    }
}

// Factory creates instances
interface Factory {
    getInstance(name: string): any;
}

class DefaultFactory implements Factory {
    getInstance(name: string): any {
        // Factory creation logic
    }
}

// Registry stores/retrieves registered objects
interface Registry {
    register(name: string, value: any): void;
    get(name: string): any;
}

class MappingRegistry implements Registry {
    register(name: string, value: any): void {}
    get(name: string): any {}
}

// Controller handles web requests
class UserController {
    @routeMapping({ method: 'GET', path: '/users' })
    listUsers(): User[] {
        // Return list of users
    }
}

// Service contains business logic
class UserService {
    createUser(data: UserData): User {
        // Business logic for user creation
    }

    validateUser(user: User): boolean {
        // Validation logic
    }
}

// ❌ Wrong: Suffix doesn't match actual responsibility
class UserHandler {
    // Acts like a Service (contains business logic)
    validateUser(user: User): boolean {} // Should be UserService
}

class DataResolver {
    // Acts like a Transformer (transforms data)
    transform(data: RawData): CleanData {} // Should be DataTransformer
}

class PaymentProcessor {
    // Acts like a Service (business logic)
    processPayment(payment: Payment): boolean {} // Should be PaymentService
}
```

**Real Examples from BlueJS:**

```typescript
// From @blue/dispatcher
export interface RouteHandlerAdapter {}
export abstract class AbstractHandlerMethodAdapter implements RouteHandlerAdapter {}
export class ControllerHandlerAdapter implements RouteHandlerAdapter {}
export class MetadataHandlerAdapter extends AbstractHandlerMethodAdapter {}

export interface HandlerMethodArgumentResolver {}
export abstract class AbstractNamedValueMethodArgumentResolver {}
export class MatrixValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {}
export class QueryValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {}

// From @blue/view
export interface ViewResolver {}
export abstract class AbstractCachingViewResolver implements ViewResolver {}
export abstract class AbstractPathBasedViewResolver extends AbstractCachingViewResolver {}
export class ImportViewResolver extends AbstractPathBasedViewResolver {}
export class ContentNegotiationViewResolver implements ViewResolver {}

export interface ContentNegotiationStrategy {}
export class PathExtensionContentNegotiationStrategy implements ContentNegotiationStrategy {}
export class FixedContentNegotiationStrategy implements ContentNegotiationStrategy {}

// From @blue/factory
export interface Factory {}
export interface HierarchicalFactory extends Factory {}
export interface ConfigurableFactory extends HierarchicalFactory {}
export abstract class AbstractFactory implements ConfigurableFactory {}
export class DefaultFactory extends AbstractFactory {}

export interface Registry {}
export class MappingRegistry implements Registry {}

// From @blue/http
export interface HTTPInterceptor {}
export class MappedHTTPInterceptor implements HTTPInterceptor {}
export class MappedResponseClassHTTPInterceptor implements ResponseAwareHTTPInterceptor {}

export class HTTPAppender {}
export class HTTPLogRecordExporter {}

// From @blue/context
export interface PropertyResolver {}
export interface ConfigurablePropertyResolver extends PropertyResolver {}
export class PrototypalPropertyResolver implements ConfigurablePropertyResolver {}

export class ContentNegotiationManager {}
export class MetadataManager {}
```

**Combining with Description-First Pattern:**

Role-based suffixes work seamlessly with the description-first pattern from Section 3.11:

```typescript
// ✅ Correct: [Description][Role] with semantic suffix
class UserDataTransformer implements DataTransformer {}
class PaymentHTTPInterceptor implements HTTPInterceptor {}
class OrderViewResolver implements ViewResolver {}
class AuthenticationStrategy implements Strategy {}

// ✅ Correct: Abstract classes
abstract class AbstractUserFactory implements Factory {}
abstract class AbstractHandlerMethodAdapter implements HandlerAdapter {}
abstract class AbstractContentNegotiationStrategy implements ContentNegotiationStrategy {}
```

**Anti-Patterns to Avoid:**

```typescript
// ❌ Avoid: Generic helper/util suffixes (use specific role suffixes)
class DataHelper {} // Use DataTransformer, DataProcessor, or DataService
class UserUtil {} // Use UserService, UserFactory, or UserValidator
class StringHelper {} // Use StringFormatter, StringConverter, or StringParser

// ❌ Avoid: Suffix doesn't match behavior
class DataHandler {
    // Actually transforms data
    transform(data: Data): TransformedData {} // Should be DataTransformer
}

class UserResolver {
    // Actually creates users
    create(data: UserData): User {} // Should be UserFactory or UserService
}
```

**Rationale:**

- **Shared Vocabulary** - Consistent suffixes create common understanding across the team
- **Instant Recognition** - Developers immediately understand a component's role from its name
- **Spring Framework Alignment** - Leverages established enterprise patterns familiar to Java/Spring developers
- **Semantic Clarity** - `*Handler` processes, `*Resolver` locates, `*Factory` creates—no ambiguity
- **Autocomplete-Friendly** - Modern tooling makes specific, descriptive names effortless

**When in Doubt:**

1. Ask: "What is this component's PRIMARY responsibility?"
2. Choose the suffix that best matches that responsibility
3. If no standard suffix fits, consider if the class has too many responsibilities (SRP violation)

---

## 4. Module Organization

### Directory Structure [CONVENTION: Code Review]

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

### Barrel Exports (index.ts) [CONVENTION: Code Review]

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

### Internal vs Public Modules [CONVENTION: Code Review]

**Public Modules:**

- Exported via `src/index.ts`
- Stable API subject to semantic versioning
- Documented with TSDoc
- Safe for cross-package use

**Internal Modules (\_prefix):**

- NOT exported in `index.ts`
- Implementation details
- Can change without notice
- Package-private only

### 4.5 Utility Function Organization [CONVENTION: Code Review]

Organizing helper functions and utilities follows a clear hierarchy based on usage patterns found across the codebase.

#### Decision Tree

**When to inline vs extract utilities:**

```
Single file usage          → Inline (regexes, functional constants)
3+ files (same category)   → Extract to dedicated file
4+ files (cross-category)  → Add to _util.ts
Multiple packages          → Promote to @blue/util
```

**Key Thresholds:**

- **Inline:** Used by only 1 file
- **Extract:** Used by 3+ files in same category (e.g., all string utilities)
- **Package-wide:** Used by 4+ files across categories, or once `_util.ts` exists
- **Global:** Used by multiple packages

#### Inline Utilities

Keep utilities inline when they're used **only within the file they're defined in**.

**Example from `packages/blue-util/src/string/to-camel.ts`:**

```typescript
// ✅ Correct: Inline helpers for single-file use
const dashes = /[\-_]/g;
const lowerCaseLetters = /\s[a-z]/g;
const spaces = /\s+/g;
const upperCaseLetters = /^[A-Z]/g;

// Functional constants (partially-applied functions)
const removeSpaces = replace(spaces, '');
const replaceDashesWithSpaces = replace(dashes, ' ');

const toCamel: (value: string) => string = pipe(
    replaceDiacritics,
    removeNonWord,
    replaceDashesWithSpaces,
    (val: string): string => val.replace(lowerCaseLetters, toUpper),
    removeSpaces,
    (val: string): string => val.replace(upperCaseLetters, toLower)
);

export default toCamel;
```

**When to use inline utilities:**

- Regexes specific to one function
- Partially-applied functions used as pipeline steps
- File-specific configuration constants
- Helper functions with narrow, context-specific use

#### Extracted to Dedicated File

Extract to a separate file when a utility is used by **3+ files within the same category**.

**Example: `packages/blue-util/src/string/remove-non-word.ts`**

This 21-line utility is imported by `to-camel.ts`, `to-pascal.ts`, `slugify.ts`, and other string utilities:

```typescript
// ✅ Correct: Extracted because used by 3+ string utilities
import { replace } from 'ramda';

/**
 * Remove non-word characters.
 * @param {string} value The string to be transformed.
 * @returns {string} The `value` with the non-word characters removed.
 */
const removeNonWord: (value: string) => string = replace(/[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g, '');

export default removeNonWord;
```

**Guidelines for extracted utilities:**

- Single export per file (focused utility modules)
- Import using relative paths from same category
- Typically 10-50 lines
- Well-documented with TSDoc

**Example usage:**

```typescript
// In packages/blue-util/src/string/to-camel.ts
import removeNonWord from './remove-non-word.js';

// In packages/blue-util/src/string/slugify.ts
import removeNonWord from './remove-non-word.js';
```

#### Package-Wide `_util.ts`

Create a `_util.ts` when utilities are used by **4+ files across different categories**, or once `_util.ts` exists, add new cross-file utilities there directly.

**Example: `packages/blue-parser/src/_util.ts`**

```typescript
// ✅ Correct: Re-exports + package-specific helpers
// Re-export commonly used utilities
export { always, compose, pipe } from '@blue/util/function';
export { filter, join, map } from '@blue/util/list';
export { lt } from '@blue/util/relation';

// Package-specific helpers used across multiple parser modules
export const joinOnEmptyString = join('');
export const lengthLessThanN = (n: number) => propSatisfies(lt(__, n), 'length');
```

**Current packages with `_util.ts`:**

- `@blue/parser/src/_util.ts` (30 lines)
- `@blue/context/src/_util.ts`
- `@blue/view-webcomponent/src/_util.ts`
- `@blue/platform-web/src/_util.ts`

**Guidelines:**

- Combines re-exports with package-specific utilities
- Internal only (never exported in `index.ts`)
- Used by multiple modules within the package
- Avoids duplicating common utility imports

**Important:** Once a package has `_util.ts`, add new cross-file utilities there directly instead of waiting for the 4-file threshold.

#### Important: Internal Files Must Contain Local Utilities

Internal files (`_util.ts`, `_parser.ts`, etc.) should **only be created when they contain actual utility functions**, not just pass-through re-exports from other packages.

##### Decision Rule

> **If you delete all the re-export lines and the file becomes empty, the file shouldn't exist.**

##### Correct Pattern: Contains Local Utilities

```typescript
/**
 * Internal utilities for @blue/parser package.
 *
 * @internal - Do not export in index.ts or import across package boundaries
 * @author Jeff Rose
 */

// Re-exports (supporting infrastructure)
import { pipe, compose } from '@blue/util/function';
import { map, filter, join } from '@blue/util/list';
import { lt } from '@blue/util/relation';
import { propSatisfies } from '@blue/util/logic';

export { pipe, compose, map, filter };

// LOCAL UTILITIES (this is what justifies the file's existence!)
export const joinOnEmptyString = join(''); // ✅ Partial application
export const lengthLessThanN = (n: number) => propSatisfies(lt(__, n), 'length'); // ✅ New function
```

**Why this is correct:** The file creates actual utility functions (`joinOnEmptyString`, `lengthLessThanN`). The re-exports are convenience infrastructure to support these utilities and consuming modules.

##### Wrong Pattern: Only Pass-Through Re-Exports

```typescript
/**
 * Internal utilities for @blue/http package.
 *
 * @internal - Do not export in index.ts or import across package boundaries
 * @author Jeff Rose
 */

// Type utilities
export { is, like, isString } from '@blue/util/types';

// Logic utilities
export { cond, ifElse, isEmpty } from '@blue/util/logic';

// Function utilities
export { pipe, identity } from '@blue/util/function';

// Package-specific utilities can be added below
// (But they never were! This file should NOT exist.)
```

**Why this is wrong:** No actual utility functions are created. This is just a convenience re-export layer with no value. Consuming files should import directly from `@blue/util` instead.

##### When to Create Internal Files

**✅ Create when:**

- You have local helper functions unique to the package
- You need composed/partial functions (e.g., `join('')`, `lt(10)`)
- You have package-specific adaptations of general utilities
- Multiple files (4+) would share these utilities

**❌ Don't create when:**

- Just to centralize imports for convenience
- Only for pass-through re-exports without local utilities
- You want to save a few import lines

##### Naming Internal Files

Internal files don't always need to be named `_util.ts`. Choose a name that reflects the **purpose and content**:

**Generic Mixed Utilities:**

- `_util.ts` - Re-exports from `@blue/util` + mixed-purpose helpers

**Domain-Specific Collections:**

- `_parser.ts` - Collection of internal parser primitives
- `_validators.ts` - Collection of internal validation helpers
- `_formatters.ts` - Collection of internal formatting functions
- `_http-common.ts` - HTTP-specific shared utilities (Node.js convention)

**Specific Implementations:**

- `_natural-sort.ts` - Natural sorting algorithm
- `_media-type-parser.ts` - Specific parsing logic

**Test Helpers:**

- `test/_expect.ts` - Custom test assertions
- `test/_fixtures.ts` - Shared test data
- `test/_worker.ts` - Test worker utilities

**Example: Node.js uses descriptive names:**

- `lib/_http_agent.js` ✅
- `lib/_http_client.js` ✅
- `lib/_http_common.js` ✅
- NOT `lib/_util.js` for everything ❌

**When to Use Which Name:**

```
Single algorithm           → Descriptive: _natural-sort.ts
3+ related utilities      → Domain-specific: _validators.ts
Mixed-purpose helpers     → Generic: _util.ts
Test utilities           → test/_<purpose>.ts
```

##### Example Progression

**Stage 1: Inline (single file uses)**

```typescript
// In packages/blue-http/src/request.ts
const parseAcceptHeader = (header: string) => header.split(',').map(trim);
```

**Stage 2: Extract to dedicated file (3+ files use)**

```typescript
// packages/blue-http/src/_header-parser.ts
export const parseAcceptHeader = (header: string) => header.split(',').map(trim);
export const parseContentType = (header: string) => {
    /* ... */
};
export const parseCacheControl = (header: string) => {
    /* ... */
};
```

**Stage 3: Add to `_util.ts` (becomes cross-cutting)**

```typescript
// packages/blue-http/src/_util.ts
import { split, map, trim } from '@blue/util/list';

export { split, map, trim }; // Re-exports

// Cross-cutting utilities used by multiple domains
export const parseAcceptHeader = (header: string) => header.split(',').map(trim);
```

**Stage 4: Promote to @blue/util (multiple packages use)**

```typescript
// packages/blue-util/src/http/parse-accept-header.ts
export const parseAcceptHeader = (header: string) => header.split(',').map(trim);
```

##### Future Re-evaluation

**Note:** The hybrid naming approach (generic `_util.ts` + specific domain files) will be reviewed at a future date to determine if it should be kept, standardized, or evolved to directory-based organization.

**See:** `docs/plans/INTERNAL_FILE_NAMING_REVIEW.md` for the evaluation framework.

**Triggers for review:**

- > 5 internal files per package (indicates need for directory structure)
- > 10% internal file ratio (too many internal files)
- Significant organizational challenges emerge

#### Promoted to `@blue/util`

Promote utilities to `@blue/util` when they're used by **multiple packages** or are truly universal.

**When to promote:**

- Function is used by 2+ packages
- Logic is universally applicable (not domain-specific)
- Fits into existing `@blue/util` categories (`/string`, `/list`, `/function`, etc.)

**Process:**

1. Move to appropriate category in `@blue/util`
2. Add comprehensive TSDoc documentation
3. Add thorough test coverage
4. Export in `@blue/util/src/index.ts`
5. Update consuming packages to import from `@blue/util`

#### Higher-Order Functions

**Use currying when:**

```typescript
// ✅ Partial application creates useful variants
const sample = (n: number) => (list: ArrayLike<T>) => ...;
const sampleTwo = sample(2);  // Reusable!
const sampleFive = sample(5);

// ✅ Pipeline composition
const slugify = (options: SlugOptions) => (value: string) => ...;
const defaultSlug = slugify({ lowercase: true, replacement: '-' });
const urlSlug = slugify({ lowercase: true, replacement: '_' });
```

**Use regular functions when:**

```typescript
// ✅ All parameters always provided together
function toCamel(value: string): string { ... }
function isValidDate(value: temporal, format: string): boolean { ... }

// No benefit from partial application
function parseMediaType(value: string): MediaType { ... }
```

**Rationale:** Currying adds complexity. Only use it when partial application or composition provides real value.

#### Constants Organization

**Inline constants (1-5 constants, single file):**

```typescript
// ✅ Correct: File-specific constants
const MAX_RETRIES = 3;
const WILDCARD = '*';
const EMAIL_REGEX = /^[\w.-]+@[\w.-]+\.\w+$/;
const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY';
```

**Dedicated constant files (10+ related constants):**

```typescript
// ✅ Correct: Large cohesive collections
// packages/blue-http/src/http-headers.ts (725 lines, 124 constants)
export const HTTPHeader = Object.freeze({
    Accept: 'Accept',
    AcceptEncoding: 'Accept-Encoding',
    AcceptLanguage: 'Accept-Language',
    Authorization: 'Authorization',
    CacheControl: 'Cache-Control',
    ContentType: 'Content-Type',
    // ... 118 more related constants
});
```

**Guidelines:**

- **Inline:** 1-5 constants specific to one module
- **Extract:** 10+ constants forming a cohesive collection
- **Large files OK:** Constant collections can exceed 500 lines if single responsibility

**Real examples:**

- `http-headers.ts`: 725 lines, 124 HTTPHeader constants
- `response-statuses.ts`: 348 lines, HTTP status code constants
- `media-type.ts`: 433 lines, media type constants

#### Anti-Patterns

**❌ Premature Extraction:**

```typescript
// ❌ Wrong: Separate file for utility used by only 1 file
// packages/util/helpers/capitalize-first.ts
const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
export default capitalizeFirst;

// ✅ Correct: Keep inline in the only file that uses it
const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const result = capitalizeFirst(input);
```

**❌ Missing Extraction (Duplication):**

```typescript
// ❌ Wrong: Same regex in 4 different files
// to-camel.ts
const spaces = /\s+/g;

// to-pascal.ts
const spaces = /\s+/g;

// to-kebab.ts
const spaces = /\s+/g;

// slugify.ts
const spaces = /\s+/g;

// ✅ Correct: Extract to _util.ts or dedicated file
// _util.ts
export const SPACES_REGEX = /\s+/g;

// to-camel.ts
import { SPACES_REGEX } from './_util';
```

**❌ Wrong Extraction Level:**

```typescript
// ❌ Wrong: Package-specific utility in @blue/util
// This is only used by @blue/parser modules
export const parseRouteSegment = ...;  // Should be in @blue/parser/src/_util.ts

// ❌ Wrong: Cross-package utility in _util.ts
// This is used by @blue/core, @blue/context, @blue/dispatcher
export const deepClone = ...;  // Should be promoted to @blue/util
```

**❌ Circular Dependencies:**

```typescript
// ❌ Wrong: _util.ts imports from module that imports _util.ts
// _util.ts
import { helper } from './module-a';

// module-a.ts
import { utility } from './_util'; // CIRCULAR!

// ✅ Correct: Extract shared code to third file or inline in one
```

**See also:** [ARCHITECTURE.md - Dependency Management Strategy](./ARCHITECTURE.md#dependency-management-strategy) for guidance on when to promote utilities to `@blue/util`.

### 4.6 File Size and Module Breakdown [CONVENTION: Code Review]

Maintaining appropriate file sizes improves code readability, testability, and maintainability.

#### Target File Sizes

**Codebase analysis (250 TypeScript files):**

| Size Range    | Count     | Percentage | Assessment             |
| :------------ | :-------- | :--------- | :--------------------- |
| ≤50 lines     | 109 files | 43%        | Small, focused modules |
| 51-150 lines  | 93 files  | 37%        | **Ideal range**        |
| 151-300 lines | 33 files  | 13%        | Large but acceptable   |
| >300 lines    | 15 files  | 6%         | Requires review        |

**Statistics:**

- **Median:** 61 lines
- **Average:** 106 lines
- **Target:** 20-150 lines per file

**Size guidelines:**

```typescript
// ✅ Ideal: Single utility (20-50 lines)
// packages/blue-util/src/string/remove-non-word.ts (21 lines)

// ✅ Good: Utility with helpers (50-150 lines)
// packages/blue-util/src/string/to-camel.ts (46 lines)

// ⚠️ Review: Complex module (150-300 lines)
// May be acceptable if single cohesive responsibility

// ❌ Likely needs refactoring: Multiple responsibilities (>300 lines)
// Probably violates Single Responsibility Principle
```

#### When to Break Up Files

Break up a file when it exhibits these signals:

**1. Multiple Unrelated Exports**

```typescript
// ❌ Wrong: 10 unrelated exports
export class UserService { ... }
export class EmailValidator { ... }
export function formatDate(date: Date): string { ... }
export const HTTP_CODES = { ... };
export function parseJSON(json: string): any { ... }
// These belong in separate files!
```

**2. Low Cohesion**

```typescript
// ❌ Wrong: Functions don't work together
export function validateUser(user: User): boolean { ... }
export function fetchWeatherData(city: string): Weather { ... }
export function calculateTaxes(income: number): number { ... }
// No relationship between these functions
```

**3. Frequent Merge Conflicts**

Multiple developers editing different sections indicates separate concerns.

**4. Hard to Test**

Complex setup required for every test suggests too many dependencies.

**5. Size + Complexity**

```typescript
// ❌ Wrong: >200 lines doing multiple things
// 965 lines: packages/blue-validate/src/standard-constraints.ts
// Contains: string validation, number validation, date validation,
//           type checking, format validation, helpers, types
// Should split by validation category
```

#### How to Break Up Large Files

**Pattern 1: Extract Constants**

```typescript
// Before: user-service.ts (400 lines)
export class UserService {
    private readonly USER_ROLES = { ADMIN: 'admin', USER: 'user', ... };
    private readonly USER_STATUSES = { ACTIVE: 'active', ... };
    private readonly EMAIL_REGEX = /^[\w.-]+@/;
    // ... 50 more constants
    // ... service methods
}

// After: user-constants.ts (60 lines)
export const USER_ROLES = { ADMIN: 'admin', USER: 'user', ... };
export const USER_STATUSES = { ACTIVE: 'active', ... };
export const EMAIL_REGEX = /^[\w.-]+@/;

// After: user-service.ts (340 lines)
import { USER_ROLES, USER_STATUSES, EMAIL_REGEX } from './user-constants';

export class UserService {
    // ... service methods using imported constants
}
```

**Pattern 2: Extract Helpers to `_util.ts`**

```typescript
// Before: route-handler.ts (350 lines)
class RouteHandler {
    // ... main logic

    private parseParams(route: string): Record<string, string> { ... }
    private normalizeRoute(route: string): string { ... }
    private validateRoute(route: string): boolean { ... }
    // ... 5 more helper methods
}

// After: _util.ts (80 lines)
export function parseRouteParams(route: string): Record<string, string> { ... }
export function normalizeRoute(route: string): string { ... }
export function validateRoute(route: string): boolean { ... }

// After: route-handler.ts (270 lines)
import { parseRouteParams, normalizeRoute, validateRoute } from './_util';

class RouteHandler {
    // ... main logic using imported helpers
}
```

**Pattern 3: Split by Functionality**

```typescript
// Before: event-emitter.ts (771 lines)
// - Event registration (on, off, once)
// - Event triggering (emit, emitAsync)
// - Error handling
// - Async event support

// After: Split into focused modules
// event-emitter.ts (300 lines) - Core registration + sync triggering
// event-errors.ts (150 lines) - Error handling utilities
// async-events.ts (200 lines) - Async event support
// _event-util.ts (121 lines) - Shared internal helpers
```

#### Acceptable Large Files

Some files are legitimately large and should **not** be split:

**✅ Constant Collections:**

```typescript
// packages/blue-http/src/http-headers.ts (725 lines, 124 constants)
// Single cohesive collection of related HTTP header constants
export const HTTPHeader = Object.freeze({
    Accept: 'Accept',
    AcceptEncoding: 'Accept-Encoding',
    // ... 122 more headers
});
```

**Real examples:**

- `http-headers.ts`: 725 lines (124 HTTPHeader constants)
- `response-statuses.ts`: 348 lines (HTTP status codes)
- `media-type.ts`: 433 lines (media type constants)

**✅ Complex Classes with Single Responsibility:**

```typescript
// packages/blue-factory/src/factory.ts (562 lines)
// Single cohesive responsibility: Dependency injection factory
// High internal cohesion, all methods serve DI container

// packages/blue-context/src/context.ts (363 lines)
// Single responsibility: Application context management
```

**✅ Framework Integration:**

```typescript
// packages/blue-dispatcher/src/route-handler-mapping.ts (884 lines)
// Complex route mapping logic with high internal cohesion
// Difficult to split without artificial boundaries
```

**Criteria for acceptable large files:**

- Single cohesive responsibility (high cohesion)
- All code serves the same purpose
- Natural unit that's hard to split
- Splitting would create artificial boundaries

#### Functions Per File Guidelines

**Utility Modules (Single Export):**

```typescript
// ✅ Ideal: 1 main export, 0-6 inline helpers
// packages/blue-util/src/string/to-camel.ts (46 lines)
const dashes = /[\-_]/g; // Helper 1
const spaces = /\s+/g; // Helper 2
const removeSpaces = replace(spaces, ''); // Helper 3
// ... 3 more inline helpers

export default toCamel; // Single export
```

**Service Modules:**

```typescript
// ✅ Good: 3-7 related public methods
class MediaTypeService {
    parse(value: string): MediaType { ... }
    format(type: MediaType): string { ... }
    compare(a: MediaType, b: MediaType): number { ... }
    isValid(value: string): boolean { ... }
    // Private helpers don't count toward this limit
}
```

**Constant Collections:**

```typescript
// ✅ Acceptable: 20-100+ exports if cohesive
export const HTTPHeader = { ... };  // Object with 124 properties

// or

export const ACCEPT = 'Accept';
export const ACCEPT_ENCODING = 'Accept-Encoding';
// ... 100+ more related constants
```

**Rule of Thumb:**

- **1-2 exports:** Utility module (ideal)
- **3-7 exports:** Service/class module (good)
- **8-15 exports:** Consider splitting (review)
- **20+ exports:** Acceptable only for constant collections

#### Refactoring Strategy

**Step-by-step approach for breaking up large files:**

**1. Identify Responsibility Boundaries**

```bash
# Analyze exports
grep "^export" large-file.ts

# Look for natural groupings
# - Related functions that work together
# - Distinct feature areas
# - Different abstraction levels
```

**2. Extract Low-Hanging Fruit First**

Start with easy, low-risk extractions:

```typescript
// First: Extract constants
// constants.ts (new file)
export const CONFIG = { ... };

// Second: Extract utilities
// _util.ts (new or existing)
export function helper() { ... }

// Third: Extract test helpers
// test/_helpers.ts (new file)
export function createMockUser() { ... }
```

**3. Split Core Functionality**

After easy extractions, split remaining code:

```typescript
// Split by feature area
user-service.ts (300 lines)
user-validation.ts (150 lines)
user-formatting.ts (100 lines)

// Split by abstraction level
high-level-api.ts (200 lines)
internal-implementation.ts (250 lines)

// Split by lifecycle phase
initialization.ts (150 lines)
runtime-operations.ts (300 lines)
cleanup.ts (100 lines)
```

**4. Verify No Circular Dependencies**

```bash
# Build will fail if circular dependencies exist
pnpm build

# Check specific package
nx run @blue/core:build:lib
```

**5. Update Tests**

```typescript
// Adjust imports in test files
import { UserService } from '../src/user-service';
import { USER_ROLES } from '../src/user-constants';

// Split test files if needed to match source structure
user - service.spec.ts;
user - validation.spec.ts;
```

**6. Verify Test Coverage Maintained**

```bash
# Ensure refactoring didn't reduce coverage
pnpm test

# Check coverage report
nx run @blue/core:test --coverage
```

**7. Document Changes**

```bash
git commit -m "refactor(validate): split large constraints file

- Extract string constraints to string-constraints.ts (200 lines)
- Extract number constraints to number-constraints.ts (150 lines)
- Extract date constraints to date-constraints.ts (180 lines)
- Move shared helpers to _util.ts (80 lines)
- Update tests and maintain 100% coverage

Ref: STYLE_GUIDE.md Section 4.6"
```

**Best Practices:**

- Make incremental changes (one extraction at a time)
- Run tests after each extraction
- Commit working changes before next extraction
- Document rationale in commit messages

---

## 6. Special Patterns

### Mixin Naming [CONVENTION: Code Review]

**Pattern:** `As*` for class mixins, `as*` for function mixins

**Class Mixins (PascalCase with `As` prefix):**

```typescript
// ✅ Correct: Class mixins
const EventEmitterMixin = AsEventEmitter(Base);

class MyService extends AsEventEmitter(BaseService) {
    constructor() {
        super();
        this.emit('initialized'); // From mixin
    }
}

// Pattern: AsEventEmitter(Component) produces new class
```

**Function Mixins (camelCase with `as` prefix):**

```typescript
// ✅ Correct: Function mixins
const component = {};
asEventEmitter(component); // Adds event emitter methods to instance

component.on('event', handler);
component.emit('event', data);

// Pattern: asEventEmitter(target) adds methods to existing object
```

**Rationale:** Capitalized `As*` indicates class-level composition (returns new class), lowercase `as*` indicates instance-level augmentation (modifies existing object).

### Configurable Suffix [CONVENTION: Code Review]

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

### Legacy Code Markers [CONVENTION: Code Review]

**Pattern:** `*.legacy.js` or `Old*` prefix

Files or classes marked as deprecated/legacy code.

```typescript
// ⚠️ Legacy marker in filename
old - component.legacy.js;

// ⚠️ Legacy marker in class name
class OldComponent {
    // Deprecated implementation
}
```

**Rationale:** Clearly identifies code scheduled for removal or refactoring. New code should not follow this pattern.

---

## 7. Complete Example

Here's a complete example demonstrating all conventions:

```typescript
/**
 * Media type parser and comparator.
 *
 * @module
 */

// Imports: Always use single quotes
import * as R from '@blue/util';
import { AbstractValueComparator } from './_util'; // Internal import OK in same package

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

type qualityValue = number; // Simple alias: camelCase

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

## 8. Maintenance

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

_This guide is a living document. When code style evolves, update this guide to reflect current practices._
