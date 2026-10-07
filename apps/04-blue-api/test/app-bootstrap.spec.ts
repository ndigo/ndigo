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
import { TaskScheduler } from '@blue/scheduler';
import { MockHTTP } from '@blue/test';
import { NodeHTTPServerAdapter } from '@blue/platform-node';
import type { AddressInfo } from 'node:net';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { ServerConfig } from '../src/server-config';
import { Heartbeat } from '../src/heartbeat';
import { CachedReportController } from '../src/cached-report-controller';
import { initAuth } from '../src/auth-store';

/**
 * Boots the REAL blue-api bootstrap path (ApplicationBuilder: NodeAutoConfiguration
 * + ManagementAutoConfiguration + app config, `dev` profile, property source)
 * — the same assembly `src/index.ts` runs — and exercises the environment
 * property sources, profile activation, and the management endpoints.
 */
describe('blue-api full bootstrap (ApplicationBuilder path)', () => {
    let context: Awaited<ReturnType<ApplicationBuilder['run']>>;
    let mockHTTP: MockHTTP;

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
        mockHTTP = new MockHTTP({ dispatcher });
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
        const res = await mockHTTP.get('/health').exec();

        expect(res.response.status).toBe(200);
        const body = res.json() as { status?: string; components?: Record<string, unknown> };
        expect(typeof body.status).toBe('string');
        expect(typeof body.components).toBe('object');
    });

    test('GET /metrics returns the aggregator snapshot', async () => {
        const res = await mockHTTP.get('/metrics').exec();

        expect(res.response.status).toBe(200);
        const body = res.json() as { features?: Record<string, unknown> };
        expect(typeof body.features).toBe('object');
    });

    test('GET /api/greeting resolves the language from Accept-Language', async () => {
        const res = await mockHTTP
            .get('/api/greeting')
            .query({ name: 'Ada' })
            .headers({ 'accept-language': 'de-DE,de;q=0.9' })
            .exec();

        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ message: 'Hallo, Ada!', language: 'de' });
    });

    test('GET /api/greeting falls back to English without the header', async () => {
        const res = await mockHTTP.get('/api/greeting').query({ name: 'Ada' }).exec();

        expect(res.json()).toEqual({ message: 'Hello, Ada!', language: 'en' });
    });

    test('the scheduled heartbeat is auto-discovered and auto-started (AD-20)', async () => {
        const scheduler = context.getValue<TaskScheduler>('taskScheduler');
        expect(context.hasValue('scheduleRegistry')).toBe(true);
        expect(scheduler.taskNames()).toContain('heartbeat.ping');

        // The auto-started timer runs on the system clock — stop it and
        // drive the engine deterministically.
        scheduler.stop();
        await scheduler.tick(new Date());
        expect(scheduler.getStats('heartbeat.ping')?.runs).toBe(0);

        await scheduler.tick(new Date(Date.now() + 3_600_000));
        expect(scheduler.getStats('heartbeat.ping')?.runs).toBe(1);

        // The ping ran the real bean: the counter incremented.
        const heartbeat = context.getValue<Heartbeat>('heartbeat');
        expect(heartbeat.pings).toBe(1);
    });

    test('the cacheManager bean is provisioned zero-wiring (AD-24)', () => {
        expect(context.hasValue('cacheManager')).toBe(true);
    });

    test('GET /api/cached-report caches across dispatches (AD-24)', async () => {
        const controller = context.getValue<CachedReportController>('cachedReportController');

        const first = await mockHTTP.get('/api/cached-report').exec();
        const second = await mockHTTP.get('/api/cached-report').exec();

        expect(first.response.status).toBe(200);
        expect(first.json()).toEqual({ invocations: 1, value: 'report-1' });
        expect(second.json()).toEqual(first.json());
        expect(controller.invocations).toBe(1);
    });

    test('security headers are set by default on dispatches (AD-25)', async () => {
        // Asserted over a real socket: MockHTTP's route resolution walks the
        // strategy's mapping collection (which can dedupe the platform
        // mapping) — the adapter path resolves the platform mapping that
        // carries the default-on interceptor.
        const adapter = new NodeHTTPServerAdapter(context.getValue<NodeDispatcher>('dispatcher'));
        await adapter.listen(0, '127.0.0.1');
        try {
            const base = `http://127.0.0.1:${(adapter.server as { address(): AddressInfo }).address().port}`;
            const res = await fetch(`${base}/api/cached-report`);
            expect(res.headers.get('x-content-type-options')).toBe('nosniff');
            expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN');
            expect(res.headers.get('strict-transport-security')).toBe('max-age=31536000; includeSubDomains');
            const csp = res.headers.get('content-security-policy');
            expect(csp).toContain("default-src 'self'");
            expect(csp).toContain("connect-src 'self'");
        } finally {
            await adapter.close();
        }
    });
});
