/**
 * `@ndigo/test` `MockHTTP` integration lane for the telemetry lab: the real
 * application context boots (management endpoints included), the page and the
 * instrumented work routes dispatch through the whole pipeline, and the
 * counters the lab recorded are read back from `/metrics`, `/lab/state`, and
 * `/lab/config`.
 *
 * Assertions are on route-specific values (the response envelope's checksum,
 * the route counters) rather than on wall-clock behaviour, so the scheduled
 * task firing in the background can never make the lane flaky.
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { bootNodeApp, MockHTTP } from '@ndigo/test';
import type { NdigoTestApp } from '@ndigo/test';
import { LAB_FEATURE } from '../src/lab-metrics';
import { MetricSnapshot, registerMetricSnapshotProvider, unregisterMetricSnapshotProvider } from '@ndigo/telemetry';
import { SOCKET_PATH } from '../src/lab-controller';
import { TelemetryLabConfiguration, applyLabSecurityHeaders } from '../src/telemetry-lab-configuration';
import { resolveLabTelemetry } from '../src/telemetry-config';
import type { WorkResponse } from '../src/work-controller';

/** The `/lab/state` document, reduced to the parts this lane asserts on. */
interface LabStateBody {
    feature: string;
    scheduled: { ticks: number; cron: string; span: string };
    sockets: { room: string; path: string; pushCron: string };
    metrics: { counters: Record<string, number>; gauges: Record<string, number> };
}

/** The `/lab/config` document, reduced to the parts this lane asserts on. */
interface LabConfigBody {
    serviceName: string;
    feature: string;
    socketPath: string;
    sampler: string;
    exporters: { trace: string; metric: string; log: string };
    tickCron: string;
    pushCron: string;
}

