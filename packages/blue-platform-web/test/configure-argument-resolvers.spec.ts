import { afterEach, describe, expect, test } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { configureBrowserArgumentResolvers } from '../src/configure-argument-resolvers';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';
import { BrowserModelValueMethodArgumentResolver } from '../src/model-argument-resolver';
import { BrowserStateValueMethodArgumentResolver } from '../src/state-argument-resolver';
import { BrowserSessionValueMethodArgumentResolver } from '../src/session-argument-resolver';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';

describe('configureBrowserArgumentResolvers', () => {
    const originalHistory = globalThis.history;

    afterEach(() => {
        Object.defineProperty(globalThis, 'history', {
            configurable: true,
            writable: true,
            value: originalHistory,
        });
    });

    test('registers browser argument resolvers in context', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(Array.isArray(resolvers)).toBe(true);
        expect(resolvers).toHaveLength(4);
        expect(context.getValue('argumentResolvers')).toBe(resolvers);
    });

    test('registers cookie resolver first', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[0]).toBeInstanceOf(BrowserCookieValueMethodArgumentResolver);
    });

    test('registers model resolver second', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[1]).toBeInstanceOf(BrowserModelValueMethodArgumentResolver);
    });

    test('registers state resolver third', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[2]).toBeInstanceOf(BrowserStateValueMethodArgumentResolver);
    });

    test('registers session resolver fourth', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[3]).toBeInstanceOf(BrowserSessionValueMethodArgumentResolver);
    });

    test('accepts named converter presets', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context, {
            state: 'number',
        });

        const stateResolver = resolvers[2] as BrowserStateValueMethodArgumentResolver;
        const parameter = new MethodParameter(MethodParameterType.STATE, 'token');
        const route = { data: {}, params: null } as any;

        Object.defineProperty(globalThis, 'history', {
            configurable: true,
            writable: true,
            value: { state: { token: '123' } },
        });

        const value = stateResolver.resolveArgument(parameter, route, {} as any);

        expect(value).toBe(123);
    });

    test('uses converter registry from application context', () => {
        const context = new GenericApplicationContext('test');
        context.setValue('argumentValueConverterRegistry', {
            toInt: (value) => Number(value),
        });

        const resolvers = configureBrowserArgumentResolvers(context, {
            state: 'toInt',
        });

        const stateResolver = resolvers[2] as BrowserStateValueMethodArgumentResolver;
        const parameter = new MethodParameter(MethodParameterType.STATE, 'token');
        const route = { data: {}, params: null } as any;

        Object.defineProperty(globalThis, 'history', {
            configurable: true,
            writable: true,
            value: { state: { token: '99' } },
        });

        const value = stateResolver.resolveArgument(parameter, route, {} as any);

        expect(value).toBe(99);
    });

    test('option-level converterRegistry overrides context registry', () => {
        const context = new GenericApplicationContext('test');
        context.setValue('argumentValueConverterRegistry', {
            toInt: () => 1,
        });

        const resolvers = configureBrowserArgumentResolvers(context, {
            converterRegistry: {
                toInt: (value) => Number(value),
            },
            state: 'toInt',
        });

        const stateResolver = resolvers[2] as BrowserStateValueMethodArgumentResolver;
        const parameter = new MethodParameter(MethodParameterType.STATE, 'token');
        const route = { data: {}, params: null } as any;

        Object.defineProperty(globalThis, 'history', {
            configurable: true,
            writable: true,
            value: { state: { token: '77' } },
        });

        const value = stateResolver.resolveArgument(parameter, route, {} as any);

        expect(value).toBe(77);
    });
});
