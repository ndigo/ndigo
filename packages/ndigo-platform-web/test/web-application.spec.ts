/**
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { DISPATCHER, VIEW_TARGET } from '@ndigo/dispatcher';
import { ROUTER } from '@ndigo/router';
import type { RouterInterceptor } from '@ndigo/router';
import { HashRouter } from '../src/hash-router';
import { createWebApplication } from '../src/web-application';
import type { CreateWebApplicationOptions, WebApplication } from '../src/web-application';

class WebTestConfiguration {}

describe('createWebApplication', () => {
    let apps: WebApplication[] = [];

    beforeEach(() => {
        document.body.innerHTML = '<div id="app"></div>';
        globalThis.location.hash = '';
        apps = [];
    });

    afterEach(() => {
        for (const app of apps) {
            app.destroy();
        }
    });

    async function boot(options: Partial<CreateWebApplicationOptions> = {}): Promise<WebApplication> {
        const app = await createWebApplication([WebTestConfiguration], { autoNavigate: false, ...options });
        apps.push(app);
        return app;
    }

    test('boots WebAutoConfiguration, resolves #app, and registers the runtime tokens', async () => {
        const app = await boot();

        expect(app.context.hasValue('handlerMapping')).toBe(true);
        expect(app.viewTarget.container).toBe(document.getElementById('app'));
        expect(app.context.getValue(VIEW_TARGET)).toBe(app.viewTarget);
        expect(app.context.getValue(DISPATCHER)).toBe(app.dispatcher);
        expect(app.context.getValue(ROUTER)).toBe(app.router);
    });

    test('accepts an element as root', async () => {
        const element = document.createElement('main');
        document.body.append(element);

        const app = await boot({ root: element });

        expect(app.viewTarget.container).toBe(element);
    });

    test('accepts an id with or without the # prefix', async () => {
        document.body.insertAdjacentHTML('beforeend', '<div id="stage"></div>');

        const app = await boot({ root: 'stage' });

        expect(app.viewTarget.container).toBe(document.getElementById('stage'));
    });

    test('a missing root throws IllegalStateError', async () => {
        await expect(
            createWebApplication([WebTestConfiguration], { root: 'missing', autoNavigate: false })
        ).rejects.toThrow(/no element with id "missing"/);
    });

    test('auto-navigates to the path the URL already addresses', async () => {
        globalThis.location.hash = '#/item/7';
        const navigate = vi.spyOn(HashRouter.prototype, 'navigate');
        try {
            await boot({ autoNavigate: true });

            expect(navigate).toHaveBeenCalledWith('/item/7');
        } finally {
            navigate.mockRestore();
        }
    });

    test('auto-navigates to / when the URL carries no hash route', async () => {
        const navigate = vi.spyOn(HashRouter.prototype, 'navigate');
        try {
            await boot({ autoNavigate: true });

            expect(navigate).toHaveBeenCalledWith('/');
        } finally {
            navigate.mockRestore();
        }
    });

    test('auto-navigates to initialPath when given', async () => {
        const navigate = vi.spyOn(HashRouter.prototype, 'navigate');
        try {
            await boot({ autoNavigate: true, initialPath: '/custom' });

            expect(navigate).toHaveBeenCalledWith('/custom');
        } finally {
            navigate.mockRestore();
        }
    });

    test('autoNavigate: false skips the first navigation', async () => {
        const navigate = vi.spyOn(HashRouter.prototype, 'navigate');
        try {
            await boot();

            expect(navigate).not.toHaveBeenCalled();
        } finally {
            navigate.mockRestore();
        }
    });

    test('beforeNavigate runs after the runtime is wired and before navigation', async () => {
        const order: string[] = [];
        const navigate = vi.spyOn(HashRouter.prototype, 'navigate').mockImplementation(async () => {
            order.push('navigate');
        });
        try {
            await boot({
                autoNavigate: true,
                beforeNavigate: (booted) => {
                    order.push('beforeNavigate');
                    expect(booted.context.getValue(ROUTER)).toBe(booted.router);
                    expect(booted.context.getValue(DISPATCHER)).toBe(booted.dispatcher);
                },
            });

            expect(order).toEqual(['beforeNavigate', 'navigate']);
        } finally {
            navigate.mockRestore();
        }
    });

    test('installs the given interceptors on the router', async () => {
        const interceptor: RouterInterceptor = { preHandle: () => true };
        const addInterceptor = vi.spyOn(HashRouter.prototype, 'addInterceptor');
        try {
            await boot({ interceptors: [interceptor] });

            expect(addInterceptor).toHaveBeenCalledWith(interceptor);
        } finally {
            addInterceptor.mockRestore();
        }
    });

    test('destroy() tears down the router, view target, and context, and is idempotent', async () => {
        const app = await boot();

        app.destroy();
        app.destroy();

        expect(app.router.destroyed).toBe(true);
        expect(app.viewTarget.destroyed).toBe(true);
        expect(app.context.isActive).toBe(false);
    });

    test('applies the name, profiles, and properties to the context', async () => {
        const app = await boot({
            name: 'test-web-app',
            profiles: ['test'],
            properties: { 'probe.value': 'set' },
        });

        expect(app.context.name).toBe('test-web-app');
        expect(app.context.environment.activeProfiles).toContain('test');
        expect(app.context.environment.getProperty('probe.value')).toBe('set');
    });
});
