# HTTPTransformer Generic Type Parameter Decision

**Date:** February 7, 2026  
**Status:** 🤔 DECISION PENDING  
**Priority:** Low  
**Context:** HTTP Transform Pipeline - Generic type signature optimization

## Question

Should `HTTPTransformer<TInput, TOutput>` make `TOutput` default to `TInput` when not explicitly specified?

## Current Design

```typescript
interface HTTPTransformer<TInput = any, TOutput = any> {
    canTransform(body: TInput, context: TransformContext): boolean;
    transform(body: TInput, context: TransformContext): TOutput | Promise<TOutput>;
}
```

**Usage:**

```typescript
// Sanitizer that doesn't change type
const sanitizer: HTTPTransformer<JSONObject, JSONObject> = {
    // Both type parameters required
};
```

## Proposed Alternative

```typescript
interface HTTPTransformer<TInput = any, TOutput = TInput> {
    canTransform(body: TInput, context: TransformContext): boolean;
    transform(body: TInput, context: TransformContext): TOutput | Promise<TOutput>;
}
```

**Usage:**

```typescript
// Sanitizer that doesn't change type
const sanitizer: HTTPTransformer<JSONObject> = {
    // TOutput automatically = JSONObject
};
```

## Rationale

### Benefits of `TOutput = TInput`

1. **Less Repetition for Same-Type Transforms**

    ```typescript
    // Before: HTTPTransformer<string, string>
    // After:  HTTPTransformer<string>
    const trimWhitespace: HTTPTransformer<string> = {
        /* ... */
    };
    ```

2. **Common Use Case**

    - Sanitizers often don't change type (clean data in, clean data out)
    - Validators may reject but don't transform type
    - Many transforms preserve type structure

3. **Still Explicit When Needed**
    ```typescript
    // Type-changing transforms still explicit
    const jsonParser: HTTPTransformer<string, JSONObject> = {
        /* ... */
    };
    ```

### Concerns

1. **Type Inference**

    - Does TypeScript correctly infer when one generic is provided?
    - What happens with type constraints?

2. **Composition**

    - CompositionTransformer pipes multiple transforms
    - Does `TOutput = TInput` complicate composition types?

3. **Convention**
    - What do other @blue packages do?
    - Is this pattern used elsewhere in the codebase?

## Research Tasks

### 1. Survey @blue/core Conventions

**Check:**

- [ ] `@blue/core/src/transducer.ts` - How are generics structured?
- [ ] Any other interfaces with input/output generics
- [ ] Pattern: Do they default output to input?

**Example from transducers:**

```typescript
// Check actual signature in @blue/core
interface Transducer<TInput, TOutput> {
    // Does this default TOutput to TInput?
}
```

### 2. Test TypeScript Type Inference

**Create test file to validate:**

```typescript
// Test case 1: Single generic provided
interface TestTransformer<TInput = any, TOutput = TInput> {
    transform(input: TInput): TOutput;
}

const test1: TestTransformer<string> = {
    transform: (input) => input.toUpperCase(),
    // Does TypeScript infer return type as string?
};

// Test case 2: Both generics provided
const test2: TestTransformer<string, number> = {
    transform: (input) => input.length,
    // Return type should be number
};

// Test case 3: With constraints
interface ConstrainedTransformer<TInput extends object = object, TOutput extends object = TInput> {
    transform(input: TInput): TOutput;
}

// Test case 4: In composition
type ComposedTransform<T1, T2, T3 = T2> = TestTransformer<T1, T2> | TestTransformer<T2, T3>;
```

**Validation:**

- [ ] Create actual test file
- [ ] Run `tsc --noEmit` to check type errors
- [ ] Verify inference works as expected
- [ ] Test edge cases

### 3. Review Similar Patterns in Ecosystem

**Check popular libraries:**

- [ ] How does RxJS define Observable transforms?
- [ ] How does Ramda define function composition types?
- [ ] How do transformer libraries structure generics?

### 4. Composition Impact Analysis

**CompositionTransformer signature:**

