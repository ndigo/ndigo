import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MethodParameter, MethodParameterType, ParameterConversionError } from '@blue/dispatcher';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';
import Cookies from '../src/cookies';
import { argumentValueConverters } from '../src/argument-value-converter';

describe('BrowserCookieValueMethodArgumentResolver', () => {
    let resolver: BrowserCookieValueMethodArgumentResolver;

    beforeEach(() => {
        resolver = new BrowserCookieValueMethodArgumentResolver();
        vi.restoreAllMocks();
    });

    test('supports cookie parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'theme');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-cookie parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'theme');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('resolves cookie values by name', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue('night');

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'theme');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe('night');
    });

    test('uses default value when cookie is absent', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'theme', false, 'default');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe('default');
    });

    test('throws when required cookie is absent', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'theme', true);

        expect(() => resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any)).toThrow(
            '"theme" cannot be undefined or null'
        );
    });

    test('applies converter when provided', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue('42');

        const converter = (value) => Number(value);
        const convertingResolver = new BrowserCookieValueMethodArgumentResolver(converter);
        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'theme');

        const value = convertingResolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe(42);
    });

    test('prefers parameter converter over resolver converter', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue('42');

        const resolver = new BrowserCookieValueMethodArgumentResolver(argumentValueConverters.boolean);
        const parameter = new MethodParameter(
            MethodParameterType.COOKIE,
            'theme',
            false,
            null,
            argumentValueConverters.number
        );
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe(42);
    });

    test('supports parameter named converter with resolver registry', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue('55');

        const resolver = new BrowserCookieValueMethodArgumentResolver(undefined, {
            toInt: argumentValueConverters.number,
        });

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'theme', false, null, 'toInt');
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe(55);
    });

    test('supports optional named converter descriptor for nullish values', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);

        const resolver = new BrowserCookieValueMethodArgumentResolver(undefined, {
            toInt: argumentValueConverters.number,
        });

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'theme', false, null, {
            optional: true,
            use: 'toInt',
        });
        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBeNull();
    });

    test('strict named lookup wraps missing converter references as ParameterConversionError', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue('55');

        const resolver = new BrowserCookieValueMethodArgumentResolver(undefined, {}, { strictNamedLookup: true });
        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'theme', false, null, 'missingConverter');

        expect(() => resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any)).toThrow(
            ParameterConversionError
        );
    });
});
