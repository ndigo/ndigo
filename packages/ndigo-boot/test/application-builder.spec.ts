/**
 */
import { describe, test, expect, vi } from 'vitest';
import { IllegalStateError } from '@ndigo/core';
import { ApplicationBuilder } from '../src/application-builder';
import { Application } from '../src/application';
import { StandardEnvironment, configuration, entry } from '@ndigo/context';
import type { InitializationAwareProcessor, EntryProcessor } from '@ndigo/factory';

@configuration
class BuilderConfiguration {
    @entry()
    builderName() {
        return 'builder';
    }
}

@configuration
class ExtraConfiguration {
    @entry()
    extraValue() {
        return 'extra';
    }
}

@configuration
class CatalogSource {
    @entry()
    catalogValue() {
        return 'catalog';
    }
}

@configuration
class ChildConfiguration {
    @entry()
    childValue() {
        return 'child';
    }
}

@configuration
class ParentConfiguration {
    @entry()
    parentValue() {
        return 'parent';
    }
}

describe('ApplicationBuilder', () => {
    test('it should store properties without throwing', () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);

        expect(() => builder.properties({ featureFlag: true })).not.toThrow();
    });

    test('it should only run once and return same context', async () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);

        const first = await builder.run();
        const second = await builder.run();

        expect(first).toBe(second);
    });

    test('CTX-09: concurrent run() calls are single-flight (one boot, one context)', async () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);
        const runSpy = vi.spyOn(Application.prototype, 'run');

        try {
            const [first, second] = await Promise.all([builder.run(), builder.run()]);

            // Both callers share the one in-flight boot; before the fix each
            // call booted its own context and the first was leaked.
            expect(runSpy).toHaveBeenCalledTimes(1);
            expect(first).toBe(second);
            expect(builder.context).toBe(first);
        } finally {
            runSpy.mockRestore();
        }
    });

    test('it should create child builder without throwing', () => {
        const parent = new ApplicationBuilder([BuilderConfiguration]);
        parent.properties({ featureFlag: true });

        expect(() => parent.child(BuilderConfiguration)).not.toThrow();
    });

    test('it should register additional sources added through sources()', async () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);
        builder.sources([ExtraConfiguration]);

        const context = await builder.run();

        expect(context.getValue('builderName')).toBe('builder');
        expect(context.getValue('extraValue')).toBe('extra');
    });

    test('it should apply profiles to the built application context', async () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);

        const context = await builder.profiles('dev', 'test').run();

        expect(context.environment.activeProfiles).toEqual(['dev', 'test']);
    });

    test('it should apply explicit environment to the built application context', async () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);
        const environment = new StandardEnvironment();

        const context = await builder.environment(environment).run();

        expect(context.environment).toBe(environment);
    });

    test('it should keep child properties isolated from parent', async () => {
        const parent = new ApplicationBuilder([BuilderConfiguration]).properties({ parentOnly: true });
        const child = parent.child(ChildConfiguration).properties({ childOnly: true });

        const parentContext = await parent.run();
        const childContext = await child.run();

        expect(parentContext.getValue('childValue')).toBeUndefined();
        expect(childContext.getValue('childValue')).toBe('child');
    });

    test('it should not mutate existing parent sources when calling parent()', async () => {
        const child = new ApplicationBuilder([ChildConfiguration]);
        const parent = child.parent(ParentConfiguration);
        const sameParent = child.parent(BuilderConfiguration);

        expect(sameParent).toBe(parent);

        const firstParentContext = await parent.run();
        expect(firstParentContext.getValue('parentValue')).toBe('parent');
        expect(firstParentContext.getValue('builderName')).toBeUndefined();
    });
});

