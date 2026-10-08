/**
 * Exposure-model and `management.*`-section specs (AD-76 D-2/D-5).
 * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { type ConfigurableEnvironment, MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@blue/platform-node';
import { ManagementAutoConfiguration } from '../src/management-auto-configuration';
import { readManagementSettings, resolveExposure, MANAGEMENT_ENDPOINT_IDS } from '../src/management-properties';

const NEW_ENDPOINTS = ['/loggers', '/env', '/configprops'];

interface Booted {
    context: MetadataConfigApplicationContext;
    adapter: NodeHTTPServerAdapter;
    base: string;
}

/**
 * The documented options channel is subclassing (the OpenAPI docs pattern):
 * a class overriding the constructor options, registered like any source.
 */
function managementWith(
    options: ConstructorParameters<typeof ManagementAutoConfiguration>[0]
): typeof ManagementAutoConfiguration {
    return class extends ManagementAutoConfiguration {
        constructor() {
            super(options);
        }
    };
}

/** Boots a management context and returns a bound HTTP base URL. */
async function boot(
    Management: typeof ManagementAutoConfiguration = ManagementAutoConfiguration,
    configure: (context: MetadataConfigApplicationContext) => void = () => {}
): Promise<Booted> {
    const context = new MetadataConfigApplicationContext('actuator-exposure');
    configure(context);
    context.register(NodeAutoConfiguration);
    context.register(Management);
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
    const address = server.address() as { port: number };
    return { context, adapter, base: `http://127.0.0.1:${address.port}` };
}

describe('resolveExposure', () => {
    test('defaults to health + metrics (AD-76 D-2)', () => {
        expect([...resolveExposure()]).toEqual(['health', 'metrics']);
    });

    test('the wildcard expands to every known id', () => {
        expect([...resolveExposure(['*'])].sort()).toEqual([...MANAGEMENT_ENDPOINT_IDS].sort());
    });

    test('exclude wins over include; unknown ids are dropped', () => {
        expect([...resolveExposure(['*'], ['env', 'bogus'])].sort()).toEqual(
            MANAGEMENT_ENDPOINT_IDS.filter((id) => id !== 'env').sort()
        );
    });
});

describe('readManagementSettings', () => {
    test('no environment: the documented defaults', () => {
        const settings = readManagementSettings(undefined);
        expect(settings.endpoints.exposure.include).toEqual(['health', 'metrics']);
        expect(settings.endpoints.exposure.exclude).toEqual([]);
        expect(settings.endpoints.env.showValues).toBe(false);
        expect(settings.health.groups).toEqual({});
    });

    test('a configuration source drives exposure, showValues and groups', async () => {
        const { context, adapter, base } = await boot(undefined, (ctx) => {
            const registry = (ctx.environment as ConfigurableEnvironment).getPropertySources();
            registry.addLast('application', {
                management: {
                    endpoints: { exposure: { include: ['loggers'], exclude: [] }, env: { showValues: true } },
                    health: { groups: { core: { include: ['telemetry'] } } },
                },
            });
        });
        try {
            const settings = readManagementSettings(context.environment);
            expect(settings.endpoints.exposure.include).toEqual(['loggers']);
            expect(settings.endpoints.env.showValues).toBe(true);
            expect(settings.health.groups).toEqual({ core: { include: ['telemetry'] } });

            // The read section drives what is served: loggers on, env off.
            expect((await fetch(`${base}/loggers`)).status).toBe(200);
            expect((await fetch(`${base}/env`)).status).toBe(404);
        } finally {
            await adapter.close();
        }
    });
});

describe('exposure gating (AD-76 D-2)', () => {
    describe('default posture: health + metrics only', () => {
        let booted: Booted;

        beforeAll(async () => {
            booted = await boot();
        });
        afterAll(async () => await booted.adapter.close());

        test('health and metrics serve', async () => {
            for (const path of ['/health', '/metrics']) {
                // oxlint-disable-next-line no-await-in-loop -- isolated requests; assertions stay independent.
                const res = await fetch(`${booted.base}${path}`);
                expect(res.status).toBe(200);
            }
        });

        test('the new endpoints are not registered at all', async () => {
            for (const path of NEW_ENDPOINTS) {
                // oxlint-disable-next-line no-await-in-loop -- isolated requests; assertions stay independent.
                const res = await fetch(`${booted.base}${path}`);
                expect(res.status, `${path} must not be served by default`).toBe(404);
            }
        });
    });

    describe('include: ["*"] registers every endpoint', () => {
        let booted: Booted;

        beforeAll(async () => {
            booted = await boot(managementWith({ exposure: { include: ['*'] } }));
        });
        afterAll(async () => await booted.adapter.close());

        test('every management endpoint serves', async () => {
            for (const path of ['/health', '/metrics', '/loggers', '/env', '/configprops']) {
                // oxlint-disable-next-line no-await-in-loop -- isolated requests; assertions stay independent.
                const res = await fetch(`${booted.base}${path}`);
                expect(res.status, `${path} must serve under include:["*"]`).toBe(200);
            }
        });
    });

    describe('exclude wins', () => {
        let booted: Booted;

        beforeAll(async () => {
            booted = await boot(managementWith({ exposure: { include: ['*'], exclude: ['env'] } }));
        });
        afterAll(async () => await booted.adapter.close());

        test('/env is withheld while the rest serve', async () => {
            // oxlint-disable-next-line no-await-in-loop -- isolated requests; assertions stay independent.
            expect((await fetch(`${booted.base}/env`)).status).toBe(404);
            expect((await fetch(`${booted.base}/configprops`)).status).toBe(200);
            expect((await fetch(`${booted.base}/loggers`)).status).toBe(200);
        });
    });
});
