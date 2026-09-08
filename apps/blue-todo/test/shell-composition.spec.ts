// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { describe, expect, test, vi } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { createTodoContext } from '../src/todo-context';
import {
    ACCOUNT_ROUTE_PREFIX,
    composeTodoRuntime,
    toAccountShellRoute,
    toTodoShellRoute,
    createTodoSiteRouter,
    TODO_ROUTE_PREFIX,
} from '../src/shell-composition';

// AbstractWebComponent renders via requestAnimationFrame, which never fires in
// jsdom — fire it synchronously so dispatches render immediately.
vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
});

/**
 * Boot the REAL composed todo runtime: real createTodoContext() (ApplicationBuilder
 * + controllers + DOMElementViewTarget on #app) composed via composeTodoRuntime().
 * Mount/route tests therefore exercise real dispatch, not empty contexts.
 */
async function composeRealRuntime() {
    const appEl = document.createElement('div');
    appEl.id = 'app';
    document.body.appendChild(appEl);

    const composition = composeTodoRuntime(await createTodoContext());

    return {
        composition,
        dispose() {
            composition.featureMountManager.destroy();
            composition.shellRouter.destroy();
            composition.shellContext.destroy();
            appEl.remove();
        },
    };
}

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

    test('it should compose the real runtime with a working relay gateway', async () => {
        const { composition, dispose } = await composeRealRuntime();

        const mountedFeature = composition.featureMountManager.getMountedFeature('todo');

        expect(mountedFeature?.gateway).toBeDefined();
        expect(mountedFeature?.gateway?.activeRelayCount).toBe(1);
        expect(mountedFeature?.gateway?.blockedRelayCount).toBe(0);
        expect(composition.featureRoutingRegistry).toBeDefined();
        expect(composition.featureMetrics.getFeatureMetrics('todo')?.counters.get('todo.mountCount')).toBeGreaterThan(
            0
        );
        // The real todo feature context is a child of the shell context.
        const todoContext = composition.featureMountManager.getMountedFeature('todo')?.context;
        expect(todoContext?.parent).toBe(composition.shellContext);

        dispose();
    });

    test('it should unmount todo feature when route is outside mounted partition', async () => {
        const { composition, dispose } = await composeRealRuntime();

        await composition.shellRouter.setRoute('/account');

        expect(composition.featureMountManager.isMounted('todo')).toBe(false);
        expect(composition.featureMountManager.isMounted('account')).toBe(true);
        expect(composition.featureMetrics.getFeatureMetrics('todo')?.counters.get('todo.unmountCount')).toBeGreaterThan(
            0
        );
        expect(
            composition.featureMetrics.getFeatureMetrics('account')?.counters.get('account.activateCount')
        ).toBeGreaterThan(0);

        dispose();
    });

    test('it should unmount account feature when routing back to todo partition', async () => {
        const { composition, dispose } = await composeRealRuntime();

        await composition.shellRouter.setRoute('/account');
        expect(composition.featureMountManager.isMounted('account')).toBe(true);
        // The todo feature is unmounted (its view target no longer active) —
        // the account partition is a marker feature without a view.

        await composition.shellRouter.setRoute('/todo/active');

        expect(composition.featureMountManager.isMounted('todo')).toBe(true);
        expect(composition.featureMountManager.isMounted('account')).toBe(false);
        // The dispatch renders asynchronously (resolver chain) — wait for it.
        await vi.waitFor(() => expect(document.querySelector('#app todo-app')).not.toBeNull());

        dispose();
    });
});
