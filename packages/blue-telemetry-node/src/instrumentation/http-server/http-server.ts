/**
 * OpenTelemetry instrumentation for `HTTPServer` lifecycle + inbound requests.
 *
 * Creates:
 * - spans for `listen` and `close` (server lifecycle boundaries)
 * - a per-request SERVER span wrapping `NodeHTTPServerAdapter.handleRequest`,
 *   which becomes the trace root for each inbound HTTP request — the
 *   `Dispatcher.dispatch` span and the `HTTPResponseViewTarget.commit` span
 *   nest under it, correlating the full request in one trace.
 *
 * @module
 * @since 1.0.0
 */

import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { HTTPServer, NodeHTTPServerAdapter } from '@blue/platform-node';
import type { IncomingMessage } from 'node:http';
import { BaseBlueInstrumentation } from '../base';

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
export class HTTPServerInstrumentation extends BaseBlueInstrumentation {
    constructor() {
        super('http-server');
    }

    enable(): void {
        this._wrap(
            HTTPServer.prototype,
            'start',
            this._patchAsync({
                name: 'HTTPServer.start',
                kind: SpanKind.SERVER,
                attributes: (instance: HTTPServer) => ({
                    'server.port': instance.port,
                }),
            })
        );

        this._wrap(
            HTTPServer.prototype,
            'close',
            this._patchAsync({
                name: 'HTTPServer.close',
                kind: SpanKind.INTERNAL,
                attributes: (instance: HTTPServer) => ({
                    'server.port': instance.port,
                }),
            })
        );

        // Per-request root span: every inbound HTTP request gets a SERVER span
        // that the dispatch + view-target spans nest under.
        this._wrap(
            NodeHTTPServerAdapter.prototype,
            'handleRequest',
            this._patchAsync({
                name: 'HTTPServer.handleRequest',
                kind: SpanKind.SERVER,
                attributes: (_instance: NodeHTTPServerAdapter, args: unknown[]) => {
                    const req = args[0] as IncomingMessage | undefined;
                    return {
                        'http.request.method': req?.method ?? 'GET',
                        'http.route': req?.url ? String(new URL(req.url, 'http://local').pathname) : undefined,
                    };
                },
                onEnd(span, outcome) {
                    // The response status is recorded by the view-target
                    // instrumentation per commit; mark the request span's
                    // outcome only (OK when handling completed).
                    span.setStatus(resultStatus(outcome));
                },
            })
        );
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
