/**
 * Zod-backed request validation (AD-7).
 *
 * `validatedBy` wraps a parameter extractor (e.g. `bindValue('query')`,
 * `queryValue('email')`, `bodyValue('*')`) with a Zod schema. The schema runs
 * after the value is resolved and type-converted, and coerces or rejects it:
 * on failure a {@link ParameterConversionError} is thrown, which flows
 * through the dispatcher's error resolver like any argument conversion
 * failure (a `400` in the Node platform's HTTP pipeline).
 *
 * Replaces the legacy `@blue/validate` constraint system, which was
 * structurally dead — `routeParams` never invoked its `.convert` hook and the
 * resolver only read `convertType`.
 *
 * ## Whole-body (Node) — validatedBody
 *
 * ```ts
 * const NoteSchema = z.object({
 *     title: z.string().min(1).max(140),
 *     body: z.string().optional(),
 * });
 *
 * @postMapping('/')
 * @routeParams({ note: validatedBody(NoteSchema) })
 * create(note: z.infer<typeof NoteSchema>) { … }
 * ```
 *
 * ## Whole query — validatedQuery
 *
 * ```ts
 * const SearchSchema = z.object({
 *     page: z.coerce.number().min(1),
 *     q: z.string().max(80),
 * });
 *
 * @routeParams({ search: validatedQuery(SearchSchema) })
 * search(search: z.infer<typeof SearchSchema>) { … }
 * ```
 *
 * ## Whole map — validateParams
 *
 * ```ts
 * @routeParams(validateParams(UserSchema, { user: bindValue('query') }))
 * ```
 *
 * ## Per-field — validatedBy
 *
 * Validation applies per argument — a single schema over one extractor:
 *
 * ```ts
 * @routeParams({ email: validatedBy(z.email(), queryValue('email')) })
 * subscribe(email: string) { … }
 * ```
 *
 * The hook runs on every platform resolver: it is invoked by the shared
 * `AbstractPlatformArgumentResolver` pipeline (after `convertType`
 * conversion), the browser BIND resolver, and the shared named-value
 * resolvers. Schemas therefore see already-coerced values
 * (`z.coerce.number()` on a query string works).
 *
 * On failure the thrown {@link ParameterConversionError} carries a
 * {@link ZodValidationError} as its `cause`: the flattened human message
 * plus a structured `issues` array (path / message / code per failed field)
 * that error resolvers can render into machine-readable response detail.
 *
 * @module
 */

import { z } from 'zod';
import { ParameterConversionError } from './error';
import { type ParameterExtractor, type RouteParameterMap, bodyValue, queryValue } from './route-parameter';

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
 */
export class ZodValidationError extends Error {
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
 * Wraps a parameter extractor with a Zod schema for validation and coercion.
 *
 * @example
 * ```ts
 * const UserSchema = z.object({
 *     name: z.string().min(2),
 *     age: z.coerce.number().min(18),
 * });
 *
 * @routeMapping('/create')
 * @routeParams({ user: validatedBy(UserSchema, bindValue('query')) })
 * create(user: z.infer<typeof UserSchema>) { … }
 * ```
 *
 * @param schema - The Zod schema to validate and coerce the resolved value.
 * @param extractor - The parameter extractor (e.g. `bindValue('query')`).
 * @returns The extractor with the Zod validation attached.
 */
export function validatedBy<T>(schema: z.ZodType<T>, extractor: ParameterExtractor): ParameterExtractor {
    const convert: (value: any) => any = (value: any) => {
        const result = schema.safeParse(value);
        if (!result.success) {
            const issues = result.error.issues.map((issue) => ({
                path: issue.path,
                message: issue.message,
                code: issue.code,
            }));
            const message = issues
                .map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`)
                .join(', ');
            // The cause is a ZodValidationError: it preserves the flattened
            // human message AND the structured per-field issues, so error
            // resolvers can render either (Phase 4A).
            throw new ParameterConversionError(extractor.name, 'validated', new ZodValidationError(message, issues));
        }
        return result.data;
    };
    return { ...extractor, convert };
}

/**
 * Convenience overlay for {@link validatedBy} over a whole `routeParams` map.
 *
 * @example
 * ```ts
 * @routeParams(validateParams(UserSchema, { user: bindValue('query') }))
 * ```
 *
 * @param schema - The Zod schema validating the bound object.
 * @param extractors - The route-parameter map.
 * @returns The map with the schema attached to each extractor.
 */
export function validateParams(schema: z.ZodType, extractors: RouteParameterMap): RouteParameterMap {
    const mapped: RouteParameterMap = {};
    for (const [name, extractor] of Object.entries(extractors)) {
        mapped[name] = validatedBy(schema, extractor);
    }
    return mapped;
}

/**
 * Sugar for validating the entire parsed request body against a Zod schema.
 *
 * Equivalent to {@link validatedBy}`(schema, bodyValue('*'))`. The `'*'`
 * extractor convention binds the whole parsed body object (Node platform).
 *
 * @example
 * ```ts
 * @routeParams({ note: validatedBody(NoteSchema) })
 * create(note: z.infer<typeof NoteSchema>) { … }
 * ```
 *
 * @param schema - The Zod schema validating the whole body.
 * @returns A parameter extractor binding `bodyValue('*')` through the schema.
 */
export function validatedBody<T>(schema: z.ZodType<T>): ParameterExtractor {
    return validatedBy(schema, bodyValue('*'));
}

/**
 * Sugar for validating the entire query object against a Zod schema.
 *
 * Equivalent to {@link validatedBy}`(schema, queryValue('*'))`. The `'*'`
 * extractor convention binds the whole `route.data` object (all query
 * parameters), so an object schema validates/coerces the whole query — e.g.
 * `z.object({ page: z.coerce.number(), q: z.string() })` against
 * `?page=2&q=search`.
 *
 * @example
 * ```ts
 * @routeParams({ search: validatedQuery(SearchSchema) })
 * search(search: z.infer<typeof SearchSchema>) { … }
 * ```
 *
 * @param schema - The Zod schema validating the whole query object.
 * @returns A parameter extractor binding `queryValue('*')` through the schema.
 */
export function validatedQuery<T>(schema: z.ZodType<T>): ParameterExtractor {
    return validatedBy(schema, queryValue('*'));
}

export type { MethodParameter } from './route-parameter';
