/**
 * Per-request HTTP semantics for static resources: conditional GET,
 * single-range, cache headers, precompressed variants, directory listing,
 * and SPA fallback — writing directly to the `ServerResponse`.
 *
 * Payloads are streamed from disk (`createReadStream`) with stat-derived
 * `Content-Length`s: nothing whole-file-buffers, and conditional GETs / HEAD
 * are answered from stat metadata alone without opening the file.
 * Header names come from the `@ndigo/http` `HTTPHeader` constants (RUS-2,
 * REUSE-1), except `X-Content-Type-Options: nosniff`, reused verbatim from the
 * resolver; request-header reads go through the constants' `get`,
 * which case-folds over Node's lower-cased `IncomingMessage` records.
 */
import { MediaTypes } from '@ndigo/core';
import { Route } from '@ndigo/router';
import {
    ACCEPT,
    ACCEPT_ENCODING,
    ACCEPT_RANGES,
    CACHE_CONTROL,
    CONTENT_ENCODING,
    CONTENT_TYPE,
    ETAG,
    LAST_MODIFIED,
    VARY,
    ProblemTypes,
} from '@ndigo/http';
import { getNodeRequest, getNodeResponse } from './node-request.js';
import { NOSNIFF_HEADER, StaticResourceResolver, type StaticResourceResult } from './static-resource-resolver.js';
import {
    DEFAULT_CACHE_CONTROL,
    DEFAULT_INDEX_NAMES,
    acceptsHtml,
    isBodylessMethod,
    toHttpDate,
} from './_static-resource-http.js';
import { sendRepresentation, sendRouteProblem } from './_static-resource-response.js';
import type { StaticHandlerOptions } from './static-resource-handler-types.js';

export * from './static-resource-handler-types.js';

/**
 * The HTTP half of static serving: one `handle(route, requestPath)` call
 * turns a path into a complete response.
 *
 * Flow: resolve (with variant negotiation) → conditional GET → single
 * range → cache headers → body. Handles GET and HEAD; errors are
 * problem+json documents; 404 file misses may fall back to the SPA index
 * Writes directly, because status/header combinations like 206/304/416
 * cannot flow through `ResponseEntityView`.
 *
 * @example
 * ```ts
 * const instance = new StaticResourceHandler();
 * ```
 */
