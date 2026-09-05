# HTTP Request/Response Body Transform Pipeline

**Date:** February 7, 2026  
**Status:** 🚧 IN PROGRESS  
**Priority:** High  
**Context:** Add Spring-inspired transform pipeline to @blue/http  
**Dependencies:** `docs/plans/2026-02-07_MEDIATYPE_LOCATION_ANALYSIS.md` (MediaType location decision)

---

## Executive Summary

This plan implements a **HTTP request/response body transformation pipeline** for `@blue/http`, inspired by Spring Framework's `HttpMessageConverter` pattern. The design enables composable, type-safe transformations of HTTP bodies (JSON sanitization, validation, parsing, etc.) through a clean interceptor-based architecture.

### Key Features

- **Type-Safe Transformations**: Generic `HTTPTransformer<TInput, TOutput>` interface
- **5 Specialized Transformers**: JSON, Composition, Transducer, FormData, URLSearchParams
- **Conditional Logic**: `TransformContext` enables transforms based on URL, headers, MediaType
- **Clean Integration**: Leverages existing `@blue/http` interceptor system
- **Subpath Exports**: `@blue/http/transformers` for specialized transformers
- **No Defaults**: Explicit configuration (align with BlueJS philosophy)

---

## ✅ Blocker Resolved: Interceptor Return Types

**Date Identified:** February 11, 2026  
**Date Resolved:** March 8, 2026

**Issue (historical):**
The `TransformInterceptor` design required replacing response bodies, but `ResponseAwareHTTPInterceptor` originally only supported `Promise<void>`.

**Resolved Implementation:**

- `ResponseAwareHTTPInterceptor` now supports `Promise<Response | void>`
- `HTTPExecutionChain.applyPostResponse()` now returns the current `Response`
- Returned `Response` values are chained across interceptors
- `TransformInterceptor.postResponse()` now returns transformed `Response`

**Impact:**
This removed the architectural blocker for response transformation while remaining backward compatible for existing interceptors that return `void`.

---

## Design Decisions Summary

## Implementation Status (March 8, 2026)

### Completed

- ✅ `TransformContext` and `HTTPTransformer` types added (`src/transformers/http-transformer.ts`)
- ✅ `TransformInterceptor` implemented and exported
- ✅ `HTTP.create()` supports `requestTransforms` and `responseTransforms`
- ✅ Response interceptor contract upgraded to `Promise<Response | void>`
- ✅ Response transform chaining enabled in execution chain
- ✅ Integration tests added for request + response transformation

### Remaining Work

- ✅ Add specialized transformer implementations (`json`, `composition`, `transducer`, `form-data`, `url-search-params`)
- ✅ Add subpath exports for `@blue/http/transformers`
- ✅ Expand README transformer documentation and examples

### Critical Decisions Made

| Decision                       | Chosen Approach                                                  | Rationale                                                    |
| ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| **Interface Name**             | `HTTPTransformer<TInput, TOutput>`                               | Avoids conflict with `@blue/core` transducer `Transformer`   |
| **Generic Names**              | `TInput`, `TOutput`                                              | Matches `@blue/core` conventions (not `TIn`/`TOut`)          |
| **canTransform Signature**     | `canTransform(body: TInput, context: TransformContext): boolean` | Type-safe, body is TInput not any                            |
| **Context Parameter**          | Required in both methods                                         | Enables powerful conditional transforms                      |
| **Composition Pattern**        | `pipe()` from `@blue/util/function`                              | Left-to-right, familiar to JS developers                     |
| **Keep TransducerTransformer** | Yes                                                              | Unique performance benefits (early termination, single-pass) |
| **Default Transforms**         | None                                                             | Explicit is better than implicit                             |
| **Naming**                     | `CompositionTransformer` not `RamdaTransformer`                  | Names functionality, not library                             |

### Why These Choices?

**canTransform(body: TInput, context: TransformContext):**

- Body is typed as `TInput` for type safety
- Context enables: multi-tenant logic, header-based auth, URL routing, request vs response asymmetry
- Example: `if (context.url.includes('/api/v2') && context.mediaType?.is('application/json'))`

**Keep TransducerTransformer:**

- Early termination with `take()`, `takeWhile()`
- Single-pass iteration (no intermediate arrays)
- Memory-efficient for large collections
- Can't be replicated with function composition

**Use pipe() not compose():**

- Left-to-right more intuitive: `pipe(f, g, h)` means f → g → h
- Matches `@blue/util` conventions
- JavaScript developers expect left-to-right (unlike Haskell/mathematical composition)

---

## File Structure

```
packages/blue-http/
├── src/
│   ├── http.ts                              [MODIFY] - Add transform config
│   ├── interceptors/
│   │   └── transform-interceptor.ts         [NEW] - Core transform logic
│   └── transformers/                        [NEW DIR]
│       ├── index.ts                         [NEW] - Public exports
│       ├── http-transformer.ts              [NEW] - Core interface + types
│       ├── json-transformer.ts              [NEW] - JSON pipeline
│       ├── composition-transformer.ts       [NEW] - Function composition
│       ├── transducer-transformer.ts        [NEW] - Transducer-based
│       ├── form-data-transformer.ts         [NEW] - FormData entries
│       └── url-search-params-transformer.ts [NEW] - URLSearchParams entries
├── test/
│   └── transformers/                        [NEW DIR]
│       ├── http-transformer.spec.ts         [NEW] - Interface tests
│       ├── json-transformer.spec.ts         [NEW]
│       ├── composition-transformer.spec.ts  [NEW]
│       ├── transducer-transformer.spec.ts   [NEW]
│       ├── form-data-transformer.spec.ts    [NEW]
│       └── url-search-params-transformer.spec.ts [NEW]
└── package.json                             [MODIFY] - Add subpath export
```

