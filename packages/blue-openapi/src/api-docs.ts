/**
 * `@apiDocs` — optional per-handler documentation metadata (AD-35 D-4).
 *
 * Purely additive: routes document themselves without it; with it, the
 * OpenAPI generator can carry summary, tags, operation ids and deprecation
 * into the spec. Stored in the same `Symbol.metadata` store as
 * `@routeMapping` / `@parameters`.
 * @module blue-openapi
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { z } from 'zod';
import { FrameworkError, getSymbolMetadata } from '@blue/core';

/**
 * Documentation for one response status (AD-38 D-4).
 *
 * A bare zod schema is shorthand for `{ description: 'OK', schema }` — the
 * typical case: the DTO schema the handler converts through (AD-38), which
 * the generator embeds via Zod's `toJSONSchema` seam. The object form
 * additionally allows a custom `description`.
 */
export type OpenAPIResponseDocs = z.ZodType<unknown> | { description?: string; schema?: z.ZodType<unknown> };

/**
 * Documentation metadata for a single handler method.
 */
export interface APIDocsMetadata {
    /** Short operation label (OpenAPI `summary`). */
    summary?: string;
    /** Long-form operation description (OpenAPI `description`). */
    description?: string;
    /** Tags grouping this operation in the docs UI. */
    tags?: string[];
    /** Explicit `operationId`; otherwise one is derived from method + path. */
    operationId?: string;
    /** Marks the operation deprecated in the spec. */
    deprecated?: boolean;
    /** Excludes the operation from the generated spec entirely. */
    hidden?: boolean;
    /**
     * Optional per-status response documentation; bare schemas embed into
     * `content['application/json']`. When declared, this set **replaces**
     * the implicit `200: { description: 'OK' }` (declare `'200'` yourself to
     * keep it); without it the generator emits the default `200 OK`.
     */
    responses?: Record<string, OpenAPIResponseDocs>;
    /**
     * Security scheme names this operation requires (OpenAPI `security`);
     * names refer to schemes declared via
     * `OpenAPIGeneratorOptions.securitySchemes`. Overrides the document-level
     * default; an empty array documents an explicitly anonymous operation.
     * Without it the operation inherits the document default.
     */
    security?: string[];
}

const API_DOCS_KEY = (name: string | symbol) => `api:docs:${String(name)}`;

/**
 * Decorator: attach documentation metadata to a handler method.
 *
 * Method-only — the spec generator reads it off the handler's prototype, so
 * class-level docs have no carrier (annotate each method).
 *
 * @param docs - The metadata to attach.
 * @returns A method decorator.
 *
 * @example
 * ```ts
 * @getMapping('/reports')
 * @parameters({ from: queryValue('from') })
 * @apiDocs({ summary: 'List reports', tags: ['reports'] })
 * list(from: string | undefined) { … }
 * ```
 */
export function apiDocs(docs: APIDocsMetadata) {
    return (_target: unknown, context: ClassMethodDecoratorContext): void => {
        if (context.kind !== 'method') {
            throw new FrameworkError('@apiDocs is method-only — annotate each handler method (AD-35 D-4).');
        }
        context.metadata[API_DOCS_KEY(context.name)] = docs;
    };
}

/**
 * Read the `@apiDocs` metadata declared on a handler method.
 *
 * @param target - The class prototype or constructor.
 * @param propertyKey - The method name.
 * @returns The metadata, or `undefined` when undeclared.
 */
export function getApiDocs(target: unknown, propertyKey: string | symbol): APIDocsMetadata | undefined {
    return getSymbolMetadata(target)[API_DOCS_KEY(propertyKey)];
}
