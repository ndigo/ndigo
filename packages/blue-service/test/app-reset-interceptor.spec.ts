import { describe, expect, test, vi } from 'vitest';
import { AppResetInterceptor } from '../src/app-reset-interceptor';

describe('AppResetInterceptor', () => {
    test('it should reload browser when status and header match', async () => {
        const reload = vi.fn();
        const interceptor = new AppResetInterceptor(reload);
        const response = {
            status: 205,
            headers: new Headers({ 'Alt-Location': '/home' }),
            url: 'http://example.com/home',
        } as unknown as Response;

        await interceptor.postResponse(response, {});

        expect(reload).toHaveBeenCalledOnce();
    });

    test('it should not reload browser on localhost', async () => {
        const reload = vi.fn();
        const interceptor = new AppResetInterceptor(reload);
        const response = {
            status: 205,
            headers: new Headers({ 'Alt-Location': '/home' }),
            url: 'http://localhost/home',
        } as unknown as Response;

        await interceptor.postResponse(response, {});

        expect(reload).not.toHaveBeenCalled();
    });

    test('it should not reload browser when header does not exist', async () => {
        const reload = vi.fn();
        const interceptor = new AppResetInterceptor(reload);
        const response = {
            status: 205,
            headers: new Headers(),
            url: 'http://example.com/home',
        } as unknown as Response;

        await interceptor.postResponse(response, {});

        expect(reload).not.toHaveBeenCalled();
    });
});