---

## Phase 1: Core Infrastructure

### 1.1 Define Core Types and Interfaces

**File:** `packages/blue-http/src/transformers/http-transformer.ts`

````typescript
/**
 * @author Jeff Rose
 */
import { MediaType } from '@blue/core';

/**
 * Context information for conditional transformation logic.
 */
export interface TransformContext {
    /**
     * Request URL for URL-based conditional transforms.
     */
    readonly url: string;

    /**
     * Request/response headers for header-based conditional logic.
     */
    readonly headers: Headers;

    /**
     * Media type for content-type-based conditional transforms.
     *
     * Note: Pending architectural decision - may change to `contentType?: string`
     * See: docs/plans/2026-02-07_MEDIATYPE_LOCATION_ANALYSIS.md
     */
    readonly mediaType?: MediaType;

    /**
     * Transform direction: 'request' or 'response'
     */
    readonly direction: 'request' | 'response';

    /**
     * Additional metadata for custom conditional logic.
     */
    readonly metadata?: Record<string, unknown>;
}

/**
 * HTTP body transformer for request/response transformation pipeline.
 *
 * Inspired by Spring Framework's HttpMessageConverter pattern.
 *
 * @template TInput - Input body type
 * @template TOutput - Output body type (defaults to TInput if not specified)
 *
 * @example
 * ```typescript
 * // JSON sanitizer (same type)
 * const sanitizer: HTTPTransformer<JSONObject> = {
 *     canTransform: (body, context) =>
 *         context.direction === 'response' &&
 *         context.mediaType?.is('application/json'),
 *     transform: (body) => sanitizeJSON(body)
 * };
 *
 * // Parser (type change)
 * const parser: HTTPTransformer<string, JSONObject> = {
 *     canTransform: (body) => typeof body === 'string',
 *     transform: (body) => JSON.parse(body)
 * };
 * ```
 */
export interface HTTPTransformer<TInput = any, TOutput = any> {
    /**
     * Determines if this transformer can handle the given body and context.
     *
     * @param body - Request/response body to potentially transform
     * @param context - Context information for conditional logic
     * @returns true if this transformer should be applied
     */
    canTransform(body: TInput, context: TransformContext): boolean;

    /**
     * Transforms the request/response body.
     *
     * @param body - Request/response body to transform
     * @param context - Context information for transformation logic
     * @returns Transformed body (sync or async)
     */
    transform(body: TInput, context: TransformContext): TOutput | Promise<TOutput>;
}

/**
 * User-provided transform function or transformer object.
 */
export type Transform<TInput = any, TOutput = any> =
    | HTTPTransformer<TInput, TOutput>
    | ((body: TInput, context: TransformContext) => TOutput | Promise<TOutput>);
````

**Checklist:**

- [ ] Create `http-transformer.ts`
- [ ] Define `TransformContext` interface
- [ ] Define `HTTPTransformer<TInput, TOutput>` interface
- [ ] Define `Transform<TInput, TOutput>` type alias
- [ ] Add comprehensive TSDoc comments
- [ ] Note MediaType pending decision

**Estimated Time:** 30 minutes

---

### 1.2 Implement TransformInterceptor

**File:** `packages/blue-http/src/interceptors/transform-interceptor.ts`

````typescript
/**
 * @author Jeff Rose
 */
import { HTTPInterceptor } from '../http-interceptor';
import { Transform, HTTPTransformer, TransformContext } from '../transformers/http-transformer';
import { MediaType } from '@blue/core';

/**
 * Interceptor that applies body transformations to requests and responses.
 *
 * Executes AFTER ContentTypeInterceptor (headers are set first).
 * Converts user-provided transforms (functions or objects) into interceptor hooks.
 *
 * @example
 * ```typescript
 * const http = new HTTP({
 *     requestTransforms: [
 *         // Function transform
 *         (body) => sanitizeRequestBody(body),
 *
 *         // Object transform with conditional logic
 *         {
 *             canTransform: (body, ctx) => ctx.url.includes('/api/v2'),
 *             transform: (body) => transformV2Format(body)
 *         }
 *     ],
 *     responseTransforms: [
 *         // Parse dates in response
 *         (body) => parseDates(body)
 *     ]
 * });
 * ```
 */
export class TransformInterceptor implements HTTPInterceptor {
    constructor(
        private readonly requestTransforms: Transform[] = [],
        private readonly responseTransforms: Transform[] = []
    ) {}

