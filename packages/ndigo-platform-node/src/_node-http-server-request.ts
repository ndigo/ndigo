/**
 * HTTP request pipeline for the Node HTTP server adapter: body limits,
 * multipart parsing, route construction, and dispatch finalization.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Route, RouteSegment, ACCEPT_LANGUAGE_ATTRIBUTE, REQUESTED_THEME_ATTRIBUTE } from '@ndigo/router';
import { getDispatchError, getInterceptorDenial, getMethodNotAllowed } from '@ndigo/dispatcher';
import { contentTypeBase, HTTPHeaders, MULTIPART_FORM_DATA, ProblemTypes } from '@ndigo/http';
import type { NodeDispatcher } from './node-dispatcher.js';
import {
    NodeRequest,
    NODE_INCOMING_ATTRIBUTE,
    NODE_REQUEST_ATTRIBUTE,
    NODE_RESPONSE_ATTRIBUTE,
} from './node-request.js';
import type { TrustedProxySet } from './trusted-proxy.js';
import { resolveClientAddress } from './trusted-proxy.js';
import type { ResolvedHTTPRequestLimits } from './http-request-limits.js';
import { parseBodyRecord } from './http-request-limits.js';
import { parseMultipart } from './parse-multipart.js';
import type { MultipartLimits } from './parse-multipart.js';
import type { MultipartContext } from './multipart-file.js';
import { writeProblem } from './problem-details.js';
import { finalizeInterceptorDenial } from './finalize-denial.js';
import { THEME_COOKIE_NAME } from './node-http-server-adapter-options.js';
import {
    assertHeaderLimits,
    buildUrl,
    parseRequestCookies,
    readRequestBody,
    writeErrorResponse,
} from './_node-http-server-adapter-helpers.js';

/** The adapter state the request pipeline reads. */
export interface NodeHTTPRequestHost {
    /** The dispatcher to invoke. */
    readonly dispatcher: NodeDispatcher;
    /** Request body/header/timeout limits. */
    readonly limits: ResolvedHTTPRequestLimits;
    /** Multipart overrides. */
    readonly multipartLimits: Partial<MultipartLimits> | undefined;
    /** Trusted-proxy allowlist for client addresses. */
    readonly trustedProxies: TrustedProxySet;
    /** Whether a path resolves to a socket-only handler. */
    hasSocketHandler(path: string, parameterized: boolean): boolean;
}

/** Parses and dispatches one HTTP request. */
export class NodeHTTPRequestPipeline {
    readonly #host: NodeHTTPRequestHost;

    /**
     * @param host - The adapter state the pipeline reads.
     */
    constructor(host: NodeHTTPRequestHost) {
        this.#host = host;
    }

