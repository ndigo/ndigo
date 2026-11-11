/**
 * Zod-backed request validation (AD-07).
 */
import { FrameworkError } from '@ndigo/core';
import { z } from 'zod';
import { ParameterConversionError } from './error';
import { type ParameterExtractor, type ParameterMap, bodyValue, queryValue } from './parameters';

/**
 * A single failed check from a Zod schema parse.
 *
 * Mirrors the stable subset of a Zod v4 issue: the failing path, human
 * message, and error code (`too_small`, `invalid_type`, `email`, …).
 */
export interface ValidationIssue {
    /** The failing path, e.g. `['title']` for a nested field. */
    readonly path: readonly PropertyKey[];
    /** The failure message. */
    readonly message: string;
    /** The Zod error code, e.g. `too_small`, `invalid_type`, `email`. */
    readonly code: string;
}

/**
 * The `cause` carried by a `ParameterConversionError` thrown from
 * {@link validatedBy}. Preserves the flattened human-readable message (in
 * `message`) alongside the machine-readable per-issue details (in `issues`),
 * so error resolvers can render either a flat detail string or a structured
 * `errors` array.
 *
 * This is a **structured payload, not an independently thrown error**: on V8
 * its `.stack` carries only the `name: message` header, because the thrown
 * `ParameterConversionError` already owns the single stack for the failure
 * (AD-103). Engines without `Error.stackTraceLimit` keep their default capture.
 */
export class ZodValidationError extends FrameworkError {
    /** The structured per-field failures from the Zod parse. */
    readonly issues: readonly ValidationIssue[];

    /**
     * Create a validation error.
     *
     * @param message - The flattened, human-readable failure message.
     * @param issues - The structured per-field failures.
     */
    constructor(message: string, issues: readonly ValidationIssue[]) {
        super(message);
        this.issues = issues;
    }
}

/**
 * The empty payload shapes an unset request body reaches `convert` as. Each
 * shape produces different Zod issues ("received null" vs "received undefined"
 * vs one issue per required field), so each gets its own memoized failure.
 */
type EmptyShape = 'object' | 'null' | 'undefined';

/**
 * A precomputed failure for one schema and empty-input shape. Zod parses are
 * deterministic for a fixed schema and input, so the message and normalized
 * issues can be built once and reused.
 */
interface EmptyShapeFailure {
    /** The flattened, human-readable failure message. */
    readonly message: string;
    /** The normalized per-field issues. */
    readonly issues: readonly ValidationIssue[];
}

/**
 * Memoized empty-shape outcomes per schema: a {@link EmptyShapeFailure} when
 * the shape is rejected, `null` when the schema accepts it. Acceptance is
 * recorded only to avoid re-probing on every request — the real parse still
 * runs, because defaults and transforms may produce request-specific data that
 * must not be shared between requests.
 */
const emptyShapeOutcomes = new WeakMap<z.ZodType, Map<EmptyShape, EmptyShapeFailure | null>>();

/**
 * Whether a value is a plain object (`Object.prototype` or a null prototype)
 * with no own keys, i.e. the empty-object payload shape.
 *
 * A keyless class instance can still satisfy a schema through prototype
 * accessors or a custom parser, so it must take the real parse.
 *
 * @param value - The resolved parameter value.
 * @returns `true` when the value is a plain object with no own keys.
 */
function isEmptyPlainObject(value: unknown): boolean {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
        return false;
    }
    // Own keys includes non-enumerable and symbol keys, which Zod can read even
    // though `Object.keys` would not report them.
    return Object.keys(value).length === 0 && Reflect.ownKeys(value).length === 0;
}

/**
 * Normalizes a Zod error into the message and issues pair carried by
 * {@link ZodValidationError}.
 *
 * @param error - The failed parse error.
 * @returns The flattened message and normalized issues.
 */
