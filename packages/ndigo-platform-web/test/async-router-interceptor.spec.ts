/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, vi } from 'vitest';
import { HashRouter } from '../src/hash-router';
import { RouterInterceptor } from '@ndigo/router';

/** Private `_setRoute` surface of HashRouter exercised by these tests. */
type TestableRouter = { _setRoute(route: string): Promise<boolean> };

const asTestableRouter = (router: HashRouter): TestableRouter => router as unknown as TestableRouter;

describe('Asynchronous Router Interceptors', () => {
    it('should support async preHandle interceptors', async () => {
        let interceptorCalled = false;
        const asyncInterceptor: RouterInterceptor = {
            preHandle: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                interceptorCalled = true;
                return true;
            },
        };

        let callbackCalled = false;
        const router = new HashRouter(() => {
            callbackCalled = true;
        });
        router.addInterceptor(asyncInterceptor);

        const result = await asTestableRouter(router)._setRoute('/test');
        expect(interceptorCalled).toBe(true);
        expect(result).toBe(true);
    });

    it('should short-circuit if async preHandle returns false', async () => {
        const asyncInterceptor: RouterInterceptor = {
            preHandle: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                return false;
            },
        };

        let callbackCalled = false;
        const router = new HashRouter(() => {
            callbackCalled = true;
        });
        router.addInterceptor(asyncInterceptor);

        const result = await asTestableRouter(router)._setRoute('/blocked');
        expect(result).toBe(false);
        expect(callbackCalled).toBe(false);
    });

    it('should support async postHandle interceptors', async () => {
        let postHandleCalled = false;
        const asyncInterceptor: RouterInterceptor = {
            postHandle: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                postHandleCalled = true;
            },
        };

        const router = new HashRouter(() => {});
        router.addInterceptor(asyncInterceptor);

        await asTestableRouter(router)._setRoute('/full');
        expect(postHandleCalled).toBe(true);
    });
});
