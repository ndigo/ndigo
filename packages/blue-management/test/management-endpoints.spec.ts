/**
 * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { configuration, entry, MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@blue/platform-node';
import { denialOf, getMapping, requestMapping, RouteHandlerMethod } from '@blue/dispatcher';
import { ManagementAutoConfiguration } from '../src/management-auto-configuration';
import { METRIC_AGGREGATOR } from '../src/metric-aggregator-tokens';
import { HEALTH_REGISTRY } from '../src/health-registry-tokens';
import { FeatureMetricAggregator } from '@blue/telemetry';
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

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');

        // Seed some metrics through the shared aggregator.
        const aggregator = context.getValue<FeatureMetricAggregator>(METRIC_AGGREGATOR);
        aggregator.incrementCounter('todo', 'mountCount', 1);
        aggregator.incrementCounter('api', 'requestCount', 3);
        aggregator.recordDuration('todo', 'mountMs', 8);
        aggregator.recordDuration('todo', 'mountMs', 12);

        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        base = `http://127.0.0.1:${(adapter.server as { address(): { port: number } }).address().port}`;
    });

    test('GET /metrics returns seeded counters', async () => {
        const res = await fetch(`${base}/metrics`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { features: Record<string, { counters: Record<string, number> }> };
        expect(body.features['todo'].counters['mountCount']).toBe(1);
        expect(body.features['api'].counters['requestCount']).toBe(3);
    });

    test('GET /metrics returns duration summaries (OP-4)', async () => {
        const res = await fetch(`${base}/metrics`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as {
            features: Record<
                string,
                {
                    counters: Record<string, number>;
                    durations: Record<string, { count: number; max: number; mean: number; min: number; p50: number }>;
                    gauges: Record<string, number>;
                    updatedAt: string;
                }
            >;
        };
        expect(body.features['todo'].durations['mountMs']).toEqual({ count: 2, max: 12, mean: 10, min: 8, p50: 10 });
        // Full per-feature shape promised by the controller JSDoc.
        expect(Object.keys(body.features['todo']).sort()).toEqual(['counters', 'durations', 'gauges', 'updatedAt']);
    });

    test('GET /health reports UP with the telemetry component', async () => {
        const res = await fetch(`${base}/health`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { status: string; components: Record<string, { status: string }> };
        expect(body.status).toBe('UP');
        expect(body.components['telemetry'].status).toBe('UP');
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
