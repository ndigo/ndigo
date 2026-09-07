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
 * ## Whole-body (Node)
 *
 * ```ts
 * const NoteSchema = z.object({
 *     title: z.string().min(1).max(140),
 *     body: z.string().optional(),
 * });
 *
 * @postMapping('/')
 * @routeParams({ note: validatedBy(NoteSchema, bodyValue('*')) })
 * create(note: z.infer<typeof NoteSchema>) { … }
 * ```
 *
 * ## Whole map (browser BIND or shared extractors)
 *
 * ```ts
 * @routeParams(validateParams(UserSchema, { user: bindValue('query') }))
 * ```
 *
 * ## Per-field
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
 * conversion) and by the browser BIND resolver. Schemas therefore see
 * already-coerced values (`z.coerce.number()` on a query string works).
 *
 * @module
 */

import { z } from 'zod';
import { ParameterConversionError } from './error';
import { type ParameterExtractor, type RouteParameterMap } from './route-parameter';

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
            const message = result.error.issues
                .map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`)
                .join(', ');
            throw new ParameterConversionError(extractor.name, 'validated', new Error(message));
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

export type { MethodParameter } from './route-parameter';
