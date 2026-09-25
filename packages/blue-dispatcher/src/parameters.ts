/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { isString } from '@blue/util/types';
import { Serializable, JSONObject, createNull, Equatable, getSymbolMetadata, IllegalStateError } from '@blue/core';
import { getFunctionParamNames } from './_decorator-util';
import { isSocketMapping } from './socket-mapping';
import { getRouteMapping } from './route-mapping';
import { InvalidParameterMappingError } from './error';

const { keys } = Object;
const { defineProperty } = Reflect;

/**
 * Factory function return type - describes a parameter extraction
 */
export type ParameterExtractor = {
    type: MethodParameterType;
    name: string;
    required: boolean;
    defaultValue: string | null;
    /** Type-based conversion: { source: SourceConstructor, target: TargetConstructor } */
    convertType?: { source: unknown; target: unknown };
    prefix?: string | null;
    /** Optional post-bind validator/converter (e.g. Zod via `validatedBy`). */
    convert?: (value: unknown) => unknown;
    /** Explicit multipart/form-data client field name, when it differs from the
     *  method-argument name. `fileValue('avatar_url')` sets this so the resolver
     *  reads that part instead of inferring from the argument name. */
    partName?: string;
    /** Optional target constructor for whole-source binding: when set, the
     *  bound result is a real instance of the target (not a plain object).
     *  `dataBinderValue(source, Target)` sets this (D-3). */
    target?: new () => object;
};

/** Options for creating a parameter extractor with type-based conversion support. */
export interface ParameterExtractorOptions {
    required?: boolean;
    defaultValue?: string;
    /** Type-based converter: specifies source and target types for ConversionService lookup. */
    convertType?: { source: unknown; target: unknown };
}

export interface ParameterValueConversionContext {
    name: string;
    parameter: MethodParameter;
    route: unknown;
    mapping: unknown;
}

export type ParameterValueConverter = (value: unknown, context: ParameterValueConversionContext) => unknown;

/**
 * Parameter map for `parameters` decorator
 */
export type ParameterMap = Record<string, ParameterExtractor>;

/**
 * Method parameter type enum
 */
export class MethodParameterType implements Equatable, Serializable {
    static COOKIE: MethodParameterType;
    static MATRIX: MethodParameterType;
    static PATH: MethodParameterType;
    static QUERY: MethodParameterType;
    static HISTORY_STATE: MethodParameterType;
    static REQUEST_SESSION: MethodParameterType;
    static SESSION_STORAGE: MethodParameterType;
    static LOCAL_STORAGE: MethodParameterType;
    static ATTRIBUTE: MethodParameterType;
    static HEADER: MethodParameterType;
    static BODY: MethodParameterType;
    static ROUTE: MethodParameterType;
    static SOCKET_SESSION: MethodParameterType;
    static MULTIPART_FILE: MethodParameterType;
    static REQUEST_PART: MethodParameterType;

    /**
     * Whole-source data-binding types (`data-{source}:value`, D-3).
     *
     * The source is encoded in the type — `dataBinderValue('body')` produces
     * `data-body:value` — and the instances are cached so type-equality via
     * `Set.has` in the `SOURCES_BY_KIND` membership checks holds.
     *
     * @param source - The data source name (`'query'`, `'body'`, `'cookie'`,
     *   `'session-storage'`, `'local-storage'`).
     * @returns The cached type instance for `data-{source}:value`.
     */
    static data(source: string): MethodParameterType {
        return (dataBindingTypes[source] ??= new MethodParameterType(`data-${source}:value`));
    }

    static fromType(type: string): MethodParameterType | null {
        // data-* types are cached instances, not static fields — resolve them
        // from the source cache so serialized types round-trip.
        if (type.startsWith('data-')) {
            return dataBindingTypes[type.slice('data-'.length, -':value'.length)] ?? null;
        }
        const types = keys(this);
        const length = types.length;

        for (let index = 0; index < length; index++) {
            const key = types[index];
            if (key !== 'fromType') {
                // Skip the static method itself
                const parameterType = MethodParameterType[key as keyof typeof MethodParameterType];
                // Ensure we only work with actual MethodParameterType instances, not methods
                if (parameterType instanceof MethodParameterType && parameterType.type === type) {
                    return parameterType;
                }
            }
        }

        return null;
    }

