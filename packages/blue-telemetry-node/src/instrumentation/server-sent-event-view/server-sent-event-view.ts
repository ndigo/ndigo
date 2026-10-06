/**
 * OpenTelemetry instrumentation for `ServerSentEventView` streaming renders.
 * @module blue-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Attributes, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { ServerSentEventView } from '@blue/platform-node';
import { Route } from '@blue/router';
import { type RenderResult } from '@blue/view';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

/**
 * Instrumentation for `ServerSentEventView.renderTo` streaming.
 *
 * @example
 * ```ts
 * configureTelemetry({
 *   instrumentations: [new ServerSentEventViewInstrumentation()],
 * });
 * ```
 */
export class ServerSentEventViewInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('server-sent-event-view');
    }

    enable(): void {
        this._wrap(
            ServerSentEventView.prototype,
            'renderTo',
            <This, Args extends unknown[], Return>(
                original: (this: This, ...args: Args) => Promise<Return>
            ): ((this: This, ...args: Args) => Promise<Return>) => {
                return function (this: This, ...args: Args): Promise<Return> {
                    const view = this as ServerSentEventView;
                    const route = args[1] as Route | undefined;
                    const tracer = trace.getTracer('@blue/telemetry');
                    // Parented implicitly: renderTo runs inside the request
                    // span's context when dispatched from HTTP handling.
                    const span = tracer.startSpan('ServerSentEventView.renderTo', {
                        kind: SpanKind.SERVER,
                        attributes: {
                            'http.response.status_code': '200',
                            'http.route': route?.path,
                        } as Attributes,
                    });
                    const began = Date.now();

                    return Promise.resolve(original.apply(this, args))
                        .then((result) => {
                            const renderResult = result as RenderResult;
                            const body = renderResult.body;
                            const measuredBody = (async function* (this: void): AsyncGenerator<unknown> {
                                try {
                                    for await (const chunk of body) {
                                        yield chunk;
                                    }
                                } finally {
                                    // Runs when the body is drained or closed
                                    // (client abort included) — the stream
                                    // window ends there, not at renderTo.
                                    span.setAttribute('sse.frames', view.frameCount);
                                    span.setAttribute('sse.duration_ms', Date.now() - began);
                                    if (view.clientDisconnected) {
                                        span.setAttribute('sse.client_disconnected', true);
                                    }
                                    span.end();
                                }
                            })();
                            return { ...result, body: measuredBody } as Return;
                        })
                        .catch((error) => {
                            span.recordException(error as Error);
                            span.setStatus({ code: SpanStatusCode.ERROR });
                            span.end();
                            throw error;
                        });
                };
            }
        );
    }

    disable(): void {
        this._unwrap(ServerSentEventView.prototype, 'renderTo');
    }
}
