/**
 * OpenAPI document and generator option types.
 */
import type { RouteHandlerMethod, RouteMappingInfo } from '@ndigo/dispatcher';

export interface RouteMappingTable {
    /**
     * The registered route table: route info → handler method.
     *
     * @returns The mapping's handler methods.
     */
    getHandlerMethods(): Map<RouteMappingInfo, RouteHandlerMethod>;
}

/**
 * A JSON Schema object (subset) — the OpenAPI `schema` field.
 *
 * @example
 * ```ts
 * const value = {} as OpenAPISchemaObject;
 * ```
 */
export interface OpenAPISchemaObject {
    [key: string]: unknown;
}

/**
 * An OpenAPI parameter object.
 *
 * @example
 * ```ts
 * const value = {} as OpenAPIParameter;
 * ```
 */
export interface OpenAPIParameter {
    /** Parameter name as it appears in the request. */
    name: string;
    /** Where the parameter travels. */
    in: 'query' | 'path' | 'header' | 'cookie';
    /** Whether the parameter is required. */
    required: boolean;
    /** The parameter's JSON Schema. */
    schema?: OpenAPISchemaObject;
    /** Human-readable parameter description. */
    description?: string;
}

/**
 * An OpenAPI request body.
 *
 * @example
 * ```ts
 * const value = {} as OpenAPIRequestBody;
 * ```
 */
export interface OpenAPIRequestBody {
    /** Whether a body is required. */
    required: boolean;
    /** Media types and their schemas. */
    content: Record<string, { schema?: OpenAPISchemaObject }>;
}

/**
 * An OpenAPI operation response object.
 *
 * @example
 * ```ts
 * const value = {} as OpenAPIResponse;
 * ```
 */
export interface OpenAPIResponse {
    /** Human-readable response description. */
    description: string;
    /**
     * Response content — e.g. `{ 'application/json': { schema } }` when the
     * handler declares its DTO via `@apiDocs({ responses })`.
     */
    content?: Record<string, { schema?: OpenAPISchemaObject }>;
}

/**
 * An OpenAPI security scheme object (the subset the generator carries).
 * Declared through {@link OpenAPIGeneratorOptions.securitySchemes} and
 * referenced by name from operation/`@apiDocs` `security` requirements.
 *
 * @example
 * ```ts
 * const value = {} as OpenAPISecurityScheme;
 * ```
 */
export interface OpenAPISecurityScheme {
    /** Security scheme type. */
    type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
    /** Human-readable scheme description. */
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
 *
 * @example
 * ```ts
 * const value = {} as OpenAPIOperation;
 * ```
 */
export interface OpenAPIOperation {
    /** Unique operation id (defaults to the handler method name). */
    operationId?: string;
    /** Short operation summary. */
    summary?: string;
    /** Longer operation description. */
    description?: string;
    /** OpenAPI tags for grouping. */
    tags?: string[];
    /** Whether the operation is deprecated. */
    deprecated?: boolean;
    /** Declared parameters. */
    parameters?: OpenAPIParameter[];
    /** Declared request body. */
    requestBody?: OpenAPIRequestBody;
    /** Responses keyed by status code. */
    responses: Record<string, OpenAPIResponse>;
    /**
     * Security requirements for this operation (scheme name → scopes). Set
     * from `@apiDocs({ security })`; overrides the document-level default.
     * An empty array documents an explicitly anonymous operation.
     */
    security?: Array<Record<string, string[]>>;
    /** Framework matrix-parameter conditions. */
    'x-ndigo-matrixParams'?: string[];
    /** Framework query-parameter conditions. */
    'x-ndigo-queryParams'?: string[];
}

/**
 * An OpenAPI path item — operations keyed by lowercase HTTP method.
 *
 * @example
 * ```ts
 * type _Alias = OpenAPIPathItem;
 * ```
 */
export type OpenAPIPathItem = Partial<Record<string, OpenAPIOperation>>;

/**
 * The generated OpenAPI 3.0.3 document.
 *
 * @example
 * ```ts
 * const value = {} as OpenAPIDocument;
 * ```
 */
export interface OpenAPIDocument {
    /** The OpenAPI version emitted (`3.0.3`). */
    openapi: '3.0.3';
    /** Document metadata (title, version, description). */
    info: {
        title: string;
        version: string;
        description?: string;
    };
    /** Optional server list. */
    servers?: Array<{ url: string }>;
    /** Path items keyed by URL template. */
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
 * Options for `OpenAPISpecGenerator.generate`.
 *
 * @example
 * ```ts
 * const value = {} as OpenAPIGeneratorOptions;
 * ```
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
     * Named security schemes for `components.securitySchemes`.
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