    readonly type!: string;

    get [Symbol.toStringTag](): string {
        return `MethodParameterType:${this.type}`;
    }

    constructor(type: string) {
        defineProperty(this, 'type', {
            value: type,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    equals(value: unknown): boolean {
        return value instanceof MethodParameterType && value.type === this.type;
    }

    toJSON(): string {
        return this.toString();
    }

    toString(): string {
        return this.type;
    }
}

/** Cache of `data-{source}:value` type instances (see {@link MethodParameterType.data}). */
const dataBindingTypes: Record<string, MethodParameterType> = {};

MethodParameterType.COOKIE = new MethodParameterType('cookie:value');
MethodParameterType.MATRIX = new MethodParameterType('matrix:value');
MethodParameterType.PATH = new MethodParameterType('path:variable');
MethodParameterType.QUERY = new MethodParameterType('query:value');
MethodParameterType.HISTORY_STATE = new MethodParameterType('history-state:value');
MethodParameterType.REQUEST_SESSION = new MethodParameterType('request-session:value');
MethodParameterType.SESSION_STORAGE = new MethodParameterType('session-storage:value');
MethodParameterType.LOCAL_STORAGE = new MethodParameterType('local-storage:value');
MethodParameterType.ATTRIBUTE = new MethodParameterType('attribute:value');
MethodParameterType.HEADER = new MethodParameterType('header:value');
MethodParameterType.BODY = new MethodParameterType('body:value');
MethodParameterType.ROUTE = new MethodParameterType('route:value');
MethodParameterType.SOCKET_SESSION = new MethodParameterType('socket-session:value');
MethodParameterType.MULTIPART_FILE = new MethodParameterType('multipart-file:value');
MethodParameterType.REQUEST_PART = new MethodParameterType('request-part:value');

/**
 * Method parameter metadata
 */
export class MethodParameter implements Serializable {
    readonly name!: string;
    readonly type!: MethodParameterType;
    readonly required!: boolean;
    readonly defaultValue!: string | null;
    readonly convertType!: { source: unknown; target: unknown } | undefined;
    readonly prefix!: string | null;
    /**
     * Optional post-bind validator/converter applied to the resolved value.
     * Set by {@link validatedBy} (Zod-backed, AD-7).
     */
    readonly convert!: ((value: unknown) => unknown) | undefined;
    /**
     * The `@parameters` map key this parameter was declared under. For HTTP
     * and browser mappings this equals the method-argument name (and usually
     * the extractor name); for socket mappings it is the `session.params`
     * key, which may differ from the extractor's source name (e.g.
     * `via: headerValue('x-via')` → `parameterName: 'via'`,
     * `name: 'x-via'`).
     */
    readonly parameterName!: string;
    /**
     * Optional target constructor for whole-source binding. When set, the
     * bound value is a real instance of the target (see
     * {@link ParameterExtractor.target} / `dataBinderValue(source, Target)`).
     */
    readonly target!: (new () => object) | undefined;

    constructor(
        type: MethodParameterType,
        name: string,
        required: boolean = false,
        defaultValue: string | null = null,
        convertType?: { source: unknown; target: unknown },
        prefix: string | null = null,
        convert?: (value: unknown) => unknown,
        parameterName?: string,
        target?: new () => object
    ) {
        if (!isString(name)) {
            throw new TypeError(`"name" must be a string but was ${name}`);
        }
        this.type = type;
        this.name = name;
        this.required = required;
        this.defaultValue = defaultValue;
        this.convertType = convertType ?? undefined;
        this.prefix = prefix;
        this.convert = convert ?? undefined;
        this.parameterName = parameterName ?? name;
        this.target = target;
    }

    toJSON(): JSONObject {
        const json = createNull();
        json.name = this.name;
        json.type = this.type;
        json.required = this.required;
        json.defaultValue = this.defaultValue;
        json.hasConvertType = this.convertType !== undefined;
        json.prefix = this.prefix;
        return json;
    }

    toString(): string {
        return this.name;
    }
}

/**
 * Factory function: Create a query parameter extractor
 *
 * @example
 * `parameters`({
 *   page: queryValue('page'),
 *   limit: queryValue('limit', { required: true, defaultValue: '10' })
 * })
 */
export function queryValue(name?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.QUERY,
        name: name ?? '',
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a path parameter extractor
 *
 * @example
 * `parameters`({
 *   userId: pathVariable('userId')
 * })
 */
export function pathVariable(name?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.PATH,
        name: name ?? '',
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a matrix parameter extractor
 *
 * @example
 * `parameters`({
 *   color: matrixValue('color'),
 *   size: matrixValue('size', { required: true })
 * })
 */
export function matrixValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.MATRIX,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a cookie parameter extractor
 *
 * @example
 * `parameters`({
 *   session: cookieValue('SESSIONID'),
 *   token: cookieValue('AUTH_TOKEN', { required: true })
 * })
 */
export function cookieValue(name?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.COOKIE,
        name: name ?? '',
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a request-session parameter extractor.
 * Reads `request.session` on the Node platform (nested-capable).
 *
 * @example
 * `parameters`({
 *   userId: requestSessionValue('userId'),
 *   token: requestSessionValue('AUTH_TOKEN', { required: true })
 * })
 */
export function requestSessionValue(name?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.REQUEST_SESSION,
        name: name ?? '',
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a session-storage parameter extractor.
 * Reads `sessionStorage` on the browser platform (scalar-only).
 *
 * @example
 * `parameters`({
 *   theme: sessionStorageValue('theme'),
 * })
 */
export function sessionStorageValue(name?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.SESSION_STORAGE,
        name: name ?? '',
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a local-storage parameter extractor.
 * Reads `localStorage` on the browser platform (scalar-only).
 *
 * @example
 * `parameters`({
 *   token: localStorageValue('token'),
 * })
 */
export function localStorageValue(name?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.LOCAL_STORAGE,
        name: name ?? '',
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a history-state parameter extractor.
 * Reads `history.state` on the browser platform (nested-capable).
 *
 * @example
 * `parameters`({
 *   token: historyStateValue('token'),
 * })
 */
export function historyStateValue(name?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.HISTORY_STATE,
        name: name ?? '',
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * The data sources whole-source binding (`dataBinderValue`) can read from,
 * per platform (D-3):
 *
 * - browser: `query`, `cookie`, `session-storage`, `local-storage`
 * - node: `body`, `cookie`
 *
 * The source is encoded in the resulting type (`data-{source}:value`), and
 * `SOURCES_BY_KIND` validates source-vs-mapping-kind compatibility at
 * registration time.
 */
export type DataBindingSource = 'query' | 'body' | 'cookie' | 'session-storage' | 'local-storage';

/**
 * Factory function: Create a whole-source data-binding parameter extractor.
 * Binds an entire flat source (e.g. `body`, `query`) into one nested object
 * via `DataBinder`, optionally filtering by prefix. Dotted client keys
 * (`address.street`) nest; repeated keys bind as arrays.
 *
 * The optional target constructor makes the bound result a real instance of
 * the target instead of a plain object (mirrors `@file()`'s explicit-marker
 * convention, AD-26 D-5).
 *
 * @example
 * `parameters`({
 *   user: dataBinderValue('body'),
 *   profile: dataBinderValue('body', ProfileForm, { prefix: 'profile.' })
 * })
 */
export function dataBinderValue(
    source: DataBindingSource,
    target?: new () => object,
    options: {
        required?: boolean;
        defaultValue?: string;
        convertType?: { source: unknown; target: unknown };
        prefix?: string;
    } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.data(source),
        name: source,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
        prefix: options.prefix ?? null,
        target,
    };
}

/**
 * Factory function: Create a route attribute parameter extractor.
 *
 * @example
 * `parameters`({
 *   user: attributeValue('user')
 * })
 */
export function attributeValue(name?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.ATTRIBUTE,
        name: name ?? '',
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a request-header parameter extractor.
 *
 * @example
 * `parameters`({
 *   contentType: headerValue('content-type'),
 *   authorization: headerValue('authorization', { required: true })
 * })
 */
export function headerValue(name?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.HEADER,
        name: name ?? '',
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a request-body parameter extractor.
 * Omit the name to bind the entire parsed body object (`bodyValue()`).
 *
 * @example
 * `parameters`({
 *   user: bodyValue('user'),
 *   payload: bodyValue()
 * })
 */
export function bodyValue(name?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.BODY,
        name: name ?? '',
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a multipart/form-data file-part extractor.
 * The client field name defaults to the method-argument name; pass an explicit
 * name only when the form field differs from the JS variable. Resolved by
 * `NodeMultipartFileMethodArgumentResolver` (blue-platform-node).
 *
 * @example
 * `parameters`({
 *   avatar: fileValue(),
 *   profile: fileValue('avatar_url')
 * })
 */
export function fileValue(partName?: string): ParameterExtractor {
    return {
        type: MethodParameterType.MULTIPART_FILE,
        name: partName ?? '',
        required: false,
        defaultValue: null,
        partName,
    };
}

/**
 * Factory function: Create a multipart JSON/text-part extractor (D-6).
 *
 * Reads a named `multipart/form-data` part and binds it like `@RequestBody`:
 * JSON parts parse to an object (raw-text fallback), optionally into a real
 * target instance, then through the shared conversion + Zod `convert` hook.
 * File parts stay `fileValue()`/`MultipartFile`.
 *
 * The part name follows the AD-26 `fileValue` convention — explicit when
 * given, otherwise the method-argument name. Mirrors Spring's
 * `@RequestPart(value)` with parameter-name fallback:
 *
 * - `requestPart()` reads the part named after the argument as a plain object;
 * - `requestPart(MetaDto)` does the same into an instantiated DTO;
 * - `requestPart('meta', MetaDto)` overrides the part name.
 *
 * Resolved by `NodeRequestPartMethodArgumentResolver` (blue-platform-node).
 *
 * @example
 * `parameters`({
 *   meta: requestPart(MetaDto),
 *   biography: requestPart('bio'),
 *   file: fileValue()
 * })
 */
export function requestPart(partName?: string, target?: new () => object): ParameterExtractor;
export function requestPart(target: new () => object): ParameterExtractor;
export function requestPart(
    partNameOrTarget?: string | (new () => object),
    target?: new () => object
): ParameterExtractor {
    const partName = typeof partNameOrTarget === 'function' ? undefined : partNameOrTarget;
    const targetConstructor = typeof partNameOrTarget === 'function' ? partNameOrTarget : target;
    return {
        type: MethodParameterType.REQUEST_PART,
        name: partName ?? '',
        required: false,
        defaultValue: null,
        partName,
        target: targetConstructor,
    };
}

/**
 * Binder for the current `Route` object. Explicit replacement for the
 * removed implicit route-injection.
 *
 * The `*Value(name)` contract extracts a value *named* `name` from its
 * source — so no-argument `routeValue()` binds the whole `Route` (there is
 * no "route" property to extract), and a named call binds a `Route`
 * property: `routeValue('path')`, `routeValue('method')`, `routeValue('id')`
 * (plus framework context stashed in `route.attributes`, matching
 * `attributeValue`). Available on route/request mappings (the dispatch
 * unit); not available on sockets.
 *
 * @example
 * @parameters({ route: routeValue() })
 * async handle(route: Route) { … }
 *
 * @param name - The `Route` property to bind; omit to bind the `Route` itself.
 * @returns A route-value extractor.
 */
export function routeValue(name?: string): ParameterExtractor {
    return {
        type: MethodParameterType.ROUTE,
        name: name ?? '',
        required: false,
        defaultValue: null,
    };
}

/**
 * Binder for the `SocketSession` on a socket mapping. Explicit replacement
 * for the removed implicit session injection: the session is only bound
 * where the handler asks for it, like every other value.
 *
 * @param name - The extractor name (defaults to `'session'`).
 * @returns A socket-session extractor.
 */
export function socketSessionValue(name: string = 'session'): ParameterExtractor {
    return {
        type: MethodParameterType.SOCKET_SESSION,
        name,
        required: false,
        defaultValue: null,
    };
}

/**
 * Binder for the entire matched path string — `pathValue()` binds the
 * request/socket path (e.g. `/abc/42`) as a value, distinct from
 * `pathVariable` which extracts a single inferred segment (`:id` → `42`).
 * Available on route, request, and socket mappings.
 *
 * @returns A full-path extractor.
 */
export function pathValue(): ParameterExtractor {
    return {
        type: MethodParameterType.ROUTE,
        name: 'path',
        required: false,
        defaultValue: null,
    };
}

/**
 * Binder for the request's HTTP method (`route.method`) — e.g. to branch at
 * runtime on which verb hit a method-less route mapping. Available on route
 * and request mappings.
 *
 * @returns A method extractor.
 */
export function methodValue(): ParameterExtractor {
    return {
        type: MethodParameterType.ROUTE,
        name: 'method',
        required: false,
        defaultValue: null,
    };
}

/**
 * Wraps a parameter extractor to enforce number conversion.
 * @example asNumber(queryValue('age'))
 */
export function asNumber(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Number } };
}

/**
 * Wraps a parameter extractor to enforce boolean conversion.
 * @example asBoolean(historyStateValue('isActive'))
 */
export function asBoolean(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Boolean } };
}

/**
 * Wraps a parameter extractor to enforce Date conversion.
 * @example asDate(cookieValue('lastLogin'))
 */
export function asDate(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Date } };
}

/**
 * Wraps a parameter extractor to enforce JSON conversion.
 * @example asJson<UserProfile>(sessionStorageValue('profile'))
 */
export function asJson<_T = unknown>(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Object } };
}

/**
 * Wraps a parameter extractor to enforce UUID conversion.
 * @example asUUID(pathValue('userId'))
 */
export function asUUID(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: String } };
}

/**
 * Wraps a parameter extractor to enforce array conversion.
 * @example asArray(queryValue('tags'))
 */
export function asArray(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Array } };
}

