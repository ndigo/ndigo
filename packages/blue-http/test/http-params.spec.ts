/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HTTP, HTTPInit } from '../src/http';

describe('HTTP Client - Default Query Parameters', () => {
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockFetch = vi.fn(() => Promise.resolve(new Response('{}', { status: 200 })));
        vi.stubGlobal('fetch', mockFetch);
    });

    it('should send default query parameters defined at the instance level', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            params: {
                apiKey: 'instance-key',
                version: 'v1',
            },
        });

        await http.get('/users');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.get('apiKey')).toBe('instance-key');
        expect(url.searchParams.get('version')).toBe('v1');
    });

    it('should merge per-request query parameters with instance default parameters', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            params: {
                apiKey: 'instance-key',
                version: 'v1',
            },
        });

        await http.get('/users', {
            params: {
                userType: 'admin',
            },
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.get('apiKey')).toBe('instance-key');
        expect(url.searchParams.get('version')).toBe('v1');
        expect(url.searchParams.get('userType')).toBe('admin');
    });

    it('should allow per-request query parameters to override instance-level parameters', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            params: {
                apiKey: 'instance-key',
                version: 'v1',
            },
        });

        await http.get('/data', {
            params: {
                apiKey: 'request-key',
                version: 'v2',
            },
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.get('apiKey')).toBe('request-key');
        expect(url.searchParams.get('version')).toBe('v2');
    });

    it('should send only per-request parameters if no instance defaults are provided', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
        });

        await http.get('/resource', {
            params: {
                id: '123',
                format: 'json',
            },
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.get('id')).toBe('123');
        expect(url.searchParams.get('format')).toBe('json');
        expect(url.searchParams.get('apiKey')).toBeNull(); // Ensure no unexpected params
    });

    it('should send no query parameters if neither instance defaults nor request parameters are provided', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
        });

        await http.get('/status');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.toString()).toBe('');
    });

    it('should handle existing query parameters in the input URL correctly', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            params: {
                defaultParam: 'default-value',
            },
        });

        await http.get('/search?query=test&existing=true', {
            params: {
                requestParam: 'request-value',
            },
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.get('query')).toBe('test');
        expect(url.searchParams.get('existing')).toBe('true');
        expect(url.searchParams.get('defaultParam')).toBe('default-value');
        expect(url.searchParams.get('requestParam')).toBe('request-value');
    });

    it('should handle overriding existing URL query parameters with instance params', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            params: {
                query: 'instance-query-override',
            },
        });

        await http.get('/search?query=original-query');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.get('query')).toBe('instance-query-override');
    });

    it('should handle overriding existing URL query parameters with request params', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            params: {
                query: 'instance-query',
            },
        });

        await http.get('/search?query=original-query', {
            params: {
                query: 'request-query-override',
            },
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.get('query')).toBe('request-query-override');
    });

    it('should handle undefined params gracefully', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            params: undefined,
        } as HTTPInit);

        await http.get('/test', {
            params: undefined,
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.toString()).toBe('');
    });

    it('should handle null params gracefully', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            params: null,
        } as HTTPInit);

        await http.get('/test', {
            params: null,
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.toString()).toBe('');
    });
});
