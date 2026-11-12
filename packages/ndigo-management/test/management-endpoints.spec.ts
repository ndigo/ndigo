/**
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { configuration, entry, MetadataConfigApplicationContext } from '@ndigo/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@ndigo/platform-node';
import { denialOf, getMapping, requestMapping, RouteHandlerMethod } from '@ndigo/dispatcher';
import { ManagementAutoConfiguration } from '../src/management-auto-configuration';
import { METRIC_AGGREGATOR } from '../src/metric-aggregator-tokens';
import { HEALTH_REGISTRY } from '../src/health-registry-tokens';
import {
    FeatureMetricAggregator,
    MetricSnapshot,
    registerMetricSnapshotProvider,
    setFallbackMetricSnapshotProvider,
    unregisterMetricSnapshotProvider,
} from '@ndigo/telemetry';
import { MetricsController, prefersJsonView } from '../src/metrics-controller';
import { HealthRegistry } from '../src/health';
import { HealthController } from '../src/health-controller';

/**
 * End-to-end: boot a real context with NodeAutoConfiguration +
 * ManagementAutoConfiguration, dispatch /health + /metrics through the actual
 * pipeline, and assert the management responses.
 */

describe('ManagementAutoConfiguration endpoints', () => {
    let base: string;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('management');
        context.register(NodeAutoConfiguration);
        context.register(ManagementAutoConfiguration);
        context.refresh(); // auto-initializes the handler mapping + dispatcher

        // Seed the health indicator's aggregator (AD-36) — `/health` reads it.
        const aggregator = context.getValue<FeatureMetricAggregator>(METRIC_AGGREGATOR);
        aggregator.incrementCounter('todo', 'mountCount', 1);

        // Seed the metric snapshot source (AD-77 D-3): `/metrics` derives
        // from the meter snapshot, not the aggregator.
        registerMetricSnapshotProvider({
            snapshot: async (): Promise<readonly MetricSnapshot[]> => [
                {
                    name: 'api.request.count',
                    description: 'Inbound API requests',
                    unit: '',
                    type: 'sum',
                    points: [{ attributes: { method: 'GET' }, value: { kind: 'scalar', value: 3 } }],
                },
                {
                    name: 'http.server.request.duration',
                    description: 'The duration of the server request.',
                    unit: 's',
                    type: 'histogram',
                    points: [
                        {
                            attributes: { method: 'GET' },
                            value: {
                                kind: 'histogram',
                                count: 2,
                                sum: 0.51,
                                min: 0.1,
                                max: 0.41,
                                buckets: [
                                    { count: 2, low: 0, high: 0.005 },
                                    { count: 0, low: 0.005, high: 0.01 },
                                ],
                            },
                        },
                    ],
                },
            ],
        });

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        base = `http://127.0.0.1:${(adapter.server as { address(): { port: number } }).address().port}`;
    });

    afterAll(() => {
        unregisterMetricSnapshotProvider();
    });

    test('GET /metrics serves the Prometheus text document by default (AD-77 D-4)', async () => {
        const res = await fetch(`${base}/metrics`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toContain('text/plain; version=0.0.4');

        const body = await res.text();
        expect(body).toContain('# TYPE api.request.count counter');
        expect(body).toContain('# HELP api.request.count Inbound API requests');
        expect(body).toContain('api.request.count{method="GET"} 3');
        // Histograms project to the _count counter + _sum gauge pair.
        expect(body).toContain('# TYPE http.server.request.duration_count counter');
        expect(body).toContain('http.server.request.duration_count{method="GET"} 2');
        expect(body).toContain('# TYPE http.server.request.duration_sum gauge');
        expect(body).toContain('http.server.request.duration_sum{method="GET"} 0.51');
    });

    test('GET /metrics serves the meter-derived JSON projection on an explicit JSON accept (AD-77 D-4)', async () => {
        const res = await fetch(`${base}/metrics`, { headers: { Accept: 'application/json' } });
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toContain('application/json');

        const body = (await res.json()) as {
            metrics: Record<
                string,
                {
                    type: string;
                    unit: string;
                    points: Array<Record<string, unknown>>;
                }
            >;
        };
        expect(body.metrics['api.request.count']).toEqual({
            type: 'sum',
            unit: '',
            description: 'Inbound API requests',
            points: [{ attributes: { method: 'GET' }, value: 3 }],
        });
        const duration = body.metrics['http.server.request.duration'];
        expect(duration.type).toBe('histogram');
        expect(duration.unit).toBe('s');
        const histogram = (
            duration.points[0] as {
                histogram: { count: number; sum: number; min: number; max: number; buckets: unknown[] };
            }
        ).histogram;
        expect(histogram.count).toBe(2);
        expect(histogram.sum).toBe(0.51);
        expect(histogram.buckets).toEqual([
            { count: 2, low: 0, high: 0.005 },
            { count: 0, low: 0.005, high: 0.01 },
        ]);
    });

    test('GET /health reports UP with the telemetry component', async () => {
        const res = await fetch(`${base}/health`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { status: string; components: Record<string, { status: string }> };
        expect(body.status).toBe('UP');
        expect(body.components['telemetry'].status).toBe('UP');
    });
});

