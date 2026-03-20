import { describe, it, expect, vi } from 'vitest';
import HashRouter from '../src/hash-router';
import { RouterInterceptor } from '../src/router-interceptor';

describe('Asynchronous Router Interceptors', () => {
    it('should support async preRoute interceptors', async () => {
        let interceptorCalled = false;
        const asyncInterceptor: RouterInterceptor = {
            preRoute: async () => {
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

        const result = await (router as any)._setRoute('/test');
        expect(interceptorCalled).toBe(true);
        expect(result).toBe(true);
    });

    it('should short-circuit if async preRoute returns false', async () => {
        const asyncInterceptor: RouterInterceptor = {
            preRoute: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                return false;
            },
        };

        let callbackCalled = false;
        const router = new HashRouter(() => {
            callbackCalled = true;
        });
        router.addInterceptor(asyncInterceptor);

        const result = await (router as any)._setRoute('/blocked');
        expect(result).toBe(false);
        expect(callbackCalled).toBe(false);
    });

    it('should support async postRoute interceptors', async () => {
        let postRouteCalled = false;
        const asyncInterceptor: RouterInterceptor = {
            postRoute: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                postRouteCalled = true;
            },
        };

        const router = new HashRouter(() => {});
        router.addInterceptor(asyncInterceptor);

        await (router as any)._setRoute('/full');
        expect(postRouteCalled).toBe(true);
    });
});
