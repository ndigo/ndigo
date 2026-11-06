/**
 * OpenTelemetry instrumentation for `HTTPServer` lifecycle + inbound requests.
 */
import { context as otelContext, propagation, ROOT_CONTEXT, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { HTTPServer, NodeHTTPServerAdapter } from '@ndigo/platform-node';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { performance } from 'node:perf_hooks';
import { AbstractBaseInstrumentation, createLazyHistogram } from '@ndigo/telemetry';

/**
 * The semconv HTTP server request-duration metric (AD-77 D-6): a histogram
 * in seconds with the semconv explicit bucket boundaries, aggregated by the
 * SDK's default explicit-bucket histogram aggregation.
 */
const REQUEST_DURATION = 'http.server.request.duration';
const REQUEST_DURATION_UNIT = 's';
const REQUEST_DURATION_DESCRIPTION = 'The duration of the server request.';
// OTel semconv (HTTP server metrics): explicit bucket boundaries in seconds.
const REQUEST_DURATION_BOUNDARIES = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10];

/**
 * Lazily resolved request-duration histogram: instruments resolve on the
 * first completed request (post-SDK-init), so a standalone instrumentation
 * used before `configureTelemetry` never captures the NoopMeter.
 */
const recordRequestDuration = createLazyHistogram({
    unit: REQUEST_DURATION_UNIT,
    description: REQUEST_DURATION_DESCRIPTION,
    boundaries: REQUEST_DURATION_BOUNDARIES,
});

/**
 * Instrumentation for `HTTPServer.listen`/`close` and per-request handling.
 *
 * @example
 * ```ts
 * configureTelemetry({
 *   instrumentations: [new HTTPServerInstrumentation()],
 * });
 * ```
 */
export class HTTPServerInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('http-server');
    }

    enable(): void {
        this._wrap(
            HTTPServer.prototype,
            'start',
            this._patch({
                name: 'HTTPServer.start',
                kind: SpanKind.INTERNAL,
                attributes: (instance: unknown) => {
                    // The patched `start`/`close` target is always the server.
                    const server = instance as HTTPServer;
                    return { 'server.port': server.port };
                },
            })
        );

        this._wrap(
            HTTPServer.prototype,
            'close',
            this._patch({
                name: 'HTTPServer.close',
                kind: SpanKind.INTERNAL,
                attributes: (instance: unknown) => {
                    // The patched `start`/`close` target is always the server.
                    const server = instance as HTTPServer;
                    return { 'server.port': server.port };
                },
            })
        );

        // Per-request root span: every inbound HTTP request gets a SERVER span
        // that the dispatch + view-target spans nest under. When the client
        // propagated a W3C traceparent (the browser→server journey pattern),
        // the span continues the caller's trace: the extracted context
        // becomes the parent of this SERVER span.
        this._wrap(NodeHTTPServerAdapter.prototype, 'handleRequest', (original) => {
            // Must stay a function (not an arrow): the adapter invocation
            // binds `this`, and `original` relies on it (private dispatcher).
            return function (this: unknown, req: IncomingMessage, res: ServerResponse<IncomingMessage>): Promise<void> {
                const tracer = trace.getTracer('@ndigo/telemetry');
                // Continue the caller's trace: extracted traceparent
                // becomes the parent of the SERVER span.
                const parent = propagation.extract(ROOT_CONTEXT, req.headers ?? {});
                const startedAt = performance.now();
                return otelContext.with(parent, () =>
                    tracer.startActiveSpan(
                        'HTTPServer.handleRequest',
                        {
                            kind: SpanKind.SERVER,
                            attributes: {
                                'http.request.method': req.method ?? 'GET',
                                // Concrete request path (semconv `url.path`).
                                // No route template is known at this layer, so
                                // `http.route` is deliberately omitted instead
                                // of being faked from the raw request target.
                                'url.path': requestPath(req.url),
                            },
                        },
                        (span) =>
                            original
                                .apply(this, [req, res])
                                .then(() => {
                                    // OP-5: the adapter converts dispatch errors
                                    // into problem responses (5xx) before
                                    // resolving, so `res.statusCode` — not the
                                    // settle state — carries the outcome. 4xx
                                    // stays OK (client error, OTel HTTP semconv).
                                    span.setAttribute('http.response.status_code', res.statusCode);
                                    span.setStatus(resultStatus({ ok: res.statusCode < 500 }));
                                    span.end();
                                    // AD-77 D-6: the semconv duration histogram
                                    // (seconds), aggregated server-side by
                                    // method + status code (low cardinality —
                                    // the raw path is deliberately not an
                                    // attribute; the span already carries it).
                                    recordRequestDuration(
                                        REQUEST_DURATION,
                                        {
                                            'http.request.method': req.method ?? 'GET',
                                            'http.response.status_code': res.statusCode,
                                        },
                                        (performance.now() - startedAt) / 1000
                                    );
                                })
                                .catch((error: unknown) => {
                                    span.recordException(error as Error);
                                    span.setStatus(resultStatus({ ok: false }));
                                    span.end();
                                    // The adapter writes a 5xx problem response
                                    // for dispatch errors, so the catch path is
                                    // the exceptional fall-through: record the
                                    // duration with the code the adapter would
                                    // have written.
                                    recordRequestDuration(
                                        REQUEST_DURATION,
                                        {
                                            'http.request.method': req.method ?? 'GET',
                                            'http.response.status_code': 500,
                                        },
                                        (performance.now() - startedAt) / 1000
                                    );
                                    throw error;
                                })
                    )
                );
            };
        });
    }

    disable(): void {
        this._unwrap(HTTPServer.prototype, 'start');
        this._unwrap(HTTPServer.prototype, 'close');
        this._unwrap(NodeHTTPServerAdapter.prototype, 'handleRequest');
    }
}

function resultStatus(outcome: { ok: boolean }): { code: SpanStatusCode } {
    return outcome.ok ? { code: SpanStatusCode.OK } : { code: SpanStatusCode.ERROR };
}

/**
 * Extracts the concrete request path (semconv `url.path`) without ever
 * throwing.
 *
 * This runs synchronously in the shimmer wrapper — before `original.apply`
 * and outside any try/catch — so it must not throw: `new URL('http://[')` raises
 * `Invalid URL`, and Node delivers exactly that
 * request target for a raw `GET http://[ HTTP/1.1` (remote process kill).
 * Falls back to the raw target before the query string.
 *
 * @param target - The request target (`req.url`).
 * @returns The path, or `undefined` when the target is absent.
 */
function requestPath(target: string | undefined): string | undefined {
    if (target === undefined || target === '') {
        return undefined;
    }
    try {
        return new URL(target, 'http://local').pathname;
    } catch {
        const queryIndex = target.indexOf('?');
        return queryIndex === -1 ? target : target.slice(0, queryIndex);
    }
}
