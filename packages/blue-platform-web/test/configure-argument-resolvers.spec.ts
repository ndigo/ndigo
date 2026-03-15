import { describe, expect, test } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { configureBrowserArgumentResolvers } from '../src/configure-argument-resolvers';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';
import { BrowserSessionValueMethodArgumentResolver } from '../src/session-argument-resolver';

describe('configureBrowserArgumentResolvers', () => {
    test('registers browser argument resolvers in context', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(Array.isArray(resolvers)).toBe(true);
        expect(resolvers).toHaveLength(2);
        expect(context.getValue('argumentResolvers')).toBe(resolvers);
    });

    test('registers cookie resolver first', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[0]).toBeInstanceOf(BrowserCookieValueMethodArgumentResolver);
    });

    test('registers session resolver second', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureBrowserArgumentResolvers(context);

        expect(resolvers[1]).toBeInstanceOf(BrowserSessionValueMethodArgumentResolver);
    });
});
