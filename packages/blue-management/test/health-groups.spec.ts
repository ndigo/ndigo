/**
 * Health groups and single-component reads (AD-76 D-6).
 * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { type ConfigurableEnvironment, MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@blue/platform-node';
import { ManagementAutoConfiguration } from '../src/management-auto-configuration';
import { HEALTH_REGISTRY } from '../src/health-registry-tokens';
import type { HealthRegistry } from '../src/health';

describe('health groups and components (AD-76 D-6)', () => {
    let base: string;
    let adapter: NodeHTTPServerAdapter;
    let registry: HealthRegistry;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('health-groups');
        const sources = (context.environment as ConfigurableEnvironment).getPropertySources();
        sources.addLast('application', {
            management: {
                health: { groups: { core: { include: ['telemetry', 'probe'] }, empty: { include: [] } } },
            },
        });
        context.register(NodeAutoConfiguration);
        context.register(ManagementAutoConfiguration);
        context.refresh();
        registry = context.getValue<HealthRegistry>(HEALTH_REGISTRY);
        // A second, user-owned indicator for the group to aggregate.
        registry.register({ name: 'probe', check: () => ({ status: 'UP' as const, details: { source: 'spec' } }) });
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher);
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
        const address = server.address() as { port: number };
        base = `http://127.0.0.1:${address.port}`;
    });
    afterAll(async () => await adapter.close());

    test('a configured group aggregates only its registered members', async () => {
        const res = await fetch(`${base}/health/core`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { status: string; components: Record<string, { status: string }> };
        expect(body.status).toBe('UP');
        expect(Object.keys(body.components).sort()).toEqual(['probe', 'telemetry']);
    });

    test('a group with a DOWN member answers 503 with the DOWN aggregate', async () => {
        registry.register({ name: 'probe', check: () => ({ status: 'DOWN' as const }) });
        try {
            const res = await fetch(`${base}/health/core`);
            expect(res.status).toBe(503);
            const body = (await res.json()) as { status: string };
            expect(body.status).toBe('DOWN');
        } finally {
            registry.register({ name: 'probe', check: () => ({ status: 'UP' as const, details: { source: 'spec' } }) });
        }
    });

    test('an unknown name answers 404', async () => {
        expect((await fetch(`${base}/health/nope`)).status).toBe(404);
    });

    test('a group with no registered members answers 404', async () => {
        expect((await fetch(`${base}/health/empty`)).status).toBe(404);
    });

    test('a single component is served as a one-component aggregate', async () => {
        const res = await fetch(`${base}/health/telemetry`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { status: string; components: Record<string, unknown> };
        expect(body.status).toBe('UP');
        expect(Object.keys(body.components)).toEqual(['telemetry']);
    });

    test('the root document stays all-components', async () => {
        const res = await fetch(`${base}/health`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { components: Record<string, unknown> };
        expect(Object.keys(body.components).sort()).toEqual(['probe', 'telemetry']);
    });

    test('a group shadows a same-named component', async () => {
        // The group wins before the component lookup.
        const res = await fetch(`${base}/health/core`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { components: Record<string, unknown> };
        expect(Object.keys(body.components).sort()).toEqual(['probe', 'telemetry']);
    });
});
