/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { installSynchronousAnimationFrames } from '@ndigo/test';
import { Route } from '@ndigo/router';
import { createTodoContext } from '../src/todo-context';
import { composeTodoRuntime } from '../src/shell-composition';

/**
 * Drives the REAL composed todo runtime (shell context, feature mounts,
 * BrowserDispatcher, DOM view target) end-to-end under jsdom: dispatch a route
 * through the composed runtime's dispatcher and assert the real DOM render —
 * not stubbed contexts, not model-only capture.
 */

// AbstractWebComponent.requestUpdate() renders via requestAnimationFrame,
// which never fires in jsdom — fire it synchronously (same as todo-app-view.spec).
installSynchronousAnimationFrames();

function makeRoute(path: string): Route {
    return { path, raw: path, id: 1, data: {}, params: null, length: 0, attributes: {} } as unknown as Route;
}

describe('composed todo runtime end-to-end', () => {
    let dispatch: (path: string) => Promise<void>;
    let dispose: () => void;

    beforeAll(async () => {
        const appEl = document.createElement('div');
        appEl.id = 'app';
        document.body.appendChild(appEl);

        const runtime = await composeTodoRuntime(await createTodoContext());
        dispatch = (path: string) => runtime.dispatcher.dispatch(makeRoute(path));
        dispose = () => {
            runtime.shellContext.close();
            appEl.remove();
        };
    });

    afterAll(() => {
        dispose();
    });

    test('boots the real runtime: shell context + feature mount + DOM render', async () => {
        // The real app booted: composed runtime constructed without throwing,
        // feature routing registry present, dispatcher wired.
        await dispatch('/');
        const todoApp = document.querySelector('#app todo-app');
        expect(todoApp).not.toBeNull();
        // Header + input shell rendered by the real view target.
        expect(todoApp?.querySelector('.todoapp')).not.toBeNull();
        expect(todoApp?.querySelector('todo-input')).not.toBeNull();
    });

    test('dispatching different filters re-renders the same shell', async () => {
        await dispatch('/active');
        const activeApp = document.querySelector('#app todo-app');
        expect(activeApp).not.toBeNull();

        await dispatch('/completed');
        const completedApp = document.querySelector('#app todo-app');
        expect(completedApp).not.toBeNull();
        expect(completedApp?.querySelector('.todoapp')).not.toBeNull();
    });
});
