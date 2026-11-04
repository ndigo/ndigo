/**
 * @module ndigo-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { context as otelContext, propagation, trace, type Context } from '@opentelemetry/api';
import { HTTP, RequestAwareHTTPInterceptor } from '../http';

/**
 * Options for the {@link TraceHeaderInterceptor}.
 */
export interface TraceHeaderInterceptorOptions {
    /**
     * Explicit context provider for the trace header.
     *
     * Browsers have no async-local storage — the ambient active context is
     * lost across `await` boundaries. Provide a closure over the span you
     * started for the request so `traceparent` is still injected (the
     * browser→server journey pattern). Defaults to the ambient active
     * context (works under Node's async-local context).
     */
    getContext?: () => Context;
}

/**
 * HTTP interceptor that injects W3C `traceparent`/`tracestate` headers from
 * the active trace context — the client half of distributed tracing.
 *
 * With a server-side `HTTPServerInstrumentation` on the receiving end, the
 * inbound server span continues the same trace: `traceId` matches and the
 * server span's parent is the client's span.
 *
 * @example
 * ```ts
 * const span = trace.getTracer('app').startSpan('client.fetch');
 * const http = HTTP.create({
 *     interceptors: [new TraceHeaderInterceptor({ getContext: () => trace.setSpan(otelContext.ROOT, span) })],
 * });
 * await http.get('/data.json');
 * span.end();
 * ```
 */
export class TraceHeaderInterceptor implements RequestAwareHTTPInterceptor {
    readonly #getContext: () => Context;

    /**
     * Creates the interceptor.
     *
     * @param options - Optional explicit context provider.
     */
    constructor(options: TraceHeaderInterceptorOptions = {}) {
        this.#getContext = options.getContext ?? (() => otelContext.active());
    }

    /**
     * Injects the trace headers into the outgoing request when a span is
     * active; leaves the request untouched otherwise.
     *
     * @param request - The outgoing request.
     * @param _http - The HTTP client executing the request.
     */
    async preRequest(request: Request, _http: HTTP): Promise<void> {
        const ctx = this.#getContext();
        if (trace.getSpan(ctx) === undefined) {
            return;
        }
        // OTel's default setter writes expando properties, which WHATWG
        // Headers instances hide — inject into a plain carrier, then apply.
        const carrier: Record<string, string> = {};
        propagation.inject(ctx, carrier);
        for (const [key, value] of Object.entries(carrier)) {
            request.headers.set(key, value);
        }
    }
}