/**
 * Wraps a parameter extractor to enforce type-based conversion via ConversionService.
 * @example withConversion(queryValue('id'), { source: String, target: UUID })
 */
export function withConversion(
    extractor: ParameterExtractor,
    convertType: { source: unknown; target: unknown }
): ParameterExtractor {
    return { ...extractor, convertType };
}

/**
 * Invoked via the `parameters` decorator.
 *
 * Replaces legacy parameter decorators with a method-level decorator.
 * Uses function parameter name extraction to map extractors to positions.
 *
 * @example
 * // Old (legacy - not supported in TC39):
 * handleRequest(@queryValue('page') page: string) {}
 *
 * // New (TC39):
 * `parameters`({
 *   page: queryValue('page')
 * })
 * handleRequest(page: string) {}
 */
export function parameters(paramMap: ParameterMap) {
    return function (target: unknown, context: ClassMethodDecoratorContext): void {
        // Store the raw parameter map declaratively. The framework converts
        // it to MethodParameter[] at registration time, where the mapping
        // kind (route/request/socket) is known: HTTP and browser mappings
        // bind method arguments positionally; socket mappings resolve the
        // sources into `session.params`. Validation (names-in-signature and
        // source-vs-mapping-kind compatibility) also happens there, not at
        // decoration time, so the same decorator works across all three.
        context.metadata[`method:parameters:${String(context.name)}`] = paramMap;
    };
}

