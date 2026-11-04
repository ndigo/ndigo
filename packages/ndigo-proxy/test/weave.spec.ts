/**
 * @module ndigo-proxy
 * @since 1.0.0
 * @author Jeff Rose
 */

import { describe, expect, it } from 'vitest';
import { createMethodDescriptor, weaveMethodProxy, MethodInterceptor, MethodChainSpec } from '@ndigo/proxy';

class PrivateService {
    #secret = 's3cret';

    read(): string {
        return `read:${this.#secret}`;
    }

    outer(): string {
        return `outer:${this.inner()}`;
    }

    inner(): string {
        return `inner:${this.#secret}`;
    }

    get secret(): string {
        return this.#secret;
    }
}

function intercepting(name: string, log: string[]) {
    const interceptor: MethodInterceptor = {
        matches: () => true,
        invoke: (invocation, next) => {
            log.push(`${name}:${String(invocation.methodName)}`);
            return next();
        },
    };
    return interceptor;
}

describe('weaveMethodProxy', () => {
    it('returns the target unchanged when nothing is intercepted', () => {
        const service = new PrivateService();
        expect(weaveMethodProxy(service, [])).toBe(service);
    });

    it('returns a proxy that preserves instanceof and identity contract', () => {
        const service = new PrivateService();
        const log: string[] = [];
        const descriptor = createMethodDescriptor(PrivateService, 'svc', 'read');
        const proxy = weaveMethodProxy(service, [
            { descriptor, interceptors: [intercepting('a', log)] },
        ]) as PrivateService;

        expect(proxy).not.toBe(service);
        expect(proxy).toBeInstanceOf(PrivateService);
        expect(proxy.read()).toBe('read:s3cret');
        expect(log).toEqual(['a:read']);
    });

    it('executes methods on the target receiver so #private fields work', () => {
        const service = new PrivateService();
        const descriptor = createMethodDescriptor(PrivateService, 'svc', 'read');
        const proxy = weaveMethodProxy(service, [
            { descriptor, interceptors: [] as MethodInterceptor[] },
        ]) as PrivateService;

        expect(proxy.read()).toBe('read:s3cret');
        expect(proxy.inner()).toBe('inner:s3cret');
    });

    it('bypasses advice for self-invocation (target-bound boundary)', () => {
        const service = new PrivateService();
        const log: string[] = [];
        const outerDescriptor = createMethodDescriptor(PrivateService, 'svc', 'outer');
        const innerDescriptor = createMethodDescriptor(PrivateService, 'svc', 'inner');
        const proxy = weaveMethodProxy(service, [
            { descriptor: outerDescriptor, interceptors: [intercepting('o', log)] },
            { descriptor: innerDescriptor, interceptors: [intercepting('i', log)] },
        ]) as PrivateService;

        proxy.outer();
        expect(log).toEqual(['o:outer']);
        log.length = 0;
        proxy.inner();
        expect(log).toEqual(['i:inner']);
    });

    it('caches method wrappers so repeated access keeps identity', () => {
        const service = new PrivateService();
        const descriptor = createMethodDescriptor(PrivateService, 'svc', 'outer');
        const proxy = weaveMethodProxy(service, [
            { descriptor, interceptors: [] as MethodInterceptor[] },
        ]) as PrivateService;

        expect(proxy.outer).toBe(proxy.outer);
        expect(proxy.read).toBe(proxy.read);
    });

    it('forwards non-method properties and getters on the target receiver', () => {
        const service = new PrivateService();
        const proxy = weaveMethodProxy(service, []) as PrivateService;

        expect(proxy.secret).toBe('s3cret');
        expect((proxy as PrivateService & { unknownField: unknown }).unknownField).toBeUndefined();
    });

    it('executes the installed (decorated) method, never a saved original', () => {
        class Decorated {
            installed(): string {
                return 'raw';
            }
        }
        let installedRuns = 0;
        const original = Decorated.prototype.installed;
        Decorated.prototype.installed = function installed(): string {
            installedRuns += 1;
            return `wrapped:${original.call(this)}`;
        };

        const instance = new Decorated();
        const descriptor = createMethodDescriptor(Decorated, 'svc', 'installed');
        const proxy = weaveMethodProxy(instance, [
            { descriptor, interceptors: [] as MethodInterceptor[] },
        ]) as Decorated;

        expect(proxy.installed()).toBe('wrapped:raw');
        expect(installedRuns).toBe(1);
    });

    it('propagates interceptor short-circuits and exceptions', () => {
        const service = new PrivateService();
        const shortCircuit: MethodInterceptor = {
            matches: () => true,
            invoke: () => 'short',
        };
        const boom = new Error('boom');
        const throwing: MethodInterceptor = {
            matches: () => true,
            invoke: () => {
                throw boom;
            },
        };
        const descriptor = createMethodDescriptor(PrivateService, 'svc', 'outer');

        const shortProxy = weaveMethodProxy(service, [{ descriptor, interceptors: [shortCircuit] }]) as PrivateService;
        expect(shortProxy.outer()).toBe('short');

        const throwingProxy = weaveMethodProxy(service, [{ descriptor, interceptors: [throwing] }]) as PrivateService;
        expect(() => throwingProxy.outer()).toThrow('boom');
    });

    it('passes promises through untouched', async () => {
        class AsyncService {
            async ask(): Promise<string> {
                return 'answer';
            }
        }

        const promise = Promise.resolve('answer');
        const instance = new AsyncService();
        // async method returns that promise only by stub; assert identity via wrapper:
        instance.ask = () => promise;

        const descriptor = createMethodDescriptor(AsyncService, 'svc', 'ask');
        const proxy = weaveMethodProxy(instance, [
            { descriptor, interceptors: [] as MethodInterceptor[] },
        ]) as AsyncService;

        expect(proxy.ask()).toBe(promise);
        expect(await proxy.ask()).toBe('answer');
    });

    it('does not intercept methods added after weaving (documented boundary)', () => {
        const service = new PrivateService();
        const descriptor = createMethodDescriptor(PrivateService, 'svc', 'read');
        const proxy = weaveMethodProxy(service, [{ descriptor, interceptors: [] as MethodInterceptor[] }]);

        // Late-added member typed once through an extension interface.
        interface WithLate {
            late?: () => string;
        }
        const withLate: PrivateService & WithLate = service as PrivateService & WithLate;
        withLate.late = () => 'late';
        expect((proxy as PrivateService & { late: () => string }).late()).toBe('late');
        expect(typeof Reflect.get(proxy, 'late')).toBe('function');
    });

    it('forwards symbol-keyed access untouched', () => {
        const meta = Symbol('meta');
        interface WithSymbol {
            [meta]: number;
        }
        const service = new PrivateService();
        const withSymbol: PrivateService & WithSymbol = service as PrivateService & WithSymbol;
        withSymbol[meta] = 42;
        const descriptor = createMethodDescriptor(PrivateService, 'svc', 'read');
        const proxy = weaveMethodProxy(service, [{ descriptor, interceptors: [] as MethodInterceptor[] }]);

        expect((proxy as PrivateService & WithSymbol)[meta]).toBe(42);
    });
});
