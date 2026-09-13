// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'node:net';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { context as otelContext, trace, SpanKind } from '@opentelemetry/api';
import { getMapping, requestMapping } from '@blue/dispatcher';
import { MetadataConfigApplicationContext } from '@blue/context';
import {
    NODE_RESPONSE_ATTRIBUTE,
    NodeAutoConfiguration,
    NodeDispatcher,
    NodeHTTPServerAdapter,
    ServerSentEventView,
} from '@blue/platform-node';
import { ServerSentEventViewInstrumentation } from '../src/instrumentation/server-sent-event-view/server-sent-event-view';

/**
 * G1: SSE streaming gets a span — frames, duration, and client disconnect.
 */

@requestMapping('/')
class EventsController {
    @getMapping('/events')
    events() {
        return new ServerSentEventView(
            (async function* () {
                yield { event: 'tick', data: { n: 1 } };
                yield { event: 'tick', data: { n: 2 } };
                yield { event: 'tick', data: { n: 3 } };
            })()
        );
    }

    @getMapping('/events/endless')
    endless() {
        return new ServerSentEventView(
            (async function* () {
                // Bounded so teardown can't hang; still stops mid-stream so a
                // disconnect flag is observable (frames stop before completion).
                for (let i = 0; i < 50; i += 1) {
                    yield { event: 'tick', data: {} };
                }
            })()
        );
    }
}

describe('ServerSentEventViewInstrumentation', () => {
    let exporter: InMemorySpanExporter;
    let adapter: NodeHTTPServerAdapter;
    let base: string;

    beforeAll(async () => {
        exporter = new InMemorySpanExporter();
        const contextManager = new AsyncHooksContextManager();
        contextManager.enable();
        otelContext.setGlobalContextManager(contextManager);
        const provider = new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(exporter)] });
        trace.setGlobalTracerProvider(provider);

        const instr = new ServerSentEventViewInstrumentation();
        instr.setTracerProvider(provider);
        instr.enable();

        const context = new MetadataConfigApplicationContext('sse-telemetry');
        context.register(NodeAutoConfiguration);
        context.setValue(EventsController.name, new EventsController());
        context.refresh(); // auto-initializes the handler mapping + dispatcher
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        base = `http://127.0.0.1:${(adapter.server as { address(): AddressInfo }).address().port}`;
    });

    afterAll(async () => {
        await adapter?.close();
    });

    it('records frames + duration for a completed stream', async () => {
        const res = await fetch(`${base}/events`);
        await res.text();
        await Promise.resolve();
        await new Promise((r) => setTimeout(r, 50));

        const spans = exporter.getFinishedSpans().filter((s) => s.name === 'ServerSentEventView.renderTo');
        expect(spans).toHaveLength(1);
        const span = spans[0];
        expect(span.kind).toBe(SpanKind.SERVER);
        expect(span.attributes['http.response.status_code']).toBe('200');
        expect(span.attributes['sse.frames']).toBe(3);
        expect(Number(span.attributes['sse.duration_ms'])).toBeGreaterThanOrEqual(0);
        expect(span.attributes['sse.client_disconnected']).toBeUndefined();
    });

    it('flags a client disconnect when the response closes mid-stream', async () => {
        // Unit-level: a destroyed response mid-loop sets the observable flag
        // (the socket-close listener mirrors this on real aborts).
        const view = new ServerSentEventView(
            (async function* () {
                yield { event: 'tick', data: {} };
                // Simulate the client abort: the loop observes res.destroyed
                // on the next iteration and flags the disconnect.
            })()
        );
        const res = {
            destroyed: true,
            headersSent: false,
            writeHead: () => {},
            flushHeaders: () => {},
            on: () => {},
            off: () => {},
            write: () => true,
            end: () => {},
        } as never;

        // ProducerView contract: renderTo returns the streaming document;
        // the body iterator is what observes the abort, so drain it.
        const result = await view.renderTo(null, { attributes: { [NODE_RESPONSE_ATTRIBUTE]: res } } as never);
        for await (const _chunk of result.body) {
            // drain
        }
        expect(view.frameCount).toBe(0);
        expect(view.clientDisconnected).toBe(true);
    });
});
