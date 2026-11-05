# Ndigo Style Guide

This document defines the concrete implementation rules, naming conventions, and formatting standards for the Ndigo codebase. For architectural principles and design patterns, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Purpose and Scope

**This guide answers:** "How do I name this file/variable/class?" and "How should this code be formatted?"

**See ARCHITECTURE.md for:** "Why is the system designed this way?" and "What are the architectural patterns?"

**Enforcement markers:** Section headings carry a marker describing how the rule is checked.

- `[AUTOMATED: oxfmt]` — enforced by oxfmt (`pnpm format:check`, `.oxfmtrc.json`).
- `[AUTOMATED: oxlint]` — enforced by oxlint (`pnpm lint`, `.oxlintrc.json`); the lane runs
  `oxlint --type-aware --deny-warnings`, so a `warn`-level rule fails CI exactly like an `error`.
  The enforcing rule names (for example `internal/no-internal-file-exports`) are named inline.
- `[CONVENTION: Code Review]` — enforced by review; no lint rule. Some of these sections also carry
  a partial oxlint rule, named inline.

## 1. Formatting Rules

These rules are enforced by oxfmt (`.oxfmtrc.json`). When the oxfmt configuration changes, this section must be updated.

### Indentation [AUTOMATED: oxfmt]

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
    "name": "@ndigo/core",
    "version": "3.0.0-alpha.0"
}
```

### Line Endings [AUTOMATED: oxfmt]

- **Always use LF** (`\n`) on all platforms
- **Never use CRLF** (`\r\n`)
- Configured: `endOfLine: 'lf'`

### Semicolons [AUTOMATED: oxfmt]

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

### Quotes [AUTOMATED: oxfmt]

- **Single quotes** for strings in TypeScript/JavaScript
- **Double quotes** for JSX attributes
- Configured: `singleQuote: true`, `jsxSingleQuote: false`

```typescript
// ✅ Correct
const message = 'Hello, world!';
import { foo } from '@ndigo/util';

// ❌ Wrong
const message = 'Hello, world!';
import { foo } from '@ndigo/util';
```

### Trailing Commas [AUTOMATED: oxfmt]

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
    arg2: number // ← oxfmt will remove this
) {}
```

### Print Width [AUTOMATED: oxfmt]

- **Maximum 120 characters** per line
- oxfmt will automatically wrap at this width
- Configured: `printWidth: 120`

### Arrow Functions [AUTOMATED: oxfmt]

- **Always use parentheses** around parameters
- Configured: `arrowParens: 'always'`

```typescript
// ✅ Correct
const fn = (x) => x * 2;
const fn2 = (x, y) => x + y;

// ❌ Wrong
const fn = (x) => x * 2;
```

### Bracket Spacing [AUTOMATED: oxfmt]

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

### Markdown Files [AUTOMATED: oxfmt]

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

### Internal/Private Files [AUTOMATED: oxlint]

**Pattern:** `_kebab-case.ts`

Files prefixed with underscore are internal implementation details.

**Automated:** `internal/no-internal-file-exports` (error) rejects underscore files re-exported from
public entry points, and `internal/no-internal-file-imports` (error) rejects cross-package imports of them.

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
// In packages/ndigo-util/src/string/to-camel.ts
import { helper } from '../_util';

// ❌ Wrong: Import across packages
// In packages/ndigo-core/src/media-type.ts
import { helper } from '@ndigo/util/_util'; // NEVER DO THIS
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
✅ seedrandom.d.ts
✅ _safe-regex.d.ts
```

### Configuration Files [CONVENTION: Code Review]

**Pattern:** `kebab-case.config.ts` or `kebab-case.json`

Configuration files use kebab-case with appropriate extensions.

**Examples:**

```
✅ vitest.config.ts
✅ vite.config.ts
✅ tsconfig.json
✅ tsconfig.build.json
✅ pnpm-workspace.yaml
✅ .oxfmtrc.json
✅ .oxlintrc.json
```

### Documentation Files [CONVENTION: Code Review]

**Pattern:** `UPPER_SNAKE_CASE.md` (root), `YYYY-MM-DD_DESCRIPTION.md` (dated), or `kebab-case-slug.md` (living)

Root-level documentation uses all caps; dated documentation uses an ISO 8601 date with an underscore separator; living documentation uses a stable kebab-case slug.

**Root Documentation (Uppercase):**

```
✅ README.md
✅ ARCHITECTURE.md
✅ STYLE_GUIDE.md
✅ AGENTS.md
✅ AGENTS.md (formerly CLAUDE.md)
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

**Living Documentation (Stable Slug):**

Docs updated in place rather than frozen by date use a stable kebab-case slug with no date:

```
✅ docs/guides/19-testing.md
✅ docs/guides/04-i18n-and-content.md
✅ docs/architecture/security.md
✅ ARCHITECTURE.md

❌ docs/guides/2026-10-06-testing.md   // Wrong: living docs do not carry a date
```

Guide files carry a zero-padded numeric ordering prefix (`NN-slug.md`); `docs/architecture/` and the root documents use a bare slug. See [docs/README.md](./docs/README.md) (Conventions) for which directories are dated (history) and which are living (updated in place).

---

## 3. Code Naming Conventions

### Constants [CONVENTION: Code Review]

**Pattern:** `UPPER_SNAKE_CASE` for primitive constants and semantic enum-like values, `camelCase` for all other constants

**Primitive Constants** (immutable primitive values per `@ndigo/core/src/primitive.ts`):

Primitive types: `boolean | null | number | string | symbol | bigint | undefined`

```typescript
// ✅ Correct: Primitive string constants use UPPER_SNAKE_CASE
const WILDCARD: SupportedMediaType = '*';
const QUALITY_FACTOR_PARAM = 'q';
const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY';

// ✅ Correct: Primitive number constants use UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;
const HTTP_OK = 200;

// ✅ Correct: Primitive boolean constants use UPPER_SNAKE_CASE
const DEBUG_ENABLED = true;
const STRICT_MODE = false;
```

**Semantic Enum-Like Constants** (immutable object instances acting as enums):

```typescript
// ✅ Correct: HTTPHeader instances (enum-like semantics) use UPPER_SNAKE_CASE
export const CONTENT_TYPE = new HTTPHeader('Content-Type');
export const AUTHORIZATION = new HTTPHeader('Authorization');

// ✅ Correct: MediaType instances (enum-like semantics) use UPPER_SNAKE_CASE
export const APPLICATION_JSON = MediaType.for('application', 'json');
export const TEXT_HTML = MediaType.for('text', 'html');
export const IMAGE_PNG = MediaType.for('image', 'png');
```

**Object Constants** (RegExp patterns, object literals, arrays):

All non-primitive constants use `camelCase`, including RegExp patterns and other immutable objects.

**Automated:** `internal/no-uppercase-regexp-constants` (error) rejects UPPER_SNAKE_CASE constants initialized with a RegExp literal.

```typescript
// ✅ Correct: RegExp patterns use camelCase (they are objects, not primitives)
const alphaRegex = /^[a-zA-Z]+$/;
const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
const queryKeyPattern = /^[A-Za-z+:/?[\]0-9%]+/;
const matrixValuePattern = /^[^;]*/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const percentEncodedPattern = /(%[0-9A-Za-z]{2})+/g;

// ✅ Correct: Used in parser combinators
const queryKey = regex(queryKeyPattern).map(replacePlusWithSpace).map(decode);

// ❌ Wrong: RegExp patterns with UPPER_SNAKE_CASE (objects, not primitives)
const ALPHA_REGEX = /^[a-zA-Z]+$/; // Should be: alphaRegex
const QUERY_KEY_PATTERN = /^[A-Z]+$/; // Should be: queryKeyPattern
const EMAIL_REGEX = /^[a-z@.]+$/; // Should be: emailRegex

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

**Rationale:** Distinguishes true primitive values (per `@ndigo/core/src/primitive.ts`: string, number, boolean, null, undefined, symbol, bigint) from all other constants. RegExp objects, arrays, and object literals are not primitives—they have methods and are mutable in structure—so they use camelCase. Semantic enum-like constants (HTTPHeader, MediaType instances) use UPPER_SNAKE_CASE as a special case because they represent immutable enum values in the public API. This follows JavaScript's semantic distinction: primitives use uppercase (Math.PI, Number.MAX_VALUE), objects use camelCase.

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

**Pattern:** `isType` prefix for type/identity checks

Predicates that verify a value's **type or identity** using `typeof`, `instanceof`, or similar runtime checks. The question being asked is: "Is this value _an instance of_ type X?"

```typescript
// ✅ Correct: typeof checks
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

// ✅ Correct: instanceof checks
const isContextToken = (value: unknown): value is ContextToken<unknown> => value instanceof ContextToken;
```

### Duck Typing Functions [CONVENTION: Code Review]

**Pattern:** `likeType` prefix for structural/interface checks

Functions that check whether a value has the expected **structural shape** (properties and methods) rather than checking identity via `typeof` or `instanceof`. The question being asked is: "Does this value _behave like_ type X?" The `like()` utility from `@ndigo/util/types` is the standard way to create these checks.

**Note:** `typeof` may appear in `like*` functions as null guards or to verify a property is callable (e.g., `typeof value.then === 'function'`). This is fine — the key distinction is whether the **primary check mechanism** tests for structural shape or type identity.

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

// ✅ Correct: Using the like() utility from @ndigo/util/types
const likeFactory = like({ getInstance: Function }) as (value) => value is Factory;
const likeEquatable = like({ equals: Function }) as (value) => value is Equatable;
```

**Anti-Patterns:**

```typescript
// ❌ Wrong: instanceof is a type/identity check, not duck-typing — use is* prefix
const likeContextToken = (value: unknown): value is ContextToken<unknown> => value instanceof ContextToken; // Should be isContextToken

// ✅ Correct: Use is* for instanceof checks
const isContextToken = (value: unknown): value is ContextToken<unknown> => value instanceof ContextToken;
```

**Decision Table:**

| Check Mechanism                | Prefix  | Example                                         |
| :----------------------------- | :------ | :---------------------------------------------- |
| `instanceof`                   | `is*`   | `isContextToken`, `isDate`                      |
| `typeof` (as primary check)    | `is*`   | `isString`, `isNumber`, `isFunction`            |
| `like()` utility (shape check) | `like*` | `likeFactory`, `likeEquatable`                  |
| Property/method presence       | `like*` | `likeIterable`, `likePromise`                   |
| `allPass`/`anyPass` of `like*` | `like*` | `likeApplicationContext`, `likeHTTPInterceptor` |

**Rationale:** `is*` asks "Is this value _an instance of_ type X?" — it checks identity. `like*` asks "Does this value _behave like_ type X?" — it checks structural compatibility. This mirrors the duck-typing philosophy: "If it walks like a duck and quacks like a duck, it's `like` a duck." An `instanceof` check, by contrast, verifies the value _is_ a duck.

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
class MediaType extends Null implements Serializable {}
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

**Automated:** `@ndigo/no-cross-paradigm-decorators` (error) rejects mixing service-call and route-mapping decorators on one class; decorator naming itself remains a review concern.

**Pattern:** `camelCase`

Decorator functions follow standard function naming conventions (camelCase).

**Examples:**

```typescript
// ✅ Correct: Decorators use camelCase
@configuration
class AppConfig {
    @entry
    databaseConnection() {}
}

@routeMapping('/api/users')
class UserController {}

@entity('users')
class User {
    @column({ name: 'first_name', type: 'varchar' })
    firstName: string;
}

@scope('singleton')
class UserService {}

@viewMapping('user-profile')
class UserProfileView {}
```

**Rationale:** Decorators are functions that modify classes, methods, fields, or parameters. Following standard function naming conventions (camelCase) maintains consistency with JavaScript/TypeScript ecosystem patterns and TC39 decorator standards.

### 3.9. Acronym Casing [AUTOMATED: oxlint]

**Automated:** `internal/no-mixed-case-acronyms` (error) rejects mixed-case acronyms (`Http`, `Json`, `Xml`) in type declaration names; identifier casing remains a review concern.

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

