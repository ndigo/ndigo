/**
 * @module blue-resilience
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import {
    createMethodDescriptor,
    invokeChain,
    weaveMethodProxy,
    type MethodInvocation,
    type AnnotationKey,
} from '@blue/proxy';
import {
    CircuitOpenError,
    DEFAULT_RETRY_ATTEMPTS,
    RetryInterceptor,
    exponentialBackoff,
    fixedBackoff,
    retry,
    type RetrySpec,
} from '@blue/resilience';

class FlakyService {
    call(): string {
        return 'ok';
    }
}

class WovenFlaky {
    #attempt = 0;

    @retry({ attempts: 2, backoff: fixedBackoff(0) })
    call(): string {
        this.#attempt += 1;
        if (this.#attempt < 2) {
            throw new Error('down');
        }
        return 'recovered';
    }
}

/** Tail that fails the first `failures` calls with `failure`, then succeeds. */
function flakyTail(failures: number, failure: Error) {
    let runs = 0;
    const tail = () => {
        runs += 1;
        if (runs <= failures) {
            throw failure;
        }
        return 'ok';
    };
    return { tail, runs: () => runs };
}

/** Invocation whose `@retry` annotation resolves to `spec`. */
function retryInvocation(spec: RetrySpec): MethodInvocation {
    const instance = new FlakyService();
    const descriptor = createMethodDescriptor(FlakyService, 'flaky', 'call');
    return {
        ...descriptor,
        target: instance,
        args: [],
        annotation: <T>(key: AnnotationKey<T>): T | undefined => (key === retry ? (spec as T) : undefined),
    };
}

describe('RetryInterceptor', () => {
    it('matches only methods carrying @retry', () => {
        const interceptor = new RetryInterceptor();

        expect(interceptor.matches(retryInvocation({}))).toBe(true);

        const plain = new FlakyService();
        const plainDescriptor = createMethodDescriptor(FlakyService, 'flaky', 'other');
        expect(interceptor.matches(plainDescriptor)).toBe(false);
    });

    it('retries failures and applies the backoff delay per attempt', async () => {
        const delays: number[] = [];
        const backoff = {
            delay: (attempt: number) => {
                delays.push(attempt);
                return 0;
            },
        };
        const { tail, runs } = flakyTail(2, new Error('transient'));
        const interceptor = new RetryInterceptor();

        const result = await invokeChain([interceptor], retryInvocation({ attempts: 3, backoff }), tail);

        expect(result).toBe('ok');
        expect(runs()).toBe(3);
        expect(delays).toEqual([1, 2]);
    });

    it('exhausts attempts and rethrows the final error', async () => {
        const boom = new Error('final');
        const { tail, runs } = flakyTail(5, boom);
        const interceptor = new RetryInterceptor();

        await expect(invokeChain([interceptor], retryInvocation({ attempts: 3 }), tail)).rejects.toBe(boom);
        expect(runs()).toBe(3);
    });

    it('honors the retryable predicate', async () => {
        const transient = new Error('transient!');
        const permanent = new Error('permanent');
        const { tail, runs } = flakyTail(5, permanent);
        const interceptor = new RetryInterceptor();

        await expect(
            invokeChain(
                [interceptor],
                retryInvocation({ attempts: 3, retryable: (error) => error === transient }),
                tail
            )
        ).rejects.toBe(permanent);
        expect(runs()).toBe(1);
    });

    it('defaults to retrying ordinary errors for DEFAULT_RETRY_ATTEMPTS', async () => {
        const { tail, runs } = flakyTail(2, new Error('transient'));
        const interceptor = new RetryInterceptor();

        const result = await invokeChain([interceptor], retryInvocation({}), tail);

        expect(result).toBe('ok');
        expect(runs()).toBe(DEFAULT_RETRY_ATTEMPTS);
    });

    it('does not retry CircuitOpenError by default — backoff must not beat fail-fast', async () => {
        const open = new CircuitOpenError('call', 'flaky', 5_000);
        const { tail, runs } = flakyTail(5, open);
        const interceptor = new RetryInterceptor();

        await expect(invokeChain([interceptor], retryInvocation({ attempts: 3 }), tail)).rejects.toBe(open);
        expect(runs()).toBe(1);
    });

    it('fails loudly on invalid attempts instead of clamping', async () => {
        const interceptor = new RetryInterceptor();

        // Weave-time validation (matches).
        expect(() => interceptor.matches(retryInvocation({ attempts: 0 }))).toThrow(TypeError);
        expect(() => interceptor.matches(retryInvocation({ attempts: -1 }))).toThrow(/positive integer/);
        expect(() => interceptor.matches(retryInvocation({ attempts: 1.5 }))).toThrow(TypeError);

        // Hand-built chains validate at invoke time too — the tail never runs.
        const { tail, runs } = flakyTail(1, new Error('down'));
        await expect(invokeChain([interceptor], retryInvocation({ attempts: 0 }), tail)).rejects.toThrow(TypeError);
        expect(runs()).toBe(0);
    });

    it('returns a Promise for sync methods through the woven proxy (documented)', async () => {
        class SyncAdvised {
            @retry({ attempts: 2, backoff: fixedBackoff(0) })
            call(): string {
                return 'sync-ok';
            }
        }

        const interceptor = new RetryInterceptor();
        const instance = new SyncAdvised();
        const descriptor = createMethodDescriptor(SyncAdvised, 'syncAdvised', 'call');
        const proxy = weaveMethodProxy(instance, [{ descriptor, interceptors: [interceptor] }]) as SyncAdvised;

        const result = proxy.call();
        expect(result).toBeInstanceOf(Promise);
        await expect(Promise.resolve(result)).resolves.toBe('sync-ok');
    });

    it('retries async failures and passes resolved results through', async () => {
        let runs = 0;
        const tail = () => {
            runs += 1;
            return runs < 3 ? Promise.reject(new Error('down')) : Promise.resolve('recovered');
        };
        const interceptor = new RetryInterceptor();

        expect(await invokeChain([interceptor], retryInvocation({ attempts: 3 }), tail)).toBe('recovered');
        expect(runs).toBe(3);
    });

    it('works end-to-end through a woven proxy', async () => {
        const interceptor = new RetryInterceptor();
        const instance = new WovenFlaky();
        const descriptor = createMethodDescriptor(WovenFlaky, 'flaky', 'call');
        const proxy = weaveMethodProxy(instance, [{ descriptor, interceptors: [interceptor] }]) as {
            call: () => Promise<string>;
        };

        expect(await proxy.call()).toBe('recovered');
    });
});
