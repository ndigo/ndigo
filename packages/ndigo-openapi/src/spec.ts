/**
 * OpenAPI 3.0.3 spec generation from dispatch metadata (AD-35 D-2/D-3).
 *
 * The generator walks `RouteHandlerMapping.getHandlerMethods()` — the exact
 * table dispatch uses — so the document cannot drift from behavior. Nothing
 * is parsed: patterns, method conditions, resolved `MethodParameter`s and
 * the zod schemas `validatedBy` carries are all runtime metadata the
 * framework already holds.
 * @module ndigo-openapi
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';
import type { HTTPMethod } from '@ndigo/http';
import {
    type RouteHandlerMethod,
    type RouteMappingInfo,
    MethodParameterType,
    type MethodParameter,
} from '@ndigo/dispatcher';
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
 * An OpenAPI security scheme object (the subset the generator carries).
 * Declared through {@link OpenAPIGeneratorOptions.securitySchemes} and
 * referenced by name from operation/`@apiDocs` `security` requirements.
 */
export interface OpenAPISecurityScheme {
    type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
    description?: string;
    /** `apiKey`: the header/query/cookie name. */
    name?: string;
    /** `apiKey`: where the key travels. */
    in?: 'query' | 'header' | 'cookie';
    /** `http`: the scheme (e.g. `bearer`, `basic`). */
    scheme?: string;
    /** `http` bearer: the bearer format hint. */
    bearerFormat?: string;
    /** `oauth2`: flow definitions. */
    flows?: Record<string, unknown>;
    /** `openIdConnect`: discovery URL. */
    openIdConnectUrl?: string;
}

/**
 * An OpenAPI operation object. Framework-specific conditions are preserved
 * under `x-ndigo-*` extensions rather than dropped.
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
    /**
     * Security requirements for this operation (scheme name → scopes). Set
     * from `@apiDocs({ security })`; overrides the document-level default.
     * An empty array documents an explicitly anonymous operation.
     */
    security?: Array<Record<string, string[]>>;
    /** Framework matrix-parameter conditions (AD-35 D-2). */
    'x-ndigo-matrixParams'?: string[];
    /** Framework query-parameter conditions (AD-35 D-2). */
    'x-ndigo-queryParams'?: string[];
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
    /**
     * Security requirements applied document-wide (scheme name → scopes);
     * per-operation `security` overrides them. Present when
     * {@link OpenAPIGeneratorOptions.security} is set.
     */
    security?: Array<Record<string, string[]>>;
    /**
     * Component schemas hoisted out of the operations: recursive DTOs (and
     * schemas registered with an `id`) convert to schemas whose `$ref`
     * pointers are document-root-relative, so they cannot embed inline.
     * Present when at least one schema was hoisted or a security scheme is
     * declared (`schemas` may then be empty).
     */
    components?: {
        schemas: Record<string, OpenAPISchemaObject>;
        /** Named security schemes ({@link OpenAPIGeneratorOptions.securitySchemes}). */
        securitySchemes?: Record<string, OpenAPISecurityScheme>;
    };
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
    /**
     * Named security schemes for `components.securitySchemes` (DAT-F12).
     * Referenced by name from the document-level {@link security} default
     * and per-operation `@apiDocs({ security })` requirements.
     */
    securitySchemes?: Record<string, OpenAPISecurityScheme>;
    /**
     * Document-level default security requirements (scheme names); a
     * per-operation `@apiDocs({ security })` overrides them. Omitted when
     * empty.
     */
    security?: string[];
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
 * True for a `$ref` value that resolves against the converted schema's own
 * document root — the shape zod emits for recursive schemas (`'#'`, the
 * document root) and for schemas carrying a registered `id`
 * (`'#/definitions/<id>'`, a root-level bundle).
 */
function isRootRelativeRef(value: unknown): value is string {
    return typeof value === 'string' && value.startsWith('#');
}

/** Does the converted schema carry any root-relative `$ref` — i.e. need hoisting? */
function containsRootRelativeRef(node: unknown): boolean {
    if (Array.isArray(node)) return node.some(containsRootRelativeRef);
    if (node === null || typeof node !== 'object') return false;
    const record = node as Record<string, unknown>;
    if (isRootRelativeRef(record['$ref'])) return true;
    return Object.values(record).some(containsRootRelativeRef);
}

