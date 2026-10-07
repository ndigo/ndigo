/**
 * @module blue-router
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import { FeatureRoutingRegistry } from '../src/feature-routing-registry';

describe('FeatureRoutingRegistry', () => {
    test('it should activate feature and route within partition', () => {
        const onActivate = vi.fn();
        const onDeactivate = vi.fn();
        const onRoute = vi.fn();
        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onActivate,
            onDeactivate,
            onRoute,
        });

        const handled = registry.navigate('/todo/active');

        expect(handled).toBe(true);
        expect(onActivate).toHaveBeenCalledTimes(1);
        expect(onRoute).toHaveBeenCalledTimes(1);
        expect(onRoute.mock.calls[0]?.[0].toString()).toBe('/active');
        expect(registry.activeFeatureName).toBe('todo');
        expect(onDeactivate).not.toHaveBeenCalled();
    });

    test('it should deactivate active feature when navigating outside registered partitions', () => {
        const onDeactivate = vi.fn();
        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onRoute: vi.fn(),
            onDeactivate,
        });

        registry.navigate('/todo/active');
        const handled = registry.navigate('/account/profile');

        expect(handled).toBe(false);
        expect(onDeactivate).toHaveBeenCalledTimes(1);
        expect(registry.activeFeatureName).toBeUndefined();
    });

    test('it should deactivate prior feature and activate next feature on partition switch', () => {
        const todoDeactivate = vi.fn();
        const accountActivate = vi.fn();
        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onDeactivate: todoDeactivate,
            onRoute: vi.fn(),
        });

        registry.registerFeature({
            name: 'account',
            prefix: '/account',
            onActivate: accountActivate,
            onRoute: vi.fn(),
        });

        registry.navigate('/todo/active');
        registry.navigate('/account/profile');

        expect(todoDeactivate).toHaveBeenCalledTimes(1);
        expect(accountActivate).toHaveBeenCalledTimes(1);
        expect(registry.activeFeatureName).toBe('account');
    });

    test('it should throw on duplicate feature registration name', () => {
        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onRoute: vi.fn(),
        });

        expect(() => {
            registry.registerFeature({
                name: 'todo',
                prefix: '/todo-v2',
                onRoute: vi.fn(),
            });
        }).toThrowError("Feature 'todo' is already registered");
    });

    test('it should allow explicitly setting active feature', () => {
        const onActivate = vi.fn();
        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onActivate,
            onRoute: vi.fn(),
        });

        registry.setActiveFeature('todo');

        expect(onActivate).toHaveBeenCalledTimes(1);
        expect(registry.activeFeatureName).toBe('todo');
    });

    test('it should throw when setting unregistered active feature', () => {
        const registry = new FeatureRoutingRegistry();

        expect(() => {
            registry.setActiveFeature('missing');
        }).toThrowError("Feature 'missing' is not registered");
    });

    test('it should support tracked activation policy (default)', () => {
        const todoDeactivate = vi.fn();
        const accountDeactivate = vi.fn();
        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onDeactivate: todoDeactivate,
            onRoute: vi.fn(),
        });

        registry.registerFeature({
            name: 'account',
            prefix: '/account',
            onDeactivate: accountDeactivate,
            onRoute: vi.fn(),
        });

        registry.navigate('/todo');
        registry.navigate('/account');

        expect(todoDeactivate).toHaveBeenCalledTimes(1);
        expect(accountDeactivate).toHaveBeenCalledTimes(0);
    });

    test('it should support exclusive activation policy', () => {
        const todoDeactivate = vi.fn();
        const accountDeactivate = vi.fn();
        const registry = new FeatureRoutingRegistry(undefined, {
            activationPolicy: 'exclusive',
        });

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onDeactivate: todoDeactivate,
            onRoute: vi.fn(),
        });

        registry.registerFeature({
            name: 'account',
            prefix: '/account',
            onDeactivate: accountDeactivate,
            onRoute: vi.fn(),
        });

        registry.navigate('/todo');

        // `account` was registered but never activated, so it must not be
        // deactivated (PWB-REV-011).
        expect(accountDeactivate).not.toHaveBeenCalled();

        registry.navigate('/account');

        expect(todoDeactivate).toHaveBeenCalledTimes(1);
        expect(registry.activeFeatureName).toBe('account');
    });

    test('exclusive policy does not deactivate or count never-activated features (PWB-REV-011)', () => {
        const incrementCounter = vi.fn();
        const setGauge = vi.fn();
        const neverActivatedDeactivate = vi.fn();
        const registry = new FeatureRoutingRegistry(undefined, {
            activationPolicy: 'exclusive',
            metricRecorder: { incrementCounter, setGauge },
        });

        registry.registerFeature({
            name: 'never',
            prefix: '/never',
            onDeactivate: neverActivatedDeactivate,
            onRoute: vi.fn(),
        });
        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onRoute: vi.fn(),
        });

        registry.navigate('/todo');

        expect(neverActivatedDeactivate).not.toHaveBeenCalled();
        expect(incrementCounter).not.toHaveBeenCalledWith('never', 'never.deactivateCount');
        expect(setGauge).not.toHaveBeenCalledWith('never', 'never.isActive', 0);
    });

    test('it should emit standardized feature metrics when metric recorder is provided', () => {
        const incrementCounter = vi.fn();
        const setGauge = vi.fn();
        const registry = new FeatureRoutingRegistry(undefined, {
            metricRecorder: {
                incrementCounter,
                setGauge,
            },
        });

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onRoute: vi.fn(),
        });

        registry.navigate('/todo/active');
        registry.navigate('/other');

        expect(incrementCounter).toHaveBeenCalledWith('todo', 'todo.registeredCount');
        expect(incrementCounter).toHaveBeenCalledWith('todo', 'todo.routeHandledCount');
        expect(incrementCounter).toHaveBeenCalledWith('todo', 'todo.activateCount');
        expect(incrementCounter).toHaveBeenCalledWith('todo', 'todo.deactivateCount');
        expect(setGauge).toHaveBeenCalledWith('todo', 'todo.isActive', 1);
        expect(setGauge).toHaveBeenCalledWith('todo', 'todo.isActive', 0);
    });

    test('it should unregister a feature, deactivate it, and unmount its prefix', () => {
        const todoDeactivate = vi.fn();
        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onDeactivate: todoDeactivate,
            onRoute: vi.fn(),
        });

        registry.navigate('/todo/active');
        expect(registry.activeFeatureName).toBe('todo');

        expect(registry.unregister('todo')).toBe(true);
        expect(registry.activeFeatureName).toBeUndefined();
        expect(todoDeactivate).toHaveBeenCalledTimes(1);
        expect(registry.navigate('/todo')).toBe(false);
        expect(registry.unregister('todo')).toBe(false);
    });

    test('it should reject a duplicate route prefix and leave the registry consistent (HT-10)', () => {
        const registry = new FeatureRoutingRegistry();

        registry.registerFeature({
            name: 'todo',
            prefix: '/todo',
            onRoute: vi.fn(),
        });

        expect(() =>
            registry.registerFeature({
                name: 'todo-v2',
                prefix: 'todo',
                onRoute: vi.fn(),
            })
        ).toThrowError("A feature is already mounted at prefix '/todo'");

        // The failed registration left no feature behind, and the original
        // feature still routes and can be unregistered on its own.
        expect(() => registry.setActiveFeature('todo-v2')).toThrowError("Feature 'todo-v2' is not registered");
        expect(registry.navigate('/todo/active')).toBe(true);
        expect(registry.unregister('todo')).toBe(true);
    });
});