// Real examples from @ndigo/http
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

**Common Acronyms in Ndigo:**

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

### 3.10. Interfaces and Abstract Classes [CONVENTION: Code Review]

**Automated:** `internal/no-abstract-class-without-prefix` (error) requires the `Abstract` prefix on abstract classes; interface naming remains a review concern.

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

// Real example from @ndigo/view
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
import { HTTPTransformer, type TransformContext } from '@ndigo/http';
import { JSONObject, type Serializable } from '@ndigo/core';

class PaymentProcessor implements HTTPTransformer, Serializable {
    // Implements both interfaces
    canTransform(body: JSONObject, _context: TransformContext): boolean {
        // Applicability check
    }

    transform(body: JSONObject, _context: TransformContext): JSONObject {
        // Request/response transformation
    }

    toJSON(): JSONObject {
        // Serialization
    }
}

// ✅ Correct: Multiple interfaces from different packages
import { ViewResolver } from '@ndigo/view';
import { ResourceLoader } from '@ndigo/context';

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
3. **Consistent with established enterprise patterns** - Follows long-standing conventions (e.g., `AbstractHandlerMapping`, `AbstractPathMatchingResourcePatternResolver`)
4. **Autocomplete-friendly** - Modern IDEs make long names effortless; clarity trumps brevity

### 3.11. Role-Based Suffixes [CONVENTION: Code Review]

**Pattern:** Use semantic suffixes to convey component responsibility

Ndigo uses role-based suffixes aligned with established enterprise conventions to indicate the responsibility and behavior of classes/interfaces. These suffixes provide instant semantic understanding and create a shared vocabulary across the codebase.

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
| `*Transformer` | Transforms data structure                                     | `DataTransformer`, `PayloadTransformer`         |
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

**Real Examples from Ndigo:**

```typescript
// From @ndigo/dispatcher
export interface RouteHandlerAdapter {}
export abstract class AbstractHandlerMethodAdapter implements RouteHandlerAdapter {}
export class ControllerHandlerAdapter implements RouteHandlerAdapter {}
export class MetadataHandlerAdapter extends AbstractHandlerMethodAdapter {}

export interface HandlerMethodArgumentResolver {}
export abstract class AbstractNamedValueMethodArgumentResolver {}
export class MatrixValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {}
export class QueryValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {}

// From @ndigo/view
export interface ViewResolver {}
export abstract class AbstractCachingViewResolver implements ViewResolver {}
export abstract class AbstractPathBasedViewResolver extends AbstractCachingViewResolver {}
export class ImportViewResolver extends AbstractPathBasedViewResolver {}
export class ContentNegotiationViewResolver implements ViewResolver {}

export interface ContentNegotiationStrategy {}
export class PathExtensionContentNegotiationStrategy implements ContentNegotiationStrategy {}
export class FixedContentNegotiationStrategy implements ContentNegotiationStrategy {}

// From @ndigo/factory
export interface Factory {}
export interface HierarchicalFactory extends Factory {}
export interface ConfigurableFactory extends HierarchicalFactory {}
export abstract class AbstractFactory implements ConfigurableFactory {}
export class DefaultFactory extends AbstractFactory {}

export interface Registry {}
export class MappingRegistry implements Registry {}

// From @ndigo/http
export interface HTTPInterceptor {}
export class MappedHTTPInterceptor implements HTTPInterceptor {}
export class MappedResponseClassHTTPInterceptor implements ResponseAwareHTTPInterceptor {}

export class HTTPAppender {}
export class HTTPLogRecordExporter {}

// From @ndigo/context
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
- **Enterprise-pattern alignment** - Leverages established conventions familiar to Java enterprise developers
- **Semantic Clarity** - `*Handler` processes, `*Resolver` locates, `*Factory` creates—no ambiguity
- **Autocomplete-Friendly** - Modern tooling makes specific, descriptive names effortless

**When in Doubt:**

1. Ask: "What is this component's PRIMARY responsibility?"
2. Choose the suffix that best matches that responsibility
3. If no standard suffix fits, consider if the class has too many responsibilities (SRP violation)

### 3.12. Properties vs Methods [CONVENTION: Code Review]

**Pattern:** Choose based on computation cost, side effects, and semantic meaning

JavaScript/TypeScript allows both properties (with getters) and methods. Ndigo favors properties for cheap, intrinsic data access, and methods for operations that involve external lookups, transformations, or potential failures.

This section provides clear guidelines on when to use each approach.

#### When to Use Properties

**Use properties when ALL of these conditions are met:**

- ✅ O(1) or trivial computation (simple field access, basic concatenation)
- ✅ No side effects (idempotent, safe to call multiple times)
- ✅ No external dependencies (doesn't query database, registry, file system)
- ✅ Always succeeds (never returns null for legitimate values)
- ✅ Feels like "what this object IS" (intrinsic attribute)

**Real Examples from Ndigo:**

```typescript
// From @ndigo/core/media-type.ts
class MediaType {
    // ✅ Correct: Properties for direct field access
    readonly type: SupportedMediaType; // Direct field
    readonly subtype: string; // Direct field
    readonly parameters: MediaTypeParameters; // Direct field

    // ✅ Correct: Properties for cheap computation
    get isWildcardType(): boolean {
        // Simple comparison
        return this.type === '*';
    }

    get isWildcardSubtype(): boolean {
        // Simple comparison
        return this.subtype === '*';
    }

    get qualityFactor(): number {
        // Parse from stored parameters
        return cond([
            [isString, parseFloat],
            [isNumber, identity],
            [T, alwaysOne],
        ])(this.parameters['q']) as number;
    }
}

// From @ndigo/http/response-status.ts
class ResponseStatus {
    // ✅ Correct: Properties for range checks
    get isInformationClass(): boolean {
        return 100 <= this.code && this.code <= 199;
    }

    get isSuccessClass(): boolean {
        return 200 <= this.code && this.code <= 299;
    }

    get isClientErrorClass(): boolean {
        return 400 <= this.code && this.code <= 499;
    }
}

// From @ndigo/dispatcher/route-condition.ts
class RouteCondition {
    // ✅ Correct: Properties for simple checks
    get isEmpty(): boolean {
        return this.conditions.length === 0;
    }

    get length(): number {
        return this.conditions.length;
    }

    get content(): RouteCondition[] {
        return this.conditions;
    }
}

// From @ndigo/core/collection.ts
class BoundedCollection {
    // ✅ Correct: Properties for collection state
    get capacity(): number {
        return this.#capacity;
    }

    get isEmpty(): boolean {
        return this.length === 0;
    }

    get isFull(): boolean {
        return this.length >= this.#capacity;
    }

    get length(): number {
        return this.items.length;
    }
}

// From @ndigo/factory/factory.ts
abstract class AbstractFactory {
    #parent: Factory;

    // ✅ Correct: Property for stored reference
    get parent(): Factory {
        return this.#parent;
    }
}
```

**Counter-Examples (What NOT to Do):**

```typescript
// ❌ Wrong: Method call wrapped in property
class BadMediaType {
    get extensions(): string[] {
        return this.getExtensions(); // Just call the method directly!
    }

    getExtensions(): string[] {
        return MIME_DB.get(this.baseType)?.extensions ?? [];
    }
}

// ❌ Wrong: External lookup as property (use get-method)
class BadMediaType {
    get defaultCharset(): string | null {
        // Queries external MIME database - use getDefaultCharset() method
        return MIME_DB.get(this.baseType)?.charset ?? null;
    }
}

// ❌ Wrong: Expensive computation as property
class BadRoute {
    get allPossiblePaths(): string[] {
        // Generates all combinations - expensive! Use method
        return this.generateAllPermutations();
    }
}

// ❌ Wrong: get* method for simple field access (use property)
class BadExample {
    #name: string;

    getName(): string {
        // Just use: get name()
        return this.#name;
    }
}
```

#### When to Use Get-Methods

**Use get-methods when ANY of these conditions are met:**

- ✅ Requires external data (database, registry, file system, network)
- ✅ May fail or return null for legitimate queries
- ✅ Non-trivial computation (O(n), recursive, expensive)
- ✅ Tristate return (true/false/null or success/failure/unknown)
- ✅ Feels like "fetching" or "retrieving"

**Real Examples from Ndigo:**

```typescript
// From @ndigo/factory/factory.ts
interface Factory {
    // ✅ Correct: get* for registry lookup (may fail)
    getInstance<T = any>(name: string): T;
}

interface ConfigurableFactory extends Factory {
    // ✅ Correct: get* for scope lookup
    getScope(name: string): Scope;
    getScopeNames(): string[];
}

// From @ndigo/context/property-resolver.ts
interface PropertyResolver {
    // ✅ Correct: get* for external property lookup
    getProperty(key: string, defaultValue?: JSONValue): JSONValue;
    getRequiredProperty(key: string): JSONValue; // May throw
}

class PrototypalPropertyResolver implements PropertyResolver {
    getProperty(key: string, defaultValue?: JSONValue): JSONValue {
        const parseResult = keypathExpression.run(key);
        if (!parseResult.isError) {
            const keypath = parseResult.result;
            return keypath ? (path(keypath, this.properties) ?? defaultValue) : defaultValue;
        }
        return defaultValue;
    }

    getRequiredProperty(key: string): JSONValue {
        const value = this.getProperty(key);
        if (typeof value === 'undefined') {
            throw new Error(`Required property "${key}" missing`);
        }
        return value;
    }
}

// From @ndigo/dispatcher/route-handler-mapping.ts
interface RouteHandlerMapping {
    // ✅ Correct: get* for handler lookup (may return null)
    getHandler(route: Route): RouteHandlerExecutionChain;
}

class AbstractRouteHandlerMapping {
    getHandler(route: Route): RouteHandlerExecutionChain {
        // Complex lookup logic with potential null return
    }

    getMappingsByPath(path: string): T[] {
        // Filters internal registry
    }

    getHandlerMethodsByMappingName(name: string): RouteHandlerMethod[] {
        // Queries internal mapping registry
    }
}

// From @ndigo/telemetry
class NdigoLoggerProvider {
    // ✅ Correct: get* for external SDK access
    getLogger(name: string, version?: string, options?: LoggerOptions): OTelLoggerAPI {
        // Creates/retrieves logger from external SDK
    }

    getSDKProvider(): SDKLoggerProvider {
        // Returns external OpenTelemetry SDK provider
    }

    getResource(): Resource {
        // Returns external OpenTelemetry resource
    }

    getProcessors(): LogRecordProcessor[] {
        // Returns registered processors
    }
}

// From @ndigo/context/event-logger.ts
class EventLogger {
    // ✅ Correct: get* that may return undefined
    getOTelLogger(): OTelLoggerAPI | undefined {
        // May return undefined if OpenTelemetry not initialized
    }
}

// Proposed for MediaType
class MediaType {
    // ✅ Correct: get* for external MIME database lookup
    getDefaultCharset(): string | null {
        // Queries MIME_DB - external data source
        return MIME_DB.get(this.baseType)?.charset ?? null;
    }

    // ✅ Correct: get* for tristate return
    getCompressibility(): boolean | null {
        // Returns true (compressible), false (not), null (unknown)
        const entry = MIME_DB.get(this.baseType);
        return entry?.compressible ?? null;
    }
}
```

**Why Get-Methods, Not Properties?**

```typescript
// ❌ Wrong: External lookup as property
get defaultCharset(): string | null {
    return MIME_DB.get(this.baseType)?.charset ?? null;
}

// ✅ Correct: External lookup as method
getDefaultCharset(): string | null {
    return MIME_DB.get(this.baseType)?.charset ?? null;
}