describe('ApplicationBuilder.fromConfig', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('fetches config from URL and sets properties', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ properties: { server: { port: 8080 } } }),
        } as Response);

        const builder = await ApplicationBuilder.fromConfig('/config.json');

        expect(fetch).toHaveBeenCalledWith('/config.json');
        const context = await builder.run();
        expect(context.environment.getProperty('server')).toEqual({ port: 8080 });
    });

    test('throws on non-ok response', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            status: 404,
        } as Response);

        await expect(ApplicationBuilder.fromConfig('/missing.json')).rejects.toThrow('404');
    });

    test('sets profiles from config', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ profiles: ['production', 'us-east'] }),
        } as Response);

        const builder = await ApplicationBuilder.fromConfig('/config.json');
        const context = await builder.run();

        expect(context.environment.activeProfiles).toContain('production');
        expect(context.environment.activeProfiles).toContain('us-east');
    });

    test('handles config with no optional fields', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({}),
        } as Response);

        const builder = await ApplicationBuilder.fromConfig('/config.json');
        expect(builder).toBeInstanceOf(ApplicationBuilder);
        // Should run without error
        await expect(builder.run()).resolves.toBeInstanceOf(Object);
    });

    test('rejects a non-http config URL', async () => {
        await expect(ApplicationBuilder.fromConfig('file:///config.json')).rejects.toThrow(/must use https or http/u);
    });

    test('resolves sources only through the static catalog', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ sources: ['catalogSource'] }),
        } as Response);

        const builder = await ApplicationBuilder.fromConfig('/config.json', {
            sourceCatalog: { catalogSource: CatalogSource },
        });
        expect(builder).toBeInstanceOf(ApplicationBuilder);
        await expect(builder.run()).resolves.toBeInstanceOf(Object);
    });

    test('rejects an unknown source id', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ sources: ['missing'] }),
        } as Response);

        await expect(ApplicationBuilder.fromConfig('/config.json')).rejects.toThrow(
            /is not present in the source catalog/u
        );
    });
});

// TOON fixtures produced with the pinned reference decoder (`@toon-format/toon`
// 4.4.0, spec v4.4), so the syntax is validated rather than hand-written.
const TOON_NESTED = 'properties:\n  server:\n    port: 9090\nprofiles[1]: production';
const TOON_FLAT = 'properties:\n  server.port: 9090';

describe('ApplicationBuilder.fromConfig — TOON decode (AD-66 Phase 3)', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function textDocument(content: string): Response {
        return { ok: true, text: () => Promise.resolve(content) } as Response;
    }

    function jsonDocument(content: Record<string, unknown>): Response {
        return { ok: true, json: () => Promise.resolve(content) } as Response;
    }

    test('it should decode a .toon address through the optional peer', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(textDocument(TOON_NESTED));

        const builder = await ApplicationBuilder.fromConfig('/config.toon');
        const context = await builder.run();

        expect(fetch).toHaveBeenCalledWith('/config.toon');
        expect(context.environment.getProperty('server')).toEqual({ port: 9090 });
        expect(context.environment.activeProfiles).toContain('production');
    });

    test('it should build the same environment from equivalent JSON and TOON documents', async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce(jsonDocument({ properties: { server: { port: 9090 } }, profiles: ['production'] }))
            .mockResolvedValueOnce(textDocument(TOON_NESTED));

        const jsonContext = await (await ApplicationBuilder.fromConfig('/config.json')).run();
        const toonContext = await (await ApplicationBuilder.fromConfig('/config.toon')).run();

        expect(toonContext.environment.getProperty('server')).toEqual(jsonContext.environment.getProperty('server'));
        expect(toonContext.environment.activeProfiles).toEqual(jsonContext.environment.activeProfiles);
    });

    test('format:toon decodes regardless of the address', async () => {
        for (const address of ['/config', '/config.json']) {
            // The mock is per-response, so each address needs its own fetch in order.
            // oxlint-disable-next-line no-await-in-loop -- the fetch mock is single-shot per iteration.
            vi.mocked(fetch).mockResolvedValueOnce(textDocument(TOON_FLAT));
            // oxlint-disable-next-line no-await-in-loop -- sequential awaits keep each iteration's single-shot mock paired.
            const context = await (await ApplicationBuilder.fromConfig(address, { format: 'toon' })).run();

            expect(context.environment.getProperty('server')).toEqual({ port: 9090 });
        }
    });

    test('format:json over a .toon address refuses the contradiction', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(textDocument(TOON_FLAT));

        await expect(ApplicationBuilder.fromConfig('/config.toon', { format: 'json' })).rejects.toThrowError(
            /Config file "\/config\.toon" is TOON but the fromConfig format option is 'json'/
        );
    });

    test('it should keep JSON the default for an extensionless address', async () => {
        const document = { properties: { 'server.port': 8080 } };
        vi.mocked(fetch).mockResolvedValueOnce(jsonDocument(document));

        const context = await (await ApplicationBuilder.fromConfig('/config')).run();

        // Going down the TOON path would reach `response.text` (absent on this
        // mock) and fail loudly, so a passing assertion also proves the peer
        // was never resolved.
        expect(context.environment.getProperty('server.port')).toBe(8080);
    });

    test('a query string must not turn a JSON address into TOON', async () => {
        const document = { properties: { 'server.port': 8080 } };
        vi.mocked(fetch).mockResolvedValueOnce(jsonDocument(document));

        const context = await (await ApplicationBuilder.fromConfig('/config.json?x=.toon')).run();

        // The query suffix must not make detection read the cached name: a
        // `.toon(.toon)` read would reach `response.text` (absent on this
        // mock) and fail loudly.
        expect(fetch).toHaveBeenCalledWith('/config.json?x=.toon');
        expect(context.environment.getProperty('server.port')).toBe(8080);
    });

    test('a cache-busted .toon address still decodes as TOON', async () => {
        for (const address of ['/config.toon?ref=main', '/config.toon#frag']) {
            // oxlint-disable-next-line no-await-in-loop -- the fetch mock is single-shot per iteration.
            vi.mocked(fetch).mockResolvedValueOnce(textDocument(TOON_FLAT));
            // oxlint-disable-next-line no-await-in-loop -- sequential awaits keep each iteration's single-shot mock paired.
            const context = await (await ApplicationBuilder.fromConfig(address)).run();

            expect(context.environment.getProperty('server')).toEqual({ port: 9090 });
        }
    });

    test('a URL object address is handled', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(textDocument(TOON_FLAT));

        const context = await (await ApplicationBuilder.fromConfig(new URL('https://example/config.toon'))).run();

        expect(context.environment.getProperty('server')).toEqual({ port: 9090 });
    });

    test('a JSON-shaped document under format:toon errors with the decode advisory', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(textDocument('{"a": 1}'));

        await expect(ApplicationBuilder.fromConfig('/config', { format: 'toon' })).rejects.toThrowError(
            /convert the document to TOON or drop the format option/
        );
    });

    test('a JSON-shaped document in a .toon file keeps its rename hint', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(textDocument('{"a": 1}'));

        await expect(ApplicationBuilder.fromConfig('/config.toon')).rejects.toThrowError(
            /starts like a JSON document[\s\S]*rename the file to \.json/
        );
    });

    test('a failing decoder surfaces a bounded, sanitized message with its cause', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(textDocument(TOON_FLAT));
        const failing = () => Promise.reject(new Error(`boom\u0000${'x'.repeat(300)}`));

        let caught: unknown;
        try {
            await ApplicationBuilder.fromConfig('/config.toon', { decodeToon: failing });
        } catch (error) {
            caught = error;
        }

        expect(caught).toBeInstanceOf(IllegalStateError);
        const message = (caught as Error).message;
        expect(message).toContain('is not valid TOON');
        expect(message).toContain('boom');
        expect(message).not.toContain('\u0000');
        expect(message.length).toBeLessThan(260);
    });
});