```typescript
class CompositionTransformer<TInput, TOutput> implements HTTPTransformer<TInput, TOutput> {
    constructor(private readonly fns: Array<(x: any) => any>) {}
    // ...
}
```

**Question:** If we default `TOutput = TInput`, does this complicate:

- Chaining multiple transformers with different types?
- Type inference through pipe()?
- Error messages when types don't match?

**Test:**

```typescript
// Can we still do this?
const composed = new CompositionTransformer<string, number>([(s: string) => s.length, (n: number) => n * 2]);

// Or does defaulting break this?
```

## Decision Matrix

| Aspect                   | TOutput = any     | TOutput = TInput  |
| ------------------------ | ----------------- | ----------------- |
| Same-type transforms     | Must repeat type  | Concise           |
| Type-changing transforms | Explicit          | Still explicit    |
| Type inference           | Standard          | Standard          |
| Composition              | Clear             | Clear             |
| Convention alignment     | [Research needed] | [Research needed] |
| Learning curve           | Familiar          | Slightly cleverer |

## Code Examples

### Example 1: Sanitizer (Same Type)

```typescript
// Current: TOutput = any
const sanitizeJSON: HTTPTransformer<JSONObject, JSONObject> = {
    canTransform: (body) => typeof body === 'object',
    transform: (body) => {
        // Remove null values, trim strings, etc.
        return sanitized;
    },
};

// Proposed: TOutput = TInput
const sanitizeJSON: HTTPTransformer<JSONObject> = {
    // TOutput automatically JSONObject
    canTransform: (body) => typeof body === 'object',
    transform: (body) => {
        return sanitized;
    },
};
```

**Analysis:** Cleaner, less repetition

### Example 2: Parser (Type Change)

```typescript
// Current: TOutput = any
const jsonParser: HTTPTransformer<string, JSONObject> = {
    canTransform: (body) => typeof body === 'string',
    transform: (body) => JSON.parse(body),
};

// Proposed: TOutput = TInput
const jsonParser: HTTPTransformer<string, JSONObject> = {
    // Still need to specify both
    canTransform: (body) => typeof body === 'string',
    transform: (body) => JSON.parse(body),
};
```

**Analysis:** No change, still explicit

### Example 3: Composition

```typescript
// Current
const pipeline = new CompositionTransformer<string, string>([
    (s) => s.trim(),
    (s) => s.toLowerCase(),
    (s) => s.replace(/\s+/g, '-'),
]);

// Proposed
const pipeline = new CompositionTransformer<string>([
    // TOutput = string automatically
    (s) => s.trim(),
    (s) => s.toLowerCase(),
    (s) => s.replace(/\s+/g, '-'),
]);
```

**Analysis:** Cleaner for same-type pipelines

## Recommendation

[TBD after research]

**Preliminary Lean:** Favor `TOutput = TInput` if:

1. TypeScript inference works correctly
2. Doesn't complicate composition
3. Aligns with @blue/core conventions
4. Common use case is same-type transforms

**Rationale:** Reduces repetition for the common case (sanitizers, validators, same-type transforms) while still allowing explicit type changes when needed.

## Implementation Impact

**If we choose `TOutput = TInput`:**

- Update `HTTPTransformer<TInput, TOutput>` interface
- Update all 5 specialized transformer class signatures
- Update documentation and usage examples
- No breaking change (backwards compatible)

**If we keep `TOutput = any`:**

- No changes needed
- More verbose for same-type transforms

## Timeline

**Estimated Time:** 1-2 hours

- Code convention research: 30 minutes
- Type inference testing: 30 minutes
- Documentation: 30 minutes

## Next Steps

1. **Research** @blue/core conventions
2. **Test** TypeScript type inference
3. **Decide** based on findings
4. **Document** decision in this file
5. **Update** HTTP Transform Pipeline plan with decision

## References

- TypeScript Handbook: Generics - https://www.typescriptlang.org/docs/handbook/2/generics.html
- TypeScript Handbook: Type Inference - https://www.typescriptlang.org/docs/handbook/type-inference.html
