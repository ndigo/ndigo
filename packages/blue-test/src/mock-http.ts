/**
 * MockHTTP — in-process, socket-free integration-test client for Blue applications.
 * * @module blue-test
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HTTPHeaders, contentTypeBase, MULTIPART_FORM_DATA } from '@blue/http';
import { NodeDispatcher } from '@blue/platform-node';
import { getMethodNotAllowed, getInterceptorDenial } from '@blue/dispatcher';
import {
    ProblemTypes,
    writeProblem,
    parseMultipart,
    parseBodyRecord,
    RequestLimitError,
    finalizeInterceptorDenial,
    type MultipartLimits,
    type NodeMultipartContext,
} from '@blue/platform-node';
import { PassThrough } from 'node:stream';
import type { IncomingMessage } from 'node:http';
import { getLogger } from '@blue/log';
import { buildRoute, MockRequest, PreparedRoute } from './request-builder';
import { createMemoryResponse, MemoryResponse } from './memory-response';

const logger = getLogger('blue-test:mock-http');

/**
 * A dispatched mock request with a fluent response.
 */
export interface MockResult {
    /** The captured response. */
    response: MemoryResponse;
    /** The route that was dispatched (useful for assertions). */
    route: PreparedRoute;
    /**
     * Parse the response body as JSON.
     * @returns The parsed object, or `undefined` when the body is empty.
     */
    json(): unknown;
    /**
     * The raw response body as a string.
     * @returns The body, or an empty string when none.
     */
    text(): string;
}

function decodeBody(body: unknown): string {
    if (body === undefined || body === null) {
        return '';
    }
    // Buffer from real node:http end().
    if (typeof Buffer !== 'undefined' && body instanceof Buffer) {
        return body.toString('utf-8');
    }
    return String(body);
}

/**
 * Wrap raw multipart bytes + headers as the stream `parseMultipart` expects.
 * A `PassThrough` is a valid `IncomingMessage`-shaped source for busboy: its
 * `.headers` carry the boundary and `end()` feeds the body busboy pipes.
 */
function asIncoming(body: string | Buffer, headers: Record<string, string | undefined>): IncomingMessage {
    const stream = new PassThrough();
    (stream as unknown as { headers: Record<string, string | string[] | undefined> }).headers = headers;
    stream.end(typeof body === 'string' ? Buffer.from(body, 'utf-8') : body);
    return stream as unknown as IncomingMessage;
}

/**
 * Builds a {@link MockResult} around a memory response.
 *
 * @param prepared - The prepared route and request context.
 * @param response - The captured response.
 * @returns The mock result.
 */
function toResult(prepared: PreparedRoute, response: MemoryResponse): MockResult {
    return {
        response,
        route: prepared,
        json() {
            const raw = decodeBody(response.body).trim();
            return raw ? JSON.parse(raw) : undefined;
        },
        text() {
            return decodeBody(response.body);
        },
    };
}

/**
 * Fluent builder for a single mock HTTP request.
 *
 * ```ts
 * const res = await mockHTTP.get('/todos').query({ filter: 'active' }).exec();
 * expect(res.json()).toEqual([...]);
 * ```
 */
export class MockHTTPRequestBuilder {
    #mockHTTP: MockHTTP;
    #request: MockRequest;

    /**
     * @param mockHTTP - The owning MockHTTP.
     * @param request - The base request spec.
     */
    constructor(mockHTTP: MockHTTP, request: MockRequest) {
        this.#mockHTTP = mockHTTP;
        this.#request = request;
    }

    /**
     * Add query parameters.
     * @param query - Query parameter map.
     * @returns This builder.
     */
    query(query: Record<string, string>): this {
        this.#request.query = { ...this.#request.query, ...query };
        return this;
    }

    /**
     * Set the request body.
     * @param body - JSON object body.
     * @returns This builder.
     */
    body(body: Record<string, unknown>): this {
        this.#request.body = body;
        return this;
    }
    /**
     * Set a raw (unserialized) request body, sent verbatim with the given
     * Content-Type. Used for content types the JSON `.body()` cannot express,
     * most notably `multipart/form-data`: when the Content-Type is multipart the
     * bytes are streamed through the real busboy parser before dispatch.
     * @param body - Raw body string or Buffer.
     * @returns This builder.
     */
    rawBody(body: string | Buffer): this {
        this.#request.rawBody = body;
        return this;
    }