    /**
     * Applies request body transformations.
     */
    async preRequest(request: Request): Promise<Request> {
        if (this.requestTransforms.length === 0) {
            return request;
        }

        // Extract body
        let body: any = await this.extractBody(request);
        if (body === null) {
            return request; // No body to transform
        }

        // Build context
        const context = this.createContext(request, 'request');

        // Apply transforms
        for (const transform of this.requestTransforms) {
            if (this.shouldApplyTransform(transform, body, context)) {
                body = await this.applyTransform(transform, body, context);
            }
        }

        // Create new request with transformed body
        return new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(body), // TODO: Smart serialization based on content-type
            // ... copy other request properties
        });
    }

    /**
     * Applies response body transformations.
     */
    async postResponse(response: Response): Promise<Response> {
        if (this.responseTransforms.length === 0) {
            return response;
        }

        // Extract body
        let body: any = await this.extractBody(response);
        if (body === null) {
            return response; // No body to transform
        }

        // Build context (use original request URL from response)
        const context = this.createContext(response, 'response');

        // Apply transforms
        for (const transform of this.responseTransforms) {
            if (this.shouldApplyTransform(transform, body, context)) {
                body = await this.applyTransform(transform, body, context);
            }
        }

        // Create new response with transformed body
        return new Response(JSON.stringify(body), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }

    /**
     * Extracts body from Request or Response.
     */
    private async extractBody(source: Request | Response): Promise<any> {
        const contentType = source.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            return await source.json();
        }
        if (contentType.includes('text/')) {
            return await source.text();
        }
        if (contentType.includes('application/x-www-form-urlencoded')) {
            const text = await source.text();
            return new URLSearchParams(text);
        }
        if (contentType.includes('multipart/form-data')) {
            return await source.formData();
        }

        // Unknown/unsupported content type
        return null;
    }

    /**
     * Creates TransformContext from Request or Response.
     */
    private createContext(source: Request | Response, direction: 'request' | 'response'): TransformContext {
        const url = source instanceof Request ? source.url : ''; // Response doesn't have URL
        const contentType = source.headers.get('content-type') || '';

        return {
            url,
            headers: source.headers,
            mediaType: contentType ? MediaType.parse(contentType) : undefined,
            direction,
            metadata: {},
        };
    }

    /**
     * Determines if transform should be applied.
     */
    private shouldApplyTransform(transform: Transform, body: any, context: TransformContext): boolean {
        // Function transform - always apply
        if (typeof transform === 'function') {
            return true;
        }

        // Object transform - check canTransform
        return transform.canTransform(body, context);
    }

    /**
     * Applies transform to body.
     */
    private async applyTransform(transform: Transform, body: any, context: TransformContext): Promise<any> {
        if (typeof transform === 'function') {
            return await transform(body, context);
        }
        return await transform.transform(body, context);
    }
}
````

**Checklist:**

- [ ] Create `transform-interceptor.ts`
- [ ] Implement `preRequest` hook (request transforms)
- [ ] Implement `postResponse` hook (response transforms)
- [ ] Handle both function and object transforms
- [ ] Build `TransformContext` from Request/Response
- [ ] Smart body extraction based on content-type
- [ ] Smart body serialization based on content-type
- [ ] Handle async transforms
- [ ] Add comprehensive TSDoc comments
- [ ] Error handling for failed transforms

**Estimated Time:** 2-3 hours

**Note:** Body extraction/serialization may need enhancement based on content-type variety.

---

### 1.3 Update HTTP Class Configuration

**File:** `packages/blue-http/src/http.ts`

**Changes:**

```typescript
// Add to HTTPConfig interface
export interface HTTPConfig {
    // ... existing properties

    /**
     * Request body transformations applied before sending.
     *
     * Transformations are applied in order after ContentTypeInterceptor.
     */
    requestTransforms?: Transform[];

    /**
     * Response body transformations applied after receiving.
     *
     * Transformations are applied in order after ResponseTypeInterceptor.
     */
    responseTransforms?: Transform[];
}

// In HTTP constructor, add TransformInterceptor to chain
constructor(config?: HTTPConfig) {
    // ... existing initialization

    // Add transform interceptor if transforms provided
    if (config?.requestTransforms || config?.responseTransforms) {
        this.#interceptors.push(
            new TransformInterceptor(
                config.requestTransforms,
                config.responseTransforms
            )
        );
    }
}
```

**Checklist:**

- [ ] Add `requestTransforms?: Transform[]` to `HTTPConfig`
- [ ] Add `responseTransforms?: Transform[]` to `HTTPConfig`
- [ ] Add `TransformInterceptor` to interceptor chain in constructor
- [ ] Add TSDoc comments for new config properties
- [ ] Ensure TransformInterceptor runs after ContentTypeInterceptor

**Estimated Time:** 30 minutes

---

## Phase 2: Specialized Transformers

### 2.1 JSONTransformer - Pipeline of Functions

**File:** `packages/blue-http/src/transformers/json-transformer.ts`

````typescript
/**
 * @author Jeff Rose
 */
import { HTTPTransformer, TransformContext } from './http-transformer';
import { pipe } from '@blue/util/function';
import { JSONObject } from '@blue/core';

/**
 * JSON transformer that applies a pipeline of functions to JSON objects.
 *
 * Uses left-to-right composition (pipe) for intuitive transform ordering.
 *
 * @example
 * ```typescript
 * const transformer = new JSONTransformer([
 *     (obj) => sanitizeNullValues(obj),
 *     (obj) => trimStringProperties(obj),
 *     (obj) => validateSchema(obj)
 * ]);
 *
 * // With conditional logic
 * const transformer = new JSONTransformer(
 *     [(obj) => transformV2(obj)],
 *     (body, ctx) => ctx.url.includes('/api/v2')
 * );
 * ```
 */
export class JSONTransformer implements HTTPTransformer<JSONObject, JSONObject> {
    private readonly pipeline: (obj: JSONObject) => JSONObject;