function toValidationFailure(error: z.ZodError): EmptyShapeFailure {
    const issues = error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
        code: issue.code,
    }));
    return {
        message: issues.map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`).join(', '),
        issues,
    };
}

/**
 * Resolves the memoized outcome for one schema and empty shape, parsing the
 * canonical empty value on first use.
 *
 * @param schema - The validation schema.
 * @param shape - The empty payload shape.
 * @returns The failure template, or `null` when the schema accepts that shape.
 */
function emptyShapeOutcome(schema: z.ZodType, shape: EmptyShape): EmptyShapeFailure | null {
    let outcomes = emptyShapeOutcomes.get(schema);
    if (outcomes?.has(shape)) {
        return outcomes.get(shape) ?? null;
    }
    const emptyValue = shape === 'object' ? {} : shape === 'null' ? null : undefined;
    const result = schema.safeParse(emptyValue);
    const outcome = result.success ? null : toValidationFailure(result.error);
    if (!outcomes) {
        outcomes = new Map();
        emptyShapeOutcomes.set(schema, outcomes);
    }
    outcomes.set(shape, outcome);
    return outcome;
}

/**
 * V8's per-engine stack-trace limit. Other engines do not define the data
 * property; the guard below then takes the default-capture path (AD-103 D-3).
 */
const stackTraceLimitHost = Error as typeof Error & { stackTraceLimit?: number };

/**
 * Constructs the cause with stack capture disabled, restoring the previous
 * limit in `finally` so the global never stays toggled (AD-103 D-2). The
 * window is synchronous and contains no user code.
 *
 * @param message - The flattened, human-readable failure message.
 * @param issues - The structured per-field failures.
 * @returns The structured cause, header-only on V8.
 */
function createValidationCause(message: string, issues: readonly ValidationIssue[]): ZodValidationError {
    const previousLimit = stackTraceLimitHost.stackTraceLimit;
    if (typeof previousLimit !== 'number') {
        return new ZodValidationError(message, issues);
    }
    stackTraceLimitHost.stackTraceLimit = 0;
    try {
        return new ZodValidationError(message, issues);
    } finally {
        stackTraceLimitHost.stackTraceLimit = previousLimit;
    }
}

/**
 * Builds the conversion error for a validation failure. The thrown error keeps
 * the only stack; the {@link ZodValidationError} cause is a structured payload
 * constructed without capture (AD-103). Only the immutable message and issues
 * are shared with the memoized templates.
 *
 * @param extractor - The extractor whose name labels the failure.
 * @param failure - The normalized validation failure.
 * @returns The conversion error to throw.
 */
function toConversionError(extractor: ParameterExtractor, failure: EmptyShapeFailure): ParameterConversionError {
    return new ParameterConversionError(
        extractor.name,
        'validated',
        createValidationCause(failure.message, failure.issues)
    );
}

/**
 * Wraps a parameter extractor with a Zod schema for validation and coercion.
 *
 * @example
 * ```ts
 * const UserSchema = z.object({
 *     name: z.string().min(2),
 *     age: z.coerce.number().min(18),
 * });
 *
 * class UserController {
 *   @routeMapping('/create')
 *   @parameters({ user: validatedBy(UserSchema, dataBinderValue('query')) })
 *   create(user: z.infer<typeof UserSchema>) {}
 * }
 * ```
 *
 * @param schema - The Zod schema to validate and coerce the resolved value.
 * @param extractor - The parameter extractor (e.g. `dataBinderValue('query')`).
 * @returns The extractor with the Zod validation attached.
 */
export function validatedBy<T>(schema: z.ZodType<T>, extractor: ParameterExtractor): ParameterExtractor {
    const convert: (value: unknown) => unknown = (value: unknown) => {
        // A missing body is the common invalid case: fail from the memoized
        // template before paying a parse.
        if (value === undefined || value === null) {
            const failure = emptyShapeOutcome(schema, value === null ? 'null' : 'undefined');
            if (failure !== null) {
                throw toConversionError(extractor, failure);
            }
        }
        const result = schema.safeParse(value);
        if (!result.success) {
            // Keyless plain objects are the other empty-body shape. This check
            // sits on the failure path only, so valid bodies pay nothing for it.
            if (isEmptyPlainObject(value)) {
                const failure = emptyShapeOutcome(schema, 'object');
                if (failure !== null) {
                    throw toConversionError(extractor, failure);
                }
            }
            // The cause is a ZodValidationError: it preserves the flattened
            // human message AND the structured per-field issues, so error
            // resolvers can render either (Phase 4A).
            throw toConversionError(extractor, toValidationFailure(result.error));
        }
        return result.data;
    };
    // The schema rides along as a generation-time introspection seam (AD-35):
    // the OpenAPI generator derives JSON Schema from it. Resolution still
    // goes through `convert` only.
    return { ...extractor, convert, schema };
}

/**
 * Convenience overlay for {@link validatedBy} over a whole `parameters` map.
 *
 * @example
 * ```ts
 * class UserController {
 *   @parameters(validateParameters(UserSchema, { user: dataBinderValue('query') }))
 *   create(user: z.infer<typeof UserSchema>) {}
 * }
 * ```
 *
 * @param schema - The Zod schema validating the bound object.
 * @param extractors - The parameters map.
 * @returns The map with the schema attached to each extractor.
 */
export function validateParameters(schema: z.ZodType, extractors: ParameterMap): ParameterMap {
    const mapped: ParameterMap = {};
    for (const [name, extractor] of Object.entries(extractors)) {
        mapped[name] = validatedBy(schema, extractor);
    }
    return mapped;
}

/**
 * Sugar for validating the entire parsed request body against a Zod schema.
 *
 * Equivalent to {@link validatedBy}`(schema, bodyValue())`. The no-argument
 * extractor binds the whole parsed body object (Node platform).
 *
 * @example
 * ```ts
 * class NoteController {
 *   @parameters({ note: validatedBody(NoteSchema) })
 *   create(note: z.infer<typeof NoteSchema>) {}
 * }
 * ```
 *
 * @param schema - The Zod schema validating the whole body.
 * @returns A parameter extractor binding `bodyValue()` through the schema.
 */
export function validatedBody<T>(schema: z.ZodType<T>): ParameterExtractor {
    return validatedBy(schema, bodyValue());
}

/**
 * Sugar for validating the entire query object against a Zod schema.
 *
 * Equivalent to {@link validatedBy}`(schema, queryValue())`. The no-argument
 * extractor binds the whole `route.data` object (all query parameters), so an
 * object schema validates/coerces the whole query — e.g.
 * `z.object({ page: z.coerce.number(), q: z.string() })` against
 * `?page=2&q=search`.
 *
 * @example
 * ```ts
 * class SearchController {
 *   @parameters({ search: validatedQuery(SearchSchema) })
 *   search(search: z.infer<typeof SearchSchema>) {}
 * }
 * ```
 *
 * @param schema - The Zod schema validating the whole query object.
 * @returns A parameter extractor binding `queryValue()` through the schema.
 */
export function validatedQuery<T>(schema: z.ZodType<T>): ParameterExtractor {
    return validatedBy(schema, queryValue());
}

export type { MethodParameter } from './parameters';
