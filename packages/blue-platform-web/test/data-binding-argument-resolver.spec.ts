/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { BrowserDataBindingMethodArgumentResolver } from '../src/data-binding-argument-resolver';

describe('BrowserDataBindingMethodArgumentResolver', () => {
    test('supports data-binding parameters', () => {
        const resolver = new BrowserDataBindingMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.data('query'), 'query');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('supports the full browser bindable-source allow-list', () => {
        const resolver = new BrowserDataBindingMethodArgumentResolver();
        for (const source of ['query', 'cookie', 'session-storage', 'local-storage']) {
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.data(source), source))).toBe(
                true
            );
        }
    });

    test('does not support non-data-binding parameters', () => {
        const resolver = new BrowserDataBindingMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'query');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('does not support node-only data sources', () => {
        const resolver = new BrowserDataBindingMethodArgumentResolver();
        expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.data('body'), 'body'))).toBe(false);
    });

    test('binds and unflattens query data', () => {
        const resolver = new BrowserDataBindingMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.data('query'), 'query');
        const value = resolver.resolveArgument(
            parameter,
            { data: { name: 'Jeff', age: '30' } } as unknown as Route,
            {}
        );

        expect(value).toEqual({ name: 'Jeff', age: '30' });
    });

    test('nests dotted keys into an object via DataBinder (D-3)', () => {
        const resolver = new BrowserDataBindingMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.data('query'), 'query');
        const value = resolver.resolveArgument(
            parameter,
            { data: { 'address.city': 'Y', 'address.street': 'X', name: 'Jeff' } } as unknown as Route,
            {}
        );

        expect(value).toEqual({ address: { city: 'Y', street: 'X' }, name: 'Jeff' });
    });

    test('binds with prefix', () => {
        const resolver = new BrowserDataBindingMethodArgumentResolver();
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

    test('binds object data without nested conversion', () => {
        const resolver = new BrowserDataBindingMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.data('query'), 'query');
        const value = resolver.resolveArgument(
            parameter,
            { data: { name: 'Jeff', age: '30' } } as unknown as Route,
            {}
        );

        expect(value).toEqual({ name: 'Jeff', age: '30' });
    });
});