// Rationale:
// 1. Queries external data source (MIME_DB)
// 2. Returns null for unknown types (tristate: exists/doesn't exist/unknown)
// 3. Semantically feels like "retrieving" not "accessing"
// 4. Debuggers won't auto-evaluate methods (avoids side effects during debugging)
```

#### When to Use To-Methods

**Use to-methods when:**

- ✅ Transforms to a different format or representation
- ✅ Takes optional parameters to control transformation
- ✅ Creates a new representation (doesn't just access data)
- ✅ Feels like "converting to X"

**Real Examples from Ndigo:**

```typescript
// From @ndigo/core/media-type.ts
class MediaType implements Serializable {
    // ✅ Correct: to* for string representation
    toString(): string {
        const mediaTypeString =
            this.suffix === null ? `${this.type}/${this.subtype}` : `${this.type}/${this.subtype}+${this.suffix}`;
        const parameterString = stringifyParameters(this.parameters);
        return `${mediaTypeString}${parameterString}`;
    }

    // ✅ Correct: to* for JSON serialization
    toJSON(): JSONValue {
        return this.toString();
    }
}

// From @ndigo/http/response-status.ts
class ResponseStatus implements Serializable {
    toString(): string {
        return `${this.code} ${this.text}`;
    }

    toJSON(): JSONObject {
        return {
            code: this.code,
            text: this.text,
        };
    }
}

// From @ndigo/core/property-value.ts
class PropertyValue {
    toString(): string {
        return `PropertyValue(${this.name}=${this.value})`;
    }
}

// Proposed for MediaType
class MediaType {
    // ✅ Correct: to* with options for Content-Type header
    toContentType(options?: { autoCharset?: boolean }): string {
        const base = this.toString();
        if (options?.autoCharset && !this.parameters.charset) {
            const charset = this.getDefaultCharset();
            return charset ? `${base};charset=${charset}` : base;
        }
        return base;
    }
}
```

**To-Methods vs Properties:**

```typescript
// ✅ Correct: toString() is a method (standard protocol)
toString(): string {
    return this.serialize();
}

// ❌ Wrong: toString as property (breaks ecosystem expectations)
get toString(): string {
    return this.serialize();
}

// ✅ Correct: baseType is a property (cheap concat, no parameters)
get baseType(): string {
    return `${this.type}/${this.subtype}`;
}

// ✅ Correct: toContentType is a method (takes options)
toContentType(options?: ContentTypeOptions): string {
    // Complex transformation with options
}
```

#### Decision Matrix

| Use Case                    | Method Type | Rationale                        | Example                           |
| :-------------------------- | :---------- | :------------------------------- | :-------------------------------- |
| Stored field access         | Property    | O(1) lookup, no computation      | `mediaType.type`                  |
| Simple boolean check        | Property    | Trivial comparison               | `mediaType.isWildcardType`        |
| Cheap concatenation         | Property    | String template, no side effects | `mediaType.baseType`              |
| Range check                 | Property    | Simple arithmetic                | `responseStatus.isSuccessClass`   |
| Array length                | Property    | Direct field access              | `collection.length`               |
| External DB lookup          | Get-method  | Queries external source          | `getDefaultCharset()`             |
| May return null             | Get-method  | Tristate/optional return         | `getCompressibility()`            |
| Registry lookup             | Get-method  | May fail, external data          | `factory.getInstance(name)`       |
| File system access          | Get-method  | I/O operation                    | `resource.getResource(path)`      |
| SDK access                  | Get-method  | External library                 | `logger.getSDKProvider()`         |
| String serialization        | To-method   | Protocol method (toString)       | `toString()`                      |
| Format transformation       | To-method   | Creates new representation       | `toJSON()`                        |
| Transformation with options | To-method   | Parameterized conversion         | `toContentType(options)`          |
| Parser invocation           | Get-method  | May fail, computational          | `getProperty(key, defaultValue?)` |

#### Edge Cases

**Tristate Returns (true/false/null):**

```typescript
// ✅ Correct: Get-method for tristate boolean
getCompressibility(): boolean | null {
    // true = compressible, false = not compressible, null = unknown
    return MIME_DB.get(this.baseType)?.compressible ?? null;
}

// ❌ Wrong: Property for tristate (suggests simple access)
get compressibility(): boolean | null {
    return MIME_DB.get(this.baseType)?.compressible ?? null;
}
```

**Boolean Properties (is/has prefix):**

```typescript
// ✅ Correct: Boolean properties use is/has prefix
get isWildcardType(): boolean {
    return this.type === '*';
}

get hasParameters(): boolean {
    return Object.keys(this.parameters).length > 0;
}

get isEmpty(): boolean {
    return this.length === 0;
}

// From @ndigo/dispatcher/model-and-view.ts
get hasView(): boolean {
    return this.view != null;
}
```

**Property That Calls Method (Usually Wrong):**

```typescript
// ❌ Anti-pattern: Property wrapping method call
get extensions(): string[] {
    return this.getExtensions(); // Why have both?
}

getExtensions(): string[] {
    return MIME_DB.get(this.baseType)?.extensions ?? [];
}

// ✅ Correct: Choose one based on semantics
// If it's intrinsic and cheap → property only
get extensions(): string[] {
    return MIME_DB.get(this.baseType)?.extensions ?? [];
}

// OR if it's external lookup → method only
getExtensions(): string[] {
    return MIME_DB.get(this.baseType)?.extensions ?? [];
}
```

**Getter/Setter Pairs:**

```typescript
// ✅ Correct: Getter/setter for field access
class PrototypalPropertyResolver {
    #propertySources: JSONObject[];

    get propertySources(): JSONObject[] {
        return this.#propertySources;
    }

    set propertySources(propertySources: JSONObject[]) {
        this.#propertySources = propertySources;
        // Additional logic to update internal state
    }
}

// ❌ Wrong: get* method with set* method for simple field
class BadExample {
    #name: string;

    getName(): string {
        // Should be: get name()
        return this.#name;
    }

    setName(name: string): void {
        // Should be: set name()
        this.#name = name;
    }
}
```

#### Complete Example: MediaType (Current + Proposed API)

```typescript
class MediaType {
    // STORED FIELDS (direct access)
    readonly type: SupportedMediaType;
    readonly subtype: string;
    readonly parameters: MediaTypeParameters;

    // PROPERTIES (cheap, intrinsic)
    get isWildcardType(): boolean {
        return this.type === '*';
    }

    get isWildcardSubtype(): boolean {
        return this.subtype === '*';
    }

    get qualityFactor(): number {
        return parseFloat(this.parameters['q'] ?? '1.0');
    }

    // Proposed: Simple concatenation
    get baseType(): string {
        return `${this.type}/${this.subtype}`;
    }

    // Proposed: Static map lookup (O(1))
    get extensions(): string[] {
        return MIME_DB.get(this.baseType)?.extensions ?? [];
    }

    get defaultExtension(): string | null {
        return this.extensions[0] ?? null;
    }

    // GET-METHODS (external data, may fail)
    // Proposed: External MIME database lookup
    getDefaultCharset(): string | null {
        return MIME_DB.get(this.baseType)?.charset ?? null;
    }

    // Proposed: Tristate return
    getCompressibility(): boolean | null {
        const entry = MIME_DB.get(this.baseType);
        return entry?.compressible ?? null;
    }

    // TO-METHODS (transformation, serialization)
    toString(): string {
        const base = this.suffix ? `${this.type}/${this.subtype}+${this.suffix}` : `${this.type}/${this.subtype}`;
        const params = stringifyParameters(this.parameters);
        return `${base}${params}`;
    }

    toJSON(): JSONValue {
        return this.toString();
    }

    // Proposed: Transformation with options
    toContentType(options?: { autoCharset?: boolean }): string {
        const base = this.toString();
        if (options?.autoCharset && !this.parameters.charset) {
            const charset = this.getDefaultCharset();
            return charset ? `${base};charset=${charset}` : base;
        }
        return base;
    }
}
```

#### Rationale

**Why This Matters:**

1. **Consistency** - Predictable API surface for consumers
2. **Performance Expectations** - Properties signal "cheap," methods signal "may be expensive"
3. **Side Effects** - Properties should be safe to call anytime, methods may have side effects
4. **Debugging** - Debuggers treat properties and methods differently (auto-evaluation)
5. **API Design** - Clear semantic meaning improves developer experience

**Influenced By:**

- JavaScript ecosystem conventions (Array.length, String.length, Map.size)
- Java Bean conventions (getters for properties, methods for operations)
- TypeScript guidance (properties for data access, methods for operations)
- Enterprise patterns (get\* methods for external lookups)

#### When in Doubt

Ask yourself:

1. **Is it cheap?** (O(1), no I/O) → Property
2. **Is it intrinsic?** (part of what the object IS) → Property
3. **Does it query external data?** → Get-method
4. **Can it fail or return null?** → Get-method
5. **Does it transform to another format?** → To-method
6. **Does it take parameters?** → Method (get-method or to-method)

If still unsure, **prefer a method** - it's safer and more flexible for future changes.

### 3.13. Method Naming Conventions [CONVENTION: Code Review]

**Pattern:** Use conventional prefixes to signal method behavior and return expectations

Method names should clearly communicate their purpose, behavior, and expected return values. Ndigo uses standardized prefixes inspired by JavaBeans, Java enterprise, and JavaScript ecosystem conventions.

This section establishes clear rules for method naming across the entire codebase.

#### Accessor Prefixes

**Methods that retrieve or check values without mutation:**

| Prefix  | Meaning                       | Returns              | Side Effects | May Fail          | Examples                                               |
| :------ | :---------------------------- | :------------------- | :----------- | :---------------- | :----------------------------------------------------- |
| `get*`  | Retrieves/fetches value       | Value or null/undef  | None         | Yes (may be null) | `getHandler()`, `getInstance()`, `getDefaultCharset()` |
| `is*`   | Type/state check              | boolean              | None         | No                | `isValid()`, `isString()`, `isWildcardType()`          |
| `has*`  | Presence/ownership check      | boolean              | None         | No                | `hasProperty()`, `hasView()`, `hasOwnValue()`          |
| `like*` | Duck-typing check (structural | boolean (type guard) | None         | No                | `likeArray()`, `likePromise()`, `likeReduced()`        |

##### get\* - Retrieval/Fetching

**Use when:** Retrieving values from external sources, registries, or performing lookups that may fail

```typescript
// From @ndigo/factory/factory.ts
interface Factory {
    // ✅ Correct: get* for registry lookup (may return null)
    getInstance<T = any>(name: string): T;
}

interface ConfigurableFactory extends Factory {
    // ✅ Correct: get* for scope lookup
    getScope(name: string): Scope;
    getScopeNames(): string[];
}

// From @ndigo/context/property-resolver.ts
interface PropertyResolver {
    // ✅ Correct: get* for external property lookup
    getProperty(key: string, defaultValue?: JSONValue): JSONValue;
    getRequiredProperty(key: string): JSONValue; // May throw
}

class PrototypalPropertyResolver implements PropertyResolver {
    getProperty(key: string, defaultValue?: JSONValue): JSONValue {
        const parseResult = keypathExpression.run(key);
        if (!parseResult.isError) {
            const keypath = parseResult.result;
            return keypath ? (path(keypath, this.properties) ?? defaultValue) : defaultValue;
        }
        return defaultValue;
    }

    getRequiredProperty(key: string): JSONValue {
        const value = this.getProperty(key);
        if (typeof value === 'undefined') {
            throw new Error(`Required property "${key}" missing`);
        }
        return value;
    }
}

// From @ndigo/dispatcher/route-handler-mapping.ts
class AbstractRouteHandlerMapping {
    // ✅ Correct: get* for complex lookups
    getHandler(route: Route): RouteHandlerExecutionChain {
        // Complex lookup logic with potential null return
    }

    getMappingsByPath(path: string): T[] {
        // Filters internal registry
    }

    getHandlerMethodsByMappingName(name: string): RouteHandlerMethod[] {
        // Queries internal mapping registry
    }

    getHandlerMethods(): Map<T, RouteHandlerMethod> {
        // Returns all registered handlers
    }
}

// From @ndigo/telemetry
class NdigoLoggerProvider {
    // ✅ Correct: get* for external SDK access
    getLogger(name: string, version?: string, options?: LoggerOptions): OTelLoggerAPI {
        // Creates/retrieves logger from external SDK
    }

    getSDKProvider(): SDKLoggerProvider {
        // Returns external OpenTelemetry SDK provider
    }

