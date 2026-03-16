import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { BrowserSessionValueMethodArgumentResolver } from '../src/session-argument-resolver';
import { argumentValueConverters } from '../src/argument-value-converter';

describe('BrowserSessionValueMethodArgumentResolver', () => {
    let resolver: BrowserSessionValueMethodArgumentResolver;
    const originalSessionStorage = globalThis.sessionStorage;

    beforeEach(() => {
        resolver = new BrowserSessionValueMethodArgumentResolver();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalSessionStorage) {
            vi.stubGlobal('sessionStorage', originalSessionStorage);
        }
    });

    test('supports session value parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.SESSION, 'sessionId');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-session parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'sessionId');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('resolves session storage values by name', () => {
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn((name: string) => (name === 'sessionId' ? 'abc-123' : null)),
        });

        const parameter = new MethodParameter(MethodParameterType.SESSION, 'sessionId');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe('abc-123');
    });

    test('uses default value when session value is absent', () => {
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn(() => null),
        });

        const parameter = new MethodParameter(MethodParameterType.SESSION, 'sessionId', false, 'fallback-id');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe('fallback-id');
    });

    test('throws when required session value is absent', () => {
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn(() => null),
        });

        const parameter = new MethodParameter(MethodParameterType.SESSION, 'sessionId', true);

        expect(() => resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any)).toThrow(
            '"sessionId" cannot be undefined or null'
        );
    });

    test('applies converter when provided', () => {
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn(() => 'true'),
        });

        const converter = (value) => value === 'true';
        const convertingResolver = new BrowserSessionValueMethodArgumentResolver(converter);
        const parameter = new MethodParameter(MethodParameterType.SESSION, 'sessionId');
        const value = convertingResolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe(true);
    });

    test('prefers parameter converter over resolver converter', () => {
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn(() => '1'),
        });

        const resolver = new BrowserSessionValueMethodArgumentResolver(argumentValueConverters.boolean);
        const parameter = new MethodParameter(
            MethodParameterType.SESSION,
            'sessionId',
            false,
            null,
            argumentValueConverters.number
        );
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe(1);
    });
});
