/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getSymbolMetadata, IllegalStateError } from '@ndigo/core';
import { getFunctionParamNames } from './_decorator-util';
import { isSocketMapping } from './socket-mapping';
import { getRouteMapping } from './route-mapping';
import { InvalidParameterMappingError } from './error';
import { MethodParameter, MethodParameterType, type ParameterExtractor, type ParameterMap } from './parameter-types';

const { defineProperty } = Reflect;

export * from './parameter-types';
export * from './parameter-factories';

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
 * source for the mapping kind (e.g. `bodyValue` on a socket mapping), or when
 * the map omits an argument between two declared ones (positional dispatch
 * cannot skip a slot: the undeclared argument would be invoked as
 * `undefined`). Arguments after the last mapped one may stay undeclared.
 *
 * @param target - The class prototype or constructor.
 * @param propertyKey - The method name.
 * @param handlerMethod - The method function (for signature discovery).
 * @returns The converted parameters (may be the empty array).
 * @throws {InvalidParameterMappingError} On source/kind incompatibility or a sparse positional map.
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
    let paramNames: string[] = [];
    if (kind !== 'socket') {
        // @traced wraps methods in a `(...args)` proxy that destroys the
        // declared signature; telemetry preserves the original so framework
        // code can still read the true parameter names.
        const original = getSymbolMetadata(target)[`telemetry:traced:${String(propertyKey)}:original`] ?? handlerMethod;
        paramNames = getFunctionParamNames(original);
        const length = paramNames.length;
        for (let index = 0; index < length; index++) nameToIndex.set(paramNames[index], index);
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
    if (kind !== 'socket') {
        // Positional dispatch needs a contiguous map: a hole makes
        // RouteHandlerMethod.invoke probe the resolver chain with
        // `undefined` and fail with a TypeError. A hole means an argument
        // between two declared ones is undeclared — a configuration error,
        // so it is rejected here at registration time instead.
        const declared = resolved.length;
        for (let index = 0; index < declared; index++) {
            if (resolved[index] === undefined) {
                throw new InvalidParameterMappingError(
                    `@parameters does not declare argument "${paramNames[index]}" at position ${index}. ` +
                        'Declare every argument up to the last mapped one.',
                    paramNames[index],
                    String(propertyKey)
                );
            }
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
            extractor.target,
            extractor.schema
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
        extractor.target,
        extractor.schema
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