/** Metadata key suffix for the raw parameter map (name → extractor). */
const PARAMETER_MAP_KEY = (name: string | symbol) => `method:parameters:${String(name)}`;
/** Metadata key suffix for the converted positional parameters array. */
const PARAMETER_ARRAY_KEY = (name: string | symbol) => `method:parameter:${String(name)}`;

/**
 * The mapping kind determines which sources exist for a handler method.
 * Named after how the value is bound per transport.
 */
export type ParameterMappingKind = 'route' | 'request' | 'socket';

/**
 * Which sources each mapping kind exposes. A `*Value` extractor whose type is
 * not in the kind's set is a configuration error — the framework throws
 * {@link InvalidParameterMappingError} at registration.
 *
 * - `route` (browser client-side navigation): route.data + browser state
 *   (+ whole-source data binding from any bindable source).
 * - `request` (Node HTTP): the request wire sources including a body
 *   (+ `data-body` / `data-cookie` whole-source binding).
 * - `socket` (WebSocket upgrade): the upgrade URL query + handshake
 *   headers/cookies — no request body, no browser state, no data binding.
 */
const SOURCES_BY_KIND: Record<ParameterMappingKind, ReadonlySet<MethodParameterType>> = {
    // Method-less routeMapping: transport-agnostic — may match any verb and
    // be dispatched on either platform, so it accepts every source. The
    // restrictive sets below are what make the checks valuable.
    route: new Set<MethodParameterType>([
        MethodParameterType.QUERY,
        MethodParameterType.PATH,
        MethodParameterType.MATRIX,
        MethodParameterType.HISTORY_STATE,
        MethodParameterType.REQUEST_SESSION,
        MethodParameterType.SESSION_STORAGE,
        MethodParameterType.LOCAL_STORAGE,
        MethodParameterType.COOKIE,
        MethodParameterType.ATTRIBUTE,
        MethodParameterType.HEADER,
        MethodParameterType.BODY,
        MethodParameterType.ROUTE,
        // Whole-source binding (D-3): permissive as today — every bindable
        // source is admitted; the platform resolver only serves the ones it
        // knows, and registration on the other transport is a no-op.
        MethodParameterType.data('query'),
        MethodParameterType.data('body'),
        MethodParameterType.data('cookie'),
        MethodParameterType.data('session-storage'),
        MethodParameterType.data('local-storage'),
    ]),
    request: new Set<MethodParameterType>([
        MethodParameterType.QUERY,
        MethodParameterType.PATH,
        MethodParameterType.MATRIX,
        MethodParameterType.HEADER,
        MethodParameterType.COOKIE,
        MethodParameterType.REQUEST_SESSION,
        MethodParameterType.ATTRIBUTE,
        MethodParameterType.BODY,
        MethodParameterType.MULTIPART_FILE,
        MethodParameterType.REQUEST_PART,
        MethodParameterType.ROUTE,
        // Whole-source binding (D-3): the form-binding surface — `data-body`
        // is the `@ModelAttribute` equivalent; `data-cookie` is symmetric.
        MethodParameterType.data('body'),
        MethodParameterType.data('cookie'),
    ]),
    socket: new Set<MethodParameterType>([
        MethodParameterType.QUERY,
        MethodParameterType.PATH,
        MethodParameterType.HEADER,
        MethodParameterType.COOKIE,
        MethodParameterType.ROUTE,
        MethodParameterType.SOCKET_SESSION,
    ]),
};

