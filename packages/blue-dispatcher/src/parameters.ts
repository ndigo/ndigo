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
    convertType?: { source: any; target: any };
    prefix?: string | null;
    /** Optional post-bind validator/converter (e.g. Zod via `validatedBy`). */
    convert?: (value: any) => any;
};

/** Options for creating a parameter extractor with type-based conversion support. */
export interface ParameterExtractorOptions {
    required?: boolean;
    defaultValue?: string;
    /** Type-based converter: specifies source and target types for ConversionService lookup. */
    convertType?: { source: any; target: any };
}

export interface ParameterValueConversionContext {
    name: string;
    parameter: MethodParameter;
    route: any;
    mapping: any;
}

export type ParameterValueConverter = (value: any, context: ParameterValueConversionContext) => any;

/**
 * Parameter map for `parameters` decorator
 */
export type ParameterMap = Record<string, ParameterExtractor>;

/**
 * Method parameter type enum
 */
export class MethodParameterType implements Equatable, Serializable {
    static COOKIE: MethodParameterType;
    static MODEL: MethodParameterType;
    static MATRIX: MethodParameterType;
    static PATH: MethodParameterType;
    static QUERY: MethodParameterType;
    static STATE: MethodParameterType;
    static SESSION: MethodParameterType;
    static BIND: MethodParameterType;
    static ATTRIBUTE: MethodParameterType;
    static HEADER: MethodParameterType;
    static BODY: MethodParameterType;

    static fromType(type: string): MethodParameterType | null {
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

    equals(value: any): boolean {
        return value instanceof MethodParameterType && value.type === this.type;
    }

    toJSON(): string {
        return this.toString();
    }

    toString(): string {
        return this.type;
    }
}

MethodParameterType.COOKIE = new MethodParameterType('cookie:value');
MethodParameterType.MODEL = new MethodParameterType('model:value');
MethodParameterType.MATRIX = new MethodParameterType('matrix:value');
MethodParameterType.PATH = new MethodParameterType('path:value');
MethodParameterType.QUERY = new MethodParameterType('query:value');
MethodParameterType.STATE = new MethodParameterType('state:value');
MethodParameterType.SESSION = new MethodParameterType('session:value');
MethodParameterType.BIND = new MethodParameterType('bind:value');
MethodParameterType.ATTRIBUTE = new MethodParameterType('attribute:value');
MethodParameterType.HEADER = new MethodParameterType('header:value');
MethodParameterType.BODY = new MethodParameterType('body:value');

/**
 * Method parameter metadata
 */
export class MethodParameter implements Serializable {
    readonly name!: string;
    readonly type!: MethodParameterType;
    readonly required!: boolean;
    readonly defaultValue!: string | null;
    readonly convertType!: { source: any; target: any } | undefined;
    readonly prefix!: string | null;
    /**
     * Optional post-bind validator/converter applied to the resolved value.
     * Set by {@link validatedBy} (Zod-backed, AD-7).
     */
    readonly convert!: ((value: any) => any) | undefined;
    /**
     * The `@parameters` map key this parameter was declared under. For HTTP
     * and browser mappings this equals the method-argument name (and usually
     * the extractor name); for socket mappings it is the `session.params`
     * key, which may differ from the extractor's source name (e.g.
     * `via: headerValue('x-via')` → `parameterName: 'via'`,
     * `name: 'x-via'`).
     */
    readonly parameterName!: string;

