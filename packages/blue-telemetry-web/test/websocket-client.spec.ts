/**
 * Client-side socket telemetry specs: `WebSocketClientInstrumentation`
 * (outbound/close counters over a fake-transport client) and
 * `countSocketClientStatus` (status/reconnect counters).
 * @module blue-telemetry-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
    AggregationTemporality,
    DataPointType,
    InMemoryMetricExporter,
    MeterProvider,
    PeriodicExportingMetricReader,
    type DataPoint,
} from '@opentelemetry/sdk-metrics';
import { metrics } from '@opentelemetry/api';
import { WebSocketClient, type SocketTransport, type WebSocketClientOptions } from '@blue/socket';
import { countSocketClientBytes, countSocketClientStatus, WebSocketClientInstrumentation } from '../src/index';

/**
 * Minimal WHATWG-subset transport: tests fire events; sends recorded.
 */
class FakeTransport implements SocketTransport {
    binaryType: 'blob' | 'arraybuffer' | undefined;
    onopen: ((event: unknown) => void) | null = null;
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onclose: ((event: { code: number; reason: string; wasClean: boolean }) => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;
    readonly sent: string[] = [];

    send(data: string): void {
        this.sent.push(data);
    }

    close(): void {
        this.onclose?.({ code: 1000, reason: '', wasClean: true });
    }

    fireOpen(): void {
        this.onopen?.(undefined);
    }

    fireClose(code: number = 1006, reason: string = ''): void {
        this.onclose?.({ code, reason, wasClean: false });
    }
}

function createClient(options: WebSocketClientOptions = {}) {
    const created: FakeTransport[] = [];
    const client = new WebSocketClient('wss://test/echo', {
        ...options,
        transportFactory: () => {
            const transport = new FakeTransport();
            created.push(transport);
            return transport;
        },
    });
    return { client, created };
}

/**
 * Constructed at module scope — BEFORE any MeterProvider registration —
 * matching production wiring (instrumentations are built in the constructor,
 * where `InstrumentationBase` already ran `enable()`). B3 regression:
 * counters must resolve lazily on first use, or they capture the NoopMeter
 * and every client `blue.socket.*` datapoint below is silently lost.
 */
const instrumentation = new WebSocketClientInstrumentation();

/**
 * Sum counter datapoints (narrowed through `dataPointType`).
 *
 * @param reader - The metric reader.
 * @param name - The counter name.
 * @returns The cumulative value, `0` when absent.
 */
async function counterValue(reader: PeriodicExportingMetricReader, name: string): Promise<number> {
    const { resourceMetrics } = await reader.collect();
    let total = 0;
    for (const scope of resourceMetrics.scopeMetrics) {
        for (const metric of scope.metrics) {
            if (metric.descriptor?.name === name && metric.dataPointType === DataPointType.SUM) {
                for (const point of metric.dataPoints) {
                    total += point.value;
                }
            }
        }
    }
    return total;
}

/**
 * Counter datapoints including attributes (typed SDK `DataPoint`s).
 *
 * @param reader - The metric reader.
 * @param name - The counter name.
 * @returns The datapoints for the counter.
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

describe('WebSocketClientInstrumentation', () => {
    let reader: PeriodicExportingMetricReader;

    beforeAll(() => {
        reader = new PeriodicExportingMetricReader({
            exporter: new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE),
            exportIntervalMillis: 3_600_000, // never auto-exports; explicit collect()
        });
        metrics.setGlobalMeterProvider(new MeterProvider({ readers: [reader] }));
        // Constructor already enabled the instrumentation (module scope);
        // a second enable() is a no-op (the `AbstractBaseInstrumentation`
        // latch records the constructor-time enable).
        instrumentation.enable();
    });

    afterAll(async () => {
        await reader.shutdown();
    });

    test('counts outbound messages, bytes, and deliberate closes', async () => {
        const sentBefore = await counterValue(reader, 'blue.socket.client.messages.sent');
        const bytesBefore = await counterValue(reader, 'blue.socket.client.messages.bytes');
        const closedBefore = await counterValue(reader, 'blue.socket.client.closes');

        const { client, created } = createClient();
        client.send('a'); // while connecting — still an outbound attempt
        created[0].fireOpen();
        client.send({ n: 1 });
        client.close(1000, 'done');

        expect(await counterValue(reader, 'blue.socket.client.messages.sent')).toBe(sentBefore + 2);
        expect(await counterValue(reader, 'blue.socket.client.messages.bytes')).toBe(
            bytesBefore + 1 + JSON.stringify({ n: 1 }).length
        );

        const closed = await counterDatapoints(reader, 'blue.socket.client.closes');
        expect(closed).toHaveLength(1);
        expect(closed[0]?.value).toBe(closedBefore + 1);
        expect(closed[0]?.attributes['socket.close_code']).toBe(1000);
    });

    test('a latched no-op second close() call does not double-count closes', async () => {
        const { client, created } = createClient();
        const closedBefore = await counterValue(reader, 'blue.socket.client.closes');
        created[0].fireOpen();
        client.close(1000, 'first');
        // Defensive teardown calls close again — latched into a no-op that
        // must not inflate the metric (the code's own idempotency promise).
        client.close(1000, 'second');
        client.close(3000, 'third');
        expect(await counterValue(reader, 'blue.socket.client.closes')).toBe(closedBefore + 1);
    });

    test('measures binary payloads by byte length, not JSON encoding', async () => {
        const bytesBefore = await counterValue(reader, 'blue.socket.client.messages.bytes');
        const { client } = createClient();
        client.send('abc'); // text frame: 3 bytes
        expect(await counterValue(reader, 'blue.socket.client.messages.bytes')).toBe(bytesBefore + 3);
        // Binary frames: exact payload bytes. JSON-encoding them would record
        // 31 (index-key object) and 2 (`'{}'`) instead.
        client.send(new Uint8Array([1, 2, 3, 4, 5]));
        expect(await counterValue(reader, 'blue.socket.client.messages.bytes')).toBe(bytesBefore + 8);
        client.send(new ArrayBuffer(8));
        expect(await counterValue(reader, 'blue.socket.client.messages.bytes')).toBe(bytesBefore + 16);
    });

    test('counts the terminal close that follows a terminal drop exactly once', async () => {
        // Auto-reconnect off: the unexpected close is terminal on its own —
        // no close() call, so nothing is counted yet.
        const { client, created } = createClient({ reconnect: null });
        created[0].fireOpen();
        created[0].fireClose(1006, 'link lost');
        expect(client.status.value).toBe('closed');

        client.close(1001, 'teardown'); // the session's real terminal close
        client.close(1001, 'teardown'); // latched no-op — must not double-count

        const points = await counterDatapoints(reader, 'blue.socket.client.closes');
        const terminal = points.find((point) => point.attributes['socket.close_code'] === 1001);
        expect(terminal?.value).toBe(1);
    });

    test('countSocketClientStatus maps every transition to its counter', async () => {
        const connectingBefore = await counterValue(reader, 'blue.socket.client.connecting');
        const openedBefore = await counterValue(reader, 'blue.socket.client.opened');
        const reconnectingBefore = await counterValue(reader, 'blue.socket.client.reconnecting');
        const closedBefore = await counterValue(reader, 'blue.socket.client.closed');

        const count = countSocketClientStatus();
        count('connecting');
        count('open');
        count('open'); // repeat — each call is an event (the client dedupes transitions)
        count('reconnecting');
        count('closed');

        expect(await counterValue(reader, 'blue.socket.client.connecting')).toBe(connectingBefore + 1);
        expect(await counterValue(reader, 'blue.socket.client.opened')).toBe(openedBefore + 2);
        expect(await counterValue(reader, 'blue.socket.client.reconnecting')).toBe(reconnectingBefore + 1);
        expect(await counterValue(reader, 'blue.socket.client.closed')).toBe(closedBefore + 1);
    });

    test('a client wired with the onSend seam counts exact wire bytes once (TEL-08)', async () => {
        const bytesBefore = await counterValue(reader, 'blue.socket.client.messages.bytes');
        const sentBefore = await counterValue(reader, 'blue.socket.client.messages.sent');

        // Wired client: the `send` wrap must skip its own estimation, and the
        // seam must report only bytes actually written — a send that is
        // buffered while connecting is *not* on the wire yet.
        const { client, created } = createClient({
            onSend: countSocketClientBytes(),
            bufferWhileDisconnected: { maxMessages: 16 },
        });
        client.send('abc'); // buffered — nothing written, nothing counted
        expect(await counterValue(reader, 'blue.socket.client.messages.bytes')).toBe(bytesBefore);
        expect(await counterValue(reader, 'blue.socket.client.messages.sent')).toBe(sentBefore + 1);

        created[0].fireOpen(); // flush: exactly 3 bytes hit the wire
        expect(await counterValue(reader, 'blue.socket.client.messages.bytes')).toBe(bytesBefore + 3);

        // Binary frames flow through the seam with their exact byte length.
        client.send(new Uint8Array([1, 2, 3]));
        expect(await counterValue(reader, 'blue.socket.client.messages.bytes')).toBe(bytesBefore + 6);
        client.close();
    });

    test('client onStatusChange wiring reaches the counters (integrated)', async () => {
        const openedBefore = await counterValue(reader, 'blue.socket.client.opened');
        const reconnectingBefore = await counterValue(reader, 'blue.socket.client.reconnecting');

        const count = countSocketClientStatus();
        const created: FakeTransport[] = [];
        const client = new WebSocketClient('wss://test/echo', {
            onStatusChange: count,
            transportFactory: () => {
                const transport = new FakeTransport();
                created.push(transport);
                return transport;
            },
        });
        created[0].fireOpen();
        created[0].fireClose(); // unexpected → reconnecting

        expect(await counterValue(reader, 'blue.socket.client.opened')).toBe(openedBefore + 1);
        expect(await counterValue(reader, 'blue.socket.client.reconnecting')).toBe(reconnectingBefore + 1);
        client.close();
    });
});
