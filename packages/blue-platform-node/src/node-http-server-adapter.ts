import { guid } from '@blue/util/math';
/**
 * Node.js HTTP server adapter wrapping `node:http.createServer()`.
 *
 * Parses the incoming `IncomingMessage` into a `NodeRequest`, creates a `Route`,
 * and dispatches through the `NodeDispatcher`. The dispatcher's render output
 * is written to the `ServerResponse`.
 *
 * Every request passes through one error boundary: URL construction, body
 * streaming, parsing, dispatch, and response finalization all terminate with
 * a deterministic status (`400` malformed input, `408` timeout, `413`
 * oversized body, generic `500` otherwise — internal details logged, never
 * returned to the client).
 *
 * @module
 * @since 1.0.0
 */
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { WebSocketServer } from 'ws';
import { Route, RouteSegment } from '@blue/router';
import {
    getInterceptorDenial,
    getMethodNotAllowed,
    isSocketMapping,
    type InterceptorDenial,
    type SocketRequestSources,
    type SocketSession,
    type MethodParameter,
    type HandlerMethodArgumentResolver,
    MethodParameterType,
} from '@blue/dispatcher';
import { NodeRequest, NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { nodeSocketSession } from './node-socket-session';
import { ProblemTypes, writeProblem } from './problem-details';
import { ResponseStatus } from '@blue/http';
import type { NodeDispatcher } from './node-dispatcher';
import type { HTTPServerAdapter } from './http-server';
import type { WebSocket } from 'ws';
import {
    type HTTPRequestLimits,
    type ResolvedHTTPRequestLimits,
    resolveHTTPRequestLimits,
    parseBody,
} from './http-request-limits';
import { parseCookies } from './cookie-parser';

/** Error classes for deterministic transport-level status mapping. */
class RequestLimitError extends Error {
    readonly statusCode: number;
    readonly code: string;

    constructor(statusCode: number, code: string, message: string) {
        super(message);
        this.name = 'RequestLimitError';
        this.statusCode = statusCode;
        this.code = code;
    }
}

/**
 * Options for {@link NodeHTTPServerAdapter}.
 */
export interface NodeHTTPServerAdapterOptions {
    /** Request pipeline limits/timeouts. Defaults are conservative and safe. */
    limits?: HTTPRequestLimits;
}

/**
 * Default HTTP server adapter using raw `node:http`.
 *
 * @example
 * ```ts
 * const adapter = new NodeHTTPServerAdapter(dispatcher);
 * await adapter.listen(3000);
 * ```
 */
export class NodeHTTPServerAdapter implements HTTPServerAdapter {
    /**
     * Pending upgrade sources, FIFO: `shouldHandle(req)` runs before
     * `handleUpgrade`/`connection` for each upgrade, so push the parsed
     * request sources there and the `connection` callback shifts them off.
     */
    #pendingUpgrades: Array<{ path: string; sources: SocketRequestSources }> = [];
    #dispatcher: NodeDispatcher;
    readonly #limits: ResolvedHTTPRequestLimits;
    #server: ReturnType<typeof createServer> | null;
    #websocket: WebSocketServer | null = null;

    get server(): unknown {
        return this.#server;
    }

    /**
     * @param dispatcher - The dispatcher to invoke for each incoming request.
     * @param options - Optional request limits and timeouts.
     */
    constructor(dispatcher: NodeDispatcher, options: NodeHTTPServerAdapterOptions = {}) {
        this.#dispatcher = dispatcher;
        this.#limits = resolveHTTPRequestLimits(options.limits);
        this.#server = null;
    }

    /**
     * Binds the server. Rejects on bind errors (port in use, bad host, …)
     * instead of resolving silently.
     */
    async listen(port: number, host?: string): Promise<void> {
        if (this.#server) {
            throw new Error('NodeHTTPServerAdapter is already listening — close it before listening again');
        }
        return new Promise<void>((resolve, reject) => {
            const server = createServer((req: IncomingMessage, res: ServerResponse) => {
                void this.handleRequest(req, res);
            });
            server.requestTimeout = this.#limits.requestTimeoutMs;
            server.headersTimeout = this.#limits.headersTimeoutMs;
            server.keepAliveTimeout = this.#limits.keepAliveTimeoutMs;
            server.maxRequestsPerSocket = this.#limits.maxRequestsPerSocket;
            const onError = (error: Error): void => reject(error);
            server.once('error', onError);
            server.listen(port, host, () => {
                server.off('error', onError);
                resolve();
            });
            this.#server = server;
            // WebSocket upgrades (RFC 6455 via `ws`): attach an `upgrade`
            // listener to this http.Server; `shouldHandle` gates by path so
            // only socket-mapped routes upgrade, then `connection` dispatches.
            // ws forwards the server's `error` onto itself unconditionally
            // (its `error` option does not apply to the http server); without
            // a listener here, a bind failure would re-emit and crash the
            // process as an uncaught exception. Bind errors are already
            // surfaced by the server `error` path above (reject).
            const websocket = new WebSocketServer({ server, verifyClient: undefined });
            websocket.on('error', () => undefined);
            websocket.shouldHandle = (req: IncomingMessage): boolean => {
                const [path, queryString] = (req.url ?? '').split('?', 2);
                const query: Record<string, string | string[]> = {};
                if (queryString) {
                    for (const [key, value] of new URLSearchParams(queryString)) {
                        if (key in query) {
                            const existing = query[key];
                            query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
                        } else {
                            query[key] = value;
                        }
                    }
                }
                const sources: SocketRequestSources = {
                    query,
                    headers: req.headers as Record<string, string | string[] | undefined>,
                    cookies: parseCookies(
                        typeof req.headers['cookie'] === 'string' ? req.headers['cookie'] : undefined
                    ),
                };
                const accepts = this.#findSocketHandler(path, query) !== null;
                // Only track accepted upgrades: when `shouldHandle` returns
                // false, ws aborts the handshake and `connection` never fires,
                // so pushing first would leave a stale entry that corrupts the
                // next upgrade's FIFO dispatch.
                if (accepts) {
                    this.#pendingUpgrades.push({ path, sources });
                }
                return accepts;
            };
            websocket.on('connection', (ws: unknown) => {
                const pending = this.#pendingUpgrades.shift();
                void this.#dispatchSocket(
                    ws,
                    pending?.path ?? '',
                    pending?.sources ?? { query: {}, headers: {}, cookies: {} }
                );
            });
            this.#websocket = websocket;
        });
    }

    /**
     * Resolve a controller instance (and its socket method) for a request
     * path, through the dispatcher's handler mapping.
     *
     * The upgrade request's query parameters are parsed into the route's
     * `data` so the mapping's `queryParams`/`matrixParams` conditions apply
     * to WebSocket upgrades exactly as they do to HTTP requests — e.g.
     * `@socketMapping({ value: '/room', queryParams: 'token=abc' })` gates
     * the upgrade by query string.
     *
     * @param path - The request path (e.g. `/chat/room`).
     * @param query - Parsed query parameters from the upgrade URL.
     * @returns `{ instance, method }` for the socket-mapped method, or `null`.
     */
    #findSocketHandler(
        path: string,
        query: Record<string, string | string[]> = {}
    ): { instance: object; method: string; parameters: MethodParameter[]; pathParams: Record<string, string> } | null {
        const route: Route = {
            path,
            raw: path,
            data: query,
            params: null,
            id: guid(),
            attributes: {},
            length: 0,
        };
        const chain = this.#dispatcher.getHandler(route);
        const handler = chain?.handler;
        if (!handler) return null;
        // The chain's handler is a RouteHandlerMethod wrapping the controller
        // instance + the selected method name + its @parameters metadata.
        const candidate = handler as {
            handler: object;
            method: string;
            parameters: MethodParameter[];
        };
        const controller = candidate.handler;
        const methodName = candidate.method;
        if (
            controller &&
            typeof methodName === 'string' &&
            isSocketMapping(Object.getPrototypeOf(controller), methodName)
        ) {
            return {
                instance: controller,
                method: methodName,
                parameters: candidate.parameters ?? [],
                // The mapping mutates the matched route with the path segments.
                pathParams: (route.params as Record<string, string> | null) ?? {},
            };
        }
        return null;
    }

    /**
     * Resolve a socket method's `@parameters` against the upgrade request
     * sources, through the same argument resolvers the HTTP path uses.
     *
     * Each declared parameter is resolved by its supporting resolver
     * (`queryValue` → query string, `pathVariable` → path segment, `headerValue`
     * / `cookieValue` → handshake sources) and the value is coerced/validated
     * (including Zod hooks). A missing required parameter closes the socket
     * with `1008` (policy violation) instead of invoking the handler.
     *
     * @param parameters - The socket method's `@parameters`.
     * @param pathParams - Path-segment values captured from the mapping match.
     * @param sources - The upgrade request sources.
     * @returns The resolved param values keyed by extractor name.
     */
    #socketRoute(parameter: MethodParameter, pathParams: Record<string, string>, sources: SocketRequestSources): Route {
        return {
            path: '',
            raw: '',
            data: sources.query,
            params: pathParams,
            id: guid(),
            attributes: {
                [NODE_REQUEST_ATTRIBUTE]: {
                    headers: sources.headers,
                    body: {},
                    cookies: sources.cookies,
                    session: {},
                },
            },
            length: 0,
        };
    }

    #findResolver(parameter: MethodParameter): HandlerMethodArgumentResolver | undefined {
        const context = this.#dispatcher.applicationContext;
        if (!context) return undefined;
        const resolvers =
            (context.hasValue?.('argumentResolvers')
                ? context.getValue<HandlerMethodArgumentResolver[]>('argumentResolvers')
                : undefined) ?? [];
        return resolvers.find((candidate) => candidate.supportsParameter(parameter));
    }

    /**
     * Dispatch an upgraded WebSocket to its socket-mapped handler.
     *
     * Builds a `SocketSession` from the `ws` connection, invokes the handler
     * (an async-iterable producer-consumer), and drains inbound + yields
     * outbound until the connection closes.
     *
     * @param rawWs - The upgraded `ws` connection.
     */
    async #dispatchSocket(rawWs: unknown, path: string, sources: SocketRequestSources): Promise<void> {
        // The `ws` server hands us a `WebSocket` (RFC 6455 connection) which
        // we only partially surface through SocketSession; the structural
        // surface is all we touch, so a boundary cast to the library type is
        // deliberate (the upgrade path is the only wire into this hook).
        const ws = rawWs as WebSocket;
        const target = this.#findSocketHandler(path, sources.query);
        if (!target) {
            ws.close(1011, 'no socket handler');
            return;
        }
        // Bind @parameters positionally (validated, coerced — including Zod):
        // a socketSession() extractor yields the session; the other extractors
        // resolve against the upgrade sources. The handler is invoked with the
        // declared args in signature order — no implicit session injection.
        const args: unknown[] = [];
        let session: SocketSession | null = null;
        if (target.parameters.length > 0) {
            try {
                for (const param of target.parameters) {
                    if (param.type === MethodParameterType.SOCKET_SESSION) {
                        session = nodeSocketSession(ws, path, sources);
                        args.push(session);
                    } else {
                        const resolver = this.#findResolver(param);
                        if (resolver)
                            args.push(
                                resolver.resolveArgument(
                                    param,
                                    this.#socketRoute(param, target.pathParams, sources),
                                    null
                                )
                            );
                        else args.push(undefined);
                    }
                }
            } catch {
                ws.close(1008, 'missing required parameter');
                return;
            }
        }
        if (!session) session = nodeSocketSession(ws, path, sources);
        const handlerMethod = (target.instance as Record<string, unknown>)[target.method] as unknown;
        if (typeof handlerMethod !== 'function') {
            ws.close(1011, 'socket handler is not a function');
            return;
        }
        try {
            const result: unknown = handlerMethod.call(target.instance, ...args);
            // The handler is an async generator: pump inbound → handler →
            // yield outbound until the stream (connection) ends.
            if (
                result &&
                typeof (result as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === 'function'
            ) {
                await this.#pumpFunction(result as AsyncGenerator<unknown>, session);
            }
        } catch (error) {
            console.log(`[socket] handler failed: ${(error as Error).message}`);
            session.close(1011, 'handler error');
        }
    }

    /**
     * Drain a socket handler's async generator: each yielded value is sent;
     * the loop ends when the connection closes (the inbound reader completes).
     *
     * @param gen - The handler's async-iterable result.
     * @param session - The session to send/poll.
     */
    async #pumpFunction(
        gen: AsyncGenerator<unknown>,
        session: { messages: AsyncIterable<unknown>; send(data: unknown): void }
    ): Promise<void> {
        const iterator = gen[Symbol.asyncIterator]();
        try {
            for await (const value of iterator) {
                const outbound = value === undefined ? null : value;
                session.send(outbound);
            }
        } catch (error) {
            console.error('[NodeHTTPServerAdapter] socket generator error:', (error as Error).message);
        }
    }

    /**
     * Stops the server gracefully: stop accepting new connections, then wait
     * up to `shutdownTimeoutMs` for in-flight requests to drain before
     * destroying remaining sockets.
     */
    async close(): Promise<void> {
        const server = this.#server;
        if (!server) return;
        this.#server = null;
        // Stop accepting upgrades and close connected sockets.
        const wss = this.#websocket;
        this.#websocket = null;
        if (wss) {
            const clients = wss.clients as unknown as Set<{ close(code: number, reason: string): void }> | undefined;
            clients?.forEach((client) => client.close(1001, 'server shutting down'));
        }
        await new Promise<void>((resolve) => {
            server.close(() => resolve());
        });
        // `closeAllConnections` requires Node 18.2+; guard for older runtimes.
        if (this.#limits.shutdownTimeoutMs > 0 && typeof server.closeAllConnections === 'function') {
            const timer = setTimeout(() => server.closeAllConnections(), this.#limits.shutdownTimeoutMs);
            timer.unref?.();
        }
    }

    async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        try {
            const urlObj = this.#buildUrl(req);
            this.#assertHeaderLimits(req);
            const body = await this.#readBody(req);
            const bodyRecord = this.#parseBodyRecord(req, body);

            const nodeRequest: NodeRequest = {
                headers: req.headers as Record<string, string | string[] | undefined>,
                body: bodyRecord,
                cookies: parseCookies(typeof req.headers['cookie'] === 'string' ? req.headers['cookie'] : undefined),
                session: {},
            };
            const data: Record<string, string | string[]> = {};

            const { segments, cleanedPath } = this.#parseMatrixParams(urlObj.pathname);
            urlObj.searchParams.forEach((value, key) => {
                // Preserve repeated query parameters using the multi-value
                // contract (`data[key]` becomes an array on repeats).
                if (key in data) {
                    const existing = data[key];
                    data[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
                } else {
                    data[key] = value;
                }
            });

            const route: Route = {
                length: segments.length,
                id: guid(),
                path: cleanedPath,
                raw: req.url ?? '/',
                data,
                params: null,
                method: req.method as Route['method'],
                attributes: {
                    [NODE_REQUEST_ATTRIBUTE]: nodeRequest,
                    [NODE_RESPONSE_ATTRIBUTE]: res,
                },
            };

            for (let index = 0; index < segments.length; index++) {
                route[index] = segments[index];
            }

            const chain = this.#dispatcher.getHandler(route);
            const noHandler = !chain?.handler || Object.keys(chain.handler).length === 0;

            if (!noHandler && this.#findSocketHandler(route.path) !== null) {
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
                        { Allow: allowed }
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
            await this.#dispatcher.dispatch(route);
            // An interceptor denial (auth guard, CSRF, CORS preflight, …)
            // leaves no rendered view — finalize a deterministic response so
            // the request never stays open.
            const denial = getInterceptorDenial(route);
            if (denial) {
                this.#finalizeDenial(res, denial);
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
        } catch (error: unknown) {
            this.#writeErrorResponse(res, error);
        }
    }

    /**
     * Finalizes an interceptor denial. A `401` denial carries
     * `WWW-Authenticate: Bearer` (RFC 9110 §15.5.2); `401`/`403` are problem
     * documents with registered types; other `4xx/5xx` denials are an
     * about:blank problem at the given status; a status `<= 399` (CORS
     * preflight `204`, browser redirects) writes headers with no body.
     */
    #finalizeDenial(res: ServerResponse, denial: InterceptorDenial): void {
        if (res.writableEnded || res.destroyed) return;
        const statusCode = denial.statusCode ?? 403;
        if (denial.redirect) {
            res.writeHead(statusCode <= 399 ? 302 : statusCode, { Location: denial.redirect });
            res.end();
            return;
        }
        if (statusCode <= 399) {
            // CORS preflight (204): headers were set by the interceptor; no body.
            res.writeHead(statusCode, {});
            res.end();
            return;
        }
        if (statusCode === 401) {
            writeProblem(
                res,
                {
                    type: ProblemTypes.unauthorized,
                    title: 'Unauthorized',
                    status: 401,
                },
                { 'WWW-Authenticate': 'Bearer' }
            );
            return;
        }
        if (statusCode === 403) {
            writeProblem(res, {
                type: ProblemTypes.forbidden,
                title: 'Forbidden',
                status: 403,
            });
            return;
        }
        const statusText = ResponseStatus.for(statusCode)?.text;
        writeProblem(res, {
            status: statusCode,
            title: statusText,
        });
    }

    /**
     * Central safe error response: maps transport errors to deterministic
     * problem documents; everything else is a generic 500 with internal
     * details logged, never leaked to the client.
     */
    #writeErrorResponse(res: ServerResponse, error: unknown): void {
        if (res.writableEnded || res.destroyed) return;
        if (error instanceof RequestLimitError) {
            writeProblem(res, {
                type: `urn:blue:${error.code}`,
                status: error.statusCode,
                detail: error.code,
            });
            return;
        }
        if (error instanceof SyntaxError) {
            writeProblem(res, {
                type: ProblemTypes.malformedBody,
                title: 'Bad Request',
                status: 400,
                detail: 'malformed_body',
            });
            return;
        }
        if (error instanceof URIError) {
            writeProblem(res, {
                type: ProblemTypes.malformedUrl,
                title: 'Bad Request',
                status: 400,
                detail: 'malformed_url',
            });
            return;
        }
        const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
        console.error('[NodeHTTPServerAdapter] dispatch failure:', message);
        writeProblem(res, {
            type: ProblemTypes.internalError,
            title: 'Internal Server Error',
            status: 500,
        });
    }

    /**
     * Builds the request URL, rejecting malformed `Host` headers with `400`.
     */
    #buildUrl(req: IncomingMessage): URL {
        const host = req.headers['host'];
        const url = req.url ?? '/';
        try {
            return new URL(url, `http://${host ?? 'localhost'}`);
        } catch {
            throw new RequestLimitError(400, 'malformed_url', `Malformed request URL: ${url}`);
        }
    }

    #assertHeaderLimits(req: IncomingMessage): void {
        const rawHeaders = req.rawHeaders;
        let cookieBytes = 0;
        for (let index = 0; index < rawHeaders.length; index += 2) {
            if (rawHeaders[index].toLowerCase() === 'cookie') {
                cookieBytes += Buffer.byteLength(rawHeaders[index + 1] ?? '', 'utf-8');
            }
        }
        if (cookieBytes > this.#limits.maxHeaderBytes) {
            throw new RequestLimitError(431, 'headers_too_large', 'Cookie header exceeds the configured limit');
        }
    }

    /**
     * Streams the body with a hard byte cap. `413` on overflow (memory stays
     * bounded because the stream is destroyed), `408` when the client stalls.
     */
    async #readBody(req: IncomingMessage): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            let received = 0;
            let settled = false;

            const settleError = (error: unknown): void => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                reject(error);
            };

            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                req.destroy();
                reject(new RequestLimitError(408, 'request_timeout', 'Request body timed out'));
            }, this.#limits.requestTimeoutMs);
            timer.unref?.();

            const onAbort = (): void =>
                settleError(new RequestLimitError(400, 'request_aborted', 'Request aborted before completion'));
            req.once('aborted', onAbort);

            void (async () => {
                try {
                    for await (const chunk of req) {
                        received += (chunk as Buffer).byteLength;
                        chunks.push(chunk as Buffer);
                    }
                    if (received > this.#limits.maxBodyBytes) {
                        // Body fully received — respond 413 without destroying
                        // the socket so the client can read the response.
                        settled = true;
                        clearTimeout(timer);
                        reject(
                            new RequestLimitError(413, 'body_too_large', 'Request body exceeds the configured limit')
                        );
                        return;
                    }
                    if (!settled) {
                        settled = true;
                        clearTimeout(timer);
                        resolve(Buffer.concat(chunks));
                    }
                } catch (error) {
                    settleError(error);
                }
            })();

            req.once('close', () => {
                if (!settled && req.errored) onAbort();
            });
        });
    }

    /**
     * Applies content-type-aware parsing. JSON is strict; other types fall
     * back to raw text under the `'*'` key (no silent reshaping).
     */
    #parseBodyRecord(req: IncomingMessage, raw: Buffer): Record<string, unknown> {
        const result = parseBody(req.headers['content-type'], raw);
        if (result.kind === 'empty') return {};
        if (result.kind === 'json') return result.value;
        return { '*': result.raw };
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

        for (let index = 0; index < pathParts.length; index++) {
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
