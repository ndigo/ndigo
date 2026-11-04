/**
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MissingParameterError, MethodParameter, MethodParameterType } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';

describe('BrowserCookieValueMethodArgumentResolver', () => {
    let resolver: BrowserCookieValueMethodArgumentResolver;
    const originalCookie = document.cookie;

    beforeEach(() => {
        resolver = new BrowserCookieValueMethodArgumentResolver();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalCookie !== undefined) {
            // Reassign onto the (possibly stubbed) document object.
            const cookieTarget = document as unknown as { cookie: unknown };
            cookieTarget.cookie = originalCookie;
        }
    });

    test('supports cookie parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'sessionId');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-cookie parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'sessionId');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('resolves cookie values by name', () => {
        vi.stubGlobal('document', { cookie: 'sessionId=abc-123' });

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'sessionId');
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toBe('abc-123');
    });

    test('cookieValue() with no name binds the whole cookie jar', () => {
        vi.stubGlobal('document', { cookie: 'sessionId=abc-123; theme=dark' });

        const parameter = new MethodParameter(MethodParameterType.COOKIE, '');
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toEqual({ sessionId: 'abc-123', theme: 'dark' });
    });

    test('uses default value when cookie is absent', () => {
        vi.stubGlobal('document', { cookie: '' });

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'sessionId', false, 'fallback-id');
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toBe('fallback-id');
    });

    test('throws when required cookie is absent', () => {
        vi.stubGlobal('document', { cookie: '' });

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'sessionId', true);

        expect(() => resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {})).toThrow(
            /parameter 'sessionId' is missing/
        );
    });

    test('applies type-based conversion when convertType is provided', () => {
        vi.stubGlobal('document', { cookie: 'count=42' });

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'count', false, null, {
            source: String,
            target: Number,
        });
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toBe(42);
    });

    test('applies boolean conversion when convertType is provided', () => {
        vi.stubGlobal('document', { cookie: 'active=true' });

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'active', false, null, {
            source: String,
            target: Boolean,
        });
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toBe(true);
    });
});