describe('GET /metrics with the aggregator-backed fallback (REV-003)', () => {
    let base: string;

    beforeAll(async () => {
        // No telemetry pull reader registered: the management auto-config's
        // feature aggregator is the snapshot source (REV-003).
        unregisterMetricSnapshotProvider();

        const context = new MetadataConfigApplicationContext('management-fallback');
        context.register(NodeAutoConfiguration);
        context.register(ManagementAutoConfiguration);
        context.refresh();

        // Seed feature metrics through the same entry the endpoint projects.
        const aggregator = context.getValue<FeatureMetricAggregator>(METRIC_AGGREGATOR);
        aggregator.incrementCounter('gate', 'opens', 2);
        aggregator.recordDuration('gate', 'latencyMs', 150);

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        base = `http://127.0.0.1:${(adapter.server as { address(): { port: number } }).address().port}`;
    });

    afterAll(() => {
        setFallbackMetricSnapshotProvider(undefined);
    });

    test('serves the feature counters instead of the error document', async () => {
        const res = await fetch(`${base}/metrics`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toContain('text/plain; version=0.0.4');

        const body = await res.text();
        // The aggregator fallback projects feature counters as the
        // exposition document — the endpoint no longer dead-ends when only
        // feature metrics exist (e.g. `counted` without telemetry).
        expect(body).toContain('# TYPE gate.opens counter');
        expect(body).toContain('gate.opens{} 2');
        // Durations project through the histogram pair (count + sum).
        expect(body).toContain('# TYPE gate.latencyMs_count counter');
        expect(body).toContain('gate.latencyMs_count{} 1');
        expect(body).toContain('# TYPE gate.latencyMs_sum gauge');
    });

    test('a registered pull reader still wins over the fallback', async () => {
        registerMetricSnapshotProvider({
            snapshot: async (): Promise<readonly MetricSnapshot[]> => [
                {
                    name: 'api.request.count',
                    description: '',
                    unit: '',
                    type: 'sum',
                    points: [{ attributes: {}, value: { kind: 'scalar', value: 3 } }],
                },
            ],
        });
        try {
            const res = await fetch(`${base}/metrics`);
            expect(res.status).toBe(200);
            const body = await res.text();
            expect(body).toContain('# TYPE api.request.count counter');
            expect(body).not.toContain('gate.opens');
        } finally {
            unregisterMetricSnapshotProvider();
        }
    });

    test('the bare controller still answers the error document with no source anywhere (AD-77 D-3)', async () => {
        // No management auto-configuration, no telemetry: the current slot
        // and the fallback are both clear, so the documented error document
        // answers instead of a 500.
        unregisterMetricSnapshotProvider();
        setFallbackMetricSnapshotProvider(undefined);
        const controller = new MetricsController();
        expect(await controller.metrics(undefined)).toEqual({ error: 'No metric source wired' });
    });
});

describe('prefersJsonView (AD-77 D-4)', () => {
    test('absent and empty Accept headers default to the text document', () => {
        expect(prefersJsonView(undefined)).toBe(false);
        expect(prefersJsonView('')).toBe(false);
    });

    test('wildcards and browser accepts fall back to the text document', () => {
        expect(prefersJsonView('*/*')).toBe(false);
        expect(prefersJsonView('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')).toBe(false);
        expect(prefersJsonView('text/plain')).toBe(false);
    });

    test('explicit JSON media types select the JSON projection', () => {
        expect(prefersJsonView('application/json')).toBe(true);
        expect(prefersJsonView('application/problem+json')).toBe(true);
        expect(prefersJsonView('text/plain;q=0.5,application/json;q=1')).toBe(true);
    });

    test('q=0 JSON never selects the JSON projection', () => {
        expect(prefersJsonView('application/json;q=0')).toBe(false);
    });
});

describe('ManagementAutoConfiguration security headers (SE-4)', () => {
    let base: string;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('management-headers');
        context.register(NodeAutoConfiguration);
        context.register(ManagementAutoConfiguration);
        context.refresh();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        const server = adapter.server;
        if (
            typeof server !== 'object' ||
            server === null ||
            !('address' in server) ||
            typeof server.address !== 'function'
        ) {
            throw new Error('Expected the adapter to expose a bound Node server');
        }
        const address: unknown = server.address();
        if (
            typeof address !== 'object' ||
            address === null ||
            !('port' in address) ||
            typeof address.port !== 'number'
        ) {
            throw new Error('Expected the adapter server to be bound to a TCP port');
        }
        base = `http://127.0.0.1:${address.port}`;
    });

    test('management responses carry the default security-header set', async () => {
        for (const path of ['/health', '/metrics']) {
            // oxlint-disable-next-line no-await-in-loop -- each path is an isolated request; assertions stay independent.
            const res = await fetch(`${base}${path}`);
            expect(res.status).toBe(200);
            expect(res.headers.get('x-content-type-options')).toBe('nosniff');
            expect(res.headers.get('content-security-policy')).toContain("default-src 'self'");
        }
    });
});

