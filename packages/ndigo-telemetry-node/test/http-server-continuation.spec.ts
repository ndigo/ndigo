/**
 * @module ndigo-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, expect, test, afterEach } from 'vitest';
import { context as otelContext, propagation, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { HTTPServerInstrumentation } from '../src/instrumentation/http-server/http-server';
import { NodeHTTPServerAdapter } from '@ndigo/platform-node';
import type { NodeDispatcher } from '@ndigo/platform-node';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * The server half of the browser→server journey: an inbound request whose
 * `traceparent` header was injected by a client (`TraceHeaderInterceptor`)
 * must continue the SAME trace — the server span's traceId matches and its
 * parent is the client's span.
 */
describe('HTTPServerInstrumentation trace continuation', () => {
    let exporter: InMemorySpanExporter;
    let instrumentation: HTTPServerInstrumentation;

    afterEach(() => {
        instrumentation?.disable();
    });

    const setup = () => {
        // Without an async-local context manager, `context.with` is a no-op
        // and extracted trace context never reaches the span.
        const contextManager = new AsyncLocalStorageContextManager();
        contextManager.enable();
        otelContext.setGlobalContextManager(contextManager);

        exporter = new InMemorySpanExporter();
        trace.setGlobalTracerProvider(
            new BasicTracerProvider({
                spanProcessors: [new SimpleSpanProcessor(exporter)],
            })
        );
        propagation.setGlobalPropagator(new W3CTraceContextPropagator());
        instrumentation = new HTTPServerInstrumentation();
        instrumentation.enable();
    };

    const requestSpan = () => exporter.getFinishedSpans().find((span) => span.name === 'HTTPServer.handleRequest');

    const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        try {
            // Downstream dispatch throws without a configured dispatcher —
            // irrelevant here; the request span still closes and is exported.
            await (
                NodeHTTPServerAdapter.prototype.handleRequest as unknown as (
                    r: IncomingMessage,
                    s: ServerResponse
                ) => Promise<void>
            ).call(new NodeHTTPServerAdapter({} as unknown as NodeDispatcher), req, res);
        } catch {
            // expected — no dispatcher wired
        }
    };

    test('continues the client trace from the traceparent header', async () => {
        setup();

        const traceId = '4bf92f3577b34da6a3ce929d0e0e4736';
        const spanId = '00f067aa0ba902b7';
        const req = {
            headers: { traceparent: `00-${traceId}-${spanId}-01` },
            method: 'GET',
            url: '/catalog',
        } as unknown as IncomingMessage;
        const res = new Proxy({} as ServerResponse, {
            get: () => () => undefined,
        });

        await handle(req, res as ServerResponse);

        const request = requestSpan();
        expect(request).toBeDefined();
        if (!request) {
            return;
        }
        expect(request.spanContext().traceId).toBe(traceId);
        expect(request.parentSpanContext?.spanId).toBe(spanId);
    });
});
