import { describe, expect, test } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { BrowserBindMethodArgumentResolver } from '../src/bind-argument-resolver';

describe('BrowserBindMethodArgumentResolver', () => {
    test('supports bind parameters', () => {
        const resolver = new BrowserBindMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.BIND, 'query');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-bind parameters', () => {
        const resolver = new BrowserBindMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'query');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('binds and unflattens query data', () => {
        const resolver = new BrowserBindMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.BIND, 'query');
        const value = resolver.resolveArgument(parameter, { data: { name: 'Jeff', age: '30' } } as any, {} as any);

        expect(value).toEqual({ name: 'Jeff', age: '30' });
    });

    test('binds with prefix', () => {
        const resolver = new BrowserBindMethodArgumentResolver();
        const parameter = new MethodParameter(
            MethodParameterType.BIND,
            'query',
            false,
            null,
            undefined,
            'user.'
        );
        const value = resolver.resolveArgument(
            parameter,
            { data: { 'user.name': 'Jeff', 'user.age': '30', 'other.field': 'ignored' } } as any,
            {} as any
        );

        expect(value).toEqual({ name: 'Jeff', age: '30' });
    });

    test('binds object data without nested conversion', () => {
        const resolver = new BrowserBindMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.BIND, 'query');
        const value = resolver.resolveArgument(
            parameter,
            { data: { name: 'Jeff', age: '30' } } as any,
            {} as any
        );

        expect(value).toEqual({ name: 'Jeff', age: '30' });
    });
});
