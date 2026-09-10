import '@tsmetadata/polyfill';
import { describe, test, expect, vi } from 'vitest';
import { GenericApplicationContext } from '../src/context';
import { FeatureContextMountManager, LazyFeatureModule } from '../src/feature-context-mount-manager';
import { FeatureContextComposition } from '../src/context-hierarchy';

describe('FeatureContextMountManager lazy loading', () => {
    function createManager() {
        const parent = new GenericApplicationContext('shell');
        return new FeatureContextMountManager(parent);
    }

    test('it should reject mountLazy for features without a loader', async () => {
        const manager = createManager();
        manager.registerFeature({ name: 'static', createContext: (p) => p.newChild('static-feat') });

        await expect(manager.mountLazy('static')).rejects.toThrow(/no 'loader'/);
    });

    test('it should load and mount a lazy feature', async () => {
        const manager = createManager();

        const lazyModule: LazyFeatureModule = {
            createContext: (parent) => {
                const ctx = parent.newChild('checkout');
                ctx.setValue('service', { process() {} });
                return ctx;
            },
        };

        const loader = vi.fn().mockResolvedValue(lazyModule);

        manager.registerFeature({ name: 'checkout', loader });

        const composition = await manager.mountLazy('checkout');

        expect(loader).toHaveBeenCalledTimes(1);
        expect(composition.context).toBeDefined();
        expect(composition.context.name).toBe('checkout');
        expect(composition.context.parent?.name).toBe('shell');
        expect(composition.context.hasValue('service')).toBe(true);
        expect(manager.isMounted('checkout')).toBe(true);
    });

    test('it should deduplicate concurrent mountLazy calls', async () => {
        const manager = createManager();

        const lazyModule: LazyFeatureModule = {
            createContext: (parent) => parent.newChild('deduped'),
        };

        const loader = vi.fn().mockResolvedValue(lazyModule);

        manager.registerFeature({ name: 'deduped', loader });

        const [a, b] = await Promise.all([manager.mountLazy('deduped'), manager.mountLazy('deduped')]);

        expect(loader).toHaveBeenCalledTimes(1);
        expect(a.context).toBe(b.context);
    });

    test('it should return existing composition on repeated mountLazy calls', async () => {
        const manager = createManager();

        const lazyModule: LazyFeatureModule = {
            createContext: (parent) => parent.newChild('cached'),
        };

        const loader = vi.fn().mockResolvedValue(lazyModule);
        manager.registerFeature({ name: 'cached', loader });

        const first = await manager.mountLazy('cached');
        const second = await manager.mountLazy('cached');

        expect(loader).toHaveBeenCalledTimes(1);
        expect(first.context).toBe(second.context);
    });

    test('it should retry after a failed load', async () => {
        const manager = createManager();

        const lazyModule: LazyFeatureModule = {
            createContext: (parent) => parent.newChild('flaky'),
        };

        let attempts = 0;
        const loader = vi.fn().mockImplementation(() => {
            attempts++;
            if (attempts === 1) {
                return Promise.reject(new Error('Network error'));
            }
            return Promise.resolve(lazyModule);
        });

        manager.registerFeature({ name: 'flaky', loader });

        // First call — fails
        await expect(manager.mountLazy('flaky')).rejects.toThrow('Network error');
        expect(manager.isMounted('flaky')).toBe(false);

        // Second call — retries and succeeds
        // Clear failed load promise and composition state
        await manager.remountLazy('flaky');

        expect(manager.isMounted('flaky')).toBe(true);
        const composition = manager.getMountedFeature('flaky');
        expect(composition?.context.name).toBe('flaky');
    });

    test('it should wire relay gateway for lazy-loaded features', async () => {
        const manager = createManager();

        const lazyModule: LazyFeatureModule = {
            createContext: (parent) => parent.newChild('messaging'),
        };

        const loader = vi.fn().mockResolvedValue(lazyModule);

        manager.registerFeature({
            name: 'messaging',
            loader,
            relays: [{ from: 'feature:event', to: 'shell:event' }],
        });

        const composition = await manager.mountLazy('messaging');

        expect(composition.gateway).toBeDefined();
        expect(composition.gateway?.destroyed).toBe(false);
    });

    test('it should support dependencies validation with lazy loading', async () => {
        const { SharedDependencyRegistry, DefaultSharedDependencyRegistry } =
            await import('../src/shared-dependency-registry');
        const { SHARED_DEPENDENCY_REGISTRY_TOKEN } = await import('../src/feature-context-mount-manager');

        const parent = new GenericApplicationContext('shell');
        const registry = new DefaultSharedDependencyRegistry();
        registry.declare({ ROUTER: { singleton: true, version: '1.0.0' } });
        parent.setValue(SHARED_DEPENDENCY_REGISTRY_TOKEN, registry);

        const manager = new FeatureContextMountManager(parent);

        const lazyModule: LazyFeatureModule = {
            createContext: (p) => p.newChild('deps-test'),
        };

        manager.registerFeature({
            name: 'deps-test',
            loader: () => Promise.resolve(lazyModule),
            dependencies: {
                requires: { ROUTER: '^1.0.0' },
            },
        });

        const composition = await manager.mountLazy('deps-test');
        expect(composition).toBeDefined();
        expect(manager.isMounted('deps-test')).toBe(true);
    });
});
