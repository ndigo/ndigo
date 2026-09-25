/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import { configureStrictBrowserArgumentResolvers } from '../src/configure-strict-argument-resolvers';
import { BrowserHistoryStateValueMethodArgumentResolver } from '../src/history-state-argument-resolver';
import {
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

describe('configureStrictBrowserArgumentResolvers', () => {
    test('registers browser argument resolvers', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureStrictBrowserArgumentResolvers(context);

        expect(resolvers.length).toBe(5);
        expect(context.hasValue('argumentResolvers')).toBe(true);
    });

    test('resolvers work with type-based conversion', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureStrictBrowserArgumentResolvers(context);

        const stateResolver = resolvers.find((r) => r instanceof BrowserHistoryStateValueMethodArgumentResolver);
        if (!stateResolver) {
            throw new Error('state resolver not registered');
        }
        const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, 'count', false, null, {
            source: String,
            target: Number,
        });

        // Mock history.state to return an object with count property
        const originalState = globalThis.history?.state;
        vi.stubGlobal('history', { state: { count: '88' } });

        const value = stateResolver.resolveArgument(parameter, {} as unknown as Route, {});
        expect(value).toBe(88);

        // Restore original state
        if (originalState !== undefined) {
            vi.unstubAllGlobals();
            vi.stubGlobal('history', { state: originalState });
        }
    });

    test('fails fast when a data-* source is not served by the web chain (DSG-1)', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureStrictBrowserArgumentResolvers(context);

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
