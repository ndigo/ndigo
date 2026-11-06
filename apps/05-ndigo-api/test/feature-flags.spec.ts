/**
 * Feature-flags demo (AD-82): `FeatureFlagController`'s `@whenFeature`
 * gate over the real ndigo-api boot path — on-flag 200, refresh-flip to
 * 404 problem doc, un-gated routes untouched.
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { ApplicationBuilder } from '@ndigo/boot';
import { type ConfigurableApplicationContext, type ConfigurableEnvironment } from '@ndigo/context';
import { NodeAutoConfiguration, NodeDispatcher } from '@ndigo/platform-node';
import { MockHTTP } from '@ndigo/test';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { ServerConfig } from '../src/server-config';

describe('ndigo-api @whenFeature demo gate (AD-82)', () => {
    let context: ConfigurableApplicationContext;
    let mockHTTP: MockHTTP;
    let close: () => void;

    beforeAll(async () => {
        context = await new ApplicationBuilder([NodeAutoConfiguration, ServerConfig, NodeAppConfiguration])
            .properties({
                'server.port': '3021',
                'server.name': 'ndigo-api-flags',
                'feature.gated.report': true,
            })
            .run();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        mockHTTP = new MockHTTP({ dispatcher });
        close = () => context.close();
    });

    afterAll(() => {
        close();
    });

    test('gated route serves while the flag is on', async () => {
        const res = await mockHTTP.get('/gated-report').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ report: 'feature-gated', feature: 'gated.report' });
    });

    test('an un-gated route in the same app is untouched', async () => {
        const res = await mockHTTP.get('/api/hello').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ message: 'Hello, World!' });
    });

    test('refresh-flipping the flag to false gates the route with a 404 problem doc', async () => {
        const environment = context.environment as ConfigurableEnvironment;
        environment.getPropertySources().addFirst('flip', { 'feature.gated.report': false });
        environment.refresh();

        const res = await mockHTTP.get('/gated-report').exec();
        expect(res.response.status).toBe(404);
        const body = res.json() as { type?: string; status?: number };
        expect(body.type).toBe('urn:ndigo:not-found');
        expect(body.status).toBe(404);
    });
});