    getResource(): Resource {
        // Returns external OpenTelemetry resource
    }

    getProcessors(): LogRecordProcessor[] {
        // Returns registered processors
    }
}

// From @ndigo/context/event-logger.ts
class EventLogger {
    // ✅ Correct: get* that may return undefined
    getOTelLogger(): OTelLoggerAPI | undefined {
        // May return undefined if OpenTelemetry not initialized
    }
}

// From @ndigo/view/content-negotiation-view-resolver.ts
class ContentNegotiationViewResolver {
    // ✅ Correct: get* for collecting from multiple sources
    getAllFileExtenstions(): string[] {
        // Aggregates extensions from all resolvers
    }

    getMediaTypes(request: any): MediaType[] {
        // Extracts media types from request
    }
}

// Proposed for MediaType
class MediaType {
    // ✅ Correct: get* for external MIME database lookup
    getDefaultCharset(): string | null {
        return MIME_DB.get(this.baseType)?.charset ?? null;
    }

    getCompressibility(): boolean | null {
        const entry = MIME_DB.get(this.baseType);
        return entry?.compressible ?? null;
    }
}

// ❌ Wrong: get* for simple field access (use property)
class BadExample {
    #name: string;

    getName(): string {
        // Just use: get name()
        return this.#name;
    }
}
```

##### is\* - Type/State Checks

**Use when:** Checking types with typeof/instanceof or checking boolean state

```typescript
// From @ndigo/util/types.ts
// ✅ Correct: is* for type checks
function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !Number.isNaN(value);
}

function isConstructor(value: unknown): value is Constructor {
    return typeof value === 'function' && value.prototype !== undefined;
}

function isFunction(value: unknown): value is Function {
    return typeof value === 'function';
}

function isPrimitive(value: unknown): boolean {
    return value == null || typeof value !== 'object';
}

// isValidDate-style predicates live in @ndigo/util (date utilities)
function isValidDate(value: temporal, format: string): boolean {
    return !isNaN(Date.parse(value));
}

// ✅ Correct: is* for boolean state checks (as properties)
class MediaType {
    get isWildcardType(): boolean {
        return this.type === '*';
    }

    get isWildcardSubtype(): boolean {
        return this.subtype === '*';
    }
}

class ResponseStatus {
    get isInformationClass(): boolean {
        return this.code >= 100 && this.code < 200;
    }

    get isSuccessClass(): boolean {
        return this.code >= 200 && this.code < 300;
    }

    get isClientErrorClass(): boolean {
        return this.code >= 400 && this.code < 500;
    }
}

// ❌ Wrong: is* that returns null (use get*)
function isCompressible(mediaType: MediaType): boolean | null {
    // Should be: getCompressibility()
    return mediaType.getCompressibility();
}
```

##### has\* - Presence/Ownership Checks

**Use when:** Checking for presence of properties, items, or capabilities

```typescript
// From @ndigo/context/property-resolver.ts
interface PropertyResolver {
    // ✅ Correct: has* for presence check
    hasProperty(key: string): boolean;
}

class PrototypalPropertyResolver implements PropertyResolver {
    hasProperty(key: string): boolean {
        const parseResult = keypathExpression.run(key);
        if (!parseResult.isError) {
            const keypath = parseResult.result;
            return keypath ? pathIsDefined(keypath, this.properties) : false;
        }
        return false;
    }
}

// From @ndigo/factory/factory.ts
interface HierarchicalFactory extends Factory {
    // ✅ Correct: has* for ownership check
    hasOwnValue(name: string): boolean;
}

// From @ndigo/dispatcher/model-and-view.ts
class ModelAndView {
    // ✅ Correct: has* as property for simple check
    get hasView(): boolean {
        return this.view != null;
    }
}

// From @ndigo/core/media-type.ts (proposed)
class MediaType {
    // ✅ Correct: has* for parameter presence
    get hasParameters(): boolean {
        return Object.keys(this.parameters).length > 0;
    }

    hasParameter(name: string): boolean {
        return name in this.parameters;
    }
}

// Standard JavaScript examples
class Map<K, V> {
    has(key: K): boolean; // Built-in JavaScript
}

class Set<T> {
    has(value: T): boolean; // Built-in JavaScript
}
```

##### like\* - Duck-Typing Checks

**Use when:** Checking structural compatibility without typeof/instanceof

```typescript
// From @ndigo/core
// ✅ Correct: like* for duck typing
function likeArray(value: unknown): value is ArrayLike<any> {
    return value != null && typeof value === 'object' && 'length' in value;
}

function likePromise(value: unknown): value is PromiseLike<any> {
    return value != null && typeof (value as any).then === 'function';
}

// From @ndigo/dispatcher
function likeController(value: unknown): value is ControllerLike {
    return (
        value != null && typeof value === 'object' && 'handle' in value && typeof (value as any).handle === 'function'
    );
}

// From @ndigo/factory
const likeFactory = like({ getInstance: Function }) as (value) => value is Factory;

const likeFactoryAware = likeAwareAnd(like({ setFactory: Function })) as (value) => value is FactoryAware;

const likeHierarchicalFactory = both(likeFactory, like({ parent: true, hasOwnValue: Function }));

// From @ndigo/http
function likeResponse(value: unknown): value is Response {
    return value != null && typeof value === 'object' && 'status' in value && 'statusText' in value;
}
```

#### Mutation Prefixes

**Methods that modify state:**

| Prefix    | Meaning                 | Returns        | Side Effects   | Examples                                       |
| :-------- | :---------------------- | :------------- | :------------- | :--------------------------------------------- |
| `set*`    | Sets value              | void or this   | Mutates object | `setProperty()`, `setFactory()`, `setParent()` |
| `add*`    | Adds to collection      | void or this   | Mutates        | `add()`, `addProcessor()`, `addListener()`     |
| `remove*` | Removes from collection | boolean / this | Mutates        | `remove()`, `removeListener()`                 |
| `clear*`  | Empties collection      | void           | Mutates        | `clear()`, `clearCache()`                      |
| `update*` | Modifies existing value | void or this   | Mutates        | `updateProperty()`, `updateStatus()`           |
| `delete*` | Removes/destroys        | boolean        | Mutates        | `delete()`, `deleteEntry()`                    |

**Examples:**

```typescript
// From @ndigo/factory/aware.ts
interface FactoryAware extends Aware {
    // ✅ Correct: set* for mutating reference
    setFactory(factory: Factory): void;
}

// From @ndigo/factory/factory.ts
interface ConfigurableFactory extends Factory {
    // ✅ Correct: set* for parent assignment
    setParent(parent: Factory): void;

    // ✅ Correct: add* for collection mutation
    addProcessor(processor: EntryProcessor): void;
}

abstract class AbstractFactory implements ConfigurableFactory {
    #parent: Factory;

    setParent(parent: Factory): void {
        this.#parent = parent;
    }

    addProcessor(processor: EntryProcessor): void {
        const index = this.processors.indexOf(processor);
        if (index !== -1) {
            this.processors.splice(index, 1);
        }
        this.processors.push(processor);
    }
}

// From @ndigo/core/data-binder.ts
class DataBinder {
    #requiredFields: Set<string>;

    // ✅ Correct: Getter/setter pair for field with validation
    get requiredFields(): string[] {
        if (!this.#requiredFields) {
            this.#requiredFields = new Set<string>();
        }
        return [...this.#requiredFields];
    }

    set requiredFields(fields: string[]) {
        this.#requiredFields = new Set<string>();
        if (fields?.length) {
            for (let index = 0; index < fields.length; index++) {
                this.#requiredFields.add(fields[index]);
            }
        }
    }
}

// From @ndigo/factory/registry.ts
interface Registry {
    // ✅ Correct: Mutation methods
    set(name: string, value: any): void;
    delete(name: string): boolean;
    clear(): void;
}

// ✅ Correct: Fluent API (return this)
class Builder {
    #name: string;
    #properties: Map<string, any>;

    setName(name: string): this {
        this.#name = name;
        return this;
    }

    addProperty(key: string, value: any): this {
        this.#properties.set(key, value);
        return this;
    }

    build(): Product {
        return new Product(this.#name, this.#properties);
    }
}

// ❌ Wrong: set* that doesn't mutate (use with*)
class BadMediaType {
    setCharset(charset: string): MediaType {
        // Returns new instance - should be withCharset()
        return new MediaType(this.type, this.subtype, { charset });
    }
}

// ✅ Correct: with* for immutable updates
class MediaType {
    withCharset(charset: string): MediaType {
        return new MediaType(this.type, this.subtype, {
            ...this.parameters,
            charset,
        });
    }
}
```

#### Factory/Creation Prefixes

**Methods that create new instances:**

| Prefix    | Meaning                    | Returns            | Parameters    | Examples                                     |
| :-------- | :------------------------- | :----------------- | :------------ | :------------------------------------------- |
| `create*` | Creates new instance       | New object         | Configuration | `create()`, `createBlob()`, `createLogger()` |
| `from*`   | Parses/converts from input | New object or null | Source data   | `fromExtension()`, `fromRequest()`, `from()` |
| `parse*`  | Parses string to object    | Object or throws   | String input  | `parse()`, `parseInt()`, `parseFloat()`      |
| `of*`     | Factory with varargs       | New object         | Variable args | `of()`, `Array.of()`, `Promise.of()`         |
| `make*`   | Alternative to create      | New object         | Configuration | `make()`, `makeHandler()`                    |

**Examples:**

```typescript
// From @ndigo/core/media-type.ts
class MediaType {
    // ✅ Correct: Static factory method
    static for(mediaType: string): MediaType;
    static for(type: SupportedMediaType, subtype: string, parameters?: MediaTypeParameters): MediaType;
    static for(
        typeOrExpression: SupportedMediaType | string,
        subtype?: string,
        parameters?: MediaTypeParameters
    ): MediaType {
        // Factory logic with singleton registry
    }

    // ✅ Correct: create* for instance creation
    createBlob(data?: BlobPart[], endings: EndingType = 'transparent'): Blob {
        return new Blob(data, {
            type: this.toString(),
            endings: endings,
        });
    }
}

// Proposed for MediaType
class MediaType {
    // ✅ Correct: from* for conversions/parsing (may return null)
    static fromExtension(ext: string): MediaType | null {
        const entry = MIME_DB.findByExtension(ext);
        return entry ? MediaType.for(entry.type) : null;
    }

    static fromFilePath(path: string): MediaType | null {
        const ext = path.split('.').pop();
        return this.fromExtension(ext);
    }

    static fromRequest(request: Request): MediaType | null {
        const contentType = request.headers.get('Content-Type');
        return contentType ? MediaType.for(contentType) : null;
    }

