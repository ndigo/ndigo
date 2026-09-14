/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { ApplicationBuilder } from '@blue/boot';
import { ManagementAutoConfiguration } from '@blue/management';
import { NodeAutoConfiguration, NodeDispatcher } from '@blue/platform-node';
import { MockHTTP } from '@blue/test';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { ServerConfig } from '../src/server-config';
import { initAuth } from '../src/auth-store';

/**
 * Boots the REAL blue-api bootstrap path (ApplicationBuilder: NodeAutoConfiguration
 * + ManagementAutoConfiguration + app config, `dev` profile, property source)
 * — the same assembly `src/index.ts` runs — and exercises the environment
 * property sources, profile activation, and the management endpoints.
 */
describe('blue-api full bootstrap (ApplicationBuilder path)', () => {
    let context: Awaited<ReturnType<ApplicationBuilder['run']>>;
    let mockMVC: MockHTTP;

    beforeAll(async () => {
        initAuth();
        context = await new ApplicationBuilder([
            NodeAutoConfiguration,
            ManagementAutoConfiguration,
            ServerConfig,
            NodeAppConfiguration,
        ])
            .profiles('dev')
            .properties({ 'server.port': '3010', 'server.name': 'blue-api-demo' })
            .run();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        mockMVC = new MockHTTP({ dispatcher });
    });

    afterAll(() => {
        context.close();
    });

    test('it should activate the dev profile on the environment (AD-14)', () => {
        expect(context.environment?.activeProfiles).toEqual(['dev']);
    });

    test('it should bind ServerConfig from the property source (AD-15)', () => {
        const serverConfig = context.getValue<ServerConfig>('serverConfig');

        expect(serverConfig.name).toBe('blue-api-demo');
        expect(serverConfig.port).toBe(3010);
    });

    test('it should activate the dev-profile bean (AD-14)', () => {
        expect(context.getValue('devInfo')).toEqual({ flavor: 'dev', note: 'profile-gated bean (AD-14)' });
    });

    test('GET /health reports the registry status', async () => {
        const res = await mockMVC.get('/health').exec();

        expect(res.response.status).toBe(200);
        const body = res.json() as { status?: string; components?: Record<string, unknown> };
        expect(typeof body.status).toBe('string');
        expect(typeof body.components).toBe('object');
    });

    test('GET /metrics returns the aggregator snapshot', async () => {
        const res = await mockMVC.get('/metrics').exec();

        expect(res.response.status).toBe(200);
        const body = res.json() as { features?: Record<string, unknown> };
        expect(typeof body.features).toBe('object');
    });

    test('GET /api/greeting resolves the language from Accept-Language', async () => {
        const res = await mockMVC
            .get('/api/greeting')
            .query({ name: 'Ada' })
            .headers({ 'accept-language': 'de-DE,de;q=0.9' })
            .exec();

        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ message: 'Hallo, Ada!', language: 'de' });
    });

    test('GET /api/greeting falls back to English without the header', async () => {
        const res = await mockMVC.get('/api/greeting').query({ name: 'Ada' }).exec();

        expect(res.json()).toEqual({ message: 'Hello, Ada!', language: 'en' });
    });
});