    /**
     * Set request headers.
     * @param headers - Header map (lower-cased keys).
     * @returns This builder.
     */
    headers(headers: Record<string, string>): this {
        this.#request.headers = { ...this.#request.headers, ...headers };
        return this;
    }

    /**
     * Set the client socket address (the rate limiter's key; SEC-6).
     */
    remoteAddress(remoteAddress: string): this {
        this.#request.remoteAddress = remoteAddress;
        return this;
    }

    /**
     * Set cookies.
     * @param cookies - Cookie map.
     * @returns This builder.
     */
    cookies(cookies: Record<string, string>): this {
        this.#request.cookies = { ...this.#request.cookies, ...cookies };
        return this;
    }

    /**
     * Set session data.
     * @param session - Session map.
     * @returns This builder.
     */
    session(session: Record<string, unknown>): this {
        this.#request.session = { ...this.#request.session, ...session };
        return this;
    }

    /**
     * Dispatch the request through the pipeline.
     * @returns The mock result (status, headers, parsed body).
     */
    async exec(): Promise<MockResult> {
        return this.#mockHTTP.request(this.#request);
    }
}

/**
 * A socket-free mock MVC client for testing Blue server-side applications.
 *
 * Wraps a configured {@link NodeDispatcher} and dispatches mock requests
 * through it, capturing the resulting HTTP response in memory.
 *
 * @example
 * ```ts
 * const boot = await bootApp([MyConfiguration]);
 * const mockHTTP = new MockHTTP(boot.dispatcher);
 * const res = await mockHTTP.get('/todos').exec();
 * ```
 */
export class MockHTTP {
    #dispatcher: NodeDispatcher;
    readonly #multipartLimits: Partial<MultipartLimits> | undefined;

    /**
     * @param arg (application dispatcher) - A configured node dispatcher, or an app with one.
     * @param options - Optional harness configuration. `multipartLimits` is
     * passed through to the multipart parser, mirroring
     * `NodeHTTPServerAdapterOptions.multipart`.
     */
    constructor(
        arg: NodeDispatcher | { dispatcher: NodeDispatcher },
        options: { multipartLimits?: Partial<MultipartLimits> } = {}
    ) {
        this.#dispatcher = typeof arg === 'object' && 'dispatcher' in arg ? arg.dispatcher : arg;
        this.#multipartLimits = options.multipartLimits;
    }

    /**
     * The configured dispatcher.
     */
    get dispatcher(): NodeDispatcher {
        return this.#dispatcher;
    }

