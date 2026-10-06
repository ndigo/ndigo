/**
 * OpenTelemetry instrumentation for `HTTPServer` lifecycle + inbound requests.
 * @module blue-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { context as otelContext, propagation, ROOT_CONTEXT, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { HTTPServer, NodeHTTPServerAdapter } from '@blue/platform-node';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

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
                kind: SpanKind.SERVER,
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
                const tracer = trace.getTracer('@blue/telemetry');
                // Continue the caller's trace: extracted traceparent
                // becomes the parent of the SERVER span.
                const parent = propagation.extract(ROOT_CONTEXT, req.headers ?? {});
                return otelContext.with(parent, () =>
                    tracer.startActiveSpan(
                        'HTTPServer.handleRequest',
                        {
                            kind: SpanKind.SERVER,
                            attributes: {
                                'http.request.method': req.method ?? 'GET',
                                'http.route': req.url ? String(new URL(req.url, 'http://local').pathname) : undefined,
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
                                })
                                .catch((error: unknown) => {
                                    span.recordException(error as Error);
                                    span.setStatus(resultStatus({ ok: false }));
                                    span.end();
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
