import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MethodParameter, MethodParameterType, bindValue } from '@blue/dispatcher';
import { BrowserBindMethodArgumentResolver } from '../src/bind-argument-resolver';
import { argumentValueConverters } from '../src/argument-value-converter';

describe('BrowserBindMethodArgumentResolver', () => {
    let resolver: BrowserBindMethodArgumentResolver;

    beforeEach(() => {
        resolver = new BrowserBindMethodArgumentResolver();
        vi.restoreAllMocks();
    });

    test('supports bind parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.BIND, 'query');
        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('binds and unflattens query data', () => {
        const parameter = new MethodParameter(MethodParameterType.BIND, 'query');
        const route = {
            data: {
                'user.name': 'Jeff',
                'user.age': '30',
                'tags[0]': 'blue',
                'tags[1]': 'js',
            },
        } as any;

        const result = resolver.resolveArgument(parameter, route, {});
        expect(result).toEqual({
            user: { name: 'Jeff', age: '30' },
            tags: ['blue', 'js'],
        });
    });

    test('binds with prefix', () => {
        const parameter = new MethodParameter(MethodParameterType.BIND, 'query', false, null, null, 'user.');
        const route = {
            data: {
                'user.name': 'Jeff',
                'user.age': '30',
                'other.field': 'ignored',
            },
        } as any;

        const result = resolver.resolveArgument(parameter, route, {});
        expect(result).toEqual({
            name: 'Jeff',
            age: '30',
        });
    });

    test('applies converter after unflattening', () => {
        const converter = (val: any) => ({ ...val, age: Number(val.age) });
        const parameter = new MethodParameter(MethodParameterType.BIND, 'query', false, null, converter, 'user.');
        const route = {
            data: {
                'user.name': 'Jeff',
                'user.age': '30',
            },
        } as any;

        const result = resolver.resolveArgument(parameter, route, {});
        expect(result).toEqual({
            name: 'Jeff',
            age: 30,
        });
    });
});
