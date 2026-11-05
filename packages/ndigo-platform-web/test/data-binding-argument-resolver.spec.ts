/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { MethodParameter, MethodParameterType } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { BrowserDataBindingMethodArgumentResolver } from '../src/data-binding-argument-resolver';

describe('BrowserDataBindingMethodArgumentResolver', () => {
    let resolver: BrowserDataBindingMethodArgumentResolver;

    beforeEach(() => {
        resolver = new BrowserDataBindingMethodArgumentResolver();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('supports data-binding parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.data('query'), 'query');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('supports the full browser bindable-source allow-list', () => {
        for (const source of ['query', 'cookie', 'session-storage', 'local-storage']) {
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.data(source), source))).toBe(
                true
            );
        }
    });

    test('does not support non-data-binding parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'query');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('does not support node-only data sources', () => {
        expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.data('body'), 'body'))).toBe(false);
    });

    test('binds and unflattens query data', () => {
        const parameter = new MethodParameter(MethodParameterType.data('query'), 'query');
        const value = resolver.resolveArgument(
            parameter,
            { data: { name: 'Jeff', age: '30' } } as unknown as Route,
            {}
        );

        expect(value).toEqual({ name: 'Jeff', age: '30' });
    });

    test('nests dotted keys into an object via DataBinder (D-3)', () => {
        const parameter = new MethodParameter(MethodParameterType.data('query'), 'query');
        const value = resolver.resolveArgument(
            parameter,
            { data: { 'address.city': 'Y', 'address.street': 'X', name: 'Jeff' } } as unknown as Route,
            {}
        );

        expect(value).toEqual({ address: { city: 'Y', street: 'X' }, name: 'Jeff' });
    });

    test('binds with prefix', () => {
        const parameter = new MethodParameter(
            MethodParameterType.data('query'),
            'query',
            false,
            null,
            undefined,
            'user.'
        );
        const value = resolver.resolveArgument(
            parameter,
            { data: { 'user.name': 'Jeff', 'user.age': '30', 'other.field': 'ignored' } } as unknown as Route,
            {}
        );

        expect(value).toEqual({ name: 'Jeff', age: '30' });
    });

    test('binds the whole cookie jar when data-cookie is used', () => {
        vi.stubGlobal('document', { cookie: 'theme=dark; sessionId=abc-123' });

        const parameter = new MethodParameter(MethodParameterType.data('cookie'), 'cookie');
        const value = resolver.resolveArgument(parameter, {} as unknown as Route, {});

        expect(value).toEqual({ theme: 'dark', sessionId: 'abc-123' });
    });

    test('binds the whole session-storage jar when data-session-storage is used', () => {
        vi.stubGlobal('sessionStorage', {
            length: 2,
            key: vi.fn((i: number) => (i === 0 ? 'theme' : 'sessionId')),
            getItem: vi.fn((name: string) => (name === 'theme' ? 'dark' : 'abc-123')),
        });

        const parameter = new MethodParameter(MethodParameterType.data('session-storage'), 'session-storage');
        const value = resolver.resolveArgument(parameter, {} as unknown as Route, {});

        expect(value).toEqual({ theme: 'dark', sessionId: 'abc-123' });
    });

    test('binds the whole local-storage jar when data-local-storage is used', () => {
        vi.stubGlobal('localStorage', {
            length: 1,
            key: vi.fn(() => 'token'),
            getItem: vi.fn(() => 'abc-123'),
        });

        const parameter = new MethodParameter(MethodParameterType.data('local-storage'), 'local-storage');
        const value = resolver.resolveArgument(parameter, {} as unknown as Route, {});

        expect(value).toEqual({ token: 'abc-123' });
    });

    test('binds an empty object for an unknown data source', () => {
        const parameter = new MethodParameter(MethodParameterType.data('body'), 'body');
        const value = resolver.resolveArgument(parameter, {} as unknown as Route, {});

        expect(value).toEqual({});
    });

    test('binds an empty object when storage is unavailable', () => {
        vi.stubGlobal('sessionStorage', undefined);
        vi.stubGlobal('localStorage', undefined);

        const sessionParameter = new MethodParameter(MethodParameterType.data('session-storage'), 'session-storage');
        expect(resolver.resolveArgument(sessionParameter, {} as unknown as Route, {})).toEqual({});

        const localParameter = new MethodParameter(MethodParameterType.data('local-storage'), 'local-storage');
        expect(resolver.resolveArgument(localParameter, {} as unknown as Route, {})).toEqual({});
    });
});
