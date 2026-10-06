/**
 * OpenAPI 3.0.3 spec generation from dispatch metadata (AD-35 D-2/D-3).
 *
 * The generator walks `RouteHandlerMapping.getHandlerMethods()` — the exact
 * table dispatch uses — so the document cannot drift from behavior. Nothing
 * is parsed: patterns, method conditions, resolved `MethodParameter`s and
 * the zod schemas `validatedBy` carries are all runtime metadata the
 * framework already holds.
 * * @module blue-openapi
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';
import type { HTTPMethod } from '@blue/http';
import {
    type RouteHandlerMethod,
    type RouteMappingInfo,
    MethodParameterType,
    type MethodParameter,
} from '@blue/dispatcher';
import { getApiDocs, type APIDocsMetadata, type OpenAPIResponseDocs } from './api-docs';

/**
 * What the generator needs from a handler mapping: the registered route
 * table. `RadixMetadataHandlerMapping` (and any
 * `AbstractHandlerMethodMapping`) satisfies it structurally.
 */
export interface RouteMappingTable {
    getHandlerMethods(): Map<RouteMappingInfo, RouteHandlerMethod>;
}

/**
 * A JSON Schema object (subset) — the OpenAPI `schema` field.
 */
export interface OpenAPISchemaObject {
    [key: string]: unknown;
}

/**
 * An OpenAPI parameter object.
 */
export interface OpenAPIParameter {
    name: string;
    in: 'query' | 'path' | 'header' | 'cookie';
    required: boolean;
    schema?: OpenAPISchemaObject;
    description?: string;
}

/**
 * An OpenAPI request body.
 */
export interface OpenAPIRequestBody {
    required: boolean;
    content: Record<string, { schema?: OpenAPISchemaObject }>;
}

/**
 * An OpenAPI operation response object.
 */
export interface OpenAPIResponse {
    description: string;
    /**
     * Response content — e.g. `{ 'application/json': { schema } }` when the
     * handler declares its DTO via `@apiDocs({ responses })` (AD-38 D-4).
     */
    content?: Record<string, { schema?: OpenAPISchemaObject }>;
}

/**
 * An OpenAPI operation object. Framework-specific conditions are preserved
 * under `x-blue-*` extensions rather than dropped.
 */
export interface OpenAPIOperation {
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    deprecated?: boolean;
    parameters?: OpenAPIParameter[];
    requestBody?: OpenAPIRequestBody;
    responses: Record<string, OpenAPIResponse>;
    /** Framework matrix-parameter conditions (AD-35 D-2). */
    'x-blue-matrixParams'?: string[];
    /** Framework query-parameter conditions (AD-35 D-2). */
    'x-blue-queryParams'?: string[];
}

/**
 * An OpenAPI path item — operations keyed by lowercase HTTP method.
 */
export type OpenAPIPathItem = Partial<Record<string, OpenAPIOperation>>;

/**
 * The generated OpenAPI 3.0.3 document.
 */
export interface OpenAPIDocument {
    openapi: '3.0.3';
    info: {
        title: string;
        version: string;
        description?: string;
    };
    servers?: Array<{ url: string }>;
    paths: Record<string, OpenAPIPathItem>;
}

/**
 * Options for {@link OpenAPISpecGenerator.generate}.
 */
export interface OpenAPIGeneratorOptions {
    /** Spec `info.title`; defaults to `'API'`. */
    title?: string;
    /** Spec `info.version`; defaults to `'0.0.0'`. */
    version?: string;
    /** Spec `info.description`. */
    description?: string;
    /** Static `servers` URLs; omitted when empty. */
    servers?: string[];
    /** Explicit path denylist (matched after template translation). */
    excludePaths?: string[];
    /**
     * Per-route filter; return `false` to leave the mapping out of the spec.
     * Called once per registered handler method, before path expansion.
     */
    include?: (mapping: RouteMappingTable, handlerMethod: RouteHandlerMethod) => boolean;
}

const { toJSONSchema } = z;

/**
 * Normalizes an `@apiDocs` responses entry: a bare schema is
 * `{ description: 'OK', schema }`; the object form carries an optional
 * description and schema (AD-38 D-4).
 */
