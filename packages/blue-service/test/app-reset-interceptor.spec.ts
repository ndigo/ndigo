import { afterEach, describe, expect, test, vi } from 'vitest';
import { AppResetInterceptor } from '../src/app-reset-interceptor';

describe('AppResetInterceptor', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('it should reload browser when status and header match', async () => {
        const reload = vi.fn();
        vi.stubGlobal('location', {
            hostname: 'bluejs.dev',
            reload,
        });

        const interceptor = new AppResetInterceptor();
        const response = new Response(null, {
            status: 205,
            headers: {
                'Alt-Location': '/home',
            },
        });

        await interceptor.postSuccess(response, {});

        expect(reload).toHaveBeenCalledOnce();
    });

    test('it should not reload browser on localhost', async () => {
        const reload = vi.fn();
        vi.stubGlobal('location', {
            hostname: 'localhost',
            reload,
        });

        const interceptor = new AppResetInterceptor();
        const response = new Response(null, {
            status: 205,
            headers: {
                'Alt-Location': '/home',
            },
        });

        await interceptor.postSuccess(response, {});

        expect(reload).not.toHaveBeenCalled();
    });

    test('it should not reload browser when header does not exist', async () => {
        const reload = vi.fn();
        vi.stubGlobal('location', {
            hostname: 'bluejs.dev',
            reload,
        });

        const interceptor = new AppResetInterceptor();
        const response = new Response(null, {
            status: 205,
        });

        await interceptor.postSuccess(response, {});

        expect(reload).not.toHaveBeenCalled();
    });
});
