/**
 * Schema and path helpers for the OpenAPI generator.
 */
import { z } from 'zod';
import type { MethodParameter } from '@ndigo/dispatcher';
import type { OpenAPIResponseDocs } from './api-docs';
import type { OpenAPISchemaObject } from './spec-types.js';

const { toJSONSchema } = z;

/**
 * Normalizes an `@apiDocs` responses entry: a bare schema is
 * `{ description: 'OK', schema }`; the object form carries an optional
 * description and schema.
 */
export function responseDocsOf(entry: OpenAPIResponseDocs): { description: string; schema?: z.ZodType<unknown> } {
    if (entry instanceof z.ZodType) {
        return { description: 'OK', schema: entry };
    }
    return { description: entry.description ?? 'OK', schema: entry.schema };
}

/**
 * Converts a zod schema to a JSON Schema object compatible with the served
 * OpenAPI 3.0.3 document (embedded: no `$schema` header). The zod library
 * owns the conversion; the `openapi-3.0` target keeps constructs
 * such as nullable, literal and tuple fields valid for that version
 * (`nullable`/`enum`/`items` instead of `type: ['x', 'null']`/`const`/
 * `prefixItems`).
 */
export function jsonSchemaOf(schema: z.ZodType<unknown>): OpenAPISchemaObject {
    const converted = toJSONSchema(schema, { target: 'openapi-3.0' }) as OpenAPISchemaObject;
    // Embedded schemas carry no document-level `$schema` header.
    const { ['$schema']: _drop, ...embedded } = converted;
    return embedded;
}

/**
 * Fallback schema when no zod schema is attached: a string — or a type
 * hint from the extractor's `convertType` when present.
 */
export function typeSchemaOf(parameter: MethodParameter): OpenAPISchemaObject {
    const target = parameter.convertType?.target;
    if (target === Number) return { type: 'number' };
    if (target === Boolean) return { type: 'boolean' };
    if (target === Date) return { type: 'string', format: 'date-time' };
    if (target === Array) return { type: 'array', items: { type: 'string' } };
    return { type: 'string' };
}

/**
 * Translate a framework path template to OpenAPI syntax:
 * `:name` → `{name}` and `{*name}` (greedy) → `{name}`. Catch-alls with no
 * parameter meaning (`**`) are excluded by the caller (methodless).
 */
export function translatePath(pattern: string): string | null {
    if (pattern === '' || pattern === '**') return null;
    let path = pattern.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
    path = path.replace(/\{\*([A-Za-z0-9_]+)\}/g, '{$1}');
    return path.startsWith('/') ? path : `/${path}`;
}

/**
 * True for a `$ref` value that resolves against the converted schema's own
 * document root — the shape zod emits for recursive schemas (`'#'`, the
 * document root) and for schemas carrying a registered `id`
 * (`'#/definitions/<id>'`, a root-level bundle).
 */
export function isRootRelativeRef(value: unknown): value is string {
    return typeof value === 'string' && value.startsWith('#');
}

/** Does the converted schema carry any root-relative `$ref` — i.e. need hoisting? */
export function containsRootRelativeRef(node: unknown): boolean {
    if (Array.isArray(node)) return node.some(containsRootRelativeRef);
    if (node === null || typeof node !== 'object') return false;
    const record = node as Record<string, unknown>;
    if (isRootRelativeRef(record['$ref'])) return true;
    return Object.values(record).some(containsRootRelativeRef);
}

/** Collects zod's `definitions`/`$defs` bundles as component candidates, in order. */
export function schemaDefinitionsOf(schema: OpenAPISchemaObject): Map<string, OpenAPISchemaObject> {
    const definitions = new Map<string, OpenAPISchemaObject>();
    for (const key of ['definitions', '$defs'] as const) {
        const bundle = schema[key];
        if (bundle === null || typeof bundle !== 'object' || Array.isArray(bundle)) continue;
        for (const [id, definition] of Object.entries(bundle as Record<string, OpenAPISchemaObject>)) {
            definitions.set(id, definition);
        }
    }
    return definitions;
}

/** The definition id of a root-relative `#/definitions/<id>` pointer, when it is one. */
export function definitionIdOf(ref: string): string | undefined {
    const match = /^#\/(?:definitions|\$defs)\/(.+)$/.exec(ref);
    return match === null ? undefined : match[1];
}

/** A component-key-safe name derived from a usage hint or a schema `id`. */
export function componentKeyOf(hint: string): string {
    const key = hint.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return key === '' ? 'Schema' : key;
}