describe('ManagementAutoConfiguration health redaction (AD-36 D-1)', () => {
    let base: string;
    let registry: HealthRegistry;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('management-redacted');
        context.register(NodeAutoConfiguration);
        context.register(ManagementAutoConfiguration);
        context.refresh();

        registry = context.getValue<HealthRegistry>(HEALTH_REGISTRY);
        registry.register({
            name: 'boom',
            check: () => {
                throw new Error('read /etc/app/creds.sqlite: EACCES');
            },
        });

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        base = `http://127.0.0.1:${(adapter.server as { address(): { port: number } }).address().port}`;
    });

    test('GET /health redacts thrown indicator errors by default', async () => {
        const res = await fetch(`${base}/health`);
        // DAT-F10: a DOWN aggregate surfaces as 503, not 200.
        expect(res.status).toBe(503);
        const body = (await res.json()) as {
            status: string;
            components: Record<string, { status: string; details?: Record<string, unknown> }>;
        };
        expect(body.status).toBe('DOWN');
        expect(body.components['boom'].details?.error).toBe('unavailable');
        // Indicator internals must not reach the wire.
        expect(JSON.stringify(body)).not.toContain('creds.sqlite');
    });
});

describe('ManagementAutoConfiguration with redaction disabled', () => {
    let base: string;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('management-verbose');
        class VerboseManagementAutoConfiguration extends ManagementAutoConfiguration {
            constructor() {
                super({ redactHealthErrors: false });
            }
        }
        context.register(NodeAutoConfiguration);
        context.register(VerboseManagementAutoConfiguration);
        context.refresh();

        context.getValue<HealthRegistry>(HEALTH_REGISTRY).register({
            name: 'boom',
            check: () => {
                throw new Error('read /etc/app/creds.sqlite: EACCES');
            },
        });

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        base = `http://127.0.0.1:${(adapter.server as { address(): { port: number } }).address().port}`;
    });

    test('GET /health exposes the raw error when opted in', async () => {
        const res = await fetch(`${base}/health`);
        // DAT-F10: the status code tracks the aggregate regardless of redaction.
        expect(res.status).toBe(503);
        const body = (await res.json()) as { components: Record<string, { details?: Record<string, unknown> }> };
        expect(body.components['boom'].details?.error).toBe('read /etc/app/creds.sqlite: EACCES');
    });
});

