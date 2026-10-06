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
    type DataPoint,
} from '@opentelemetry/sdk-metrics';
import { metrics, trace, type Attributes } from '@opentelemetry/api';
import { parameters, requestMapping, socketMapping, socketSessionValue, type SocketSession } from '@blue/dispatcher';
import { MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@blue/platform-node';
import { WebSocketServerInstrumentation } from '../src/instrumentation/websocket-server/websocket-server';
import { WebSocket } from 'ws';

@requestMapping('/')
class SocketTelemetryController {
    @socketMapping('/echo')
    @parameters({ session: socketSessionValue('session') })
    async *echo(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'echo', data: message };
        }
    }
}

/**
 * Constructed at module scope — BEFORE any MeterProvider registration —
 * matching production wiring (`configureTelemetry({ instrumentations: [
 * new WebSocketServerInstrumentation() ] })` builds the instrumentation in
 * the constructor, where `InstrumentationBase` already ran `enable()`).
 * B3 regression: counters must resolve lazily on first use, or they capture
 * the NoopMeter and every `blue.socket.*` datapoint below is silently lost.
 */
const instrumentation = new WebSocketServerInstrumentation();

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

/**
 * The counter's datapoints via an explicit collect (typed SDK `DataPoint`s).
 *
 * @param reader - The metric reader to collect from.
 * @param name - The counter name (e.g. `blue.socket.messages.sent`).
 * @returns The counter's datapoints, `[]` when the metric is absent.
 */
async function counterDatapoints(reader: PeriodicExportingMetricReader, name: string): Promise<DataPoint<number>[]> {
    const { resourceMetrics } = await reader.collect();
    for (const scope of resourceMetrics.scopeMetrics) {
        for (const metric of scope.metrics) {
            if (metric.descriptor?.name === name && metric.dataPointType === DataPointType.SUM) {
                return [...metric.dataPoints];
            }
        }
    }
    return [];
}

/**
 * Cumulative value of the datapoints whose attributes carry every entry of
 * `match` — the series a specific fan-out dimension lands on, or the
 * attribute-free series for `{}`.
 *
 * @param reader - The metric reader to collect from.
 * @param name - The counter name.
 * @param match - Attribute entries the datapoint must carry.
 * @returns The matching series' cumulative value, `0` when absent.
 */
async function datapointValue(reader: PeriodicExportingMetricReader, name: string, match: Attributes): Promise<number> {
    let total = 0;
    for (const point of await counterDatapoints(reader, name)) {
        if (Object.entries(match).every(([key, value]) => point.attributes[key] === value)) {
            total += point.value;
        }
    }
    return total;
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

        // Constructor already enabled the instrumentation (module scope);
        // a second enable() is a no-op (`AbstractBaseInstrumentation` latches).
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

    /**
     * Open a socket against the echo endpoint, resolving once the upgrade
     * handshake is up (so the registry has the session when the caller fans
     * out — a fan-out that reaches nobody is not a sent message).
     *
     * @returns The connected socket.
     */
    async function openEchoSocket(): Promise<WebSocket> {
        const socket = new WebSocket(`${wsUrl}/echo`);
        const { promise, resolve, reject } = Promise.withResolvers<void>();
        socket.on('open', resolve);
        socket.on('error', reject);
        await promise;
        return socket;
    }

    test('records a session lifetime span with path, duration, and close code', async () => {
        const ws = await openEchoSocket();
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
        const ws = await openEchoSocket();

        const received = new Promise<void>((resolve) => {
            ws.once('message', () => resolve());
        });
        await adapter.socketRegistry.broadcast('/echo', { event: 'tick' });
        await received;

        expect(await counterValue(metricReader, 'blue.socket.sessions.opened')).toBe(2); // this + prior test
        expect(await counterValue(metricReader, 'blue.socket.sessions.closed')).toBe(1);
        expect(await counterValue(metricReader, 'blue.socket.messages.sent')).toBe(1);
        expect(await counterValue(metricReader, 'blue.socket.messages.bytes')).toBe(16); // '{"event":"tick"}'

        ws.close(1000, 'done');
        await delay(150);
        expect(await counterValue(metricReader, 'blue.socket.sessions.closed')).toBe(2);
    });

    test('measures binary fan-out payloads by byte length, not JSON encoding', async () => {
        const ws = await openEchoSocket();
        const bytesBefore = await counterValue(metricReader, 'blue.socket.messages.bytes');
        await adapter.socketRegistry.broadcast('/echo', 'abc'); // text frame: 3 bytes
        expect(await counterValue(metricReader, 'blue.socket.messages.bytes')).toBe(bytesBefore + 3);
        // Binary frames: exact payload bytes. JSON-encoding them would record
        // 31 (index-key object) and 2 (`'{}'`) instead.
        await adapter.socketRegistry.broadcast('/echo', new Uint8Array([1, 2, 3, 4, 5]));
        expect(await counterValue(metricReader, 'blue.socket.messages.bytes')).toBe(bytesBefore + 8);
        await adapter.socketRegistry.broadcast('/echo', new ArrayBuffer(8));
        expect(await counterValue(metricReader, 'blue.socket.messages.bytes')).toBe(bytesBefore + 16);
        ws.close(1000, 'done');
        await delay(150);
    });

    test('room fan-out counts on the bounded attribute-free series by default', async () => {
        const ws = await openEchoSocket();
        const room = 'TEL-3-default-room';
        const session = adapter.socketRegistry.sessions('/echo')[0];
        adapter.socketRegistry.join(session, room);
        const sentBefore = await datapointValue(metricReader, 'blue.socket.messages.sent', {});
        const bytesBefore = await datapointValue(metricReader, 'blue.socket.messages.bytes', {});
        await adapter.socketRegistry.broadcastTo(room, 'room-tin'); // 8 bytes

        expect(await datapointValue(metricReader, 'blue.socket.messages.sent', {})).toBe(sentBefore + 1);
        expect(await datapointValue(metricReader, 'blue.socket.messages.bytes', {})).toBe(bytesBefore + 8);
        // The arbitrary room string never becomes a metric attribute.
        const points = await counterDatapoints(metricReader, 'blue.socket.messages.sent');
        expect(points.some((point) => point.attributes['socket.room'] === room)).toBe(false);
        ws.close(1000, 'done');
        await delay(150);
    });

    test('records socket.room only with the roomAttribute opt-in', async () => {
        // Two instrumentations must not wrap the same prototype at once —
        // hand the registry over to a room-aware instance for this test.
        instrumentation.disable();
        const roomAware = new WebSocketServerInstrumentation({ roomAttribute: true });
        try {
            // The observer attaches on the first registration while this
            // instance is enabled, so the socket opens after the swap.
            const ws = await openEchoSocket();
            const room = 'TEL-3-opt-in-room';
            const session = adapter.socketRegistry.sessions('/echo')[0];
            adapter.socketRegistry.join(session, room);
            await adapter.socketRegistry.broadcastTo(room, 'room-tin'); // 8 bytes

            expect(await datapointValue(metricReader, 'blue.socket.messages.sent', { 'socket.room': room })).toBe(1);
            expect(await datapointValue(metricReader, 'blue.socket.messages.bytes', { 'socket.room': room })).toBe(8);
            ws.close(1000, 'done');
            await delay(150);
        } finally {
            roomAware.disable();
            instrumentation.enable();
        }
    });
});
