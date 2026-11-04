/**
 * Trace-context propagation, end to end through a real socket.
 *
 * The client half of the journey is `@ndigo/http`'s `TraceHeaderInterceptor`,
 * which injects the active span as a W3C `traceparent` header (browsers have no
 * async-local storage, so it reads a span the caller started — see
 * `apps/07-ndigo-views`' client demo). This lane plays that client with a raw
 * `fetch`, and asserts the server half with the **in-memory span exporter**
 * (`@opentelemetry/sdk-trace-base`), the same instrument
 * `packages/ndigo-telemetry-node/test/http-server-continuation.spec.ts` uses:
 *
 * - the SERVER span (`HTTPServer.handleRequest`) carries the client's trace id
 *   and its parent is the client's span id,
 * - the app's own `lab.work.compute` span nests under that SERVER span (same
 *   trace id, parent = the SERVER span),
 * - the response body echoes the continued trace id, because the handler ran
 *   inside the SERVER span's active context.
 *
 * The server listens on port `0` (ephemeral), so the lane can run beside a real
 * dev server without colliding.
 *
 * @module ndigo-telemetry-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type { Server } from 'node:http';
import { context as otelContext, propagation, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import {
    BasicTracerProvider,
    InMemorySpanExporter,
    SimpleSpanProcessor,
    type ReadableSpan,
} from '@opentelemetry/sdk-trace-base';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { HTTPServer } from '@ndigo/platform-node';
import { bootApp, delay } from '@ndigo/test';
import type { NdigoTestApp } from '@ndigo/test';
import { HTTPServerInstrumentation } from '@ndigo/telemetry-node';
import { TelemetryLabConfiguration } from '../src/telemetry-lab-configuration';

/** The `traceparent` a client injected: `00-<trace-id>-<span-id>-01`. */
const CLIENT_TRACE_ID = '4bf92f3577b34da6a3ce929d0e0e4736';
const CLIENT_SPAN_ID = '00f067aa0ba902b7';
const TRACEPARENT = `00-${CLIENT_TRACE_ID}-${CLIENT_SPAN_ID}-01`;

/** The span name the server instrumentation gives the per-request SERVER span. */
const SERVER_SPAN = 'HTTPServer.handleRequest';

/** The span name `@traced` gives the lab's work method. */
const WORK_SPAN = 'lab.work.compute';

/** Waits for the batch-free simple processor to have handed the span over. */
async function finishedSpan(exporter: InMemorySpanExporter, name: string): Promise<ReadableSpan | undefined> {
    for (let attempt = 0; attempt < 50; attempt += 1) {
        const found = exporter.getFinishedSpans().find((span) => span.name === name);
        if (found) {
            return found;
        }
        // The adapter ends the SERVER span asynchronously, just after the
        // response is flushed; poll instead of sleeping a fixed amount.
        // oxlint-disable-next-line no-await-in-loop -- polling is inherently sequential
        await delay(10);
    }
    return exporter.getFinishedSpans().find((span) => span.name === name);
}

describe('browser → server trace continuation', () => {
    let app: NdigoTestApp;
    let server: HTTPServer;
    let instrumentation: HTTPServerInstrumentation;
    let exporter: InMemorySpanExporter;
    let baseUrl: string;

    beforeAll(async () => {
        // Without an async-local context manager the SERVER span's context
        // never reaches the handler, and `context.with` is a no-op.
        const contextManager = new AsyncLocalStorageContextManager();
        contextManager.enable();
        otelContext.setGlobalContextManager(contextManager);

        exporter = new InMemorySpanExporter();
        trace.setGlobalTracerProvider(new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(exporter)] }));
        propagation.setGlobalPropagator(new W3CTraceContextPropagator());

        instrumentation = new HTTPServerInstrumentation();
        instrumentation.enable();

        app = bootApp([ManagementAutoConfiguration, TelemetryLabConfiguration]);

        // A real listener on an ephemeral port, wired to the app's dispatcher —
        // the exact path `pnpm start` takes, minus a fixed port.
        server = new HTTPServer(app.dispatcher, { port: 0 });
        await server.start();
        // `HTTPServer.server` is typed `unknown` by the platform (it is the
        // adapter's own instance — the `node:http` server for the default one).
        const listener = server.server as Server;
        const address = listener.address();
        if (address === null || typeof address === 'string') {
            throw new Error('expected the lab server to listen on a TCP address');
        }
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    afterAll(async () => {
        await server?.close();
        instrumentation?.disable();
        app?.close();
    });

    test('the inbound traceparent continues as the SERVER span and the handler sees it', async () => {
        const response = await fetch(`${baseUrl}/work?payload=trace&units=1`, {
            headers: { traceparent: TRACEPARENT },
        });
        expect(response.status).toBe(200);

        const body = (await response.json()) as {
            route: string;
            trace: { traceId: string; spanId: string } | null;
        };
        // The handler executed inside the SERVER span's active context, so it
        // reports the client's trace id — the continuation, in one response.
        expect(body.route).toBe('GET /work');
        expect(body.trace?.traceId).toBe(CLIENT_TRACE_ID);
        expect(body.trace?.spanId).not.toBe(CLIENT_SPAN_ID);

        const request = await finishedSpan(exporter, SERVER_SPAN);
        expect(request, `${SERVER_SPAN} was not exported`).toBeDefined();
        expect(request?.spanContext().traceId).toBe(CLIENT_TRACE_ID);
        expect(request?.parentSpanContext?.spanId).toBe(CLIENT_SPAN_ID);
        expect(request?.attributes['http.request.method']).toBe('GET');

        // The app's own span nested under the SERVER span: same trace, and the
        // SERVER span as its parent.
        const work = await finishedSpan(exporter, WORK_SPAN);
        expect(work, `${WORK_SPAN} was not exported`).toBeDefined();
        expect(work?.spanContext().traceId).toBe(CLIENT_TRACE_ID);
        expect(work?.parentSpanContext?.spanId).toBe(request?.spanContext().spanId);
    });

    test('a request without traceparent starts a fresh root trace', async () => {
        const response = await fetch(`${baseUrl}/work?payload=root&units=1`);
        expect(response.status).toBe(200);

        const body = (await response.json()) as { trace: { traceId: string } | null };
        expect(body.trace?.traceId).toBeDefined();
        expect(body.trace?.traceId).not.toBe(CLIENT_TRACE_ID);

        const spans = exporter.getFinishedSpans().filter((span) => span.name === SERVER_SPAN);
        expect(spans.length).toBeGreaterThanOrEqual(2);
        expect(exporter.getFinishedSpans().length).toBeGreaterThan(2);
    });
});
