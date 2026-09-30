/**
 * @module blue-host
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import { createShellContext, DefaultSharedDependencyRegistry, SHARED_DEPENDENCY_REGISTRY_TOKEN } from '@blue/context';
import type { ApplicationContext } from '@blue/context';
import { HostManager, HOST_MANAGER_TOKEN } from '../src/host-manager';
import type { HostManagerOptions } from '../src/host-manager';

const createHost = (options: HostManagerOptions = {}) => {
    const shellContext = createShellContext({ name: 'site-shell' });
    const host = new HostManager(shellContext, { activationPolicy: 'exclusive', ...options });
    return { host, shellContext };
};

describe('HostManager', () => {
    test('it should register a feature in one call and mount it on route activation', () => {
        const { host } = createHost();

        host.registerFeature({ name: 'catalog', prefix: '/catalog', data: { catalogItems: [] } });

        expect(host.navigate('/catalog')).toBe(true);
        expect(host.activeFeature).toBe('catalog');
        expect(host.isMounted('catalog')).toBe(true);
    });

    test('it should unmount the previous feature on deactivation under exclusive policy', () => {
        const { host } = createHost();

        host.registerFeature({ name: 'catalog', prefix: '/catalog', unmountPolicy: 'close' });
        host.registerFeature({ name: 'reports', prefix: '/reports' });

        host.navigate('/catalog');
        expect(host.isMounted('catalog')).toBe(true);

        host.navigate('/reports');
        expect(host.isMounted('catalog')).toBe(false);
        expect(host.activeFeature).toBe('reports');
    });

    test('it should validate shared dependencies at mount against the shell registry', () => {
        const { host, shellContext } = createHost();
        shellContext.setValue(SHARED_DEPENDENCY_REGISTRY_TOKEN, new DefaultSharedDependencyRegistry());

        host.registerFeature({
            name: 'checkout',
            prefix: '/checkout',
            data: {},
            dependencies: { requires: { router: '^1.0.0' } },
        });

        expect(() => host.navigate('/checkout')).toThrow(TypeError);
        expect(host.isMounted('checkout')).toBe(false);
    });

    test('it should mount a feature whose dependencies the shell declares', () => {
        const { host, shellContext } = createHost();
        const registry = new DefaultSharedDependencyRegistry();
        registry.declare({ router: { singleton: true, version: '1.0.0' } });
        shellContext.setValue(SHARED_DEPENDENCY_REGISTRY_TOKEN, registry);

        host.registerFeature({
            name: 'checkout',
            prefix: '/checkout',
            data: {},
            dependencies: { requires: { router: '^1.0.0' } },
        });

        expect(() => host.navigate('/checkout')).not.toThrow();
        expect(host.isMounted('checkout')).toBe(true);
    });

    test('it should load a lazy feature once and deduplicate concurrent mounts', async () => {
        const { host } = createHost();
        const loader = vi.fn(async () => ({
            createContext: (parent: ApplicationContext) => parent.newChild('lazy'),
        }));

        host.registerFeature({ name: 'lazy', prefix: '/lazy', loader });

        const [first, second] = await Promise.all([host.mountLazy('lazy'), host.mountLazy('lazy')]);

        expect(first).toBe(second);
        expect(loader).toHaveBeenCalledTimes(1);
    });

    test('it should unregister a feature from both registries and free its name', () => {
        const { host } = createHost();

        host.registerFeature({ name: 'catalog', prefix: '/catalog', data: {} });
        host.navigate('/catalog');
        expect(host.activeFeature).toBe('catalog');

        expect(host.unregister('catalog')).toBe(true);
        expect(host.isMounted('catalog')).toBe(false);
        expect(host.navigate('/catalog')).toBe(false);
        expect(host.activeFeature).toBeUndefined();

        // The name is free again.
        host.registerFeature({ name: 'catalog', prefix: '/catalog', data: {} });
        expect(host.navigate('/catalog')).toBe(true);
    });

    test('it should reject duplicate registration names', () => {
        const { host } = createHost();

        host.registerFeature({ name: 'a', prefix: '/a' });
        expect(() => host.registerFeature({ name: 'a', prefix: '/a2' })).toThrow(TypeError);
    });

    test('it should dispatch the feature-local route through onRoute', () => {
        const { host } = createHost();
        const onRoute = vi.fn();

        host.registerFeature({ name: 'todo', prefix: '/todo', data: {}, onRoute });
        host.navigate('/todo/active');

        expect(onRoute).toHaveBeenCalledTimes(1);
        expect(onRoute.mock.calls[0]?.[0]?.toString()).toBe('/active');
    });

    test('it should invoke onDeactivate after unmounting on deactivation', () => {
        const { host } = createHost();
        const onDeactivate = vi.fn();

        host.registerFeature({
            name: 'catalog',
            prefix: '/catalog',
            unmountPolicy: 'close',
            data: {},
            onDeactivate,
        });
        host.registerFeature({ name: 'reports', prefix: '/reports' });

        host.navigate('/catalog');
        host.navigate('/reports');

        expect(onDeactivate).toHaveBeenCalledTimes(1);
    });

    test('it should forward metrics to the FeatureMetricRecorder', () => {
        const recorder = { incrementCounter: vi.fn(), setGauge: vi.fn() };
        const { host } = createHost({ metricRecorder: recorder });

        host.registerFeature({ name: 'catalog', prefix: '/catalog', data: {} });
        host.navigate('/catalog');

        expect(recorder.incrementCounter).toHaveBeenCalledWith('catalog', 'catalog.registeredCount');
        expect(recorder.incrementCounter).toHaveBeenCalledWith('catalog', 'catalog.activateCount');
        expect(recorder.setGauge).toHaveBeenCalledWith('catalog', 'catalog.isMounted', 1);
    });

    test('it should report a failed lazy activation through the sink, not drop it', async () => {
        const recorder = { incrementCounter: vi.fn(), setGauge: vi.fn() };
        const onActivationError = vi.fn();
        const { host } = createHost({ metricRecorder: recorder, onActivationError });

        const boom = new Error('loader boom');
        host.registerFeature({
            name: 'broken',
            prefix: '/broken',
            loader: () => Promise.reject(boom),
        });

        host.navigate('/broken');

        // Let the fire-and-forget activation settle; the rejection must be
        // observed via the sink rather than surfacing as an unhandled error.
        await vi.waitFor(() => {
            expect(onActivationError).toHaveBeenCalledTimes(1);
        });

        expect(onActivationError.mock.calls[0]?.[0]).toBe('broken');
        expect(onActivationError.mock.calls[0]?.[1]).toBe(boom);
        expect(recorder.incrementCounter).toHaveBeenCalledWith('broken', 'broken.activationErrorCount');

        // The routing registry's active flag is retained — retry on next activate.
        expect(host.activeFeature).toBe('broken');
    });

    test('it should report a lazy activation rejected by dependency validation', async () => {
        const onActivationError = vi.fn();
        const { host, shellContext } = createHost({ onActivationError });
        shellContext.setValue(SHARED_DEPENDENCY_REGISTRY_TOKEN, new DefaultSharedDependencyRegistry());

        host.registerFeature({
            name: 'checkout',
            prefix: '/checkout',
            loader: () => Promise.resolve({ createContext: (parent) => parent.newChild('lazy') }),
            dependencies: { requires: { router: '^1.0.0' } },
        });

        host.navigate('/checkout');

        await vi.waitFor(() => {
            expect(onActivationError).toHaveBeenCalledTimes(1);
        });

        expect(onActivationError.mock.calls[0]?.[0]).toBe('checkout');
        expect(onActivationError.mock.calls[0]?.[1]).toBeInstanceOf(TypeError);
        expect(host.isMounted('checkout')).toBe(false);
    });

    test('it should be resolvable from the shell context via HOST_MANAGER_TOKEN', () => {
        const { host, shellContext } = createHost();

        shellContext.setValue(HOST_MANAGER_TOKEN, host);

        expect(shellContext.getValue(HOST_MANAGER_TOKEN)).toBe(host);

        const child = shellContext.newChild('feature');
        expect(child.getValue(HOST_MANAGER_TOKEN)).toBe(host);
    });

    test('it should destroy by unmounting and freeing every registration', () => {
        const { host } = createHost();

        host.registerFeature({ name: 'a', prefix: '/a', unmountPolicy: 'close' });
        host.registerFeature({ name: 'b', prefix: '/b' });
        host.navigate('/a');

        host.destroy();

        expect(host.isMounted('a')).toBe(false);
        expect(host.navigate('/a')).toBe(false);
        expect(host.navigate('/b')).toBe(false);
    });
});