    constructor(
        private readonly transforms: Array<(obj: JSONObject) => JSONObject>,
        private readonly condition?: (body: JSONObject, context: TransformContext) => boolean
    ) {
        // Build pipeline using pipe() from @blue/util
        this.pipeline = pipe(...transforms);
    }

    canTransform(body: JSONObject, context: TransformContext): boolean {
        // Check if body is JSON-like
        if (typeof body !== 'object' || body === null) {
            return false;
        }

        // Apply custom condition if provided
        if (this.condition) {
            return this.condition(body, context);
        }

        return true;
    }

    transform(body: JSONObject, context: TransformContext): JSONObject {
        return this.pipeline(body);
    }
}
````

**Checklist:**

- [ ] Create `json-transformer.ts`
- [ ] Implement constructor with function array and optional condition
- [ ] Use `pipe()` from `@blue/util/function` for composition
- [ ] Implement `canTransform` with JSON type check and condition
- [ ] Implement `transform` using pipeline
- [ ] Add TSDoc with examples
- [ ] Handle edge cases (null, undefined, non-objects)

**Estimated Time:** 1 hour

---

### 2.2 CompositionTransformer - Generic Function Composition

**File:** `packages/blue-http/src/transformers/composition-transformer.ts`

````typescript
/**
 * @author Jeff Rose
 */
import { HTTPTransformer, TransformContext } from './http-transformer';
import { pipe } from '@blue/util/function';

/**
 * Generic transformer using function composition.
 *
 * Uses Ramda's pipe() for left-to-right composition.
 * Works with any input/output types.
 *
 * @example
 * ```typescript
 * // String transformations
 * const transformer = new CompositionTransformer<string, string>([
 *     (s) => s.trim(),
 *     (s) => s.toLowerCase(),
 *     (s) => s.replace(/\s+/g, '-')
 * ]);
 *
 * // Type-changing transformations
 * const parser = new CompositionTransformer<string, number>([
 *     (s) => s.trim(),
 *     (s) => parseInt(s, 10)
 * ]);
 * ```
 */
export class CompositionTransformer<TInput = any, TOutput = any> implements HTTPTransformer<TInput, TOutput> {
    private readonly pipeline: (input: TInput) => TOutput;

    constructor(
        private readonly fns: Array<(x: any) => any>,
        private readonly condition?: (body: TInput, context: TransformContext) => boolean
    ) {
        // Use pipe() from @blue/util for left-to-right composition
        this.pipeline = pipe(...fns) as (input: TInput) => TOutput;
    }

    canTransform(body: TInput, context: TransformContext): boolean {
        if (this.condition) {
            return this.condition(body, context);
        }
        return true;
    }

    transform(body: TInput, context: TransformContext): TOutput {
        return this.pipeline(body);
    }
}
````

**Checklist:**

- [ ] Create `composition-transformer.ts`
- [ ] Support generic `TInput` and `TOutput` types
- [ ] Use `pipe()` from `@blue/util/function`
- [ ] Support optional condition function
- [ ] Add comprehensive TSDoc with examples
- [ ] Document left-to-right composition order

**Estimated Time:** 45 minutes

---

### 2.3 TransducerTransformer - Performance-Optimized

**File:** `packages/blue-http/src/transformers/transducer-transformer.ts`

````typescript
/**
 * @author Jeff Rose
 */
import { HTTPTransformer, TransformContext } from './http-transformer';
import { transduce } from '@blue/util/list';

/**
 * Transformer using transducers for memory-efficient transformations.
 *
 * Ideal for:
 * - Large collections (arrays, form data entries)
 * - Early termination scenarios (take, takeWhile)
 * - Single-pass transformations
 * - Memory-constrained environments
 *
 * Uses @blue/util's transduce() (Ramda-based).
 *
 * @example
 * ```typescript
 * import * as R from '@blue/util';
 *
 * // Transform array with early termination
 * const transformer = new TransducerTransformer<number[], number[]>(
 *     R.compose(
 *         R.map((n: number) => n * 2),
 *         R.filter((n: number) => n > 10),
 *         R.take(5) // Early termination - stops after 5 results
 *     )
 * );
 *
 * // Single-pass transformation (no intermediate arrays)
 * const transformer = new TransducerTransformer<string[], string[]>(
 *     R.compose(
 *         R.map((s: string) => s.trim()),
 *         R.filter((s: string) => s.length > 0),
 *         R.map((s: string) => s.toUpperCase())
 *     )
 *     // ^ All operations in single pass
 * );
 * ```
 */
export class TransducerTransformer<TInput = any, TOutput = any> implements HTTPTransformer<TInput, TOutput> {
    constructor(
        private readonly transducer: any, // Transducer function from Ramda
        private readonly condition?: (body: TInput, context: TransformContext) => boolean
    ) {}

    canTransform(body: TInput, context: TransformContext): boolean {
        // Check if body is iterable (array-like)
        if (!Array.isArray(body) && typeof (body as any)[Symbol.iterator] !== 'function') {
            return false;
        }

        if (this.condition) {
            return this.condition(body, context);
        }

        return true;
    }

    transform(body: TInput, context: TransformContext): TOutput {
        // Use transduce from @blue/util (Ramda-based)
        const result = transduce(
            this.transducer,
            (acc: any[], val: any) => [...acc, val], // Accumulator function
            [],
            body as any
        );

        return result as TOutput;
    }
}
````

**Checklist:**

