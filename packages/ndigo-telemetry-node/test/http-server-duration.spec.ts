/**
 * HTTPServerInstrumentation semconv duration metric (AD-77 D-6): every
 * completed inbound request records `http.server.request.duration` on the
 * meter — the success path with the adapter's status code, the catch path
 * with the 500 the adapter would have written.
 *
 * One provider per file: the instrument cache in the instrumentation is
 * module-level, so a mid-file provider swap would orphan the cached
 * histogram onto the dead provider.
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { metrics } from '@opentelemetry/api';
import { configuration, entry, MetadataConfigApplicationContext } from '@ndigo/context';
import { getMapping, requestMapping } from '@ndigo/dispatcher';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@ndigo/platform-node';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { HTTPServerInstrumentation } from '../src/instrumentation/http-server/http-server';
import { PrometheusMetricReader } from '../src/metrics/prometheus-metric-reader';

@requestMapping('/probe')
class ProbeController {
    @getMapping('/')
    index() {
        return { ok: true };
    }
}

@configuration
class ProbeConfiguration {
    @entry()
    probeApi() {
        return new ProbeController();
    }
}

describe('HTTPServerInstrumentation request duration metric', () => {
    let reader: PrometheusMetricReader;

    beforeAll(() => {
        reader = new PrometheusMetricReader();
        metrics.setGlobalMeterProvider(new MeterProvider({ readers: [reader] }));
    });

    afterAll(() => {
        metrics.disable();
    });

    /** Boots a real dispatcher with the probe route (the management-spec shape). */
    async function buildBase(): Promise<{ adapter: NodeHTTPServerAdapter; base: string }> {
        const context = new MetadataConfigApplicationContext('http-duration');
        context.register(NodeAutoConfiguration);
        context.register(ProbeConfiguration);
        context.refresh();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        return {
            adapter,
            base: `http://127.0.0.1:${(adapter.server as { address(): { port: number } }).address().port}`,
        };
    }

    test('records http.server.request.duration on the success path with method + status attributes', async () => {
        const instrumentation = new HTTPServerInstrumentation();
        instrumentation.enable();
        const { adapter, base } = await buildBase();

        try {
            const res = await fetch(`${base}/probe`);
            expect(res.status).toBe(200);

            const snapshots = await reader.snapshot();
            const duration = snapshots.find((snapshot) => snapshot.name === 'http.server.request.duration');
            expect(duration).toBeDefined();
            if (!duration) {
                return;
            }
            expect(duration.type).toBe('histogram');
            expect(duration.unit).toBe('s');

            const point = duration.points.find(
                (candidate) =>
                    candidate.attributes['http.request.method'] === 'GET' &&
                    candidate.attributes['http.response.status_code'] === 200
            );
            expect(point).toBeDefined();
            expect(point?.value).toMatchObject({ kind: 'histogram', count: 1 });
        } finally {
            instrumentation.disable();
            await adapter.close();
        }
    });

    test('records http.server.request.duration on the catch path with the 500 the adapter would write', async () => {
        // The real adapter converts dispatch failures into problem responses
        // internally (OP-5) and resolves, so the wrapper's catch path can
        // never fire through it — it only fires for a truly rejecting
        // original. Stub the prototype before wrapping to prove that branch.
        const realHandleRequest = NodeHTTPServerAdapter.prototype.handleRequest;
        const boom = new Error('no dispatcher');
        NodeHTTPServerAdapter.prototype.handleRequest = () => Promise.reject(boom);

        const instrumentation = new HTTPServerInstrumentation();
        instrumentation.enable();
        try {
            const req = {
                headers: {},
                method: 'POST',
                url: '/broken',
            } as unknown as IncomingMessage;
            const res = new Proxy({} as ServerResponse, {
                get: () => () => undefined,
            });

            try {
                await (
                    NodeHTTPServerAdapter.prototype.handleRequest as unknown as (
                        r: IncomingMessage,
                        s: ServerResponse
                    ) => Promise<void>
                ).call(new NodeHTTPServerAdapter({} as unknown as NodeDispatcher), req, res);
            } catch {
                // expected — the stub rejects
            }

            const snapshots = await reader.snapshot();
            const duration = snapshots.find((snapshot) => snapshot.name === 'http.server.request.duration');
            expect(duration).toBeDefined();
            if (!duration) {
                return;
            }

            const point = duration.points.find(
                (candidate) =>
                    candidate.attributes['http.request.method'] === 'POST' &&
                    candidate.attributes['http.response.status_code'] === 500
            );
            expect(point).toBeDefined();
            expect(point?.value).toMatchObject({ kind: 'histogram', count: 1 });
        } finally {
            instrumentation.disable();
            NodeHTTPServerAdapter.prototype.handleRequest = realHandleRequest;
        }
    });
});