    /**
     * Dispatch an arbitrary mock request.
     *
     * Replicates `NodeHTTPServerAdapter`'s request→dispatch contract so the
     * in-process behavior matches a real HTTP hit: an unmatched route yields
     * `404` JSON; a dispatcher error yields `500` JSON; an interceptor denial
     * yields the adapter's deterministic denial response (`401`/`403` problem
     * document, redirect `302` with `Location`, or an empty `<= 399` status).
     *
     * @param req - The request spec.
     * @returns The mock result.
     */
    async request(req: MockRequest): Promise<MockResult> {
        const { response, sink } = createMemoryResponse();
        const prepared = buildRoute(req, sink);
        let multipart: NodeMultipartContext | undefined;

        try {
            // Mirror NodeHTTPServerAdapter — stream raw multipart bytes through
            // busboy before dispatch and attach the parsed parts + text fields
            // so the @file() resolver sees real parts (a true byte-level
            // round-trip). Parse/limit errors land in the catch below and map
            // to the same problem responses the live adapter writes.
            if (req.rawBody !== undefined) {
                const contentType = String(HTTPHeaders.CONTENT_TYPE.get(req.headers ?? {}) ?? '').toLowerCase();
                if (contentTypeBase(contentType) === MULTIPART_FORM_DATA) {
                    multipart = await parseMultipart(asIncoming(req.rawBody, req.headers ?? {}), {
                        limits: this.#multipartLimits,
                    });
                    const nodeRequest = prepared.request;
                    nodeRequest.multipart = multipart;
                    nodeRequest.body = { ...nodeRequest.body, ...multipart.fields };
                } else {
                    // RUS-4: a non-multipart rawBody is parsed like a live
                    // body (JSON / urlencoded / raw) instead of being
                    // silently dropped.
                    const bytes = typeof req.rawBody === 'string' ? Buffer.from(req.rawBody, 'utf-8') : req.rawBody;
                    const nodeRequest = prepared.request;
                    nodeRequest.body = { ...nodeRequest.body, ...parseBodyRecord(contentType, bytes) };
                }
            }
            const chain = this.#dispatcher.getHandler(prepared.route);
            // The mapping strategy returns an empty execution chain (`handler: {}`)
            // when nothing matches — detect a real handler by its own keys.
            const noHandler = !chain?.handler || Object.keys(chain.handler).length === 0;
            if (noHandler) {
                // RFC 9110 §15.5.6: a path whose handlers reject the request
                // method is 405 with an Allow header, not 404. Short-circuit
                // before dispatch: dispatching an unmatched route would fall
                // into the error path (a 500) instead of the correct status.
                const allowed = getMethodNotAllowed(prepared.route);
                if (allowed) {
                    writeProblem(
                        sink,
                        {
                            type: ProblemTypes.methodNotAllowed,
                            title: 'Method Not Allowed',
                            status: 405,
                            instance: prepared.route.path,
                        },
                        { Allow: allowed }
                    );
                    return toResult(prepared, response);
                }
                writeProblem(sink, {
                    type: ProblemTypes.notFound,
                    title: 'Not Found',
                    status: 404,
                    instance: prepared.route.path,
                });
                return toResult(prepared, response);
            }
            // Dispatch through the real pipeline; the handler writes to the sink.
            await this.#dispatcher.dispatch(prepared.route);
            // Mirror NodeHTTPServerAdapter.handleRequest: an interceptor denial
            // (auth guard, CSRF, CORS preflight) leaves no rendered view —
            // finalize the same deterministic denial response here too, instead
            // of returning the default empty 200. A response an interceptor
            // already ended (e.g. the CSRF guard's own problem document) is left
            // untouched, matching the adapter's ended-response skip.
            const denial = getInterceptorDenial(prepared.route);
            if (denial && !response.completed) {
                finalizeInterceptorDenial(sink, denial);
            }
        } catch (err: unknown) {
            if (!response.completed) {
                if (err instanceof RequestLimitError) {
                    // SEC-13: mirror NodeHTTPServerAdapter.#writeErrorResponse —
                    // limit/parse rejections are problem documents at their own
                    // status with a `urn:blue:<code>` type, not plain 500 JSON.
                    writeProblem(sink, {
                        type: `urn:blue:${err.code}`,
                        status: err.statusCode,
                        detail: err.code,
                    });
                } else {
                    const message = err instanceof Error ? (err.stack ?? err.message) : String(err);
                    logger.error('dispatch failure:', message);
                    writeProblem(sink, {
                        type: ProblemTypes.internalError,
                        title: 'Internal Server Error',
                        status: 500,
                    });
                }
            }
        } finally {
            // SEC-6: mirror the live adapter — parsed multipart temp parts are
            // disposed once dispatch has finished (success or error).
            if (multipart) {
                await multipart.cleanup();
            }
        }

        return toResult(prepared, response);
    }

    /** GET request builder. @param path - The path, e.g. `/todos`. */
    get(path: string): MockHTTPRequestBuilder {
        return this.#method('GET', path);
    }

    /** POST request builder. */
    post(path: string): MockHTTPRequestBuilder {
        return this.#method('POST', path);
    }

    /** PUT request builder. */
    put(path: string): MockHTTPRequestBuilder {
        return this.#method('PUT', path);
    }

    /** DELETE request builder. */
    delete(path: string): MockHTTPRequestBuilder {
        return this.#method('DELETE', path);
    }

    /** PATCH request builder. */
    patch(path: string): MockHTTPRequestBuilder {
        return this.#method('PATCH', path);
    }

    /** QUERY (RFC 9889) request builder. */
    query(path: string): MockHTTPRequestBuilder {
        return this.#method('QUERY', path);
    }

    #method(method: string, path: string): MockHTTPRequestBuilder {
        return new MockHTTPRequestBuilder(this, { method, path });
    }
}