const SOURCE_LABEL: Record<ParameterMappingKind, string> = {
    route: '@routeMapping (method-less: any method)',
    request: '@requestMapping / @getMapping / … (HTTP)',
    socket: '@socketMapping (WebSocket)',
};

/**
 * Determine a method's mapping kind from its metadata.
 *
 * @param target - The class prototype or constructor.
 * @param propertyKey - The method name.
 * @returns `'socket'` for socket-mapped methods, `'request'` when a verb is
 *   set (requestMapping/getMapping/…), else `'route'`.
 */
export function parameterMappingKind(target: unknown, propertyKey: string | symbol): ParameterMappingKind {
    try {
        if (isSocketMapping(target, propertyKey)) return 'socket';
    } catch {
        // isSocketMapping may be unavailable before socket-mapping metadata
        // is imported; treat as route.
    }
    const mapping = getRouteMapping(target, propertyKey);
    return mapping?.method ? 'request' : 'route';
}

/**
 * Read the raw parameter map declared on a method by `@parameters`.
 *
 * @param target - The class prototype or constructor.
 * @param propertyKey - The method name.
 * @returns The name → extractor map, or `undefined` when not decorated.
 */
export function getParameterMap(target: unknown, propertyKey: string | symbol): ParameterMap | undefined {
    return getSymbolMetadata(target)[PARAMETER_MAP_KEY(propertyKey)];
}

