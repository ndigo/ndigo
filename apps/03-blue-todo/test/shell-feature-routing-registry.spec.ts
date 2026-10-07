/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { FeatureContextMountManager } from '@blue/context';
import { FeatureRoutingRegistry } from '@blue/router';

describe('FeatureRoutingRegistry mount-manager integration', () => {
    test('it should route feature partition and mount feature context', () => {
        const shell = new GenericApplicationContext('shell');
        const mountManager = new FeatureContextMountManager(shell);
        mountManager.registerFeature({ name: 'todo' });

        const onRoute = vi.fn();
        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onActivate: () => mountManager.mount('todo'),
            onRoute,
        });

        const handled = registry.navigate('/todo/active');

        expect(handled).toBe(true);
        expect(mountManager.isMounted('todo')).toBe(true);
        expect(onRoute).toHaveBeenCalledTimes(1);
        expect(onRoute.mock.calls[0]?.[0].toString()).toBe('/active');

        mountManager.destroy();
        shell.destroy();
    });

    test('it should deactivate and unmount when route misses partitions', () => {
        const shell = new GenericApplicationContext('shell');
        const mountManager = new FeatureContextMountManager(shell);
        mountManager.registerFeature({ name: 'todo', unmountPolicy: 'close' });

        const onDeactivate = vi.fn();
        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onActivate: () => mountManager.mount('todo'),
            onDeactivate: () => {
                onDeactivate();
                mountManager.unmount('todo');
            },
            onRoute: vi.fn(),
        });

        registry.navigate('/todo');
        const handled = registry.navigate('/account');

        expect(handled).toBe(false);
        expect(onDeactivate).toHaveBeenCalledTimes(1);
        expect(mountManager.isMounted('todo')).toBe(false);

        mountManager.destroy();
        shell.destroy();
    });

    test('it should switch active feature lifecycle across partitions', () => {
        const shell = new GenericApplicationContext('shell');
        const mountManager = new FeatureContextMountManager(shell);

        mountManager.registerFeature({ name: 'todo', unmountPolicy: 'preserve' });
        mountManager.registerFeature({ name: 'account', unmountPolicy: 'close' });

        const todoDeactivate = vi.fn();
        const accountDeactivate = vi.fn();
        const registry = new FeatureRoutingRegistry(undefined, {
            activationPolicy: 'exclusive',
        });

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onActivate: () => {
                mountManager.mount('todo');
            },
            onDeactivate: () => {
                todoDeactivate();
                mountManager.unmount('todo');
            },
            onRoute: vi.fn(),
        });

        registry.registerFeature({
            name: 'account',
            prefix: '/account',
            onActivate: () => {
                mountManager.mount('account');
            },
            onDeactivate: () => {
                accountDeactivate();
                mountManager.unmount('account');
            },
            onRoute: vi.fn(),
        });

        registry.navigate('/todo');
        registry.navigate('/account');

        expect(todoDeactivate).toHaveBeenCalledTimes(1);
        expect(mountManager.isMounted('account')).toBe(true);

        registry.navigate('/todo/active');

        // The registry deactivates only features it actually activated — a
        // registered-but-never-activated feature (account at startup) never
        // receives `onDeactivate` (PWB routed-activation semantics).
        expect(accountDeactivate).toHaveBeenCalledTimes(1);
        expect(mountManager.isMounted('account')).toBe(false);

        mountManager.destroy();
        shell.destroy();
    });

    test('it should throw on duplicate feature registration name', () => {
        const shell = new GenericApplicationContext('shell');
        const mountManager = new FeatureContextMountManager(shell);
        mountManager.registerFeature({ name: 'todo' });

        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onActivate: () => mountManager.mount('todo'),
            onRoute: vi.fn(),
        });

        expect(() => {
            registry.registerFeature({
                name: 'todo',
                prefix: '/todo-v2',
                onRoute: vi.fn(),
            });
        }).toThrowError("Feature 'todo' is already registered");

        mountManager.destroy();
        shell.destroy();
    });
});
