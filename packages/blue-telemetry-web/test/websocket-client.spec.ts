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
import { WebSocketClient, type SocketTransport } from '@blue/socket';
import { countSocketClientStatus, WebSocketClientInstrumentation } from '../src/index';

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

function createClient() {
    const created: FakeTransport[] = [];
    const client = new WebSocketClient('wss://test/echo', {
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
        // a second enable() is a no-op (`InstrumentationBase` latches).
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
