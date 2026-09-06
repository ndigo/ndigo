// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@blue/platform-node';
import { RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { ManagementAutoConfiguration } from '../src/management-auto-configuration';
import { METRIC_AGGREGATOR } from '../src/metric-aggregator-token';
import { FeatureMetricAggregator } from '@blue/telemetry';

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
        context.refresh();

        const mapping = context.getValue<RadixMetadataHandlerMapping>('handlerMapping');
        mapping.setApplicationContext(context);
        mapping.init();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        dispatcher.initStrategies(context);
        dispatcher.applicationContext = context;

        // Seed some metrics through the shared aggregator.
        const aggregator = context.getValue<FeatureMetricAggregator>(METRIC_AGGREGATOR);
        aggregator.incrementCounter('todo', 'mountCount', 1);
        aggregator.incrementCounter('api', 'requestCount', 3);

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

    test('GET /health reports UP with the telemetry component', async () => {
        const res = await fetch(`${base}/health`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { status: string; components: Record<string, { status: string }> };
        expect(body.status).toBe('UP');
        expect(body.components['telemetry'].status).toBe('UP');
    });
});
