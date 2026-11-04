/**
 * @module ndigo-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
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