- [ ] Create `transducer-transformer.ts`
- [ ] Use `transduce()` from `@blue/util/list`
- [ ] Support generic `TInput` and `TOutput`
- [ ] Add iterable type check in `canTransform`
- [ ] Document performance benefits (early termination, single-pass)
- [ ] Add TSDoc with transducer examples
- [ ] Explain when to use vs CompositionTransformer

**Estimated Time:** 1-1.5 hours

---

### 2.4 FormDataTransformer - FormData Entry Transform

**File:** `packages/blue-http/src/transformers/form-data-transformer.ts`

````typescript
/**
 * @author Jeff Rose
 */
import { HTTPTransformer, TransformContext } from './http-transformer';

/**
 * Transformer for FormData entries.
 *
 * Applies transformation function to each FormData entry.
 * Useful for sanitizing file uploads, validating form fields, etc.
 *
 * @example
 * ```typescript
 * // Sanitize form field names
 * const transformer = new FormDataTransformer(
 *     (key, value) => [key.toLowerCase(), value]
 * );
 *
 * // Filter out empty fields
 * const transformer = new FormDataTransformer(
 *     (key, value) => value ? [key, value] : null
 * );
 *
 * // Add prefix to keys
 * const transformer = new FormDataTransformer(
 *     (key, value) => [`user_${key}`, value]
 * );
 * ```
 */
export class FormDataTransformer implements HTTPTransformer<FormData, FormData> {
    constructor(
        private readonly entryTransform: (
            key: string,
            value: FormDataEntryValue
        ) => [string, FormDataEntryValue] | null,
        private readonly condition?: (body: FormData, context: TransformContext) => boolean
    ) {}

    canTransform(body: FormData, context: TransformContext): boolean {
        if (!(body instanceof FormData)) {
            return false;
        }

        if (this.condition) {
            return this.condition(body, context);
        }

        return true;
    }

    transform(body: FormData, context: TransformContext): FormData {
        const transformed = new FormData();

        for (const [key, value] of body.entries()) {
            const result = this.entryTransform(key, value);

            if (result !== null) {
                const [newKey, newValue] = result;
                transformed.append(newKey, newValue);
            }
        }

        return transformed;
    }
}
````

**Checklist:**

- [ ] Create `form-data-transformer.ts`
- [ ] Support entry transformation function `(key, value) => [key, value] | null`
- [ ] Handle null returns (filter entries)
- [ ] Check `body instanceof FormData` in `canTransform`
- [ ] Create new FormData with transformed entries
- [ ] Add TSDoc with examples
- [ ] Handle File and Blob values correctly

**Estimated Time:** 1 hour

---

### 2.5 URLSearchParamsTransformer - Query Parameter Transform

**File:** `packages/blue-http/src/transformers/url-search-params-transformer.ts`

````typescript
/**
 * @author Jeff Rose
 */
import { HTTPTransformer, TransformContext } from './http-transformer';

/**
 * Transformer for URLSearchParams entries.
 *
 * Applies transformation function to each query parameter.
 * Useful for sanitizing query params, adding default values, etc.
 *
 * @example
 * ```typescript
 * // Lowercase all parameter names
 * const transformer = new URLSearchParamsTransformer(
 *     (key, value) => [key.toLowerCase(), value]
 * );
 *
 * // Remove sensitive parameters
 * const transformer = new URLSearchParamsTransformer(
 *     (key, value) => key === 'password' ? null : [key, value]
 * );
 *
 * // Add authentication token
 * const transformer = new URLSearchParamsTransformer(
 *     (key, value) => [key, value],
 *     (body, ctx) => {
 *         const token = ctx.metadata?.authToken as string;
 *         body.set('token', token);
 *         return body;
 *     }
 * );
 * ```
 */
export class URLSearchParamsTransformer implements HTTPTransformer<URLSearchParams, URLSearchParams> {
    constructor(
        private readonly entryTransform: (key: string, value: string) => [string, string] | null,
        private readonly postProcess?: (params: URLSearchParams) => URLSearchParams,
        private readonly condition?: (body: URLSearchParams, context: TransformContext) => boolean
    ) {}

    canTransform(body: URLSearchParams, context: TransformContext): boolean {
        if (!(body instanceof URLSearchParams)) {
            return false;
        }

        if (this.condition) {
            return this.condition(body, context);
        }

        return true;
    }

    transform(body: URLSearchParams, context: TransformContext): URLSearchParams {
        const transformed = new URLSearchParams();

        for (const [key, value] of body.entries()) {
            const result = this.entryTransform(key, value);

            if (result !== null) {
                const [newKey, newValue] = result;
                transformed.append(newKey, newValue);
            }
        }

        // Apply post-processing if provided
        if (this.postProcess) {
            return this.postProcess(transformed);
        }

        return transformed;
    }
}
````

**Checklist:**

- [ ] Create `url-search-params-transformer.ts`
- [ ] Support entry transformation `(key, value) => [key, value] | null`
- [ ] Support optional post-processing function
- [ ] Check `body instanceof URLSearchParams` in `canTransform`
- [ ] Create new URLSearchParams with transformed entries
- [ ] Add TSDoc with examples
- [ ] Handle duplicate parameter names correctly

**Estimated Time:** 1 hour

---

### 2.6 Public Exports

**File:** `packages/blue-http/src/transformers/index.ts`