    static fromResponse(response: Response): MediaType | null {
        const contentType = response.headers.get('Content-Type');
        return contentType ? MediaType.for(contentType) : null;
    }
}

// From @ndigo/http/response-status.ts
class ResponseStatus {
    // ✅ Correct: Static factory (overloaded)
    static for(response: Response): ResponseStatus;
    static for(code: number, text?: string): ResponseStatus;
    static for(codeOrResponse: number | Response, text?: string): ResponseStatus {
        // Factory with singleton registry
    }
}

// Native — Object.fromEntries replaces any pair-building helper
const pairs: [string, number][] = [
    ['a', 1],
    ['b', 2],
];
const obj = Object.fromEntries(pairs); // { a: 1, b: 2 }

// ✅ Correct: parse* for string parsing (may throw)
class MediaType {
    static parse(mediaTypeString: string): MediaType {
        if (!mediaTypeString) {
            throw new Error('Invalid media type');
        }
        return MediaType.for(mediaTypeString);
    }
}

// Standard JavaScript examples
const num = parseInt('42', 10);
const float = parseFloat('3.14');
const date = Date.parse('2025-01-01');
const json = JSON.parse('{"key":"value"}');

// ✅ Correct: of* for varargs factories
class MediaType {
    static of(type: string, subtype: string, ...parameters: [string, string][]): MediaType {
        const params = fromPairs(parameters);
        return MediaType.for(type, subtype, params);
    }
}

// Standard JavaScript
const arr = Array.of(1, 2, 3); // [1, 2, 3]
const promise = Promise.resolve(42);
```

#### Transformation Prefixes

**Methods that convert between formats:**

| Prefix       | Meaning                                                                                  | Returns               | Parameters         | Examples                                            |
| :----------- | :--------------------------------------------------------------------------------------- | :-------------------- | :----------------- | :-------------------------------------------------- |
| `to*`        | Converts to format                                                                       | String or object      | Often accepts opts | `toString()`, `toJSON()`, `toContentType()`         |
| `format*`    | Formats to string                                                                        | String                | May accept format  | `format()`, `formatDate()`                          |
| `convert*`   | Bidirectional conversion                                                                 | Converted value       | None               | `convert()`, `convertToUTC()`                       |
| `with*`      | Creates copy with change                                                                 | New instance (immut)  | New value          | `withCharset()`, `withParameter()`                  |
| `parse*`     | Deserializes a string into a structured value; returns `null` or throws on invalid input | Typed value or `null` | String input       | `parseKeypath()`, `parseWildcard()`, `JSON.parse()` |
| `stringify*` | Serializes a value to its string representation                                          | String                | Value to serialize | `JSON.stringify()`, `stringifyParameters()`         |

**Examples:**

```typescript
// From @ndigo/core/media-type.ts
class MediaType implements Serializable {
    // ✅ Correct: to* for string representation
    toString(): string {
        const mediaTypeString =
            this.suffix === null ? `${this.type}/${this.subtype}` : `${this.type}/${this.subtype}+${this.suffix}`;
        const parameterString = stringifyParameters(this.parameters);
        return `${mediaTypeString}${parameterString}`;
    }

    // ✅ Correct: to* for JSON serialization
    toJSON(): JSONValue {
        return this.toString();
    }

    // ✅ Correct: with* for immutable updates
    withCharset(charset: string): MediaType {
        return new MediaType(this.type, this.subtype, {
            ...this.parameters,
            charset,
        });
    }
}

// Proposed for MediaType
class MediaType {
    // ✅ Correct: to* with options for transformation
    toContentType(options?: { autoCharset?: boolean }): string {
        const base = this.toString();
        if (options?.autoCharset && !this.parameters.charset) {
            const charset = this.getDefaultCharset();
            return charset ? `${base};charset=${charset}` : base;
        }
        return base;
    }

    // ✅ Correct: with* for immutable parameter updates
    withParameter(key: string, value: string): MediaType {
        return new MediaType(this.type, this.subtype, {
            ...this.parameters,
            [key]: value,
        });
    }
}

// From @ndigo/http/response-status.ts
class ResponseStatus implements Serializable {
    toString(): string {
        return `${this.code} ${this.text}`;
    }

    toJSON(): JSONObject {
        return {
            code: this.code,
            text: this.text,
        };
    }
}

// From @ndigo/core/property-value.ts
class PropertyValue {
    toString(): string {
        return `PropertyValue(${this.name}=${this.value})`;
    }
}

// From @ndigo/core — parse* for string deserialization
// parse* functions return the result directly or null on failure (never a discriminated union)
function parseWildcard(pattern: string): string {
    // Always succeeds — any string is a valid wildcard
    return `^${pattern.replace(/\*/g, '.*?')}$`;
}

function parseKeypath(input: string): KeypathToken[] | null {
    // Returns null for invalid input rather than throwing
    // (callers treat an unparseable keypath as "no match" rather than an error)
    // ...
}

// ❌ Wrong: parse* that returns a discriminated union (use T | null instead)
// function parseKeypath(input: string): { isError: false; result: KeypathToken[] } | { isError: true; error: string }
// Unnecessarily complex — callers check `if (keypath)` not `if (!result.isError)`

// ✅ parse* functions align with the Converter<string, T> type alias from @ndigo/core
import type { Converter } from '@ndigo/core';
const parseWildcard: Converter<string, string> = (pattern) => `^${pattern.replace(/\*/g, '.*?')}$`;

// Real JavaScript examples
const arr = [1, 2, 3];
arr.toString(); // "1,2,3"

const obj = { name: 'Alice' };
JSON.stringify(obj); // '{"name":"Alice"}'

const date = new Date();
date.toISOString(); // "2025-02-07T12:00:00.000Z"
date.toLocaleDateString(); // "2/7/2025"

// ❌ Wrong: with* that mutates (use set*)
class BadBuilder {
    withName(name: string): this {
        this.#name = name; // Mutates! Should be setName()
        return this;
    }
}
```

#### Special Patterns

##### Async Methods

**Pattern 1: Prefix with `async`** (preferred for new code)

```typescript
// ✅ Correct: async prefix for async operations
async function asyncLoadResource(path: string): Promise<Resource> {
    const response = await fetch(path);
    return response.json();
}

class ResourceLoader {
    async asyncLoad(path: string): Promise<Resource> {
        return await fetch(path).then((r) => r.json());
    }
}
```

**Pattern 2: Return Promise** (acceptable in established code)

```typescript
// ✅ Acceptable: Async implied by Promise return
class ResourceLoader {
    load(path: string): Promise<Resource> {
        return fetch(path).then((r) => r.json());
    }
}

// From @ndigo/context/resource.ts
interface ResourceLoader {
    getResource(location: string): Promise<Resource>;
}
```

##### Stream/Observable Methods

**Pattern: `*Async` suffix or return Observable**

```typescript
// ✅ Correct: *Async suffix for streams
class EventStream {
    watchAsync(): Observable<Event> {
        return new Observable((observer) => {
            // Stream events
        });
    }
}

// ✅ Acceptable: Implied by return type
class EventStream {
    watch(): Observable<Event> {
        return new Observable((observer) => {
            // Stream events
        });
    }
}
```

##### Predicate Methods

**Pattern: Always return boolean (or type guard)**

```typescript
// ✅ Correct: Predicates return boolean
function isValid(value: unknown): boolean {
    return value != null;
}

// ✅ Correct: Type guard predicates
function isString(value: unknown): value is string {
    return typeof value === 'string';
}

// ❌ Wrong: Predicate returns tristate
function isCompressible(type: MediaType): boolean | null {
    // Should be: getCompressibility()
    return type.getCompressibility();
}
```

##### Mutator Methods

**Pattern: Return void or this (for chaining)**

```typescript
// ✅ Correct: Mutator returns void
class Registry {
    set(name: string, value: any): void {
        this.entries.set(name, value);
    }

    clear(): void {
        this.entries.clear();
    }
}

// ✅ Correct: Mutator returns this (fluent API)
class Builder {
    #name: string;
    #properties: Map<string, any>;

    setName(name: string): this {
        this.#name = name;
        return this;
    }

    addProperty(key: string, value: any): this {
        this.#properties.set(key, value);
        return this;
    }

    build(): Product {
        return new Product(this.#name, this.#properties);
    }
}

// Usage
const product = new Builder().setName('Widget').addProperty('color', 'blue').addProperty('size', 'large').build();
```

#### Anti-Patterns

##### get\* for Simple Field Access

```typescript
// ❌ Wrong: get* method for simple field access
class BadExample {
    #name: string;

    getName(): string {
        return this.#name;
    }
}

// ✅ Correct: Property for simple field access
class GoodExample {
    #name: string;

    get name(): string {
        return this.#name;
    }
}
```

##### set\* That Doesn't Mutate

```typescript
// ❌ Wrong: set* that returns new instance
class BadMediaType {
    setCharset(charset: string): MediaType {
        // Returns new instance - not mutating!
        return new MediaType(this.type, this.subtype, { charset });
    }
}

// ✅ Correct: with* for immutable updates
class GoodMediaType {
    withCharset(charset: string): MediaType {
        return new MediaType(this.type, this.subtype, {
            ...this.parameters,
            charset,
        });
    }
}
```

##### is\* That Returns Null

```typescript
// ❌ Wrong: is* returns tristate
function isCompressible(type: MediaType): boolean | null {
    return type.getCompressibility();
}

// ✅ Correct: get* for tristate returns
function getCompressibility(type: MediaType): boolean | null {
    return MIME_DB.get(type.baseType)?.compressible ?? null;
}
```

##### to\* That Doesn't Transform

```typescript
// ❌ Wrong: to* that just accesses data
class BadMediaType {
    toBaseType(): string {
        // Just accessing/concatenating - should be property
        return `${this.type}/${this.subtype}`;
    }
}

// ✅ Correct: Property for simple access
class GoodMediaType {
    get baseType(): string {
        return `${this.type}/${this.subtype}`;
    }
}
```

#### Complete Reference Table

| Prefix    | Use Case               | Returns              | Side Effects | May Fail | Example              |
| :-------- | :--------------------- | :------------------- | :----------- | :------- | :------------------- |
| `get*`    | Retrieve from external | Value or null        | None         | Yes      | `getHandler(route)`  |
| `is*`     | Type/state check       | boolean              | None         | No       | `isWildcardType()`   |
| `has*`    | Presence check         | boolean              | None         | No       | `hasProperty(key)`   |
| `like*`   | Duck-typing check      | boolean (type guard) | None         | No       | `likeArray(value)`   |
| `set*`    | Mutate value           | void or this         | Mutates      | No       | `setProperty(k, v)`  |
| `add*`    | Add to collection      | void or this         | Mutates      | No       | `addProcessor(p)`    |
| `remove*` | Remove from collection | boolean or this      | Mutates      | No       | `removeListener(fn)` |
| `clear*`  | Empty collection       | void                 | Mutates      | No       | `clearCache()`       |
| `update*` | Modify existing        | void or this         | Mutates      | No       | `updateStatus(s)`    |
| `delete*` | Remove/destroy         | boolean              | Mutates      | No       | `deleteEntry(k)`     |
| `create*` | Create instance        | New object           | None         | No       | `createBlob(data)`   |
| `from*`   | Parse/convert from     | Object or null       | None         | Yes      | `fromExtension(ext)` |
| `parse*`  | Parse string           | Object or throws     | None         | Yes      | `parse(str)`         |
| `of*`     | Varargs factory        | New object           | None         | No       | `of(...args)`        |
| `to*`     | Transform to format    | String/object        | None         | No       | `toString()`         |
| `format*` | Format to string       | String               | None         | No       | `formatDate(d)`      |
| `with*`   | Immutable update       | New instance         | None         | No       | `withCharset(cs)`    |

#### Rationale

**Why This Matters:**

1. **Predictability** - Developers instantly understand method behavior from name
2. **Consistency** - Same patterns across entire codebase
3. **API Design** - Clear contracts between callers and implementations
4. **Ecosystem Alignment** - Follows JavaScript/TypeScript/Java conventions
5. **Tooling Support** - IDEs can provide better autocomplete and suggestions

**Influenced By:**

- JavaBeans naming conventions (get\*, set\*, is\*)
- Enterprise patterns (get\* for external lookups)
- JavaScript standard library (Array.from, Array.of, toString, toJSON)
- TypeScript type guard conventions (is\* predicates)
- Functional programming (from\*, to\* transformations)
- Immutable data structures (with\* for copies)

#### When in Doubt

Ask yourself:

1. **Does it retrieve from external source?** → `get*`
2. **Does it check type or state?** → `is*` or `has*`
3. **Does it mutate the object?** → `set*`, `add*`, `remove*`
4. **Does it create new instance?** → `create*`, `from*`, `of*`
5. **Does it transform to different format?** → `to*`, `format*`
6. **Does it return new immutable copy?** → `with*`

If still unsure, **check similar methods in the codebase** for established patterns.

---

### 3.14. Type-Safe Enums [CONVENTION: Code Review]

**Pattern:** `PascalCase` for class names, `UPPER_SNAKE_CASE` for enum constants

Type-safe enums use classes to create enumeration constants with enhanced capabilities beyond built-in TypeScript enums. This pattern provides methods, inheritance, factory functions, and full serialization control.

**See also:** [Type-Safe Enums](#314-type-safe-enums-convention-code-review) — the pattern's home in this guide.

#### Class Naming

Type-safe enum classes follow standard class naming conventions:

```typescript
// ✅ Correct: PascalCase for enum class
export class MethodParameterType {
    /* ... */
}
export class Level {
    /* ... */
}
export class SyslogLevel extends Level {
    /* ... */
}
export class ResponseStatus {
    /* ... */
}

// ❌ Wrong: Other casings
export class methodParameterType {
    /* ... */
} // Wrong: camelCase
export class method_parameter_type {
    /* ... */
} // Wrong: snake_case
export class METHODPARAMETERTYPE {
    /* ... */
} // Wrong: all caps
```

**Rationale:** Enum classes are classes and should follow standard PascalCase convention.

#### Static Constant Naming

Enum constant values use `UPPER_SNAKE_CASE` to match built-in enum conventions:

```typescript
// ✅ Correct: UPPER_SNAKE_CASE for enum constants
class Level {
    static OFF = new Level('off', 0);
    static ALL = new Level('all', Number.MAX_VALUE);
}

class MethodParameterType {
    static COOKIE = new MethodParameterType('cookie:value');
    static MATRIX = new MethodParameterType('matrix:value');
    static QUERY = new MethodParameterType('query:value');
}

class ResponseStatus {
    static OK = ResponseStatus.for(200, 'OK');
    static NOT_FOUND = ResponseStatus.for(404, 'Not Found');
    static INTERNAL_SERVER_ERROR = ResponseStatus.for(500, 'Internal Server Error');
}

// ❌ Wrong: Other casings
static cookie = new MethodParameterType('cookie');  // Wrong: camelCase
static Cookie = new MethodParameterType('cookie');  // Wrong: PascalCase
static COOKIE_VALUE = new MethodParameterType('cookie');  // Redundant suffix
```

**Rationale:** Matches built-in enum constant naming and clearly distinguishes constants from methods.

#### Implementation Patterns

**Inline Assignment (Recommended):**

Modern ES2022+ style with inline static initialization:

```typescript
export class Level implements Comparable<Level>, Serializable {
    static OFF = new Level('off', 0);
    static ALL = new Level('all', Number.MAX_VALUE);

