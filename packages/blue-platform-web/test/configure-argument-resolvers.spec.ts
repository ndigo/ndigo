import { describe, expect, test } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { configureBrowserArgumentResolvers } from '../src/configure-argument-resolvers';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';
import { BrowserModelValueMethodArgumentResolver } from '../src/model-argument-resolver';
import { BrowserStateValueMethodArgumentResolver } from '../src/state-argument-resolver';
import { BrowserSessionValueMethodArgumentResolver } from '../src/session-argument-resolver';

describe('configureBrowserArgumentResolvers', () => {
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
});