```typescript
/**
 * HTTP Body Transformers
 *
 * Provides composable transformations for HTTP request/response bodies.
 *
 * @module @blue/http/transformers
 */
export { HTTPTransformer, TransformContext, Transform } from './http-transformer';
export { JSONTransformer } from './json-transformer';
export { CompositionTransformer } from './composition-transformer';
export { TransducerTransformer } from './transducer-transformer';
export { FormDataTransformer } from './form-data-transformer';
export { URLSearchParamsTransformer } from './url-search-params-transformer';
```

**Checklist:**

- [ ] Create `index.ts` in `transformers/`
- [ ] Export all transformers
- [ ] Export core types (`HTTPTransformer`, `TransformContext`, `Transform`)
- [ ] Add module-level TSDoc comment

**Estimated Time:** 10 minutes

---

## Phase 3: Package Configuration

### 3.1 Update package.json for Subpath Exports

**File:** `packages/blue-http/package.json`

**Add to exports:**

```json
{
    "name": "@blue/http",
    "exports": {
        ".": {
            "types": "./lib/index.d.ts",
            "import": "./lib/index.js"
        },
        "./transformers": {
            "types": "./lib/transformers/index.d.ts",
            "import": "./lib/transformers/index.js"
        }
    }
}
```

**Checklist:**

- [ ] Add `./transformers` subpath export
- [ ] Verify types path points to `lib/transformers/index.d.ts`
- [ ] Verify import path points to `lib/transformers/index.js`
- [ ] Test import: `import { JSONTransformer } from '@blue/http/transformers'`

**Estimated Time:** 15 minutes

---

## Phase 4: Comprehensive Testing

### 4.1 Interface Tests

**File:** `packages/blue-http/test/transformers/http-transformer.spec.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { HTTPTransformer, TransformContext } from '../../src/transformers/http-transformer';

describe('HTTPTransformer Interface', () => {
    describe('canTransform', () => {
        it('should accept body and context parameters', () => {
            const transformer: HTTPTransformer<string, string> = {
                canTransform: (body, context) => {
                    expect(typeof body).toBe('string');
                    expect(context).toHaveProperty('url');
                    return true;
                },
                transform: (body) => body,
            };

            const context: TransformContext = {
                url: 'https://api.example.com',
                headers: new Headers(),
                direction: 'request',
            };

            transformer.canTransform('test', context);
        });

        it('should enable conditional logic based on URL', () => {
            const transformer: HTTPTransformer = {
                canTransform: (body, context) => context.url.includes('/api/v2'),
                transform: (body) => body,
            };

            const v2Context: TransformContext = {
                url: 'https://api.example.com/api/v2/users',
                headers: new Headers(),
                direction: 'request',
            };

            const v1Context: TransformContext = {
                url: 'https://api.example.com/api/v1/users',
                headers: new Headers(),
                direction: 'request',
            };

            expect(transformer.canTransform({}, v2Context)).toBe(true);
            expect(transformer.canTransform({}, v1Context)).toBe(false);
        });

        it('should enable conditional logic based on headers', () => {
            const transformer: HTTPTransformer = {
                canTransform: (body, context) => context.headers.get('x-api-version') === '2',
                transform: (body) => body,
            };

            const headers = new Headers();
            headers.set('x-api-version', '2');

            const context: TransformContext = {
                url: 'https://api.example.com',
                headers,
                direction: 'request',
            };

            expect(transformer.canTransform({}, context)).toBe(true);
        });

        it('should enable conditional logic based on direction', () => {
            const transformer: HTTPTransformer = {
                canTransform: (body, context) => context.direction === 'response',
                transform: (body) => body,
            };

            const requestContext: TransformContext = {
                url: '',
                headers: new Headers(),
                direction: 'request',
            };

            const responseContext: TransformContext = {
                url: '',
                headers: new Headers(),
                direction: 'response',
            };

            expect(transformer.canTransform({}, requestContext)).toBe(false);
            expect(transformer.canTransform({}, responseContext)).toBe(true);
        });
    });

    describe('transform', () => {
        it('should transform body synchronously', () => {
            const transformer: HTTPTransformer<string, string> = {
                canTransform: () => true,
                transform: (body) => body.toUpperCase(),
            };

            const context: TransformContext = {
                url: '',
                headers: new Headers(),
                direction: 'request',
            };

            expect(transformer.transform('hello', context)).toBe('HELLO');
        });

        it('should transform body asynchronously', async () => {
            const transformer: HTTPTransformer<string, string> = {
                canTransform: () => true,
                transform: async (body) => {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    return body.toUpperCase();
                },
            };

            const context: TransformContext = {
                url: '',
                headers: new Headers(),
                direction: 'request',
            };

            const result = await transformer.transform('hello', context);
            expect(result).toBe('HELLO');
        });

        it('should support type-changing transforms', () => {
            const transformer: HTTPTransformer<string, number> = {
                canTransform: () => true,
                transform: (body) => body.length,
            };

            const context: TransformContext = {
                url: '',
                headers: new Headers(),
                direction: 'request',
            };

            expect(transformer.transform('hello', context)).toBe(5);
        });
    });
});
```

**Checklist:**

- [ ] Create interface test file
- [ ] Test `canTransform` with various conditions (URL, headers, direction, mediaType)
- [ ] Test synchronous `transform`
- [ ] Test asynchronous `transform`
- [ ] Test type-changing transforms
- [ ] Test with metadata

**Estimated Time:** 1 hour

---

### 4.2-4.6 Specialized Transformer Tests

Each specialized transformer needs comprehensive tests:

