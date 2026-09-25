/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MissingParameterError, MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { BrowserSessionStorageValueMethodArgumentResolver } from '../src/session-storage-argument-resolver';

describe('BrowserSessionStorageValueMethodArgumentResolver', () => {
    let resolver: BrowserSessionStorageValueMethodArgumentResolver;
    const originalSessionStorage = globalThis.sessionStorage;

    beforeEach(() => {
        resolver = new BrowserSessionStorageValueMethodArgumentResolver();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalSessionStorage) {
            vi.stubGlobal('sessionStorage', originalSessionStorage);
        }
    });

    test('supports session-storage value parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.SESSION_STORAGE, 'sessionId');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-session-storage parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'sessionId');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('resolves session storage values by name', () => {
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn((name: string) => (name === 'sessionId' ? 'abc-123' : null)),
        });

        const parameter = new MethodParameter(MethodParameterType.SESSION_STORAGE, 'sessionId');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {});

        expect(value).toBe('abc-123');
    });

    test('sessionStorageValue() with no name binds the whole jar', () => {
        vi.stubGlobal('sessionStorage', {
            length: 2,
            key: vi.fn((i: number) => (i === 0 ? 'theme' : 'sessionId')),
            getItem: vi.fn((name: string) => (name === 'theme' ? 'dark' : 'abc-123')),
        });

        const parameter = new MethodParameter(MethodParameterType.SESSION_STORAGE, '');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {});

        expect(value).toEqual({ theme: 'dark', sessionId: 'abc-123' });
    });

    test('uses default value when session value is absent', () => {
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn(() => null),
        });

        const parameter = new MethodParameter(MethodParameterType.SESSION_STORAGE, 'sessionId', false, 'fallback-id');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {});

        expect(value).toBe('fallback-id');
    });

    test('throws when required session value is absent', () => {
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn(() => null),
        });

        const parameter = new MethodParameter(MethodParameterType.SESSION_STORAGE, 'sessionId', true);

        expect(() => resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {})).toThrow(
            /parameter 'sessionId' is missing/
        );
    });

    test('applies type-based conversion when convertType is provided', () => {
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn(() => 'true'),
        });

        const parameter = new MethodParameter(MethodParameterType.SESSION_STORAGE, 'sessionId', false, null, {
            source: String,
            target: Boolean,
        });
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {});

        expect(value).toBe(true);
    });

    test('applies number conversion when convertType is provided', () => {
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn(() => '42'),
        });

        const parameter = new MethodParameter(MethodParameterType.SESSION_STORAGE, 'count', false, null, {
            source: String,
            target: Number,
        });
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {});

        expect(value).toBe(42);
    });
});