/**
 * Convert a raw `@parameters` map into the positional {@link MethodParameter}
 * array the dispatch pipeline + socket resolution consume, validating the
 * map against the method and its mapping kind.
 *
 * - `route`/`request`: each key must be a method-signature argument name;
 *   the resulting array is indexed by argument position.
 * - `socket`: no signature mapping — each declared parameter is resolved
 *   from the upgrade sources into `session.params` (keyed by extractor
 *   name); the array is in declaration order.
 *
 * Throws `InvalidParameterMappingError` when a `*Value` extractor has no
 * source for the mapping kind (e.g. `bodyValue` on a socket mapping).
 *
 * @param target - The class prototype or constructor.
 * @param propertyKey - The method name.
 * @param handlerMethod - The method function (for signature discovery).
 * @returns The converted parameters (may be the empty array).
 * @throws {InvalidParameterMappingError} On source/kind incompatibility.
 */
export function resolveParameters(
    target: unknown,
    propertyKey: string | symbol,
    handlerMethod: Function
): MethodParameter[] {
    const map = getParameterMap(target, propertyKey);
    if (!map) return [];
    const kind = parameterMappingKind(target, propertyKey);
    const allowed = SOURCES_BY_KIND[kind];
    const nameToIndex = new Map<string, number>();
    if (kind !== 'socket') {
        // @traced wraps methods in a `(...args)` proxy that destroys the
        // declared signature; telemetry preserves the original so framework
        // code can still read the true parameter names.
        const original = getSymbolMetadata(target)[`telemetry:traced:${String(propertyKey)}:original`] ?? handlerMethod;
        const paramNames = getFunctionParamNames(original);
        for (let index = 0; index < paramNames.length; index++) nameToIndex.set(paramNames[index], index);
    }
    const resolved: MethodParameter[] = [];
    for (const [paramName, extractor] of Object.entries(map)) {
        if (!allowed.has(extractor.type)) {
            throw new InvalidParameterMappingError(
                `@parameters uses ${extractor.type} on a ${SOURCE_LABEL[kind]} method — this source is not ` +
                    `available for that mapping kind. Allowed sources: ${[...allowed].map((t) => t.type).join(', ')}`,
                paramName,
                String(propertyKey)
            );
        }
        if (kind !== 'socket') {
            const index = nameToIndex.get(paramName);
            if (index === undefined) {
                throw new IllegalStateError(
                    `Parameter "${paramName}" not found in method signature. ` +
                        `Available parameters: ${getFunctionParamNames(handlerMethod).join(', ')}`
                );
            }
            resolved[index] = toMethodParameter(paramName, extractor);
        } else {
            resolved.push(toMethodParameter(paramName, extractor));
        }
    }
    return resolved;
}

