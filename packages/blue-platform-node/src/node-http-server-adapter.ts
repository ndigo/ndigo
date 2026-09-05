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
import { Route, RouteSegment } from '@blue/router';
import { getInterceptorDenial, type InterceptorDenial } from '@blue/dispatcher';
import { NodeRequest, NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE } from './node-request';
import type { NodeDispatcher } from './node-dispatcher';
import type { HTTPServerAdapter } from './http-server';
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
    readonly #dispatcher: NodeDispatcher;
    readonly #limits: ResolvedHTTPRequestLimits;
    #server: ReturnType<typeof createServer> | null;

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
        });
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
                id: Date.now(),
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

            // The mapping strategy's fallback chain carries interceptors even
            // for unmatched routes, so interceptor-only concerns (CORS
            // preflight short-circuiting) can finalize the request. Dispatch
            // always; denial finalizes immediately, unmatched requests fall
            // through to 404 below.
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
                this.#writeJson(res, 404, { error: 'Not Found' });
            }
        } catch (error: unknown) {
            this.#writeErrorResponse(res, error);
        }
    }

    #writeJson(res: ServerResponse, statusCode: number, payload: Record<string, unknown>): void {
        if (res.writableEnded || res.destroyed) return;
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(payload));
    }

    /**
     * Finalizes an interceptor denial: explicit status/body, or the default
     * `403` for bare `false` denials. Browser redirects use the `redirect`
     * target with a Location header.
     */
    #finalizeDenial(res: ServerResponse, denial: InterceptorDenial): void {
        if (res.writableEnded || res.destroyed) return;
        const statusCode = denial.statusCode ?? 403;
        if (denial.redirect) {
            res.writeHead(statusCode <= 399 ? 302 : statusCode, { Location: denial.redirect });
            res.end();
            return;
        }
        this.#writeJson(res, statusCode, denial.body ?? { error: statusCode === 401 ? 'Unauthorized' : 'Forbidden' });
    }
    /**
     * Central safe error response: maps transport errors to deterministic
     * statuses; everything else is a generic 500 with internal details
     * logged, never leaked to the client.
     */
    #writeErrorResponse(res: ServerResponse, error: unknown): void {
        if (res.writableEnded || res.destroyed) return;
        if (error instanceof RequestLimitError) {
            this.#writeJson(res, error.statusCode, { error: error.code });
            return;
        }
        if (error instanceof SyntaxError) {
            this.#writeJson(res, 400, { error: 'malformed_body' });
            return;
        }
        if (error instanceof URIError) {
            this.#writeJson(res, 400, { error: 'malformed_url' });
            return;
        }
        const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
        console.error('[NodeHTTPServerAdapter] dispatch failure:', message);
        this.#writeJson(res, 500, { error: 'Internal Server Error' });
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
