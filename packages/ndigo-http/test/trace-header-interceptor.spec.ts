/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, expect, test, vi } from 'vitest';
import { ROOT_CONTEXT, context as otelContext, propagation, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';
import { HTTP } from '../src/http';
import { TraceHeaderInterceptor } from '../src/interceptors/trace-header-interceptor';

/**
 * The client half of the browser→server journey: traceparent injection from
 * the active (or explicitly provided) trace context. The server half is
 * proven by ndigo-telemetry-node's continuation spec.
 */
describe('TraceHeaderInterceptor', () => {
    const traceparentPattern = /^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/;

    test('injects traceparent from the ambient active span (node pattern)', async () => {
        // Node's OTel contract: ambient context via async-local storage.
        const contextManager = new AsyncLocalStorageContextManager();
        contextManager.enable();
        otelContext.setGlobalContextManager(contextManager);

        trace.setGlobalTracerProvider(new BasicTracerProvider());
        propagation.setGlobalPropagator(new W3CTraceContextPropagator());
        const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);

        const http = HTTP.create({ interceptors: [new TraceHeaderInterceptor()] });
        const span = trace.getTracer('probe').startSpan('root');
        try {
            await otelContext.with(trace.setSpan(ROOT_CONTEXT, span), () => http.get('http://localhost:1/data.json'));
        } finally {
            span.end();
        }

        const request = fetchMock.mock.calls[0]?.[0] as Request;
        const traceparent = request.headers.get('traceparent');
        expect(traceparent).toMatch(traceparentPattern);
        expect(traceparent).toContain(span.spanContext().traceId);

        vi.unstubAllGlobals();
    });

    test('injects traceparent from an explicit context provider (browser pattern)', async () => {
        trace.setGlobalTracerProvider(new BasicTracerProvider());
        propagation.setGlobalPropagator(new W3CTraceContextPropagator());
        const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);

        // Browsers have no async-local storage: the provider closure carries
        // the span across await boundaries (the pattern ndigo-views uses).
        const span = trace.getTracer('probe').startSpan('client-request');
        const http = HTTP.create({
            interceptors: [new TraceHeaderInterceptor({ getContext: () => trace.setSpan(ROOT_CONTEXT, span) })],
        });
        await http.get('http://localhost:1/data.json');
        span.end();

        const request = fetchMock.mock.calls[0]?.[0] as Request;
        expect(request.headers.get('traceparent')).toMatch(traceparentPattern);
        expect(request.headers.get('traceparent')).toContain(span.spanContext().traceId);

        vi.unstubAllGlobals();
    });

    test('leaves the request untouched without an active span', async () => {
        trace.setGlobalTracerProvider(new BasicTracerProvider());
        const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);

        const http = HTTP.create({ interceptors: [new TraceHeaderInterceptor()] });
        await http.get('http://localhost:1/data.json');

        const request = fetchMock.mock.calls[0]?.[0] as Request;
        expect(request.headers.get('traceparent')).toBeNull();

        vi.unstubAllGlobals();
    });
});