/** Build a `MethodParameter` from an extractor, labeling it with the map key. */
function toMethodParameter(paramName: string, extractor: ParameterExtractor): MethodParameter {
    // File/JSON parts infer their client field/part name from the
    // method-argument (map key) unless `fileValue('field')` /
    // `requestPart('part')` supplies one; fold that into `name` so both
    // resolution and required-missing errors address the real part.
    if (
        extractor.type.equals(MethodParameterType.MULTIPART_FILE) ||
        extractor.type.equals(MethodParameterType.REQUEST_PART)
    ) {
        return new MethodParameter(
            extractor.type,
            extractor.partName ?? paramName,
            extractor.required,
            extractor.defaultValue,
            extractor.convertType,
            extractor.prefix,
            extractor.convert,
            paramName,
            extractor.target
        );
    }
    return new MethodParameter(
        extractor.type,
        extractor.name,
        extractor.required,
        extractor.defaultValue,
        extractor.convertType,
        extractor.prefix,
        extractor.convert,
        paramName,
        extractor.target
    );
}

/**
 * Register-time hook: store the resolved parameters for a method so
 * `getMethodParameter` / `hasMethodParameter` (and `RouteHandlerMethod`)
 * see them.
 *
 * @param target - The class prototype or constructor.
 * @param propertyKey - The method name.
 */
export function storeResolvedParameters(
    target: unknown,
    propertyKey: string | symbol,
    resolvedParams: MethodParameter[]
): void {
    if (resolvedParams.length > 0) {
        defineProperty(getSymbolMetadata(target), PARAMETER_ARRAY_KEY(propertyKey), {
            value: resolvedParams,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}

/**
 * Get method parameters
 */
export function getMethodParameter(target: unknown, propertyKey: string | symbol): MethodParameter[] | undefined {
    const metadata = getSymbolMetadata(target);
    return metadata[PARAMETER_ARRAY_KEY(propertyKey)];
}

/**
 * Check if method has parameters
 */
export function hasMethodParameter(target: unknown, propertyKey: string | symbol): boolean {
    return getMethodParameter(target, propertyKey) !== undefined;
}
