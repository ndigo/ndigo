import { describe, test, expect } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { BrowserModelValueMethodArgumentResolver } from '../src/model-argument-resolver';

describe('BrowserModelValueMethodArgumentResolver', () => {
    const resolver = new BrowserModelValueMethodArgumentResolver();

    test('supports model parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.MODEL, 'profile');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-model parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'profile');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('resolves direct model value from route data', () => {
        const parameter = new MethodParameter(MethodParameterType.MODEL, 'profile');
        const route = {
            data: {
                profile: { name: 'Blue', role: 'admin' },
            },
        } as any;

        const value = resolver.resolveArgument(parameter, route, {} as any);

        expect(value).toEqual({ name: 'Blue', role: 'admin' });
    });

    test('resolves dotted model key path from route data', () => {
        const parameter = new MethodParameter(MethodParameterType.MODEL, 'profile.name');
        const route = {
            data: {
                profile: { name: 'Blue', role: 'admin' },
            },
        } as any;

        const value = resolver.resolveArgument(parameter, route, {} as any);

        expect(value).toBe('Blue');
    });

    test('uses default value when model value is absent', () => {
        const parameter = new MethodParameter(MethodParameterType.MODEL, 'profile', false, 'guest');
        const route = { data: {} } as any;

        const value = resolver.resolveArgument(parameter, route, {} as any);

        expect(value).toBe('guest');
    });

    test('applies converter when provided', () => {
        const converter = (value) => `${value}`.toUpperCase();
        const convertingResolver = new BrowserModelValueMethodArgumentResolver(converter);
        const parameter = new MethodParameter(MethodParameterType.MODEL, 'profile.name');
        const route = {
            data: {
                profile: { name: 'Blue', role: 'admin' },
            },
        } as any;

        const value = convertingResolver.resolveArgument(parameter, route, {} as any);

        expect(value).toBe('BLUE');
    });
});
