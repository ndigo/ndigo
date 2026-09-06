/**
 * OpenTelemetry instrumentation for `ServerSentEventView` streaming renders.
 *
 * Streaming responses bypass `HTTPResponseViewTarget.commit` (the view writes
 * frames directly to the `ServerResponse`), so without this instrumentation a
 * long-lived SSE connection only ever shows its `handleRequest` root span.
 * This adds the stream-lifetime span with the telemetry-relevant totals:
 * frames written, stream duration, and client disconnect.
 *
 * @module
 * @since 1.0.0
 */

import { SpanKind } from '@opentelemetry/api';
import { ServerSentEventView } from '@blue/platform-node';
import { Route } from '@blue/router';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

/** Start timestamps per view instance, so the span-end can report duration. */
const startedAt = new WeakMap<ServerSentEventView, number>();

/**
 * Instrumentation for `ServerSentEventView.render` streaming.
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
            'render',
            this._patchAsync({
                name: 'ServerSentEventView.render',
                kind: SpanKind.SERVER,
                attributes: (instance, args) => {
                    startedAt.set(instance as ServerSentEventView, Date.now());
                    const route = args[1] as Route | undefined;
                    return {
                        'http.response.status_code': '200',
                        'http.route': route?.path,
                    };
                },
                onEnd(span, _outcome, instance) {
                    const view = instance as ServerSentEventView;
                    const began = startedAt.get(view);
                    span.setAttribute('sse.frames', view.frameCount);
                    if (began) {
                        span.setAttribute('sse.duration_ms', Date.now() - began);
                    }
                    if (view.clientDisconnected) {
                        span.setAttribute('sse.client_disconnected', true);
                    }
                },
            })
        );
    }

    disable(): void {
        this._unwrap(ServerSentEventView.prototype, 'render');
    }
}