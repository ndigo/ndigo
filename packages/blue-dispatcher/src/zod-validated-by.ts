/**
 * Zod-backed request validation (AD-7).
 * * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
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
 * @parameters({ user: validatedBy(UserSchema, bindBrowserValue('query')) })
 * create(user: z.infer<typeof UserSchema>) { … }
 * ```
 *
 * @param schema - The Zod schema to validate and coerce the resolved value.
 * @param extractor - The parameter extractor (e.g. `bindBrowserValue('query')`).
 * @returns The extractor with the Zod validation attached.
 */
export function validatedBy<T>(schema: z.ZodType<T>, extractor: ParameterExtractor): ParameterExtractor {
    const convert: (value: unknown) => unknown = (value: unknown) => {
        const result = schema.safeParse(value);
        if (!result.success) {
            const issues = result.error.issues.map((issue) => ({
                path: issue.path,
                message: issue.message,
                code: issue.code,
            }));
            const message = issues.map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`).join(', ');
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
 * Convenience overlay for {@link validatedBy} over a whole `parameters` map.
 *
 * @example
 * ```ts
 * @parameters(validateParameters(UserSchema, { user: bindBrowserValue('query') }))
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
 * Equivalent to {@link validatedBy}`(schema, bodyValue('*'))`. The `'*'`
 * extractor convention binds the whole parsed body object (Node platform).
 *
 * @example
 * ```ts
 * @parameters({ note: validatedBody(NoteSchema) })
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
 * @parameters({ search: validatedQuery(SearchSchema) })
 * search(search: z.infer<typeof SearchSchema>) { … }
 * ```
 *
 * @param schema - The Zod schema validating the whole query object.
 * @returns A parameter extractor binding `queryValue('*')` through the schema.
 */
export function validatedQuery<T>(schema: z.ZodType<T>): ParameterExtractor {
    return validatedBy(schema, queryValue('*'));
}

export type { MethodParameter } from './parameters';
