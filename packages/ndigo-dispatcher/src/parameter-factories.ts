/**
 * Parameter decorator factories.
 */

import {
    MethodParameterType,
    type DataBindingSource,
    type ParameterExtractor,
    type ParameterExtractorOptions,
} from './parameter-types';

/**
 * Factory function: Create a query parameter extractor
 *
 * @example
 * ```ts
 * parameters({
 *   page: queryValue('page'),
 *   limit: queryValue('limit', { required: true, defaultValue: '10' })
 * })
 * ```
 *
 * @param name - The query parameter name, or `''` for the whole query.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   userId: pathVariable('userId')
 * })
 * ```
 *
 * @param name - The path-variable name, or `''` for the whole path.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   color: matrixValue('color'),
 *   size: matrixValue('size', { required: true })
 * })
 * ```
 *
 * @param name - The matrix-parameter name.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   session: cookieValue('SESSIONID'),
 *   token: cookieValue('AUTH_TOKEN', { required: true })
 * })
 * ```
 *
 * @param name - The cookie name, or `''` for the whole jar.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   userId: requestSessionValue('userId'),
 *   token: requestSessionValue('AUTH_TOKEN', { required: true })
 * })
 * ```
 *
 * @param name - The session value path, or `''` for the whole session.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   theme: sessionStorageValue('theme'),
 * })
 * ```
 *
 * @param name - The storage key, or `''` for the whole jar.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   token: localStorageValue('token'),
 * })
 * ```
 *
 * @param name - The storage key, or `''` for the whole jar.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   token: historyStateValue('token'),
 * })
 * ```
 *
 * @param name - The history-state path, or `''` for the whole state.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   user: dataBinderValue('body'),
 *   profile: dataBinderValue('body', ProfileForm, { prefix: 'profile.' })
 * })
 * ```
 *
 * @param source - The data source name.
 * @param target - Optional target constructor for the bound result.
 * @param options - Required/default/prefix/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   user: attributeValue('user')
 * })
 * ```
 *
 * @param name - The route-attribute name.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   contentType: headerValue('content-type'),
 *   authorization: headerValue('authorization', { required: true })
 * })
 * ```
 *
 * @param name - The header name, or `''` for the whole header record.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * ```ts
 * parameters({
 *   user: bodyValue('user'),
 *   payload: bodyValue()
 * })
 * ```
 *
 * @param name - The body field name, or `''` for the whole body.
 * @param options - Required/default/conversion options.
 * @returns The parameter extractor.
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
 * `NodeMultipartFileMethodArgumentResolver` (ndigo-platform-node).
 *
 * A missing part resolves to the extractor's `defaultValue` (`null`) unless
 * the part is declared required: `fileValue('avatar', { required: true })`
 * makes a missing upload a {@link error.MissingParameterError | MissingParameterError} (HTTP 400) instead
 * of a late TypeError (DOC-5).
 *
 * @example
 * ```ts
 * parameters({
 *   avatar: fileValue(),
 *   profile: fileValue('avatar_url'),
 *   cv: fileValue('cv', { required: true })
 * })
 * ```
 *
 * @param partName - The multipart field name; defaults to the argument name.
 * @param options - Extractor options (`required`).
 * @returns The parameter extractor.
 */
