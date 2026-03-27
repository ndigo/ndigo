// @vitest-environment jsdom

import { describe, expect, test, vi } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import {
    ACCOUNT_ROUTE_PREFIX,
    composeTodoRuntime,
    toAccountShellRoute,
    toTodoShellRoute,
    createTodoSiteRouter,
    TODO_ROUTE_PREFIX,
} from '../src/shell-composition';

describe('todo shell composition', () => {
    test('it should map feature routes to shell routes with todo prefix', () => {
        expect(TODO_ROUTE_PREFIX).toBe('/todo');
        expect(ACCOUNT_ROUTE_PREFIX).toBe('/account');
        expect(toTodoShellRoute('/')).toBe('/todo');
        expect(toTodoShellRoute('/active')).toBe('/todo/active');
        expect(toTodoShellRoute('/completed')).toBe('/todo/completed');
        expect(toAccountShellRoute('/')).toBe('/account');
        expect(toAccountShellRoute('/settings')).toBe('/account/settings');
    });

    test('it should mount todo partition and dispatch feature-local route', () => {
        const callback = vi.fn();
        const router = createTodoSiteRouter(callback);

        const matched = router.navigate('/todo/active');

        expect(matched).toBe(true);
        expect(callback).toHaveBeenCalledTimes(1);
        const featureRoute = callback.mock.calls[0]?.[0];
        expect(featureRoute.toString()).toBe('/active');
    });

    test('it should reject non-todo partition paths', () => {
        const callback = vi.fn();
        const router = createTodoSiteRouter(callback);

        const matched = router.navigate('/account/profile');

        expect(matched).toBe(false);
        expect(callback).not.toHaveBeenCalled();
    });

    test('it should support shell/feature parent-child relationship', () => {
        const shell = new GenericApplicationContext('shell');
        const feature = new GenericApplicationContext('todo');

        feature.setParent(shell);

        expect(shell.hasChild(feature)).toBe(true);
        expect(feature.parent).toBe(shell);
        expect(feature.path).toBe('shell/todo');

        shell.destroy();
    });

    test('it should compose runtime with relay gateway diagnostics enabled', () => {
        const todoContext = new GenericApplicationContext('todo');

        const composition = composeTodoRuntime(todoContext);

        const mountedFeature = composition.featureMountManager.getMountedFeature('todo');

        expect(mountedFeature?.gateway).toBeDefined();
        expect(mountedFeature?.gateway?.hasBlockedRelays()).toBe(false);
        expect((mountedFeature?.gateway as any)?.activeRelayCount ?? mountedFeature?.gateway?.relays.length).toBe(1);
        expect(
            (mountedFeature?.gateway as any)?.blockedRelayCount ?? mountedFeature?.gateway?.blockedRelays.length
        ).toBe(0);
        expect(composition.featureRoutingRegistry).toBeDefined();
        expect(composition.featureMetrics.getFeatureMetrics('todo')?.counters.get('todo.mountCount')).toBeGreaterThan(
            0
        );
        expect(composition.shellContext).toBe(todoContext.parent);

        composition.featureMountManager.destroy();
        composition.shellRouter.destroy();
        composition.shellContext.destroy();
    });

    test('it should unmount todo feature when route is outside mounted partition', async () => {
        const todoContext = new GenericApplicationContext('todo');
        const composition = composeTodoRuntime(todoContext);

        await composition.shellRouter.setRoute('/account');

        expect(composition.featureMountManager.isMounted('todo')).toBe(false);
        expect(composition.featureMountManager.isMounted('account')).toBe(true);
        expect(composition.featureMetrics.getFeatureMetrics('todo')?.counters.get('todo.unmountCount')).toBeGreaterThan(
            0
        );
        expect(
            composition.featureMetrics.getFeatureMetrics('account')?.counters.get('account.activateCount')
        ).toBeGreaterThan(0);

        composition.featureMountManager.destroy();
        composition.shellRouter.destroy();
        composition.shellContext.destroy();
    });

    test('it should unmount account feature when routing back to todo partition', async () => {
        const todoContext = new GenericApplicationContext('todo');
        const composition = composeTodoRuntime(todoContext);

        await composition.shellRouter.setRoute('/account');
        expect(composition.featureMountManager.isMounted('account')).toBe(true);

        await composition.shellRouter.setRoute('/todo/active');

        expect(composition.featureMountManager.isMounted('todo')).toBe(true);
        expect(composition.featureMountManager.isMounted('account')).toBe(false);

        composition.featureMountManager.destroy();
        composition.shellRouter.destroy();
        composition.shellContext.destroy();
    });
});