/** Collects zod's `definitions`/`$defs` bundles as component candidates, in order. */
function schemaDefinitionsOf(schema: OpenAPISchemaObject): Map<string, OpenAPISchemaObject> {
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
function definitionIdOf(ref: string): string | undefined {
    const match = /^#\/(?:definitions|\$defs)\/(.+)$/.exec(ref);
    return match === null ? undefined : match[1];
}

/** A component-key-safe name derived from a usage hint or a schema `id`. */
function componentKeyOf(hint: string): string {
    const key = hint.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return key === '' ? 'Schema' : key;
}

/**
 * Hoists schemas whose `$ref` pointers are document-root-relative into
 * `components.schemas`, rewriting the pointers to absolute component
 * locations. Embedded inline under `paths`, those pointers resolve against
 * the whole document — `$ref: '#'` even targets the root document object —
 * which no longer denotes the schema (zod's conversion is only valid for a
 * standalone document).
 *
 * One instance per {@link OpenAPISpecGenerator.generate} call: a schema that
 * converts to the same JSON is hoisted once and reused by pointer, and
 * component names are allocated deterministically from the usage site
 * (operation id) or the registered `id`.
 */
class SchemaComponents {
    readonly #schemas: Record<string, OpenAPISchemaObject> = {};
    readonly #byRef: Map<string, string> = new Map();
    readonly #names: Set<string> = new Set();

    /** Hoisted components, keyed by component name. */
    get schemas(): Record<string, OpenAPISchemaObject> {
        return this.#schemas;
    }

    /** Number of hoisted components. */
    get size(): number {
        return Object.keys(this.#schemas).length;
    }

    /**
     * Embed a schema at a usage site: returned as converted when it is
     * self-contained, otherwise hoisted and returned as a `$ref` to its
     * component.
     *
     * @param schema - The zod schema to convert.
     * @param hint - Deterministic component-name hint for the usage site.
     * @returns The schema to embed.
     */
    embed(schema: z.ZodType<unknown>, hint: string): OpenAPISchemaObject {
        const converted = jsonSchemaOf(schema);
        if (!containsRootRelativeRef(converted)) return converted;
        return this.#hoist(converted, hint);
    }

    #hoist(converted: OpenAPISchemaObject, hint: string): OpenAPISchemaObject {
        const shape = JSON.stringify(converted);
        const known = this.#byRef.get(shape);
        if (known !== undefined) return { $ref: known };

        const definitions = schemaDefinitionsOf(converted);
        const definitionNames = new Map<string, string>();
        for (const id of definitions.keys()) definitionNames.set(id, this.#allocate(id));

        // A root that is nothing but a pointer into its own definition bundle
        // (zod's `id` shape) already has a component: the promoted definition.
        const rest = { ...converted };
        delete rest['definitions'];
        delete rest['$defs'];
        const bareRefId =
            Object.keys(rest).length === 1 && isRootRelativeRef(rest['$ref'])
                ? definitionIdOf(rest['$ref'])
                : undefined;
        const promotedName = bareRefId === undefined ? undefined : definitionNames.get(bareRefId);
        let rootName: string | undefined;
        let embeddedRef: string;
        if (promotedName !== undefined) {
            embeddedRef = `#/components/schemas/${promotedName}`;
        } else {
            rootName = this.#allocate(hint);
            embeddedRef = `#/components/schemas/${rootName}`;
        }

        const pointerOf = (ref: string): string => {
            if (ref === '#') {
                // A definition referencing the whole schema needs a root
                // component even when the root itself is a bare pointer.
                rootName ??= this.#allocate(hint);
                return `#/components/schemas/${rootName}`;
            }
            const id = definitionIdOf(ref);
            const name = id === undefined ? undefined : definitionNames.get(id);
            return name === undefined ? ref : `#/components/schemas/${name}`;
        };
        const rewrite = (node: unknown): unknown => {
            if (Array.isArray(node)) return node.map(rewrite);
            if (node === null || typeof node !== 'object') return node;
            const copy: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(node)) {
                copy[key] = key === '$ref' && isRootRelativeRef(value) ? pointerOf(value) : rewrite(value);
            }
            return copy;
        };

        for (const [id, definition] of definitions) {
            const name = definitionNames.get(id);
            if (name !== undefined) this.#schemas[name] = rewrite(definition) as OpenAPISchemaObject;
        }
        if (rootName !== undefined) this.#schemas[rootName] = rewrite(rest) as OpenAPISchemaObject;
        this.#byRef.set(shape, embeddedRef);
        return { $ref: embeddedRef };
    }

    #allocate(hint: string): string {
        const base = componentKeyOf(hint);
        let name = base;
        for (let suffix = 2; this.#names.has(name); suffix++) name = `${base}-${suffix}`;
        this.#names.add(name);
        return name;
    }
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
        const components = new SchemaComponents();

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
                        docs,
                        components
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
        if (options.security !== undefined && options.security.length > 0) {
            document.security = options.security.map((name) => ({ [name]: [] }));
        }
        const securitySchemes = options.securitySchemes;
        const hasSecuritySchemes = securitySchemes !== undefined && Object.keys(securitySchemes).length > 0;
        if (components.size > 0 || hasSecuritySchemes) {
            document.components = { schemas: components.schemas };
            if (hasSecuritySchemes) document.components.securitySchemes = securitySchemes;
        }
        return document;
    }

    #buildOperation(
        info: RouteMappingInfo,
        handlerMethod: RouteHandlerMethod,
        method: HTTPMethod,
        path: string,
        docs: APIDocsMetadata | undefined,
        components: SchemaComponents
    ): OpenAPIOperation {
        const operation: OpenAPIOperation = { responses: {} };
        if (docs !== undefined) {
            if (docs.operationId !== undefined) operation.operationId = docs.operationId;
            if (docs.summary !== undefined) operation.summary = docs.summary;
            if (docs.description !== undefined) operation.description = docs.description;
            if (docs.tags !== undefined && docs.tags.length > 0) operation.tags = docs.tags;
            if (docs.deprecated !== undefined) operation.deprecated = docs.deprecated;
            if (docs.security !== undefined) {
                operation.security = docs.security.map((name) => ({ [name]: [] }));
            }
        }
        if (operation.operationId === undefined) operation.operationId = `${method.toLowerCase()}-${path}`;
        const operationId = operation.operationId;
        if (docs?.responses !== undefined && Object.keys(docs.responses).length > 0) {
            // Declared responses REPLACE the implicit `200 OK` — the handler's
            // own set is authoritative (DAT-F11).
            for (const [status, entry] of Object.entries(docs.responses)) {
                const { description, schema } = responseDocsOf(entry);
                const response: OpenAPIResponse = { description };
                if (schema !== undefined) {
                    response.content = {
                        'application/json': { schema: components.embed(schema, `${operationId}-${status}`) },
                    };
                }
                operation.responses[status] = response;
            }
        } else {
            operation.responses['200'] = { description: 'OK' };
        }

        // Framework conditions the OpenAPI model cannot express are carried
        // as x-ndigo extensions instead of silently dropped (AD-35 D-2).
        const matrixParams = [...info.matrixCondition.expressions].map((expression) => expression.toString());
        if (matrixParams.length > 0) operation['x-ndigo-matrixParams'] = matrixParams;
        const queryParams = [...info.queryCondition.expressions].map((expression) => expression.toString());
        if (queryParams.length > 0) operation['x-ndigo-queryParams'] = queryParams;

        const parameters: OpenAPIParameter[] = [];
        for (const parameter of handlerMethod.parameters) {
            const location = this.#locationOf(parameter);
            if (location !== null) {
                parameters.push(this.#parameterOf(parameter, location, components, operationId));
                continue;
            }
            if (MethodParameterType.BODY.equals(parameter.type)) {
                operation.requestBody = {
                    required: parameter.required,
                    content: {
                        'application/json': {
                            schema: this.#schemaOf(parameter, components, `${operationId}-body`),
                        },
                    },
                };
                continue;
            }
            if (
                MethodParameterType.MULTIPART_FILE.equals(parameter.type) ||
                MethodParameterType.REQUEST_PART.equals(parameter.type)
            ) {
                this.#addMultipartPart(operation, parameter, components, operationId);
            }
        }

        // OpenAPI 3.0 requires every path template variable to be declared as
        // a `path` parameter; a route need not extract every variable the
        // router matches on (`/files/:id/download` with no `pathVariable`).
        const pathNames = new Set(
            parameters.filter((parameter) => parameter.in === 'path').map((parameter) => parameter.name)
        );
        for (const match of path.matchAll(/\{([^{}]+)\}/g)) {
            if (pathNames.has(match[1])) continue;
            pathNames.add(match[1]);
            parameters.push({ name: match[1], in: 'path', required: true, schema: { type: 'string' } });
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

    #parameterOf(
        parameter: MethodParameter,
        location: OpenAPIParameter['in'],
        components: SchemaComponents,
        operationId: string
    ): OpenAPIParameter {
        const name = parameter.name === '' ? parameter.parameterName : parameter.name;
        return {
            name,
            in: location,
            required: location === 'path' ? true : parameter.required,
            schema: this.#schemaOf(parameter, components, `${operationId}-${location}-${name}`),
        };
    }

    #schemaOf(parameter: MethodParameter, components: SchemaComponents, hint: string): OpenAPISchemaObject {
        if (parameter.schema !== undefined) return components.embed(parameter.schema, hint);
        const schema = typeSchemaOf(parameter);
        if (parameter.defaultValue !== null && schema.default === undefined) {
            schema.default = parameter.defaultValue;
        }
        return schema;
    }

    #addMultipartPart(
        operation: OpenAPIOperation,
        parameter: MethodParameter,
        components: SchemaComponents,
        operationId: string
    ): void {
        const body = (operation.requestBody ??= { required: parameter.required, content: {} });
        body.required ||= parameter.required;
        const media = (body.content['multipart/form-data'] ??= { schema: { type: 'object', properties: {} } });
        const schema = media.schema as OpenAPISchemaObject;
        const properties = ((schema.properties as Record<string, OpenAPISchemaObject>) ??= {});
        properties[parameter.name] = MethodParameterType.MULTIPART_FILE.equals(parameter.type)
            ? { type: 'string', format: 'binary' }
            : this.#schemaOf(parameter, components, `${operationId}-part-${parameter.name}`);
        if (parameter.required) {
            const required = ((schema.required as string[] | undefined) ??= []);
            required.push(parameter.name);
        }
    }
}