export function fileValue(partName?: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.MULTIPART_FILE,
        name: partName ?? '',
        required: options.required ?? false,
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
 * given, otherwise the method-argument name. Mirrors the reference
 * `@RequestPart(value)` with parameter-name fallback:
 *
 * - `requestPart()` reads the part named after the argument as a plain object;
 * - `requestPart(MetaDto)` does the same into an instantiated DTO;
 * - `requestPart('meta', MetaDto)` overrides the part name.
 *
 * Resolved by `NodeRequestPartMethodArgumentResolver` (ndigo-platform-node).
 *
 * A missing part resolves to the extractor's `defaultValue` (`null`) unless
 * the part is declared required: requestPart('meta', undefined, \{ required:
 * true \}) / requestPart(MetaDto, \{ required: true \}) make a missing part
 * a {@link error.MissingParameterError | MissingParameterError} (HTTP 400) instead of a late TypeError
 * (DOC-5).
 *
 * @example
 * ```ts
 * parameters({
 *   meta: requestPart(MetaDto),
 *   biography: requestPart('bio'),
 *   file: fileValue()
 * })
 * ```
 *
 * @param partName - The multipart field name; defaults to the argument name.
 * @param target - Optional target constructor for the bound part.
 * @param options - Extractor options (`required`).
 * @returns The parameter extractor.
 */
export function requestPart(
    partName?: string,
    target?: new () => object,
    options?: ParameterExtractorOptions
): ParameterExtractor;
/**
 * Creates a request-part extractor targeting a DTO.
 *
 * @param target - The DTO constructor.
 * @param options - Extractor options (`required`).
 * @returns The parameter extractor.
 */
export function requestPart(target: new () => object, options?: ParameterExtractorOptions): ParameterExtractor;
/**
 * Creates a request-part extractor.
 *
 * @param partNameOrTarget - The part name or a DTO constructor.
 * @param targetOrOptions - The DTO constructor or options.
 * @param options - Extractor options (`required`).
 * @returns The parameter extractor.
 */
export function requestPart(
    partNameOrTarget?: string | (new () => object),
    targetOrOptions?: (new () => object) | ParameterExtractorOptions,
    options: ParameterExtractorOptions = {}
): ParameterExtractor {
    // Normalize the overloads: `(partName[, target][, options])` vs
    // `(target[, options])` — in the target-first form the options arrive in
    // the `targetOrOptions` slot.
    const partName = typeof partNameOrTarget === 'function' ? undefined : partNameOrTarget;
    const target =
        typeof partNameOrTarget === 'function'
            ? partNameOrTarget
            : typeof targetOrOptions === 'function'
              ? targetOrOptions
              : undefined;
    const resolvedOptions = typeof targetOrOptions === 'object' && targetOrOptions !== null ? targetOrOptions : options;
    return {
        type: MethodParameterType.REQUEST_PART,
        name: partName ?? '',
        required: resolvedOptions.required ?? false,
        defaultValue: null,
        partName,
        target,
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
 * ```ts
 * class RouteController {
 *   @parameters({ route: routeValue() })
 *   async handle(route: Route) {}
 * }
 * ```
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
 *
 * @param extractor - The extractor to wrap.
 * @returns The extractor with number conversion.
 * @example asNumber(queryValue('age'))
 */
export function asNumber(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Number } };
}

/**
 * Wraps a parameter extractor to enforce boolean conversion.
 *
 * @param extractor - The extractor to wrap.
 * @returns The extractor with boolean conversion.
 * @example asBoolean(historyStateValue('isActive'))
 */
export function asBoolean(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Boolean } };
}

/**
 * Wraps a parameter extractor to enforce Date conversion.
 *
 * @param extractor - The extractor to wrap.
 * @returns The extractor with Date conversion.
 * @example asDate(cookieValue('lastLogin'))
 */
export function asDate(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Date } };
}

/**
 * Wraps a parameter extractor to enforce JSON conversion.
 *
 * @param extractor - The extractor to wrap.
 * @returns The extractor with JSON conversion.
 * @example asJson<UserProfile>(sessionStorageValue('profile'))
 */
export function asJson<_T = unknown>(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Object } };
}

/**
 * Wraps a parameter extractor to enforce UUID conversion.
 *
 * @param extractor - The extractor to wrap.
 * @returns The extractor with UUID conversion.
 * @example asUUID(pathValue('userId'))
 */
export function asUUID(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: String } };
}

/**
 * Wraps a parameter extractor to enforce array conversion.
 *
 * @param extractor - The extractor to wrap.
 * @returns The extractor with array conversion.
 * @example asArray(queryValue('tags'))
 */
export function asArray(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Array } };
}

/**
 * Wraps a parameter extractor to enforce type-based conversion via ConversionService.
 * @example
 * ```ts
 * withConversion(queryValue('id'), { source: String, target: UUID })
 * ```
 *
 * @param extractor - The extractor to wrap.
 * @param convertType - The source/target conversion pair.
 * @returns The extractor with the conversion applied.
 */
export function withConversion(
    extractor: ParameterExtractor,
    convertType: { source: unknown; target: unknown }
): ParameterExtractor {
    return { ...extractor, convertType };
}
