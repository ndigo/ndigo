/**
 * @module ndigo-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HTTP, HTTPInit } from '../src/http';

describe('HTTP Client - Default Headers', () => {
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockFetch = vi.fn(() => Promise.resolve(new Response('{}', { status: 200 })));
        vi.stubGlobal('fetch', mockFetch);
    });

    it('should send default headers defined at the instance level', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            headers: {
                Authorization: 'Bearer instance-token',
                'X-Instance-Header': 'instance-value',
            },
        });

        await http.get('/users');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        expect(request.headers.get('Authorization')).toBe('Bearer instance-token');
        expect(request.headers.get('X-Instance-Header')).toBe('instance-value');
    });

    it('should merge per-request headers with instance default headers', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            headers: {
                Authorization: 'Bearer instance-token',
                'X-Instance-Header': 'instance-value',
            },
        });

        await http.get('/users', {
            headers: {
                'X-Request-Header': 'request-value',
            },
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        expect(request.headers.get('Authorization')).toBe('Bearer instance-token');
        expect(request.headers.get('X-Instance-Header')).toBe('instance-value');
        expect(request.headers.get('X-Request-Header')).toBe('request-value');
    });

    it('should allow per-request headers to override instance-level headers (case-insensitively)', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            headers: {
                Authorization: 'Bearer instance-token',
                'X-Custom-Header': 'instance-value',
            },
        });

        await http.post('/data', {
            headers: {
                authorization: 'Bearer request-token', // Lowercase to test case-insensitivity
                'x-custom-header': 'request-override', // Lowercase to test case-insensitivity
            },
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        expect(request.headers.get('Authorization')).toBe('Bearer request-token');
        expect(request.headers.get('X-Custom-Header')).toBe('request-override');
    });

    it('should send only per-request headers if no instance defaults are provided', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
        });

        await http.put('/resource', {
            headers: {
                'Content-Type': 'application/xml',
                'X-Only-Request': 'true',
            },
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        expect(request.headers.get('Content-Type')).toBe('application/xml');
        expect(request.headers.get('X-Only-Request')).toBe('true');
        expect(request.headers.get('Authorization')).toBeNull(); // Ensure no unexpected headers
    });

    it('should send no headers if neither instance defaults nor request headers are provided', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
        });

        await http.get('/status');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        // The Request object might add some default headers itself, so we check for our custom ones
        expect(request.headers.get('Authorization')).toBeNull();
        expect(request.headers.get('X-Custom-Header')).toBeNull();
    });

    it('should handle undefined headers gracefully', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            headers: undefined, // Explicitly undefined
        } as HTTPInit);

        await http.get('/test', {
            headers: undefined, // Explicitly undefined
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        expect(request.headers.get('Authorization')).toBeNull();
    });

    it('should handle null headers gracefully', async () => {
        const http = HTTP.create({
            baseURL: 'https://api.example.com',
            headers: null, // Explicitly null
        } as unknown as HTTPInit);

        await http.get('/test', {
            headers: null as unknown as HeadersInit, // Explicitly null
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const request = mockFetch.mock.calls[0][0] as Request;
        expect(request.headers.get('Authorization')).toBeNull();
    });
});