    readonly name: string;
    readonly value: number;

    get [Symbol.toStringTag](): string {
        return `Level:${this.name}`;
    }

    constructor(name: string, value: number) {
        Reflect.defineProperty(this, 'name', {
            value: name,
            writable: false,
            enumerable: false,
            configurable: true,
        });
        Reflect.defineProperty(this, 'value', {
            value: value,
            writable: false,
            enumerable: false,
            configurable: true,
        });
    }

    compareTo(other: Level): number {
        return this.value - other.value;
    }

    toJSON(): string {
        return this.name;
    }

    toString(): string {
        return this.name;
    }
}
```

**Post-Class Assignment (Alternative):**

Traditional style with forward declaration and post-class initialization:

```typescript
export class MethodParameterType implements Equatable, Serializable {
    static COOKIE: MethodParameterType;
    static QUERY: MethodParameterType;

    readonly type: string;

    get [Symbol.toStringTag](): string {
        return `MethodParameterType:${this.type}`;
    }

    constructor(type: string) {
        Reflect.defineProperty(this, 'type', {
            value: type,
            writable: false,
            enumerable: false,
            configurable: true,
        });
    }

    equals(other: any): boolean {
        return other instanceof MethodParameterType && other.type === this.type;
    }

    toJSON(): string {
        return this.type;
    }

    toString(): string {
        return this.type;
    }
}

// Post-class assignment
MethodParameterType.COOKIE = new MethodParameterType('cookie:value');
MethodParameterType.QUERY = new MethodParameterType('query:value');
```

**Preference:** Use inline assignment for new code. Both styles are acceptable.

#### Required Methods

All type-safe enums should implement these core methods:

**Equality Check (Equatable):**

```typescript
equals(other: any): boolean {
    return other instanceof EnumType && other.value === this.value;
}
```

**Serialization (Serializable):**

```typescript
toJSON(): string | JSONObject {
    return this.value;  // Simple string, or structured object
}

toString(): string {
    return this.value;
}
```

**Debug String:**

```typescript
get [Symbol.toStringTag](): string {
    return `EnumType:${this.value}`;
}
```

**Ordering (Comparable - Optional):**

```typescript
compareTo(other: EnumType): number {
    return this.numericValue - other.numericValue;
}
```

#### Property Immutability

Use `Reflect.defineProperty` to ensure true immutability:

```typescript
constructor(value: string) {
    Reflect.defineProperty(this, 'value', {
        value: value,
        writable: false,      // Immutable - cannot be changed
        enumerable: false,    // Hidden from JSON.stringify loops
        configurable: true,   // Allows property descriptor changes
    });
}
```

**Why not `readonly`?**

The `readonly` keyword only provides compile-time protection. `Reflect.defineProperty` with `writable: false` provides runtime immutability, preventing accidental modification even through reflection or type casting.

**Rationale:** Enum constants must be truly immutable to maintain singleton identity and type safety.

#### Factory Method Naming

Static factory methods follow these naming conventions:

**Lookup Methods:**

```typescript
// ✅ Correct: from* prefix for parsing/lookup
static fromType(type: string): EnumType | null { /* ... */ }
static fromValue(value: number): EnumType | null { /* ... */ }
static fromString(str: string): EnumType | null { /* ... */ }

// ✅ Correct: for* prefix for factory with caching
static for(code: number, reason: string): ResponseStatus { /* ... */ }

// ❌ Wrong: Inconsistent naming
static getByType(type: string) { /* ... */ }  // Use fromType
static parse(str: string) { /* ... */ }       // Use fromString
```

**Conversion Methods:**

```typescript
// ✅ Correct: to* prefix for conversion
static toSeverity(level: Level): SeverityNumber { /* ... */ }
static toOrdinal(value: EnumType): number { /* ... */ }

// ✅ Correct: from* prefix for reverse conversion
static fromSeverity(severity: SeverityNumber): Level { /* ... */ }
static fromOrdinal(ordinal: number): EnumType { /* ... */ }
```

**Rationale:** Follows established convention from STYLE_GUIDE.md Section 3.13 (Method Naming).

#### Factory Function Naming

Standalone factory functions (not static class methods) follow these naming conventions:

**Enforcement:** the `internal/no-global-state-in-create-factories` rule automates
the mechanically-checkable slice — `create*` factories (standalone, or static
methods) that reference _mutable_ module-level (`let`/`var`) or class-level
(non-`readonly` static) state directly. Transitive dependencies reached through
helper calls, and ambient globals (`process.env`, `globalThis`), remain review
checks.

**Creation Functions (no global state):**

```typescript
// ✅ Correct: create* for pure creation (no global configuration)
export const createShellContext = (options: ShellContextOptions) => {
    /* ... */
};
export const createFeatureContext = (parent: ApplicationContext, options: FeatureContextOptions) => {
    /* ... */
};
export const createStringSplitConverter = (separator: string | RegExp) => {
    /* ... */
};
export const createOptionalConverter = (converter: ArgumentValueConverter) => {
    /* ... */
};
export const createNull = () => Object.create(null);
export const createDataSource = (options: DataSourceOptions) => {
    /* ... */
};
export const createUnitOfWork = (entityManager: EntityManager) => {
    /* ... */
};

// ❌ Wrong: get* for pure creation (use create*)
export const getShellContext = (options: ShellContextOptions) => {
    /* ... */
}; // Use createShellContext
export const getStringSplitConverter = (separator: string) => {
    /* ... */
}; // Use createStringSplitConverter
```

**Configuration-Dependent Functions (with global state):**

```typescript
// ✅ Correct: get* when global state affects the result
class LoggerFactory {
    private static type: LoggerType = 'console';
    private static threshold: SeverityNumber = SeverityNumber.DEBUG;
    private static contextAware: boolean = true;

    public static getLogger(name: string): Logger {
        // Creates a logger with global configuration applied
    }
}

// ❌ Wrong: create* when global state is involved (use get*)
class LoggerFactory {
    public static createLogger(name: string): Logger {
        /* ... */
    } // Use getLogger
}
```

**Decision Rule:**

| Pattern     | When to use                                | Example                                  |
| ----------- | ------------------------------------------ | ---------------------------------------- |
| `create*()` | No global state, per-instance creation     | `createShellContext()`, `createRouter()` |
| `get*()`    | Global state affects the returned instance | `LoggerFactory.getLogger()`              |

**Rationale:** `create*()` signals "a new instance is created." `get*()` signals "an instance is returned based on current configuration." This distinction helps callers understand whether the factory has side effects or depends on shared state.

**Maintenance Note:** When updating this section, also update `AGENTS.md` Critical section (Section 3.13) to ensure agents follow the pattern.

#### Interface Implementation

Type-safe enums typically implement one or more standard interfaces:

**Basic Enum (Equatable + Serializable):**

```typescript
export class SimpleEnum implements Equatable, Serializable {
    static VALUE_ONE = new SimpleEnum('one');
    static VALUE_TWO = new SimpleEnum('two');

    readonly value: string;

    constructor(value: string) {
        /* ... */
    }

    equals(other: any): boolean {
        return other instanceof SimpleEnum && other.value === this.value;
    }

    toJSON(): string {
        return this.value;
    }

    toString(): string {
        return this.value;
    }
}
```

**Ordered Enum (Comparable + Serializable):**

```typescript
export class OrderedEnum implements Comparable<OrderedEnum>, Serializable {
    static LOW = new OrderedEnum('low', 1);
    static MEDIUM = new OrderedEnum('medium', 2);
    static HIGH = new OrderedEnum('high', 3);

    readonly name: string;
    readonly priority: number;

    constructor(name: string, priority: number) {
        /* ... */
    }

    compareTo(other: OrderedEnum): number {
        return this.priority - other.priority;
    }

    toJSON(): string {
        return this.name;
    }

    toString(): string {
        return this.name;
    }
}
```

#### Usage Examples

**Identity Checks (Reference Equality):**

```typescript
// ✅ Correct: Reference equality for identity
if (paramType === MethodParameterType.COOKIE) {
    // Process cookie parameter
}

// ✅ Correct: Value equality for comparison
if (paramType.equals(otherType)) {
    // Types are semantically equal
}

// ❌ Wrong: String comparison (fragile, bypasses type safety)
if (paramType.toString() === 'cookie:value') {
    // Don't do this - loses type safety
}
```

**Ordering:**

```typescript
// ✅ Correct: Use compareTo() for ordering
const levels = [Level.ERROR, Level.INFO, Level.DEBUG];
levels.sort((a, b) => a.compareTo(b));

if (currentLevel.compareTo(Level.ERROR) <= 0) {
    // Critical or error level
}

// ❌ Wrong: Direct comparison operators
if (level1 > level2) {
    // Won't work - compares references
}
```

**Serialization:**

```typescript
// ✅ Correct: Automatic serialization via toJSON()
const config = {
    level: Level.INFO,
    paramType: MethodParameterType.QUERY,
};
const json = JSON.stringify(config);
// Result: {"level":"info","paramType":"query:value"}

// ✅ Correct: Manual string conversion
const levelString = level.toString(); // "info"
```

**Factory Method Usage:**

```typescript
// ✅ Correct: Parse external input to enum constant
const paramType = MethodParameterType.fromType(request.paramType);
if (paramType === null) {
    throw new Error(`Unknown parameter type: ${request.paramType}`);
}

// ✅ Correct: Type-safe comparison after parsing
if (paramType === MethodParameterType.COOKIE) {
    // Handle cookie parameter
}
```

#### Inheritance

Type-safe enums support inheritance for shared behavior:

```typescript
// Base enum class
export class Level implements Comparable<Level>, Serializable {
    static OFF = new Level('off', 0);
    static ALL = new Level('all', Number.MAX_VALUE);

    readonly name: string;
    readonly value: number;

    constructor(name: string, value: number) {
        /* ... */
    }

    // Shared behavior
    compareTo(other: Level): number {
        return this.value - other.value;
    }

    toJSON(): string {
        return this.name;
    }