describe('ndigo-telemetry-lab HTTP surface', () => {
    let app: NdigoTestApp;
    let mockHTTP: MockHTTP;

    beforeAll(() => {
        app = bootNodeApp([ManagementAutoConfiguration, TelemetryLabConfiguration]);
        // Same widening the bootstrap applies, so the served page carries the
        // CSP the browser half needs (WebSocket on 'self').
        applyLabSecurityHeaders(app.context, resolveLabTelemetry());
        mockHTTP = new MockHTTP(app);
    });

    afterAll(() => {
        app.close();
    });

    test('GET / serves the page that boots the built client under the widened CSP', async () => {
        const res = await mockHTTP.get('/').exec();

        expect(res.response.status).toBe(200);
        expect(String(res.response.headers['content-type'])).toContain('text/html');
        const html = res.text();
        expect(html).toContain('/static/client.js');
        expect(html).toContain('id="browser-spans"');

        const csp = String(res.response.headers['content-security-policy']);
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("connect-src 'self' ws: wss:");
    });

    test('GET /health answers UP (the boot-smoke probe)', async () => {
        const res = await mockHTTP.get('/health').exec();

        expect(res.response.status).toBe(200);
        expect(res.json()).toMatchObject({ status: 'UP' });
    });

    test('GET /work runs the instrumented work and reports its route', async () => {
        const res = await mockHTTP.get('/work').query({ payload: 'ndigo', units: '2' }).exec();

        expect(res.response.status).toBe(200);
        const body = res.json() as WorkResponse;
        expect(body).toMatchObject({ ok: true, route: 'GET /work', payload: 'ndigo', units: 2 });
        // No server instrumentation in this (socket-free) lane: the handler
        // reports the absence rather than a fabricated context.
        expect(body.trace).toBeNull();
        expect(body.checksum).toBeGreaterThan(0);
    });

    test('POST /work honors the JSON body and is deterministic', async () => {
        const first = await mockHTTP.post('/work').body({ payload: 'ndigo', units: 3 }).exec();
        const second = await mockHTTP.post('/work').body({ payload: 'ndigo', units: 3 }).exec();

        expect(first.response.status).toBe(200);
        const a = first.json() as WorkResponse;
        const b = second.json() as WorkResponse;
        expect(a).toMatchObject({ ok: true, route: 'POST /work', payload: 'ndigo', units: 3 });
        expect(a.checksum).toBe(b.checksum);

        // A different payload is a different checksum (the hash is real work).
        const other = await mockHTTP.post('/work').body({ payload: 'green', units: 3 }).exec();
        expect((other.json() as WorkResponse).checksum).not.toBe(a.checksum);
    });

    test('POST /work rejects an invalid body as an RFC 9457 problem document', async () => {
        const res = await mockHTTP.post('/work').body({ payload: '', units: 0 }).exec();

        expect(res.response.status).toBe(400);
        expect(res.json()).toMatchObject({ status: 400, error: 'invalid_body' });
    });

    test('GET /metrics serves the meter-derived Prometheus document (AD-77 D-4)', async () => {
        // The hermetic lane never registers an OTel SDK, so the meter-backed
        // snapshot source is injected directly. (`@ndigo/management` pins the
        // full adapter contract end-to-end; this lane pins what the lab
        // serves on the wire.)
        registerMetricSnapshotProvider({
            snapshot: async (): Promise<readonly MetricSnapshot[]> => [
                {
                    name: 'work.requests.get',
                    description: 'GET /work requests',
                    unit: '',
                    type: 'sum',
                    points: [{ attributes: { feature: LAB_FEATURE }, value: { kind: 'scalar', value: 7 } }],
                },
                {
                    name: 'http.server.request.duration',
                    description: 'The duration of the server request.',
                    unit: 's',
                    type: 'histogram',
                    points: [
                        {
                            attributes: { 'http.request.method': 'GET' },
                            value: { kind: 'histogram', count: 2, sum: 0.02, min: 0.001, max: 0.019, buckets: [] },
                        },
                    ],
                },
            ],
        });
        try {
            const res = await mockHTTP.get('/metrics').exec();

            expect(res.response.status).toBe(200);
            const body = res.text();
            expect(body).toContain('# TYPE work.requests.get counter');
            expect(body).toContain(`work.requests.get{feature="${LAB_FEATURE}"} 7`);
            expect(body).toContain('# TYPE http.server.request.duration_count counter');
            expect(body).toContain('http.server.request.duration_count{http.request.method="GET"} 2');
            expect(body).toContain('# TYPE http.server.request.duration_sum gauge');
        } finally {
            unregisterMetricSnapshotProvider();
        }
    });

    test('GET /lab/state reports the counters, scheduler, and socket wiring', async () => {
        const res = await mockHTTP.get('/lab/state').exec();

        expect(res.response.status).toBe(200);
        const body = res.json() as LabStateBody;
        expect(body.feature).toBe(LAB_FEATURE);
        expect(body.scheduled.span).toBe('lab.ticker.tick');
        expect(body.scheduled.cron).toBe('*/5 * * * * *');
        expect(body.sockets).toEqual({ room: 'telemetry', path: SOCKET_PATH, pushCron: '*/3 * * * * *' });
        expect(body.metrics.counters['work.requests.post']).toBeGreaterThanOrEqual(1);
    });

    test('GET /lab/config reports the resolved sampler and exporter targets', async () => {
        const res = await mockHTTP.get('/lab/config').exec();

        expect(res.response.status).toBe(200);
        const body = res.json() as LabConfigBody;
        expect(body).toMatchObject({
            serviceName: 'ndigo-telemetry-lab-web',
            feature: LAB_FEATURE,
            socketPath: SOCKET_PATH,
            tickCron: '*/5 * * * * *',
            pushCron: '*/3 * * * * *',
        });
        // No collector in the test environment: the console posture.
        expect(body.exporters).toEqual({ trace: 'console', metric: 'console', log: 'console' });
        expect(body.sampler).toContain('always');
    });
});