describe('ApplicationBuilder.processors', () => {
    test('returns this for chaining', () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);
        expect(builder.processors({} as unknown as EntryProcessor)).toBe(builder);
    });

    test('processors() registers entry processors before the context refresh', async () => {
        @configuration
        class ConstructorConfiguration {
            @entry()
            processedService() {
                return ProcessedService;
            }
        }

        class ProcessedService {
            value(): string {
                return 'processed';
            }
        }

        const seen: string[] = [];
        const processor: InitializationAwareProcessor = {
            processBeforeInitialization: <T>(_name: string, instance: T): T => instance,
            processAfterInitialization: <T>(name: string, instance: T): T => {
                seen.push(name);
                return instance;
            },
        };

        const builder = new ApplicationBuilder([ConstructorConfiguration]).processors(processor);
        const context = await builder.run();

        // The constructor entry — eagerly created at refresh end — was
        // processed, which was impossible before processors() existed.
        expect(context.getValue<ProcessedService>('processedService').value()).toBe('processed');
        expect(seen).toContain('processedService');
    });

    test('processors() replacement: chained calls do not accumulate', async () => {
        const first: string[] = [];
        const second: string[] = [];
        const building = (log: string[]): InitializationAwareProcessor => ({
            processBeforeInitialization: <T>(_name: string, instance: T): T => instance,
            processAfterInitialization: <T>(name: string, instance: T): T => {
                log.push(name);
                return instance;
            },
        });

        const builder = new ApplicationBuilder([BuilderConfiguration]).processors(building(first), building(second));
        builder.processors(building(second));
        const context = await builder.run();

        await context.getValue('builderName');
        expect(first).toEqual([]);
        expect(second).not.toEqual([]);
    });
});