export class StaticResourceHandler {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "StaticResourceHandler".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object StaticResourceHandler]"
     */
    get [Symbol.toStringTag](): string {
        return 'StaticResourceHandler';
    }

    readonly #resolver: StaticResourceResolver;
    readonly #options: StaticHandlerOptions;

    /**
     * Creates a handler over a static root.
     *
     * @param basePath - The directory to serve files from.
     * @param options - Handler options.
     */
    constructor(basePath: string, options: StaticHandlerOptions = {}) {
        this.#resolver = new StaticResourceResolver(basePath);
        this.#options = options;
    }

    /**
     * Serves `requestPath` for the route's request, writing the response.
     *
     * @param route - The current route (carries the Node request/response).
     * @param requestPath - The request-relative path to serve (raw, undecoded).
     * @returns A promise that resolves once the response is written.
     */
    async handle(route: Route, requestPath: string): Promise<void> {
        const res = getNodeResponse(route);
        if (!res || res.headersSent) {
            return;
        }
        const method = route.method;
        if (!isBodylessMethod(method)) {
            sendRouteProblem(res, route, 405, 'Method Not Allowed', ProblemTypes.methodNotAllowed);
            return;
        }
        const headers: Record<string, string | string[] | undefined> = getNodeRequest(route)?.headers ?? {};

        const resolved = await this.#resolveForResponse(route, requestPath);
        if (resolved === null) {
            return;
        }

        const successHeaders = this.#successHeaders(resolved.result, resolved.spaFallbackServed);
        await sendRepresentation({ res, result: resolved.result, successHeaders, headers, method });
    }

    /**
     * Resolves the requested path, applying the SPA fallback when configured.
     * Sends the problem document and returns `null` when resolution fails.
     */
    async #resolveForResponse(
        route: Route,
        requestPath: string
    ): Promise<{ result: StaticResourceResult; spaFallbackServed: boolean } | null> {
        const res = getNodeResponse(route);
        if (!res) {
            return null;
        }
        const headers: Record<string, string | string[] | undefined> = getNodeRequest(route)?.headers ?? {};
        let result = await this.#resolver.resolve(requestPath, {
            indexNames: this.#options.indexNames ?? DEFAULT_INDEX_NAMES,
            listDirectories: this.#options.listDirectories,
            acceptEncoding: ACCEPT_ENCODING.get(headers) ?? undefined,
            maxFileSizeBytes: this.#options.maxFileSizeBytes,
            serveDotfiles: this.#options.serveDotfiles,
        });

        // A shared cache must key an SPA fallback on `Accept` so it is
        // never replayed to clients that did not accept HTML.
        let spaFallbackServed = false;

        if (result.kind === 'not-found' && this.#options.spaFallback && acceptsHtml(ACCEPT.get(headers) ?? undefined)) {
            const indexName = this.#options.indexNames?.[0] ?? DEFAULT_INDEX_NAMES[0];
            const index = await this.#resolver.resolve(indexName, {
                acceptEncoding: undefined,
                maxFileSizeBytes: this.#options.maxFileSizeBytes,
                serveDotfiles: this.#options.serveDotfiles,
            });
            if (index.kind === 'ok') {
                result = index;
                spaFallbackServed = true;
            }
        }

        if (result.kind === 'ok') {
            return { result, spaFallbackServed };
        }
        if (result.kind === 'forbidden') {
            sendRouteProblem(res, route, 403, 'Forbidden', ProblemTypes.forbidden);
        } else if (result.kind === 'internal-error') {
            sendRouteProblem(res, route, 500, 'Internal Server Error', ProblemTypes.internalError);
        } else {
            sendRouteProblem(res, route, 404, 'Not Found', ProblemTypes.notFound);
        }
        return null;
    }

    /** Builds the success headers shared by every representation. */
    #successHeaders(result: StaticResourceResult, spaFallbackServed: boolean): Record<string, string> {
        const successHeaders: Record<string, string> = {
            [CONTENT_TYPE.name]: result.contentType ?? String(MediaTypes.APPLICATION_OCTET_STREAM),
        };
        // Never let a browser MIME-sniff a static payload. The
        // resolver's constant is the canonical `name: value` line; split it
        // once so the header key stays in lockstep with its value.
        const [nosniffName, nosniffValue] = NOSNIFF_HEADER.split(/:\s*/, 2) as [string, string];
        successHeaders[nosniffName] = nosniffValue;
        // `undefined` → default; `null` → opt out of the header entirely.
        const cacheControl =
            this.#options.cacheControl === undefined ? DEFAULT_CACHE_CONTROL : this.#options.cacheControl;
        if (cacheControl !== null) {
            successHeaders[CACHE_CONTROL.name] = cacheControl;
        }
        if (result.variantAware) {
            successHeaders[VARY.name] = 'Accept-Encoding';
        }
        if (spaFallbackServed) {
            // Extend (never overwrite) any existing Vary value so the shared
            // cache keys the fallback on both variant dimensions.
            successHeaders[VARY.name] =
                successHeaders[VARY.name] === undefined ? 'Accept' : `${successHeaders[VARY.name]}, Accept`;
        }
        if (result.etag) {
            successHeaders[ETAG.name] = result.etag;
        }
        if (result.mtimeMs !== undefined) {
            successHeaders[LAST_MODIFIED.name] = toHttpDate(result.mtimeMs);
        }
        if (result.encoding) {
            successHeaders[CONTENT_ENCODING.name] = result.encoding;
        }
        if (result.etag !== undefined) {
            successHeaders[ACCEPT_RANGES.name] = 'bytes';
        }
        return successHeaders;
    }
}