    constructor(
        type: MethodParameterType,
        name: string,
        required: boolean = false,
        defaultValue: string | null = null,
        convertType?: { source: any; target: any },
        prefix: string | null = null,
        convert?: (value: any) => any,
        parameterName?: string
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
export function queryValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.QUERY,
        name,
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
 *   userId: pathValue('userId')
 * })
 */
export function pathValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.PATH,
        name,
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
export function cookieValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.COOKIE,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a session parameter extractor
 *
 * @example
 * `parameters`({
 *   userId: sessionValue('userId'),
 *   token: sessionValue('AUTH_TOKEN', { required: true })
 * })
 */
export function sessionValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.SESSION,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a model parameter extractor
 *
 * @example
 * `parameters`({
 *   profile: modelValue('profile'),
 * })
 */
export function modelValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.MODEL,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a history state parameter extractor
 *
 * @example
 * `parameters`({
 *   token: stateValue('token'),
 * })
 */
export function stateValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.STATE,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a binding parameter extractor.
 * Binds an entire source (e.g. query, state) to an object, optionally filtering by prefix.
 *
 * @example
 * `parameters`({
 *   user: bindValue('query', { prefix: 'user.' })
 * })
 */
export function bindValue(
    source: 'query' | 'state' | 'session' | 'model' | 'cookie' | 'matrix' | 'path',
    options: {
        required?: boolean;
        defaultValue?: any;
        convertType?: { source: any; target: any };
        prefix?: string;
    } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.BIND,
        name: source,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
        prefix: options.prefix ?? null,
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
export function attributeValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.ATTRIBUTE,
        name,
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
export function headerValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.HEADER,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a request-body parameter extractor.
 * Use `name: '*'` to bind the entire parsed body object.
 *
 * @example
 * `parameters`({
 *   user: bodyValue('user'),
 *   payload: bodyValue('*')
 * })
 */
export function bodyValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.BODY,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
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
 * @example asBoolean(stateValue('isActive'))
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
 * @example asJson<UserProfile>(modelValue('profile'))
 */
export function asJson<_T = any>(extractor: ParameterExtractor): ParameterExtractor {
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
    convertType: { source: any; target: any }
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
    return function (target: any, context: ClassMethodDecoratorContext): void {
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
 *   (+ model/state/bind form binding).
 * - `request` (Node HTTP): the request wire sources including a body.
 * - `socket` (WebSocket upgrade): the upgrade URL query + handshake
 *   headers/cookies — no request body, no browser state.
 */
const SOURCES_BY_KIND: Record<ParameterMappingKind, ReadonlySet<MethodParameterType>> = {
    // Method-less routeMapping: transport-agnostic — may match any verb and
    // be dispatched on either platform, so it accepts every source. The
    // restrictive sets below are what make the checks valuable.
    route: new Set<MethodParameterType>([
        MethodParameterType.QUERY,
        MethodParameterType.PATH,
        MethodParameterType.MATRIX,
        MethodParameterType.STATE,
        MethodParameterType.SESSION,
        MethodParameterType.MODEL,
        MethodParameterType.COOKIE,
        MethodParameterType.ATTRIBUTE,
        MethodParameterType.BIND,
        MethodParameterType.HEADER,
        MethodParameterType.BODY,
    ]),
    request: new Set<MethodParameterType>([
        MethodParameterType.QUERY,
        MethodParameterType.PATH,
        MethodParameterType.MATRIX,
        MethodParameterType.HEADER,
        MethodParameterType.COOKIE,
        MethodParameterType.SESSION,
        MethodParameterType.ATTRIBUTE,
        MethodParameterType.BODY,
    ]),
    socket: new Set<MethodParameterType>([
        MethodParameterType.QUERY,
        MethodParameterType.PATH,
        MethodParameterType.HEADER,
        MethodParameterType.COOKIE,
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
export function parameterMappingKind(target: any, propertyKey: string | symbol): ParameterMappingKind {
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
export function getParameterMap(
    target: any,
    propertyKey: string | symbol
): ParameterMap | undefined {
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
    target: any,
    propertyKey: string | symbol,
    handlerMethod: Function
): MethodParameter[] {
    const map = getParameterMap(target, propertyKey);
    if (!map) return [];
    const kind = parameterMappingKind(target, propertyKey);
    const allowed = SOURCES_BY_KIND[kind];
    const nameToIndex = new Map<string, number>();
    if (kind !== 'socket') {
        const paramNames = getFunctionParamNames(handlerMethod);
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
    return new MethodParameter(
        extractor.type,
        extractor.name,
        extractor.required,
        extractor.defaultValue,
        extractor.convertType,
        extractor.prefix,
        extractor.convert,
        paramName
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
export function storeResolvedParameters(target: any, propertyKey: string | symbol, resolvedParams: MethodParameter[]): void {
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
export function getMethodParameter(target: any, propertyKey: string | symbol): MethodParameter[] | undefined {
    const metadata = getSymbolMetadata(target);
    return metadata[PARAMETER_ARRAY_KEY(propertyKey)];
}

/**
 * Check if method has parameters
 */
export function hasMethodParameter(target: any, propertyKey: string | symbol): boolean {
    return getMethodParameter(target, propertyKey) !== undefined;
}
