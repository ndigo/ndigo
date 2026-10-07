/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { MetadataConfigApplicationContext, configuration, entry } from '@blue/context';
import {
    HandlerMethodArgumentResolver,
    MethodParameter,
    MethodParameterType,
    ParameterBindingError,
    RouteHandlerMethod,
    dataBinderValue,
    parameters,
    resolveParameters,
    routeMapping,
} from '@blue/dispatcher';
import { Route } from '@blue/router';
import { configureBrowserArgumentResolvers } from '../src/configure-argument-resolvers';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';
import { BrowserHistoryStateValueMethodArgumentResolver } from '../src/history-state-argument-resolver';
import { BrowserStorageValueMethodArgumentResolver } from '../src/browser-storage-argument-resolver';
import { BrowserDataBindingMethodArgumentResolver } from '../src/data-binding-argument-resolver';

describe('configureBrowserArgumentResolvers', () => {
    test('registers browser argument resolvers in context', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers.length).toBe(5);
        expect(context.hasValue('argumentResolvers')).toBe(true);
    });

    test('registers data-binding resolver first', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[0]).toBeInstanceOf(BrowserDataBindingMethodArgumentResolver);
    });

    test('registers cookie resolver second', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[1]).toBeInstanceOf(BrowserCookieValueMethodArgumentResolver);
    });

    test('registers history-state resolver third', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[2]).toBeInstanceOf(BrowserHistoryStateValueMethodArgumentResolver);
    });

    test('registers session-storage resolver fourth', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[3]).toBeInstanceOf(BrowserStorageValueMethodArgumentResolver);
        expect(Object.prototype.toString.call(resolvers[3])).toBe(
            '[object BrowserSessionStorageValueMethodArgumentResolver]'
        );
    });

    test('registers local-storage resolver fifth', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[4]).toBeInstanceOf(BrowserStorageValueMethodArgumentResolver);
        expect(Object.prototype.toString.call(resolvers[4])).toBe(
            '[object BrowserLocalStorageValueMethodArgumentResolver]'
        );
    });

    test('applies type-based conversion when convertType is provided', () => {
        const context = new MetadataConfigApplicationContext('test');
        configureBrowserArgumentResolvers(context);

        const resolvers: HandlerMethodArgumentResolver[] =
            context.getValue<HandlerMethodArgumentResolver[]>('argumentResolvers');
        const stateResolver = resolvers.find((r) =>
            r.supportsParameter(new MethodParameter(MethodParameterType.HISTORY_STATE, 'count'))
        );
        if (!stateResolver) {
            throw new Error('state resolver not registered');
        }

        // Mock history.state to return an object with count property
        const originalState = globalThis.history?.state;
        vi.stubGlobal('history', { state: { count: '123' } });

        const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, 'count', false, null, {
            source: String,
            target: Number,
        });
        const value = stateResolver.resolveArgument(parameter, {} as unknown as Route, {});

        expect(value).toBe(123);

        // Restore original state
        if (originalState !== undefined) {
            vi.unstubAllGlobals();
            vi.stubGlobal('history', { state: originalState });
        }
    });

    test('fails fast when a data-* source is not served by the web chain (DSG-1)', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        @routeMapping('/users')
        class UserController {
            @parameters({ user: dataBinderValue('body') })
            create(user: object) {}
        }
        const handler = new RouteHandlerMethod(new UserController(), 'create');
        handler.parameters = resolveParameters(
            UserController.prototype,
            'create',
            UserController.prototype.create as Function
        );
        handler.argumentResolvers = resolvers;

        // The browser chain binds query/cookie/session-storage/local-storage
        // only — data-body:value has no resolver, so invoke must fail loudly
        // instead of silently passing undefined.
        try {
            handler.invoke({} as unknown as Route);
            expect.unreachable('invoke should throw');
        } catch (error) {
            expect(error).toBeInstanceOf(ParameterBindingError);
            expect(String(error)).toMatch(/No argument resolver supports data-body:value/);
            expect(String(error)).toMatch(/'body'/);
            expect(String(error)).toMatch(/'user'/);
        }
    });
});
