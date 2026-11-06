/**
 */
import { describe, expect, test, vi } from 'vitest';
import { GenericApplicationContext } from '../src/context';
import { NamespaceRelayValidationStrategy } from '../src/event-gateway';
import { FeatureContextMountManager } from '../src/feature-context-mount-manager';

describe('FeatureContextMountManager', () => {
    test('it should mount, unmount preserve, and remount feature with same context', () => {
        const shell = new GenericApplicationContext('shell');
        const shellListener = vi.fn();
        shell.on('site:nav:badge:update', shellListener);

        const manager = new FeatureContextMountManager(shell);
        manager.registerFeature({
            name: 'todo',
            relays: [
                {
                    from: 'todo:stats:updated',
                    to: 'site:nav:badge:update',
                },
            ],
            unmountPolicy: 'preserve',
        });

        const firstMount = manager.mount('todo');
        firstMount.context.emit('todo:stats:updated', 1);

        expect(shellListener).toHaveBeenCalledTimes(1);
        expect(manager.isMounted('todo')).toBe(true);

        manager.unmount('todo');
        expect(manager.isMounted('todo')).toBe(false);
        expect(firstMount.context.destroyed).toBe(false);

        const secondMount = manager.mount('todo');
        secondMount.context.emit('todo:stats:updated', 2);

        expect(secondMount.context).toBe(firstMount.context);
        expect(shellListener).toHaveBeenCalledTimes(2);

        manager.destroy();
        shell.destroy();
    });

    test('it should close context and create new context on remount with close policy', () => {
        const shell = new GenericApplicationContext('shell');
        const manager = new FeatureContextMountManager(shell);

        manager.registerFeature({
            name: 'todo',
            relays: [
                {
                    from: 'todo:stats:updated',
                    to: 'site:nav:badge:update',
                },
            ],
            unmountPolicy: 'close',
        });

        const firstMount = manager.mount('todo');
        manager.unmount('todo');

        expect(firstMount.context.destroyed).toBe(true);

        const secondMount = manager.mount('todo');
        expect(secondMount.context).not.toBe(firstMount.context);

        manager.destroy();
        shell.destroy();
    });

    test('it should apply gateway options across remount cycles', () => {
        const shell = new GenericApplicationContext('shell');
        const onRelayBlocked = vi.fn();
        const manager = new FeatureContextMountManager(shell);

        manager.registerFeature({
            name: 'todo',
            relays: [
                {
                    from: 'admin:stats:updated',
                    to: 'site:nav:badge:update',
                },
            ],
            gatewayOptions: {
                validationStrategy: new NamespaceRelayValidationStrategy({
                    featureNamespace: 'todo',
                }),
                diagnosticHandler: {
                    onRelayBlocked,
                },
            },
            unmountPolicy: 'preserve',
        });

        const firstMount = manager.mount('todo');
        expect(firstMount.gateway?.hasBlockedRelays()).toBe(true);
        expect(onRelayBlocked).toHaveBeenCalledTimes(1);

        manager.unmount('todo');
        manager.mount('todo');

        expect(onRelayBlocked).toHaveBeenCalledTimes(2);

        manager.destroy();
        shell.destroy();
    });

    test('it should throw when mounting unregistered feature', () => {
        const shell = new GenericApplicationContext('shell');
        const manager = new FeatureContextMountManager(shell);

        expect(() => manager.mount('missing')).toThrowError("Feature 'missing' is not registered");

        manager.destroy();
        shell.destroy();
    });

    test('it should emit standardized mount metrics when metric recorder is provided', () => {
        const shell = new GenericApplicationContext('shell');
        const incrementCounter = vi.fn();
        const setGauge = vi.fn();
        const manager = new FeatureContextMountManager(shell, {
            metricRecorder: {
                incrementCounter,
                setGauge,
            },
        });

        manager.registerFeature({
            name: 'todo',
            unmountPolicy: 'preserve',
        });

        manager.mount('todo');
        manager.unmount('todo');

        expect(incrementCounter).toHaveBeenCalledWith('todo', 'todo.registeredCount');
        expect(incrementCounter).toHaveBeenCalledWith('todo', 'todo.mountAttemptCount');
        expect(incrementCounter).toHaveBeenCalledWith('todo', 'todo.mountCount');
        expect(incrementCounter).toHaveBeenCalledWith('todo', 'todo.unmountCount');
        expect(setGauge).toHaveBeenCalledWith('todo', 'todo.isMounted', 1);
        expect(setGauge).toHaveBeenCalledWith('todo', 'todo.isMounted', 0);

        manager.destroy();
        shell.destroy();
    });

    test('it should unregister a feature and allow re-registration', () => {
        const shell = new GenericApplicationContext('shell');
        const manager = new FeatureContextMountManager(shell);

        manager.registerFeature({
            name: 'todo',
            unmountPolicy: 'close',
        });
        manager.mount('todo');
        expect(manager.isMounted('todo')).toBe(true);

        expect(manager.unregister('todo')).toBe(true);
        expect(manager.hasRegistration('todo')).toBe(false);
        expect(manager.isMounted('todo')).toBe(false);
        expect(manager.unregister('todo')).toBe(false);

        manager.registerFeature({
            name: 'todo',
        });
        expect(manager.mount('todo')).toBeDefined();

        manager.destroy();
        shell.destroy();
    });
});
