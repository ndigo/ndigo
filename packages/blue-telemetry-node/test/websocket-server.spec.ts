/**
 * `WebSocketServerInstrumentation` spec — session lifetime spans + counters
 * over a real socket (the SSE-instrumentation test pattern).
 * @module blue-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
    AggregationTemporality,
    DataPointType,
    InMemoryMetricExporter,
    MeterProvider,
    PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { metrics, trace } from '@opentelemetry/api';
import { parameters, requestMapping, socketMapping, socketSession, type SocketSession } from '@blue/dispatcher';
import { MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@blue/platform-node';
import { WebSocketServerInstrumentation } from '../src/instrumentation/websocket-server/websocket-server';
import { WebSocket } from 'ws';

@requestMapping('/')
class SocketTelemetryController {
    @socketMapping('/echo')
    @parameters({ session: socketSession('session') })
    async *echo(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'echo', data: message };
        }
    }
}

/**
 * Sums the counter's datapoints via an explicit collect (counters aggregate
 * as SUM — narrowed through `dataPointType`).
 *
 * @param reader - The metric reader to collect from.
 * @param name - The counter name (e.g. `blue.socket.sessions.opened`).
 * @returns The cumulative counter value, `0` when absent.
 */
async function counterValue(reader: PeriodicExportingMetricReader, name: string): Promise<number> {
    const { resourceMetrics } = await reader.collect();
    for (const scope of resourceMetrics.scopeMetrics) {
        for (const metric of scope.metrics) {
            if (metric.descriptor?.name === name && metric.dataPointType === DataPointType.SUM) {
                let total = 0;
                for (const point of metric.dataPoints) {
                    total += point.value;
                }
                return total;
            }
        }
    }
    return 0;
}

const delay = (ms: number): Promise<void> => {
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, ms);
    return promise;
};

describe('WebSocketServerInstrumentation', () => {
    let spanExporter: InMemorySpanExporter;
    let metricReader: PeriodicExportingMetricReader;
    let adapter: NodeHTTPServerAdapter;
    let wsUrl: string;

    beforeAll(async () => {
        spanExporter = new InMemorySpanExporter();
        trace.setGlobalTracerProvider(
            new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(spanExporter)] })
        );
        metricReader = new PeriodicExportingMetricReader({
            exporter: new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE),
            exportIntervalMillis: 3_600_000, // never auto-exports; explicit collect() in assertions
        });
        metrics.setGlobalMeterProvider(new MeterProvider({ readers: [metricReader] }));

        const instrumentation = new WebSocketServerInstrumentation();
        instrumentation.enable();

        const context = new MetadataConfigApplicationContext('ws-telemetry');
        context.register(NodeAutoConfiguration);
        context.setValue(SocketTelemetryController.name, new SocketTelemetryController());
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        const bound = adapter.server as { address: () => { port: number } | null };
        wsUrl = `ws://127.0.0.1:${bound.address()?.port}`;
    }, 30_000);

    afterAll(async () => {
        await adapter?.close();
    });

    test('records a session lifetime span with path, duration, and close code', async () => {
        const ws = new WebSocket(`${wsUrl}/echo`);
        const { promise: opened, resolve, reject } = Promise.withResolvers<void>();
        ws.on('open', resolve);
        ws.on('error', reject);
        await opened;
        ws.send('ping');
        ws.close(1000, 'done');
        await delay(150); // close handshake → registry remove → span end

        const sessionSpan = spanExporter.getFinishedSpans().find((span) => span.name === 'SocketSession.connect');
        expect(sessionSpan).toBeDefined();
        expect(sessionSpan?.attributes['socket.path']).toBe('/echo');
        expect(sessionSpan?.attributes['socket.close_code']).toBe(1000);
        expect(Number(sessionSpan?.attributes['socket.duration_ms'])).toBeGreaterThanOrEqual(0);
    });

    test('counts session lifecycle, fan-out messages, and bytes', async () => {
        const ws = new WebSocket(`${wsUrl}/echo`);
        const { promise: opened, resolve, reject } = Promise.withResolvers<void>();
        ws.on('open', resolve);
        ws.on('error', reject);
        await opened;

        const received = new Promise<void>((resolve) => {
            ws.once('message', () => resolve());
        });
        adapter.socketRegistry.broadcast('/echo', { event: 'tick' });
        await received;

        expect(await counterValue(metricReader, 'blue.socket.sessions.opened')).toBe(2); // this + prior test
        expect(await counterValue(metricReader, 'blue.socket.sessions.closed')).toBe(1);
        expect(await counterValue(metricReader, 'blue.socket.messages.sent')).toBe(1);
        expect(await counterValue(metricReader, 'blue.socket.messages.bytes')).toBe(16); // '{"event":"tick"}'

        ws.close(1000, 'done');
        await delay(150);
        expect(await counterValue(metricReader, 'blue.socket.sessions.closed')).toBe(2);
    });
});