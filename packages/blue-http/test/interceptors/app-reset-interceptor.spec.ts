import { describe, test, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { http as mswHttp, HttpResponse } from 'msw';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { AppResetInterceptor } from '../../src/interceptors/app-reset-interceptor';

describe('AppResetInterceptor', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    afterEach(() => {
        server.resetHandlers();
    });

    afterAll(() => server.close());

    test('should not reload when header is absent', async () => {
        const mockReload = vi.fn();
        const interceptor = new AppResetInterceptor(mockReload);
        const http = new HTTP([interceptor]);

        // base handler at /app-reset/normal returns 200 with no Alt-Location header
        let response: any;
        try {
            response = await http.request('http://localhost/app-reset/normal');
        } catch (error) {
            response = error;
        }

        // No NotOKInterceptor in chain — 200 is returned as a plain Response
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(200);
        expect(mockReload).not.toHaveBeenCalled();
    });

    test('should not reload on localhost', async () => {
        const mockReload = vi.fn();
        const interceptor = new AppResetInterceptor(mockReload);
        const http = new HTTP([interceptor]);

        // Override handler: 205 + Alt-Location, but hostname is localhost → no reload
        server.use(
            mswHttp.get('http://localhost/app-reset/205', () => {
                return HttpResponse.text('reset', {
                    status: 205,
                    headers: { 'Alt-Location': '/reset' },
                });
            })
        );

        let response: any;
        try {
            response = await http.request('http://localhost/app-reset/205');
        } catch (error) {
            response = error;
        }

        // No NotOKInterceptor — 205 is returned as a plain Response
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(205);
        expect(mockReload).not.toHaveBeenCalled();
    });

    test('should reload when status 205 + header present + non-localhost URL', async () => {
        const mockReload = vi.fn();
        const interceptor = new AppResetInterceptor(mockReload);

        // Use a plain mock to avoid MSW's patched Response constructor rejecting status 205
        const mockResponse = {
            status: 205,
            headers: new Headers({ 'Alt-Location': '/reset' }),
            url: 'http://example.com/reset',
        } as unknown as Response;

        await interceptor.postResponse(mockResponse, {});

        expect(mockReload).toHaveBeenCalled();
    });

    test('should reload when status 303 + header present + non-localhost URL', async () => {
        const mockReload = vi.fn();
        const interceptor = new AppResetInterceptor(mockReload);

        const mockResponse = {
            status: 303,
            headers: new Headers({ 'Alt-Location': '/reset' }),
            url: 'http://example.com/reset',
        } as unknown as Response;

        await interceptor.postResponse(mockResponse, {});

        expect(mockReload).toHaveBeenCalled();
    });

    test('should not reload when status is 200', async () => {
        const mockReload = vi.fn();
        const interceptor = new AppResetInterceptor(mockReload);

        const mockResponse = {
            status: 200,
            headers: new Headers({ 'Alt-Location': '/reset' }),
            url: 'http://example.com/reset',
        } as unknown as Response;

        await interceptor.postResponse(mockResponse, {});

        expect(mockReload).not.toHaveBeenCalled();
    });

    test('should use custom appResetHeader and appResetCode via settings', async () => {
        const mockReload = vi.fn();
        const interceptor = new AppResetInterceptor(mockReload);

        const mockResponse = {
            status: 202,
            headers: new Headers({ 'X-Reset': '/reset' }),
            url: 'http://example.com/reset',
        } as unknown as Response;

        await interceptor.postResponse(mockResponse, {
            appResetHeader: 'X-Reset',
            appResetCode: 202,
        });

        expect(mockReload).toHaveBeenCalled();
    });
});