    toString(): string {
        return this.name;
    }
}

// Specialized subclass
export class SyslogLevel extends Level {
    static EMERG = new Level('emerg', 10000);
    static ERROR = new Level('error', 40000);
    // ... more constants

    // Additional conversion methods
    static toSeverity(level: Level): SeverityNumber {
        /* ... */
    }
    static fromSeverity(severity: SeverityNumber): Level {
        /* ... */
    }
}
```

**Use Case:** Logging level hierarchies with different standard sets (Syslog, CLI, NPM, Apache) sharing comparison logic.

#### When to Use Type-Safe Enums vs Built-in Enums

**Use Type-Safe Enum Pattern When:**

- ✅ Need instance methods (equals, compareTo, custom logic)
- ✅ Need factory methods (fromType, conversion methods)
- ✅ Rich data model (multiple properties per constant)
- ✅ Inheritance hierarchies needed
- ✅ Part of public API (predictable serialization)
- ✅ Large value sets (8+ values)

**Use Built-in TypeScript Enum When:**

- ✅ Simple constants (no behavior)
- ✅ Internal use only (not in public API)
- ✅ Small value sets (2-5 values)
- ✅ No methods or logic needed

**See:** ARCHITECTURE.md Type-Safe Enum Pattern for detailed decision guide.

#### Documentation

Always document enum constants with JSDoc:

```typescript
export class HttpMethod implements Equatable, Serializable {
    /**
     * HTTP GET method - retrieves resources without side effects.
     * Safe and idempotent.
     */
    static GET = new HttpMethod('GET', true, true);

    /**
     * HTTP POST method - creates new resources.
     * Not safe, not idempotent.
     */
    static POST = new HttpMethod('POST', false, false);

    /**
     * HTTP PUT method - updates existing resources.
     * Not safe, but idempotent.
     */
    static PUT = new HttpMethod('PUT', false, true);

    readonly name: string;
    readonly safe: boolean;
    readonly idempotent: boolean;

    constructor(name: string, safe: boolean, idempotent: boolean) {
        /* ... */
    }
}
```

#### Examples from Codebase

**Simple Type-Safe Enum:**

- `MethodParameterType` - `@ndigo/dispatcher/src/parameter-types.ts`

**Factory Registry Pattern:**

- `ResponseStatus` - `@ndigo/http/src/response-status.ts`

**Built-in Enum (Appropriate Use):**

- `RouteAccess`, `RouteSource` - `@ndigo/router/src/hash-router.ts`

---

### 3.15. Validation [CONVENTION: Code Review]

**Pattern:** Zod is the single runtime-schema primitive. There is exactly one way to validate a value at each level — no parallel constraint/decorator APIs. (`ndigo-validate` and `ndigo-model`/objectmodel were retired 2026-09-05 per AD-07; do not re-introduce them.)

**Pick the shape by what you are validating:**

| What                  | Canonical form                                                                                  |
| :-------------------- | :---------------------------------------------------------------------------------------------- |
| DTO / object shape    | `z.object({ ... })` — static type via `z.infer`                                                 |
| Route parameter       | `validatedBy(schema, dataBinderValue('query'))` in `@parameters` (from `@ndigo/dispatcher`)     |
| ENTITY field          | `@column({ schema: z.string().min(2) })` — the ORM derives the full entity schema from metadata |
| A reusable value type | `z.string().refine(...)` or `z.number().min(0)` — a schema _is_ the type                        |

```typescript
// ✅ Correct: Entity validation is derived from @column metadata
@entity('users')
class User {
    @generated() @primaryColumn() id!: number;

