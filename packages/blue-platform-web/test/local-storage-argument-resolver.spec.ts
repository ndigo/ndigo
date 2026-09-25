/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MissingParameterError, MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { BrowserStorageValueMethodArgumentResolver } from '../src/browser-storage-argument-resolver';

describe('BrowserLocalStorageValueMethodArgumentResolver', () => {
    let resolver: BrowserStorageValueMethodArgumentResolver;
    const originalLocalStorage = globalThis.localStorage;

    beforeEach(() => {
        resolver = new BrowserStorageValueMethodArgumentResolver(
            () => globalThis.localStorage,
            MethodParameterType.LOCAL_STORAGE,
            'BrowserLocalStorageValueMethodArgumentResolver'
        );
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalLocalStorage) {
            vi.stubGlobal('localStorage', originalLocalStorage);
        }
    });

    test('supports local-storage value parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.LOCAL_STORAGE, 'token');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-local-storage parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'token');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('resolves local storage values by name', () => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((name: string) => (name === 'token' ? 'abc-123' : null)),
        });

        const parameter = new MethodParameter(MethodParameterType.LOCAL_STORAGE, 'token');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {});

        expect(value).toBe('abc-123');
    });

    test('localStorageValue() with no name binds the whole jar', () => {
        vi.stubGlobal('localStorage', {
            length: 1,
            key: vi.fn(() => 'token'),
            getItem: vi.fn(() => 'abc-123'),
        });

        const parameter = new MethodParameter(MethodParameterType.LOCAL_STORAGE, '');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {});

        expect(value).toEqual({ token: 'abc-123' });
    });

    test('uses default value when local value is absent', () => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(() => null),
        });

        const parameter = new MethodParameter(MethodParameterType.LOCAL_STORAGE, 'token', false, 'fallback-id');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {});

        expect(value).toBe('fallback-id');
    });

    test('throws when required local value is absent', () => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(() => null),
        });

        const parameter = new MethodParameter(MethodParameterType.LOCAL_STORAGE, 'token', true);

        expect(() => resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {})).toThrow(
            /parameter 'token' is missing/
        );
    });

    test('applies type-based conversion when convertType is provided', () => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(() => '42'),
        });

        const parameter = new MethodParameter(MethodParameterType.LOCAL_STORAGE, 'count', false, null, {
            source: String,
            target: Number,
        });
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as unknown as Route, {});

        expect(value).toBe(42);
    });
});