function responseDocsOf(entry: OpenAPIResponseDocs): { description: string; schema?: z.ZodType<unknown> } {
    if (entry instanceof z.ZodType) {
        return { description: 'OK', schema: entry };
    }
    return { description: entry.description ?? 'OK', schema: entry.schema };
}

/**
 * Converts a zod schema to a JSON Schema object compatible with the served
 * OpenAPI 3.0.3 document (embedded: no `$schema` header). The zod library
 * owns the conversion (AD-35 D-3); the `openapi-3.0` target keeps constructs
 * such as nullable, literal and tuple fields valid for that version
 * (`nullable`/`enum`/`items` instead of `type: ['x', 'null']`/`const`/
 * `prefixItems`).
 */
function jsonSchemaOf(schema: z.ZodType<unknown>): OpenAPISchemaObject {
    const converted = toJSONSchema(schema, { target: 'openapi-3.0' }) as OpenAPISchemaObject;
    // Embedded schemas carry no document-level `$schema` header.
    const { ['$schema']: _drop, ...embedded } = converted;
    return embedded;
}

/**
 * Fallback schema when no zod schema is attached: a string — or a type
 * hint from the extractor's `convertType` when present.
 */
function typeSchemaOf(parameter: MethodParameter): OpenAPISchemaObject {
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
function translatePath(pattern: string): string | null {
    if (pattern === '' || pattern === '**') return null;
    let path = pattern.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
    path = path.replace(/\{\*([A-Za-z0-9_]+)\}/g, '{$1}');
    return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Builds OpenAPI documents from the framework's route tables.
 *
 * Thread-safe and pure: `generate` reads dispatch metadata and returns a
 * fresh document; nothing is cached on the instance.
 */
export class OpenAPISpecGenerator {
    /**
     * Generate the API document for the given handler mappings.
     *
     * @param mappings - The registered mappings, in dispatch order (first
     *   mapping wins, mirroring the strategy's precedence).
     * @param options - Document options + filters.
     * @returns The OpenAPI 3.0.3 document.
     */
    generate(mappings: readonly RouteMappingTable[], options: OpenAPIGeneratorOptions = {}): OpenAPIDocument {
        const paths: Record<string, OpenAPIPathItem> = {};
        const seen = new Set<string>();

        for (const mapping of mappings) {
            for (const [info, handlerMethod] of mapping.getHandlerMethods()) {
                const httpMethod = info.methodCondition.method;
                if (httpMethod === undefined) continue; // methodless catch-alls
                if (info.accessCondition?.access === 'private') continue;

                const docs = getApiDocs(handlerMethod.handler, handlerMethod.method);
                if (docs?.hidden) continue;
                if (options.include !== undefined && !options.include(mapping, handlerMethod)) continue;

                for (const pattern of info.patternsCondition.patterns) {
                    const path = translatePath(pattern);
                    if (path === null) continue;
                    if (options.excludePaths?.includes(path)) continue;
                    const key = `${httpMethod} ${path}`;
                    if (seen.has(key)) continue; // dedup: dispatch precedence wins
                    seen.add(key);
                    paths[path] ??= {};
                    paths[path][httpMethod.toLowerCase()] = this.#buildOperation(
                        info,
                        handlerMethod,
                        httpMethod,
                        path,
                        docs
                    );
                }
            }
        }

        const document: OpenAPIDocument = {
            openapi: '3.0.3',
            info: {
                title: options.title ?? 'API',
                version: options.version ?? '0.0.0',
            },
            paths,
        };
        if (options.description !== undefined) document.info.description = options.description;
        if (options.servers !== undefined && options.servers.length > 0) {
            document.servers = options.servers.map((url) => ({ url }));
        }
        return document;
    }

    #buildOperation(
        info: RouteMappingInfo,
        handlerMethod: RouteHandlerMethod,
        method: HTTPMethod,
        path: string,
        docs: APIDocsMetadata | undefined
    ): OpenAPIOperation {
        const operation: OpenAPIOperation = {
            responses: { '200': { description: 'OK' } },
        };
        if (docs !== undefined) {
            if (docs.operationId !== undefined) operation.operationId = docs.operationId;
            if (docs.summary !== undefined) operation.summary = docs.summary;
            if (docs.description !== undefined) operation.description = docs.description;
            if (docs.tags !== undefined && docs.tags.length > 0) operation.tags = docs.tags;
            if (docs.deprecated !== undefined) operation.deprecated = docs.deprecated;
        }
        if (docs?.responses !== undefined) {
            for (const [status, entry] of Object.entries(docs.responses)) {
                const { description, schema } = responseDocsOf(entry);
                const response: OpenAPIResponse = { description };
                if (schema !== undefined) {
                    response.content = { 'application/json': { schema: jsonSchemaOf(schema) } };
                }
                operation.responses[status] = response;
            }
        }
        if (operation.operationId === undefined) operation.operationId = `${method.toLowerCase()}-${path}`;

        // Framework conditions the OpenAPI model cannot express are carried
        // as x-blue extensions instead of silently dropped (AD-35 D-2).
        const matrixParams = [...info.matrixCondition.expressions].map((expression) => expression.toString());
        if (matrixParams.length > 0) operation['x-blue-matrixParams'] = matrixParams;
        const queryParams = [...info.queryCondition.expressions].map((expression) => expression.toString());
        if (queryParams.length > 0) operation['x-blue-queryParams'] = queryParams;

        const parameters: OpenAPIParameter[] = [];
        for (const parameter of handlerMethod.parameters) {
            const location = this.#locationOf(parameter);
            if (location !== null) {
                parameters.push(this.#parameterOf(parameter, location));
                continue;
            }
            if (MethodParameterType.BODY.equals(parameter.type)) {
                operation.requestBody = {
                    required: parameter.required,
                    content: { 'application/json': { schema: this.#schemaOf(parameter) } },
                };
                continue;
            }
            if (
                MethodParameterType.MULTIPART_FILE.equals(parameter.type) ||
                MethodParameterType.REQUEST_PART.equals(parameter.type)
            ) {
                this.#addMultipartPart(operation, parameter);
            }
        }
        if (parameters.length > 0) operation.parameters = parameters;
        return operation;
    }

    #locationOf(parameter: MethodParameter): OpenAPIParameter['in'] | null {
        if (MethodParameterType.QUERY.equals(parameter.type)) return 'query';
        if (MethodParameterType.PATH.equals(parameter.type)) return 'path';
        if (MethodParameterType.HEADER.equals(parameter.type)) return 'header';
        if (MethodParameterType.COOKIE.equals(parameter.type)) return 'cookie';
        // Whole-source binding into query/cookie — represented at the bound
        // parameter's location with the zod schema when available.
        if (MethodParameterType.data('query').equals(parameter.type)) return 'query';
        if (MethodParameterType.data('cookie').equals(parameter.type)) return 'cookie';
        return null;
    }

    #parameterOf(parameter: MethodParameter, location: OpenAPIParameter['in']): OpenAPIParameter {
        return {
            name: parameter.name === '' ? parameter.parameterName : parameter.name,
            in: location,
            required: location === 'path' ? true : parameter.required,
            schema: this.#schemaOf(parameter),
        };
    }

    #schemaOf(parameter: MethodParameter): OpenAPISchemaObject {
        if (parameter.schema !== undefined) return jsonSchemaOf(parameter.schema);
        const schema = typeSchemaOf(parameter);
        if (parameter.defaultValue !== null && schema.default === undefined) {
            schema.default = parameter.defaultValue;
        }
        return schema;
    }

    #addMultipartPart(operation: OpenAPIOperation, parameter: MethodParameter): void {
        const body = (operation.requestBody ??= { required: parameter.required, content: {} });
        body.required ||= parameter.required;
        const media = (body.content['multipart/form-data'] ??= { schema: { type: 'object', properties: {} } });
        const schema = media.schema as OpenAPISchemaObject;
        const properties = ((schema.properties as Record<string, OpenAPISchemaObject>) ??= {});
        properties[parameter.name] = MethodParameterType.MULTIPART_FILE.equals(parameter.type)
            ? { type: 'string', format: 'binary' }
            : this.#schemaOf(parameter);
        if (parameter.required) {
            const required = ((schema.required as string[] | undefined) ??= []);
            required.push(parameter.name);
        }
    }
}