    @column({ type: 'varchar', schema: z.string().min(2) })
    name!: string;
}
// schemaForEntity(User) / validateEntity(User, inst) from @ndigo/orm

// ✅ Correct: Route param validation via validatedBy
@routeMapping('/create')
@parameters({ user: validatedBy(UserSchema, dataBinderValue('query')) })
create(user: z.infer<typeof UserSchema>) { /* ... */ }
```

**Rationale:** One schema produces runtime validation _and_ the static type (`z.infer`), eliminating the `as any` casts that a decorator-based constraint system and third-party model wrappers required. The ORM, dispatcher, and domain component all consume the same Zod primitive, so there is no competing idiom to choose between.

---

### 3.16. Loop Iteration [CONVENTION: Code Review]

**Pattern:** Index-based `for` loops over a list that does not change during the loop cache the length in a constant.

```typescript
// ✅ Correct: cache the length; the iterated list is not mutated by the body
const length = arr.length;
for (let index = 0; index < length; index += 1) {
    // …
}

// ✅ Correct: counted-down idioms read the length exactly once
for (let i = arr.length - 1; i >= 0; i -= 1) { … }
let i = arr.length;
while (i--) { … }

// ✅ Correct: for-of caches the collection implicitly — prefer it when the
//    body only needs the element, not an index
for (const item of arr) { … }
```

```typescript
// ❌ Wrong: re-reads `arr.length` on every iteration
for (let index = 0; index < arr.length; index += 1) { … }
```

**When the live length check is required:** if the loop body mutates the
iterated collection (splices/removes/`push`es into it) or **reassigns** it,
the condition must keep re-reading `.length` — caching would change the
iteration semantics. Default to a snapshot (e.g. `items.slice()`) when the
body performs listener-style removal, so the cacheable pattern applies.

**Rationale:** Modern engines hoist plain-array `.length` loads in simple
loops, so the win is consistency and the pathological cases (accessor-backed
collections like `Storage.length`, live `NodeList`s, or bodies that hide
mutation) rather than raw array throughput. One convention across the
codebase avoids per-reviewer debates and makes the rare live-length loop
stand out as intentional.

---

### 3.17. Decorator Categories & Naming [CONVENTION: Code Review]

**Pattern:** Every decorator belongs to one category; the category fixes the name's grammatical form. Pick the category first — the form follows.

| Category                    | What the name describes               | Form                                        | Examples                                                                                                                          |
| :-------------------------- | :------------------------------------ | :------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Stereotypes**             | What the unit _is_                    | noun                                        | `@service`, `@entity`, `@configuration`, `@jobHandler`, `@scope`, `@entry`, `@sharedDependency`                                   |
| **Participatory behaviors** | What it _participates in_             | past participle / adjective                 | `@scheduled`, `@authenticated`, `@authorized`, `@transactional`, `@cached`, `@traced`, `@counted`                                 |
| **Conditions**              | _When_ it is active                   | `@when*`                                    | `@whenFeature`, `@whenProperty`, `@whenProfile`, `@whenNode`, `@whenBrowser`, `@whenMissingEntry`                                 |
| **Registrations**           | What it _registers_                   | `<qualifier>Mapping`                        | `@routeMapping`, `@socketMapping`, `@stompMapping`, `@getMapping` …                                                               |
| **Lifecycle hooks**         | _When_ in a lifecycle it runs         | `@pre*` / `@post*` + event                  | `@prePersist`, `@preUpdate`, `@postLoad`, `@postRemove`                                                                           |
| **Member descriptors**      | What a member _denotes_               | established term of art (noun or adjective) | `@column`, `@primaryColumn`, `@generatedColumn`, `@property`, `@defaultValue`, `@nestedConfig`, `@signal`, `@computed`, `@effect` |
| **Policies**                | _How_ behavior is governed            | noun = the policy name                      | `@retry`, `@circuitBreaker`, `@rateLimit`                                                                                         |
| **Annotations**             | What a declaration _binds_ or exposes | noun                                        | `@parameters`, `@apiDocs`                                                                                                         |

**Admission procedure:**

1. Determine the category from the annotated element's role — not from the mechanism. "When" phrasing → condition; "registers a …" → registration; a noun for what something _is_ → stereotype; a verb root + `-ed` for what it participates in → behavior.
2. Take the category's form. Do not invent a new morphology for one decorator.
3. Straddling categories: prefer the category matching the annotated element's role, and record the deviation (with rationale) in the exception list of [AD-83](docs/decisions/2026-10-31_AD83_DECORATOR_CATEGORIES.md) — do not bend the category.

**Recorded exceptions (do not "fix" without an ADR):** the signals family keeps its ecosystem vocabulary (`@signal`, `@computed`, `@effect`, `@reactive`); policies stay policy nouns (`retried` would misdescribe on-failure semantics); `@whenProfile` is the single profile gate — there is no `@profile`.

**Reference:** [AD-83](docs/decisions/2026-10-31_AD83_DECORATOR_CATEGORIES.md) — full taxonomy, member map, rename verdicts, and the profile unification. §3.8 (camelCase) remains the base rule for every category.

**Rationale:** A single global convention could not describe the repository's decorator surface — conditions and registrations already ran their own forms deliberately. Role-keyed categories give every existing decorator a documented home, give new decorators a decision procedure ("pick the category; the form follows"), and make deviations explicit records instead of accidental drift.

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
// packages/ndigo-core/src/index.ts
// Only export public API - never export underscore files

export { MediaType } from './media-type';
export { DataBinder } from './data-binder';
export type { Comparable, Comparator } from './interfaces';

// ❌ NEVER do this:
// export { helper } from './_util';  // Internal files never exported
```

**Category Barrel:**

```typescript
// packages/ndigo-util/src/string/index.ts
// Re-export all public modules in this category

export { toCamel } from './to-camel';
export { toPascal } from './to-pascal';
export { toKebab } from './to-kebab';
export { slugify } from './slugify';

// Internal utilities stay private
// (no export for _helpers.ts)
```

### Internal vs Public Modules [AUTOMATED: oxlint]

**Automated:** `internal/no-internal-file-exports` (error) — underscore-prefixed modules must not be
re-exported from public entry points; `internal/no-internal-file-imports` (error) — they must not be
imported across package boundaries.

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
Multiple packages          → Promote to @ndigo/util
```

**Key Thresholds:**

- **Inline:** Used by only 1 file
- **Extract:** Used by 3+ files in same category (e.g., all string utilities)
- **Package-wide:** Used by 4+ files across categories, or once `_util.ts` exists
- **Global:** Used by multiple packages

#### Inline Utilities

Keep utilities inline when they're used **only within the file they're defined in**.

**Example from `packages/ndigo-util/src/string/to-camel.ts`:**

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

**Example: `packages/ndigo-util/src/string/remove-non-word.ts`**

This 21-line utility is imported by `to-camel.ts`, `to-pascal.ts`, `slugify.ts`, and other string utilities:

```typescript
// ✅ Correct: Extracted because used by 3+ string utilities

/**
 * Remove non-word characters.
 * @param {string} value The string to be transformed.
 * @returns {string} The `value` with the non-word characters removed.
 */
const removeNonWord: (value: string) => string = (val: string) =>
    val.replace(/[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g, '');

export default removeNonWord;
```

**Guidelines for extracted utilities:**

- Single export per file (focused utility modules)
- Import using relative paths from same category
- Typically 10-50 lines
- Well-documented with TSDoc

**Example usage:**

```typescript
// In packages/ndigo-util/src/string/to-camel.ts
import removeNonWord from './remove-non-word.js';

// In packages/ndigo-util/src/string/slugify.ts
import removeNonWord from './remove-non-word.js';
```

#### Package-Wide `_util.ts`

Create a `_util.ts` when utilities are used by **4+ files across different categories**, or once `_util.ts` exists, add new cross-file utilities there directly.

**Example: `packages/ndigo-dispatcher/src/_shared.ts`**

```typescript
// ✅ Correct: Re-exports + package-specific helpers
// Re-export commonly used utilities
export { like, isFunction } from '@ndigo/util';
export { isString } from '@ndigo/util/string';

// Package-specific helpers used across multiple dispatcher modules
export const isNonEmptyString = (value: unknown) => isString(value) && value.length > 0;
export const notLike = (value: unknown, pattern: unknown) => !like(value, pattern);
```

**Examples of existing internal files:**

- `@ndigo/context/src/_event-emitter-helpers.ts`
- `@ndigo/dispatcher/src/_shared.ts`
- `@ndigo/dispatcher/src/_match.ts`
- `@ndigo/platform-node/src/_resolver-util.ts`

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
 * Internal utilities for @ndigo/dispatcher package.
 *
 * @internal - Do not export in index.ts or import across package boundaries
 */

// Re-exports (supporting infrastructure)
import { like, isFunction } from '@ndigo/util';
import { isString } from '@ndigo/util/string';

export { like, isString };

// LOCAL UTILITIES (this is what justifies the file's existence!)
export const isNonEmptyString = (value: unknown) => isString(value) && value.length > 0; // ✅ New function
export const notLike = (value: unknown, pattern: unknown) => !like(value, pattern); // ✅ New function
```

**Why this is correct:** The file creates actual utility functions (`isNonEmptyString`, `notLike`). The re-exports are convenience infrastructure to support these utilities and consuming modules.

##### Wrong Pattern: Only Pass-Through Re-Exports

```typescript
/**
 * Internal utilities for @ndigo/http package.
 *
 * @internal - Do not export in index.ts or import across package boundaries
 */

// Type utilities
export { is, like, isString } from '@ndigo/util';

// String utilities
export { slugify, toSentence } from '@ndigo/util/string';

// Package-specific utilities can be added below
// (But they never were! This file should NOT exist.)
```

**Why this is wrong:** No actual utility functions are created. This is just a convenience re-export layer with no value. Consuming files should import directly from `@ndigo/util` instead.

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

- `_util.ts` - Re-exports from `@ndigo/util` + mixed-purpose helpers

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
// In packages/ndigo-http/src/request.ts
const parseAcceptHeader = (header: string) => header.split(',').map(trim);
```

**Stage 2: Extract to dedicated file (3+ files use)**

```typescript
// packages/ndigo-http/src/_header-parser.ts
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
// packages/ndigo-http/src/_shared.ts
import { slugify, toSentence } from '@ndigo/util/string';

export { slugify, toSentence }; // Re-exports

// Cross-cutting utilities used by multiple domains
export const parseAcceptHeader = (header: string) => header.split(',').map((part) => part.trim());
```

**Stage 4: Promote to @ndigo/util (multiple packages use)**

```typescript
// packages/ndigo-util/src/http/parse-accept-header.ts
export const parseAcceptHeader = (header: string) => header.split(',').map(trim);
```

##### Future Re-evaluation

**Note:** The hybrid naming approach (generic `_util.ts` + specific domain files) will be reviewed at a future date to determine if it should be kept, standardized, or evolved to directory-based organization.

**See:** `docs/plans/2026-02-01_INTERNAL_FILE_NAMING_REVIEW.md` for the evaluation framework.

**Triggers for review:**

- > 5 internal files per package (indicates need for directory structure)
- > 10% internal file ratio (too many internal files)
- Significant organizational challenges emerge

#### Promoted to `@ndigo/util`

Promote utilities to `@ndigo/util` when they're used by **multiple packages** or are truly universal.

**When to promote:**

- Function is used by 2+ packages
- Logic is universally applicable (not domain-specific)
- Fits into existing `@ndigo/util` categories (`/string`, `/list`, `/function`, etc.)

**Process:**

1. Move to appropriate category in `@ndigo/util`
2. Add comprehensive TSDoc documentation
3. Add thorough test coverage
4. Export in `@ndigo/util/src/index.ts`
5. Update consuming packages to import from `@ndigo/util`

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
// packages/ndigo-http/src/http-headers.ts (725 lines, 124 constants)
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
// ❌ Wrong: Package-specific utility in @ndigo/util
// This is only used by @ndigo/dispatcher modules
export const resolveMatch = ...;  // Should be in @ndigo/dispatcher/src/_match.ts

// ❌ Wrong: Cross-package utility in _util.ts
// This is used by @ndigo/core, @ndigo/context, @ndigo/dispatcher
export const deepClone = ...;  // Should be promoted to @ndigo/util
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

**See also:** [ARCHITECTURE.md - Dependency Management Strategy](./ARCHITECTURE.md#dependency-management-strategy) for guidance on when to promote utilities to `@ndigo/util`.

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
// packages/ndigo-util/src/string/remove-non-word.ts (21 lines)

// ✅ Good: Utility with helpers (50-150 lines)
// packages/ndigo-util/src/string/to-camel.ts (46 lines)

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
// e.g. a 965-line module mixing string validation, number validation,
//      date validation, type checking, and helpers
// Should split by responsibility
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
// packages/ndigo-http/src/http-headers.ts (725 lines, 124 constants)
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
// packages/ndigo-factory/src/factory.ts (562 lines)
// Single cohesive responsibility: Dependency injection factory
// High internal cohesion, all methods serve DI container

// packages/ndigo-context/src/context.ts (363 lines)
// Single responsibility: Application context management
```

**✅ Framework Integration:**

```typescript
// packages/ndigo-dispatcher/src/route-handler-mapping.ts (884 lines)
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
// packages/ndigo-util/src/string/to-camel.ts (46 lines)
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
nx run @ndigo/core:build:lib
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
nx run @ndigo/core:test --coverage
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

## 5. Documentation Blocks

Every source file begins with a single canonical TSDoc block at the very top
of the file, carrying the since-version stamp and the author. This is the
standard form — `@ndigo/generators` emits it for new packages/components and
the `header` generator adds/replaces it on existing files:

```
/**
 * <One-line summary ending with a period>.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
```

**Rules:**

- ✅ One block per file, first thing in the file (before imports)
- ✅ `<summary>` is a single sentence ending in a period; it may be omitted
- ✅ `@since 1.0.0` stamps the framework version the file first shipped in
- ✅ `@author Jeff Rose` (override per file only with `--author`)
- ❌ No `@module` tag: the generated reference derives each module's name from
  its source path, and a package-wide tag collapses every file of the package
  into one module (see `docs/guides/12-package-documentation.md`)
- ❌ Headings (`#`) inside doc blocks
- ❌ `TODO:` summary placeholders — describe what the file does
- ❌ `@file`, `@category`, or duplicate summary lines
- ✅ Generate with:
  `pnpm exec nx generate @ndigo/generators:header --file <path> [--summary ...]`

The file-level block documents the whole module; class/method members carry
their own focused TSDoc. `internal/requires-doc-header` (oxlint, error level —
`.oxlintrc.json`) enforces the canonical block on source files.

**Public symbol comments (coverage gate):** every top-level exported
function, class, interface, or type alias needs a doc comment — the docs
pipeline (`pnpm doc:api` → coverage gate) fails CI without one. A one-line
summary suffices for self-evident type aliases and predicate helpers:

```typescript
/** Whether the lifecycle has finished initializing. */
export function isInitialized(value: unknown): boolean;
```

Members (methods/getters/properties), variables, and enum members are exempt
— names self-document. `@internal` and `_`-prefixed internal files are
exempt. See `docs/guides/12-package-documentation.md`.

**`{@link}` targets follow the file, not the package.** The reference is
generated one module per source file, so an unqualified `{@link Name}` only
resolves inside the file that declares `Name`. Link across files of the same
package with the declaring module as the qualifier and keep the printed text
short:

```typescript
// ❌ Fails the docs build (unresolved link) when DrizzleEntityManager lives
//    in drizzle-entity-manager.ts
* {@link DrizzleEntityManager}

// ✅ Same package, another file
* {@link drizzle-entity-manager.DrizzleEntityManager | DrizzleEntityManager}
```

Class members qualify with `#` (`{@link cache.CacheOptions#maxSize}`). A link
to another package goes in `scripts/external-symbol-links.json` — never
inline.

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

## 6. Complete Example

Here's a complete example demonstrating all conventions:

```typescript
/**
 * Media type parser and comparator.
 */

// Imports: Always use single quotes
import * as R from '@ndigo/util';
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

## 7. Maintenance

### When oxfmt Config Changes

**IMPORTANT:** When `.oxfmtrc.json` is modified, update Section 1 of this guide to reflect the new formatting rules.

**Process:**

1. Make changes to `.oxfmtrc.json`
2. Update corresponding section in `STYLE_GUIDE.md`
3. Run `pnpm format` to apply new formatting
4. Document the change in commit message:

    ```
    style: update oxfmt config and style guide

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

## 8. Self-Documenting Code

Code is read more often than it is written. Self-documenting code minimizes the gap between what the code says and what the author intended.

### Principle: Names carry meaning, comments carry rationale

| Category   | What to document                                       | What NOT to document                               |
| ---------- | ------------------------------------------------------ | -------------------------------------------------- |
| Names      | Domain concepts, roles (`*Handler`, `*Strategy`)       | Trivial getters (`// Returns the X`)               |
| Comments   | _Why_ a choice was made, edge cases, tradeoffs         | _What_ the code does (the code says that)          |
| Assertions | _Why_ the compiler is wrong (one-liner with assertion) | _That_ it's wrong (the `as any` already says that) |
| Dead code  | `@deprecated` with migration path, or delete           | Commented-out blocks ("I'll need this later")      |

### Property/Method naming tells readers cost and semantics

As established in Section 3.12:

| Shape             | Convention | Signals to the reader                          |
| ----------------- | ---------- | ---------------------------------------------- |
| `get something()` | Property   | O(1), no side effects, intrinsic data          |
| `getSomething()`  | get-method | May be expensive, may fail, may return `null`  |
| `toSomething()`   | to-method  | Returns a new representation, source unchanged |

### Comment structure: say _why_ not _what_

```typescript
// ❌ WHAT — the code already says this
// Increment the OTel counter
counter.add(1, config.attributes);

// ✅ WHY — explains a non-obvious design decision
// The retry creates a new Request object, so the WeakMap key
// from the previous attempt is lost. The x-retry-attempt header
// carries the counter without per-instance mutable state.
const RETRY_ATTEMPT_HEADER = 'x-retry-attempt';
```

### Type assertions must explain why the compiler is wrong

Every `as any`, `as unknown as T`, or `// @ts-ignore` must carry a one-line reason:

```typescript
// ❌ Bare assertion — reader must reverse-engineer why
const metadata = (handler as any).constructor?.[Symbol.metadata];

// ✅ With rationale — reader immediately knows the gap
// constructor[Symbol.metadata] is a runtime-only TC39 decorator property
// not declared on the `Function` type in TS 5.7.
const metadata = (handler?.constructor as any)?.[Symbol.metadata];
```

When a module has many similar assertions (e.g., a library whose types end at `any`), a single module-level comment suffices:

```typescript
// NOTE: this third-party runtime resolves types dynamically, so the fluent
// API returns `any`. A typed wrapper would require wrapping every call —
// this is accepted for the integration layer.
```

### `// NOTE:` comments are technical debt

A `// NOTE:` comment usually means "this is not right but I'm shipping it anyway." It obscures the fact that the code is knowingly incomplete. Prefer:

| Instead of `// NOTE:` | Use                                                                |
| --------------------- | ------------------------------------------------------------------ |
| "This is simplified"  | `@remarks This is a reference implementation. For production use…` |
| "Not implemented"     | `@deprecated Use {@link ProductionJWTAdapter} instead.`            |
| "In production, do X" | Remove the comment and do X, or mark with `@deprecated`            |
| "This should be X"    | Do X, or open a ticket                                             |

### File size is documentation

A file containing one public type documents the relationship between name and content. A file containing seven classes documents nothing — the reader must reverse-engineer the grouping. Follow the one-public-type-per-file convention:

- ✅ `abstract-path-handler-mapping.ts` contains `AbstractPathHandlerMapping`
- ❌ `route-handler-mapping.ts` (1218 lines) contained 7 public classes, 3 internal helpers, and 2 interfaces

**Guideline:** Keep files under 300 lines. Files over 300 lines should have a clear single-responsibility justification. Split by public type, not by author convenience.

### Dead code must carry its tombstone

| State                               | Treatment                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Intentionally unused                | Delete it. Source control remembers it.                                                                |
| Kept for future activation          | `@deprecated` with a `@remarks` explaining when it will be needed, or move to an `_archive/` directory |
| Commented-out                       | Delete it.                                                                                             |
| Optional path you chose not to take | Document the decision in `docs/decisions/` or a commit message                                         |

---

**Last Updated:** August 22, 2026

_This guide is a living document. When code style evolves, update this guide to reflect current practices._