**Files:**

- `test/transformers/json-transformer.spec.ts`
- `test/transformers/composition-transformer.spec.ts`
- `test/transformers/transducer-transformer.spec.ts`
- `test/transformers/form-data-transformer.spec.ts`
- `test/transformers/url-search-params-transformer.spec.ts`

**Test Coverage for Each:**

- [ ] Constructor with various configurations
- [ ] `canTransform` logic (type checks, conditions)
- [ ] `transform` with valid inputs
- [ ] Edge cases (null, undefined, empty, large data)
- [ ] Async transforms (if applicable)
- [ ] Error handling
- [ ] Integration with TransformContext

**Estimated Time:** 1-1.5 hours per transformer = 5-7 hours total

---

## Phase 5: Integration & Documentation

### 5.1 Integration Testing

**File:** `packages/blue-http/test/transform-integration.spec.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { HTTP } from '../src/http';
import { JSONTransformer } from '../src/transformers/json-transformer';

describe('Transform Pipeline Integration', () => {
    it('should apply request transforms', async () => {
        const http = new HTTP({
            requestTransforms: [(body) => ({ ...body, timestamp: Date.now() })],
        });

        // Test request transformation
        // ... integration test
    });

    it('should apply response transforms', async () => {
        const http = new HTTP({
            responseTransforms: [new JSONTransformer([(obj) => ({ ...obj, parsed: true })])],
        });

        // Test response transformation
        // ... integration test
    });

    it('should chain multiple transforms', async () => {
        // Test transform chaining
    });

    it('should apply transforms conditionally', async () => {
        // Test conditional transform logic
    });
});
```

**Checklist:**

- [ ] Create integration test file
- [ ] Test request transforms
- [ ] Test response transforms
- [ ] Test transform chaining
- [ ] Test conditional transforms
- [ ] Test with real HTTP requests (mock server)
- [ ] Test error handling

**Estimated Time:** 2-3 hours

---

### 5.2 Documentation

**Update:** `packages/blue-http/README.md`

**Add section:**

````markdown
## Body Transformations

@blue/http supports composable request/response body transformations inspired by Spring Framework's HttpMessageConverter pattern.

### Basic Usage

```typescript
import { HTTP } from '@blue/http';

const http = new HTTP({
    requestTransforms: [
        // Function transform
        (body) => sanitizeRequestBody(body),
    ],
    responseTransforms: [
        // Parse dates in responses
        (body) => parseDates(body),
    ],
});
```
````

### Specialized Transformers

Import from `@blue/http/transformers`:

```typescript
import { JSONTransformer, CompositionTransformer, TransducerTransformer } from '@blue/http/transformers';
```

#### JSONTransformer

Pipeline of functions for JSON objects:

```typescript
const transformer = new JSONTransformer([
    (obj) => removeNullValues(obj),
    (obj) => trimStrings(obj),
    (obj) => validateSchema(obj),
]);
```

#### CompositionTransformer

Generic function composition (left-to-right):

```typescript
const transformer = new CompositionTransformer<string, string>([
    (s) => s.trim(),
    (s) => s.toLowerCase(),
    (s) => s.replace(/\s+/g, '-'),
]);
```

#### TransducerTransformer

Memory-efficient transformations with early termination:

```typescript
import * as R from '@blue/util';

const transformer = new TransducerTransformer<number[], number[]>(
    R.compose(
        R.map((n: number) => n * 2),
        R.filter((n: number) => n > 10),
        R.take(5) // Early termination
    )
);
```

### Conditional Transforms

Use object transformers with `canTransform` for conditional logic:

```typescript
const http = new HTTP({
    responseTransforms: [
        {
            canTransform: (body, context) =>
                context.url.includes('/api/v2') && context.mediaType?.is('application/json'),
            transform: (body) => transformV2Format(body),
        },
    ],
});
```

### Transform Context

All transforms receive a `TransformContext`:

```typescript
interface TransformContext {
    url: string; // Request URL
    headers: Headers; // Request/response headers
    mediaType?: MediaType; // Content-Type parsed
    direction: 'request' | 'response';
    metadata?: Record<string, unknown>;
}
```

Use context for:

- URL-based routing
- Header-based authentication
- Multi-tenant logic
- Request vs response asymmetry

````

**Checklist:**
- [ ] Add "Body Transformations" section to README
- [ ] Document basic usage
- [ ] Document all 5 specialized transformers
- [ ] Provide clear examples
- [ ] Document TransformContext
- [ ] Document conditional transform patterns
- [ ] Link to API docs (if generated)

**Estimated Time:** 2 hours

---

## Validation Checklist

Before marking implementation complete:

### Code Quality
- [ ] All files follow STYLE_GUIDE.md naming conventions
- [ ] All code uses 4-space indentation
- [ ] All public APIs have TSDoc comments
- [ ] No `any` types without justification
- [ ] Imports follow Library Integration Layer pattern (use @blue/util, not ramda)

### Testing
- [ ] All tests pass: `pnpm test`
- [ ] Test coverage >80% for new code
- [ ] Integration tests verify end-to-end flow
- [ ] Edge cases covered (null, undefined, empty, large data)

### Type Safety
- [ ] `pnpm build` succeeds without errors
- [ ] Generic types work as expected
- [ ] Type inference works correctly
- [ ] No TypeScript `any` escape hatches

