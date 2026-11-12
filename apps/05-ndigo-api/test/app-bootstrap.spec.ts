// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { ApplicationBuilder } from '@ndigo/boot';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { NodeAutoConfiguration, NodeDispatcher } from '@ndigo/platform-node';
import { TaskScheduler } from '@ndigo/scheduler';
import { MockHTTP } from '@ndigo/test';
import { NodeHTTPServerAdapter } from '@ndigo/platform-node';
import type { AddressInfo } from 'node:net';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { MigrationsConfig, MIGRATIONS_CONFIG, ServerConfig } from '../src/server-config';
import { Heartbeat } from '../src/heartbeat';
import { CachedReportController } from '../src/cached-report-controller';
import { initAuth } from '../src/auth-store';

/**
 * Boots the REAL ndigo-api bootstrap path (ApplicationBuilder: NodeAutoConfiguration
 * + ManagementAutoConfiguration + app config, `dev` profile, property source)
 * — the same assembly `src/index.ts` runs — and exercises the environment
 * property sources, profile activation, and the management endpoints.
 */
describe('ndigo-api full bootstrap (ApplicationBuilder path)', () => {
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
            .properties({ 'server.port': '3010', 'server.name': 'ndigo-api-demo' })
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

        expect(serverConfig.name).toBe('ndigo-api-demo');
        expect(serverConfig.port).toBe(3010);
    });

    test('it should activate the dev-profile entry (AD-14)', () => {
        expect(context.getValue('devInfo')).toEqual({ flavor: 'dev', note: 'profile-gated entry (AD-14)' });
    });

    test('GET /health reports the registry status', async () => {
        const res = await mockHTTP.get('/health').exec();

        expect(res.response.status).toBe(200);
        const body = res.json() as { status?: string; components?: Record<string, unknown> };
        expect(typeof body.status).toBe('string');
        expect(typeof body.components).toBe('object');
    });

    test('GET /metrics serves the empty catalog via the aggregator fallback (REV-003)', async () => {
        const res = await mockHTTP.get('/metrics').exec();

        expect(res.response.status).toBe(200);
        // No telemetry configured in the boot path → the endpoint is served
        // by the management auto-config's aggregator-backed fallback, which
        // has nothing tracked here yet: an empty exposition document, not
        // the error document.
        expect(res.text()).toBe('');
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

        // The ping ran the real entry: the counter incremented.
        const heartbeat = context.getValue<Heartbeat>('heartbeat');
        expect(heartbeat.pings).toBe(1);
    });

    test('the cacheManager entry is provisioned zero-wiring (AD-24)', () => {
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

/**
 * Regression guard for REV-001: `migrations.runOnBoot` uses strict boolean
 * parsing (zod `coerce.boolean()` turned the STRING `"false"` into `true`).
 */
describe('MigrationsConfig boolean binding (REV-001)', () => {
    const bootWith = async (runOnBoot: string): Promise<boolean> => {
        const built = await new ApplicationBuilder([MigrationsConfig])
            .properties({ 'migrations.runOnBoot': runOnBoot })
            .run();
        try {
            return built.getValue<MigrationsConfig>(MIGRATIONS_CONFIG).runOnBoot;
        } finally {
            built.close();
        }
    };

    test("the string 'false' stays false (coerce.boolean() would flip it)", async () => {
        expect(await bootWith('false')).toBe(false);
        expect(await bootWith('no')).toBe(false);
        expect(await bootWith('0')).toBe(false);
    });

    test("the string 'true' binds true", async () => {
        expect(await bootWith('true')).toBe(true);
        expect(await bootWith('1')).toBe(true);
    });

    test('a misspelled flag fails the boot instead of flipping the default', async () => {
        await expect(bootWith('maybe')).rejects.toThrow();
    });

    test('the committed default stays false when the key is absent', async () => {
        const built = await new ApplicationBuilder([MigrationsConfig]).run();
        try {
            expect(built.getValue<MigrationsConfig>(MIGRATIONS_CONFIG).runOnBoot).toBe(false);
        } finally {
            built.close();
        }
    });
});