    /**
     * Handles one incoming request through the dispatch pipeline.
     *
     * @param req - The Node request.
     * @param res - The Node response.
     * @returns A promise that resolves once the response is written.
     */
    async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let multipart: MultipartContext | undefined;
        try {
            const urlObj = buildUrl(req);
            assertHeaderLimits(req, this.#host.limits);
            const contentType = String(HTTPHeaders.CONTENT_TYPE.get(req.headers) ?? '').toLowerCase();
            let bodyRecord: Record<string, unknown>;
            if (contentTypeBase(contentType) === MULTIPART_FORM_DATA) {
                multipart = await parseMultipart(req, { limits: this.#host.multipartLimits });
                bodyRecord = multipart.fields;
            } else {
                bodyRecord = this.#parseBodyRecord(req, await readRequestBody(req, this.#host.limits));
            }

            const nodeRequest: NodeRequest = {
                headers: req.headers as Record<string, string | string[] | undefined>,
                body: bodyRecord,
                cookies: parseRequestCookies(req),
                // Resolved through the trusted-proxy allowlist; the
                // direct socket address stands unless the peer is trusted.
                remoteAddress: resolveClientAddress(
                    req.socket?.remoteAddress,
                    req.headers as Record<string, string | string[] | undefined>,
                    this.#host.trustedProxies
                ),
                session: {},
            };
            if (multipart) {
                nodeRequest.multipart = multipart;
            }
            // Null-prototype map — see the upgrade path. `?__proto__=a`
            // must stay an ordinary parameter, not swap the map's prototype.
            const data: Record<string, string | string[]> = Object.create(null);

            const { segments, cleanedPath } = this.#parseMatrixParams(urlObj.pathname);
            urlObj.searchParams.forEach((value, key) => {
                // Preserve repeated query parameters using the multi-value
                // contract (`data[key]` becomes an array on repeats).
                if (Object.hasOwn(data, key)) {
                    const existing = data[key];
                    data[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
                } else {
                    data[key] = value;
                }
            });

            const route: Route = {
                length: segments.length,
                id: crypto.randomUUID(),
                path: cleanedPath,
                raw: req.url ?? '/',
                data,
                params: null,
                method: req.method as Route['method'],
                attributes: {
                    [NODE_REQUEST_ATTRIBUTE]: nodeRequest,
                    [NODE_RESPONSE_ATTRIBUTE]: res,
                    [NODE_INCOMING_ATTRIBUTE]: req,
                    [ACCEPT_LANGUAGE_ATTRIBUTE]: HTTPHeaders.ACCEPT_LANGUAGE.get(req.headers) ?? undefined,
                    [REQUESTED_THEME_ATTRIBUTE]: nodeRequest.cookies[THEME_COOKIE_NAME],
                },
            };

            const segmentsLength = segments.length;
            for (let index = 0; index < segmentsLength; index++) {
                route[index] = segments[index];
            }

            const chain = this.#host.dispatcher.getHandler(route);
            const noHandler = !chain?.handler || Object.keys(chain.handler).length === 0;

            // `route.params` is non-null exactly when the matched mapping is
            // parameterized (the radix mapping writes the captured segments),
            // so those probes stay out of the path-keyed memo (PL-8).
            if (!noHandler && this.#host.hasSocketHandler(route.path, route.params !== null)) {
                // A WebSocket-only endpoint (socketMapped) reached through a
                // plain HTTP request: the method exists but only for upgraded
                // sockets. Respond 404 — this path is not served over HTTP.
                writeProblem(res, {
                    type: ProblemTypes.notFound,
                    title: 'Not Found',
                    status: 404,
                    instance: route.path,
                });
                return;
            }

            if (noHandler) {
                const allowed = getMethodNotAllowed(route);
                if (allowed) {
                    writeProblem(
                        res,
                        {
                            type: ProblemTypes.methodNotAllowed,
                            title: 'Method Not Allowed',
                            status: 405,
                            instance: route.path,
                        },
                        { [HTTPHeaders.ALLOW.name]: allowed }
                    );
                    return;
                }
                if (route.method !== 'OPTIONS') {
                    // RFC 9110 §15.5.6: unmatched request → 404. Dispatching a
                    // non-OPTIONS unmatched route would fall into the error path
                    // (a deterministic 500) instead of the correct 404.
                    writeProblem(res, {
                        type: ProblemTypes.notFound,
                        title: 'Not Found',
                        status: 404,
                        instance: route.path,
                    });
                    res.end();
                    return;
                }
                // OPTIONS is always allowable and the CORS interceptor on the
                // fallback chain finalizes preflights — dispatch so it runs.
            }

            // The mapping strategy's fallback chain carries interceptors even
            // for unmatched routes, so interceptor-only concerns (CORS
            // preflight short-circuiting) can finalize the request. Dispatch
            // always; denial finalizes immediately.
            await this.#host.dispatcher.dispatch(route);
            // An interceptor denial (auth guard, CSRF, CORS preflight, …)
            // leaves no rendered view — finalize a deterministic response so
            // the request never stays open.
            const denial = getInterceptorDenial(route);
            if (denial) {
                finalizeInterceptorDenial(res, denial);
                return;
            }

            if (noHandler) {
                // OPTIONS preflight that no interceptor finalized: default to 404.
                writeProblem(res, {
                    type: ProblemTypes.notFound,
                    title: 'Not Found',
                    status: 404,
                    instance: route.path,
                });
                res.end();
            }

            // DSV-B1: the dispatcher swallows a handler-adapter, view-resolution,
            // or render failure (it must not reject fire-and-forget callers) and
            // records it on the route. Finalize a deterministic 500 when the
            // response is still open and nothing else finalized it — a denial is
            // handled above, and `noHandler` keeps its own 404/405 contract.
            const dispatchError = getDispatchError(route);
            if (dispatchError && !noHandler) {
                writeErrorResponse(res, dispatchError);
                return;
            }
        } catch (error: unknown) {
            writeErrorResponse(res, error);
        } finally {
            // Every parsed multipart context is disposed once the
            // request has finished dispatching — success, early return
            // (404/405/denial), or error — so spilled temp parts never leak.
            // cleanup() is idempotent and never throws; handlers have already
            // run transferTo() (a copy), so the temp file is still owned here.
            if (multipart) {
                await multipart.cleanup();
            }
        }
    }
    /**
     * Applies content-type-aware parsing. JSON is strict; other types fall
     * back to raw text under the `'*'` key (no silent reshaping).
     */
    #parseBodyRecord(req: IncomingMessage, raw: Buffer): Record<string, unknown> {
        return parseBodyRecord(HTTPHeaders.CONTENT_TYPE.get(req.headers) ?? undefined, raw);
    }

    /**
     * Parse matrix parameters (e.g. `/products/42;color=red`) from a pathname.
     * Returns a cleaned path (matrix params stripped) and per-segment data maps.
     */
    #parseMatrixParams(pathname: string): {
        cleanedPath: string;
        segments: RouteSegment[];
    } {
        const segments: RouteSegment[] = [];
        const pathParts = pathname.split('/').filter((part) => part !== '');

        let cleanedPath = '';
        const pathPartsLength = pathParts.length;
        for (let index = 0; index < pathPartsLength; index++) {
            const part = pathParts[index];
            const [segmentValue, ...matrixParams] = part.split(';');

            cleanedPath = index === 0 ? segmentValue : `${cleanedPath}/${segmentValue}`;

            const data: Record<string, string> = {};
            for (const param of matrixParams) {
                const [key, value] = param.split('=');
                data[key] = value ?? '';
            }

            segments.push({ name: segmentValue, raw: part, data });
        }

        return { cleanedPath: cleanedPath ? `/${cleanedPath}` : '/', segments };
    }
}