describe('ManagementAutoConfiguration with an access guard', () => {
    let guardedBase: string;

    beforeAll(async () => {
        // A guard that denies every request it intercepts, proving the
        // management routes are gated before their handlers run.
        const denyAll = {
            async preHandle() {
                return denialOf(403);
            },
            async postHandle() {},
            async completeHandle() {},
        };
        class GuardedManagementAutoConfiguration extends ManagementAutoConfiguration {
            constructor() {
                super({ accessGuard: denyAll });
            }
        }
        const context = new MetadataConfigApplicationContext('management-guarded');
        context.register(NodeAutoConfiguration);
        context.register(GuardedManagementAutoConfiguration);
        context.refresh();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        guardedBase = `http://127.0.0.1:${(adapter.server as { address(): { port: number } }).address().port}`;
    });

    test('management endpoints are denied before the handler runs', async () => {
        for (const path of ['/health', '/metrics']) {
            // oxlint-disable-next-line no-await-in-loop -- each path is an isolated request; assertions stay independent.
            const res = await fetch(`${guardedBase}${path}`);
            expect(res.status).toBe(403);
        }
    });

    test('non-management routes still dispatch with a guard configured', async () => {
        // The scoped guard must never touch routes outside /health and /metrics.
        const res = await fetch(`${guardedBase}/`);
        expect([200, 404]).toContain(res.status);
    });
});

// A real non-management handler so the COR-3 scoping assertions exercise a
// route that dispatches through the shared mapping.
@requestMapping('/app')
class ProbeController {
    @getMapping('/probe')
    probe() {
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

describe('ManagementAutoConfiguration guard: handler forwarding + hook scoping (SEC-1/COR-3)', () => {
    type GuardRecord = {
        hook: 'preHandle' | 'postHandle' | 'completeHandle';
        path: string;
        handler: object | undefined;
    };
    const isManagementPath = (path: string): boolean => path === '/health' || path === '/metrics';
    let guardedBase: string;
    let seen: GuardRecord[] = [];

    beforeAll(async () => {
        const spy = {
            async preHandle(route: { path: string }, handler: object | undefined) {
                seen.push({ hook: 'preHandle', path: route.path, handler });
                return true;
            },
            async postHandle(route: { path: string }, handler: object | undefined) {
                seen.push({ hook: 'postHandle', path: route.path, handler });
            },
            async completeHandle(route: { path: string }, handler: object | undefined) {
                seen.push({ hook: 'completeHandle', path: route.path, handler });
            },
        };
        class SpyManagementAutoConfiguration extends ManagementAutoConfiguration {
            constructor() {
                super({ accessGuard: spy });
            }
        }
        const context = new MetadataConfigApplicationContext('management-guard-spy');
        context.register(NodeAutoConfiguration);
        context.register(SpyManagementAutoConfiguration);
        context.register(ProbeConfiguration);
        context.refresh();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        guardedBase = `http://127.0.0.1:${(adapter.server as { address(): { port: number } }).address().port}`;

        // A management route (the guard sees the real handler) and a
        // non-management route through the same mapping (guard must not run).
        const health = await fetch(`${guardedBase}/health`);
        expect(health.status).toBe(200);
        const probe = await fetch(`${guardedBase}/app/probe`);
        expect(probe.status).toBe(200);
        expect(seen.length).toBeGreaterThan(0);
    });

    test('the real controller instance is forwarded to every hook, never undefined (SEC-1)', () => {
        const healthRow = seen.find((row) => row.hook === 'preHandle' && row.path === '/health');
        // The chain forwards the route's resolved handler — the
        // RouteHandlerMethod for `health` wrapping the HealthController.
        const forwarded = healthRow?.handler as RouteHandlerMethod | undefined;
        expect(forwarded).toBeDefined();
        expect(forwarded?.method).toBe('health');
        expect(forwarded?.handler).toBeInstanceOf(HealthController);
        expect(seen.find((row) => row.handler === undefined)).toBeUndefined();
    });

    test('no guard hook runs for non-management routes (COR-3)', () => {
        const nonManagement = seen.filter((row) => !isManagementPath(row.path));
        expect(nonManagement).toEqual([]);
    });
});
