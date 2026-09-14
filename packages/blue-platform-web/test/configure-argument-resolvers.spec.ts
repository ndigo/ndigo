/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { MetadataConfigApplicationContext, configuration, entry } from '@blue/context';
import { HandlerMethodArgumentResolver, MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { configureBrowserArgumentResolvers } from '../src/configure-argument-resolvers';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';
import { BrowserModelValueMethodArgumentResolver } from '../src/model-argument-resolver';
import { BrowserStateValueMethodArgumentResolver } from '../src/state-argument-resolver';
import { BrowserSessionValueMethodArgumentResolver } from '../src/session-argument-resolver';
import { BrowserBindMethodArgumentResolver } from '../src/bind-argument-resolver';

describe('configureBrowserArgumentResolvers', () => {
    test('registers browser argument resolvers in context', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers.length).toBe(5);
        expect(context.hasValue('argumentResolvers')).toBe(true);
    });

    test('registers bind resolver first', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[0]).toBeInstanceOf(BrowserBindMethodArgumentResolver);
    });

    test('registers cookie resolver second', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[1]).toBeInstanceOf(BrowserCookieValueMethodArgumentResolver);
    });

    test('registers model resolver third', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[2]).toBeInstanceOf(BrowserModelValueMethodArgumentResolver);
    });

    test('registers state resolver fourth', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[3]).toBeInstanceOf(BrowserStateValueMethodArgumentResolver);
    });

    test('registers session resolver fifth', () => {
        const context = new MetadataConfigApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[4]).toBeInstanceOf(BrowserSessionValueMethodArgumentResolver);
    });

    test('applies type-based conversion when convertType is provided', () => {
        const context = new MetadataConfigApplicationContext('test');
        configureBrowserArgumentResolvers(context);

        const resolvers: HandlerMethodArgumentResolver[] =
            context.getValue<HandlerMethodArgumentResolver[]>('argumentResolvers');
        const stateResolver = resolvers.find((r) =>
            r.supportsParameter(new MethodParameter(MethodParameterType.STATE, 'count'))
        );
        if (!stateResolver) {
            throw new Error('state resolver not registered');
        }

        // Mock history.state to return an object with count property
        const originalState = globalThis.history?.state;
        vi.stubGlobal('history', { state: { count: '123' } });

        const parameter = new MethodParameter(MethodParameterType.STATE, 'count', false, null, {
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
});