### Documentation
- [ ] README.md updated with usage examples
- [ ] All public APIs documented with TSDoc
- [ ] Examples are clear and runnable
- [ ] TransformContext usage documented

### Integration
- [ ] Subpath export works: `import {} from '@blue/http/transformers'`
- [ ] TransformInterceptor integrates with HTTP class
- [ ] Transforms run in correct order (after ContentTypeInterceptor)
- [ ] No circular dependencies

### Architecture
- [ ] MediaType location decision finalized (see research plan)
- [ ] No direct imports from ramda (use @blue/util)
- [ ] Follows existing @blue/http patterns
- [ ] Interceptor pattern used correctly

---

## Timeline Estimate

| Phase | Task | Time |
|-------|------|------|
| **Phase 1** | Core Infrastructure | 3-4 hours |
| 1.1 | Core types and interfaces | 30 min |
| 1.2 | TransformInterceptor | 2-3 hours |
| 1.3 | HTTP class updates | 30 min |
| **Phase 2** | Specialized Transformers | 5-6 hours |
| 2.1 | JSONTransformer | 1 hour |
| 2.2 | CompositionTransformer | 45 min |
| 2.3 | TransducerTransformer | 1-1.5 hours |
| 2.4 | FormDataTransformer | 1 hour |
| 2.5 | URLSearchParamsTransformer | 1 hour |
| 2.6 | Public exports | 10 min |
| **Phase 3** | Package Configuration | 15 min |
| 3.1 | package.json subpath exports | 15 min |
| **Phase 4** | Testing | 8-10 hours |
| 4.1 | Interface tests | 1 hour |
| 4.2-4.6 | Specialized transformer tests | 5-7 hours |
| 4.7 | Integration tests | 2-3 hours |
| **Phase 5** | Documentation | 2 hours |
| 5.1 | README.md updates | 2 hours |
| **Total** | | **18-22 hours** |

---

## Dependencies and Blockers

### Critical Dependencies
1. **MediaType Location Decision** (HIGH PRIORITY)
   - See: `docs/plans/2026-02-07_MEDIATYPE_LOCATION_ANALYSIS.md`
   - Affects `TransformContext` interface design
   - Must be resolved before Phase 1.1 completion

### Optional Dependencies
2. **Generic Type Parameter Decision** (LOW PRIORITY)
   - See: `docs/plans/2026-02-07_HTTP_TRANSFORMER_GENERICS.md`
   - Can be decided during Phase 1.1
   - Affects interface signature only

---

## Usage Examples

### Example 1: JSON Sanitizer

```typescript
import { HTTP } from '@blue/http';
import { JSONTransformer } from '@blue/http/transformers';

const http = new HTTP({
    responseTransforms: [
        new JSONTransformer([
            // Remove null values
            (obj) => Object.fromEntries(
                Object.entries(obj).filter(([_, v]) => v !== null)
            ),
            // Trim all string properties
            (obj) => Object.fromEntries(
                Object.entries(obj).map(([k, v]) =>
                    [k, typeof v === 'string' ? v.trim() : v]
                )
            ),
        ])
    ],
});

const response = await http.get('https://api.example.com/users/1');
// Response body automatically sanitized
````

### Example 2: Multi-Tenant Authentication

```typescript
import { HTTP } from '@blue/http';

const http = new HTTP({
    requestTransforms: [
        {
            canTransform: (body, context) => {
                const tenant = context.headers.get('x-tenant-id');
                return tenant === 'premium';
            },
            transform: (body, context) => ({
                ...body,
                features: ['advanced', 'analytics'],
            }),
        },
    ],
});
```

### Example 3: URL-Based Routing

```typescript
import { HTTP } from '@blue/http';

const http = new HTTP({
    responseTransforms: [
        {
            canTransform: (body, context) => context.url.includes('/api/v2'),
            transform: (body) => transformToV2Format(body),
        },
        {
            canTransform: (body, context) => context.url.includes('/api/v1'),
            transform: (body) => transformToV1Format(body),
        },
    ],
});
```

### Example 4: Transducer Performance

```typescript
import { HTTP } from '@blue/http';
import { TransducerTransformer } from '@blue/http/transformers';
import * as R from '@blue/util';

const http = new HTTP({
    responseTransforms: [
        new TransducerTransformer(
            R.compose(
                R.map((item: any) => ({ ...item, processed: true })),
                R.filter((item: any) => item.active),
                R.take(100) // Early termination - stop after 100 items
            )
        ),
    ],
});

// Processes large arrays efficiently (single-pass, early termination)
const response = await http.get('https://api.example.com/items');
```

---

## References

- Spring Framework HttpMessageConverter: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/http/converter/HttpMessageConverter.html
- @blue/http Interceptor System: `packages/blue-http/src/http-interceptor.ts`
- HTTP Feature Comparison: `docs/plans/2026-02-06_HTTP_FEATURE_COMPARISON.md`
- MediaType Analysis: `docs/plans/2026-02-07_MEDIATYPE_LOCATION_ANALYSIS.md`
- Generic Type Decision: `docs/plans/2026-02-07_HTTP_TRANSFORMER_GENERICS.md`

---

## Notes

- Transform pipeline runs AFTER ContentTypeInterceptor (headers set first)
- Transform pipeline runs BEFORE ResponseTypeInterceptor (transforms run on raw body)
- Body extraction/serialization may need enhancement for edge cases
- Consider adding metrics/logging for transform performance
- Future enhancement: Transform caching for expensive operations
