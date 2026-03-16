import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { BrowserStateValueMethodArgumentResolver } from '../src/state-argument-resolver';
import { argumentValueConverters } from '../src/argument-value-converter';

describe('BrowserStateValueMethodArgumentResolver', () => {
    let resolver: BrowserStateValueMethodArgumentResolver;

    beforeEach(() => {
        resolver = new BrowserStateValueMethodArgumentResolver();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('supports state parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.STATE, 'token');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-state parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'token');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('resolves values from browser history state', () => {
        vi.stubGlobal('history', {
            state: {
                token: 'abc123',
            },
        });

        const parameter = new MethodParameter(MethodParameterType.STATE, 'token');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe('abc123');
    });

    test('uses default value when state value is absent', () => {
        vi.stubGlobal('history', {
            state: {},
        });

        const parameter = new MethodParameter(MethodParameterType.STATE, 'token', false, 'guest-token');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe('guest-token');
    });

    test('throws when required state value is absent', () => {
        vi.stubGlobal('history', {
            state: {},
        });

        const parameter = new MethodParameter(MethodParameterType.STATE, 'token', true);

        expect(() => resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any)).toThrow(
            '"token" cannot be undefined or null'
        );
    });

    test('applies converter when provided', () => {
        vi.stubGlobal('history', {
            state: {
                token: '123',
            },
        });

        const converter = (value) => Number(value);
        const convertingResolver = new BrowserStateValueMethodArgumentResolver(converter);
        const parameter = new MethodParameter(MethodParameterType.STATE, 'token');
        const value = convertingResolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe(123);
    });

    test('prefers parameter converter over resolver converter', () => {
        vi.stubGlobal('history', {
            state: {
                token: '1',
            },
        });

        const resolver = new BrowserStateValueMethodArgumentResolver(argumentValueConverters.boolean);
        const parameter = new MethodParameter(
            MethodParameterType.STATE,
            'token',
            false,
            null,
            argumentValueConverters.number
        );
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe(1);
    });
});
