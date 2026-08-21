import { describe, expect, test } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { BrowserModelValueMethodArgumentResolver } from '../src/model-argument-resolver';

describe('BrowserModelValueMethodArgumentResolver', () => {
    test('supports model parameters', () => {
        const resolver = new BrowserModelValueMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.MODEL, 'profile');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-model parameters', () => {
        const resolver = new BrowserModelValueMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'profile');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('resolves direct model value from route data', () => {
        const resolver = new BrowserModelValueMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.MODEL, 'name');
        const value = resolver.resolveArgument(parameter, { data: { name: 'Jeff' } } as any, {} as any);

        expect(value).toBe('Jeff');
    });

    test('resolves dotted model key path from route data', () => {
        const resolver = new BrowserModelValueMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.MODEL, 'profile.name');
        const value = resolver.resolveArgument(parameter, { data: { profile: { name: 'Jeff' } } } as any, {} as any);

        expect(value).toBe('Jeff');
    });

    test('uses default value when model value is absent', () => {
        const resolver = new BrowserModelValueMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.MODEL, 'name', false, 'default');
        const value = resolver.resolveArgument(parameter, { data: {} } as any, {} as any);

        expect(value).toBe('default');
    });

    test('applies type-based conversion when convertType is provided', () => {
        const resolver = new BrowserModelValueMethodArgumentResolver();
        const parameter = new MethodParameter(
            MethodParameterType.MODEL,
            'count',
            false,
            null,
            { source: String, target: Number }
        );
        const value = resolver.resolveArgument(parameter, { data: { count: '42' } } as any, {} as any);

        expect(value).toBe(42);
    });

    test('applies boolean conversion when convertType is provided', () => {
        const resolver = new BrowserModelValueMethodArgumentResolver();
        const parameter = new MethodParameter(
            MethodParameterType.MODEL,
            'active',
            false,
            null,
            { source: String, target: Boolean }
        );
        const value = resolver.resolveArgument(parameter, { data: { active: 'true' } } as any, {} as any);

        expect(value).toBe(true);
    });
});
