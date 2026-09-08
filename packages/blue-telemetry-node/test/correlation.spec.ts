// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { context as otelContext, trace } from '@opentelemetry/api';
import { HTTPServerInstrumentation } from '../src/instrumentation/http-server/http-server';
import { DispatcherInstrumentation } from '../src/instrumentation/dispatcher/dispatcher';
import { getMapping, ModelAndView, requestMapping } from '@blue/dispatcher';
import { MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, NodeDispatcher, HTTPServer } from '@blue/platform-node';

/**
 * Trace correlation over a real HTTP request: the inbound request span
 * (HTTPServer.handleRequest) is the parent of the dispatch span, so
 * interceptors, handler, and view-target work share one trace — the
 * feature-assessment "no tracing correlation through the interceptor chain"
 * gap, closed for the Node server path.
 */

@requestMapping('/')
class APIController {
    @getMapping('/')
    index() {
        return { ok: true };
    }

    @getMapping('/view')
    view() {
        return new ModelAndView('test');
    }
}

describe('telemetry request→dispatch correlation (real HTTP)', () => {
    let exporter: InMemorySpanExporter;
    let base: string;
    let server: HTTPServer;

    beforeAll(async () => {
        exporter = new InMemorySpanExporter();
        const contextManager = new AsyncHooksContextManager();
        contextManager.enable();
        otelContext.setGlobalContextManager(contextManager);

        const provider = new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(exporter)] });
        trace.setGlobalTracerProvider(provider);

        const serverInstr = new HTTPServerInstrumentation();
        serverInstr.setTracerProvider(provider);
        serverInstr.enable();

        const dispatcherInstr = new DispatcherInstrumentation();
        dispatcherInstr.setTracerProvider(provider);
        // Regression: wrapping the BrowserDispatcher mixin prototype used to
        // throw (shimmer's obj.propertyIsEnumerable absent). Must enable cleanly.
        dispatcherInstr.enable();

        // Boot a real HTTP server through the node pipeline (the request span
        // fires on NodeHTTPServerAdapter.handleRequest, which MockHTTP bypasses).
        const context = new MetadataConfigApplicationContext('corr');
        context.register(NodeAutoConfiguration);
        context.setValue(APIController.name, new APIController());
        context.refresh(); // auto-initializes the handler mapping + dispatcher

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');

        server = new HTTPServer(dispatcher, { port: 0, host: '127.0.0.1' });
        await server.start();
        const httpServer = server.server as { address(): { port: number } };
        base = `http://127.0.0.1:${httpServer.address().port}`;
    });

    afterAll(async () => {
        await server?.close();
    });

    test('a real request produces request+dispatch spans with HTTP/OTel attrs', async () => {
        const res = await fetch(`${base}/`);
        expect(res.status).toBe(200);

        const spans = exporter.getFinishedSpans();
        const requestSpans = spans.filter((s) => s.name === 'HTTPServer.handleRequest');
        const dispatchSpans = spans.filter((s) => s.name === 'Dispatcher.dispatch');

        // Request-root span (regression: previously the dispatch instrumentation
        // could not even wrap the mixin prototype; both must now emit).
        expect(requestSpans.length).toBeGreaterThan(0);
        const requestSpan = requestSpans[requestSpans.length - 1]!;
        expect(requestSpan.attributes['http.request.method']).toBe('GET');
        expect(requestSpan.attributes['http.route']).toBe('/');

        // Dispatch span emitted with route/method attrs and nested under the
        // request span (trace correlation).
        expect(dispatchSpans.length).toBeGreaterThan(0);
        const dispatchSpan = dispatchSpans[dispatchSpans.length - 1]!;
        expect(dispatchSpan.spanContext().traceId).toBe(requestSpan.spanContext().traceId);
        expect(dispatchSpan.parentSpanContext?.spanId).toBe(requestSpan.spanContext().spanId);
        expect(dispatchSpan.attributes['http.route']).toBe('/');
        expect(dispatchSpan.attributes['http.method']).toBe('GET');
    });

    test('view-name resolution records the winning resolver', async () => {
        const res = await fetch(`${base}/view`);
        expect(res.status).toBe(200);
        await new Promise((r) => setTimeout(r, 50));

        const resolveSpans = exporter.getFinishedSpans().filter((s) => s.name === 'Dispatcher.resolveViewName');
        expect(resolveSpans.length).toBeGreaterThan(0);
        const span = resolveSpans[resolveSpans.length - 1]!;
        expect(span.attributes['view.name']).toBe('test');
        expect(span.attributes['view.resolved']).toBe(true);
        // The node default resolver (IslandViewResolver) served an IslandView.
        expect(span.attributes['view.resolved_by']).toBe('IslandView');
    });
});
