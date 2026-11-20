/**
 */
import { describe, expect, it } from 'vitest';
import {
    AdviceOrder,
    createMethodDescriptor,
    hasAnnotation,
    interceptMethods,
    invokeChain,
    type MethodInvocation,
    type AnnotationKey,
} from '@ndigo/advice';
import {
    CircuitOpenError,
    DEFAULT_RETRY_ATTEMPTS,
    RetryInterceptor,
    exponentialBackoff,
    fixedBackoff,
    retry,
    type RetrySpec,
} from '@ndigo/resilience';

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
    it('selects only methods carrying @retry', () => {
        expect(hasAnnotation(retry).matches(retryInvocation({}))).toBe(true);

        const plainDescriptor = createMethodDescriptor(FlakyService, 'flaky', 'other');
        expect(hasAnnotation(retry).matches(plainDescriptor)).toBe(false);
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

        // Plan-time validation, before any call is made.
        expect(() => interceptor.validate(retryInvocation({ attempts: 0 }))).toThrow(TypeError);
        expect(() => interceptor.validate(retryInvocation({ attempts: -1 }))).toThrow(/positive integer/);
        expect(() => interceptor.validate(retryInvocation({ attempts: 1.5 }))).toThrow(TypeError);

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
        const proxy = interceptMethods(new SyncAdvised(), [{ when: hasAnnotation(retry), use: interceptor }]);

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

    it('works end-to-end through the standalone weave', async () => {
        const interceptor = new RetryInterceptor();
        // Retry advice is async, so the declared `string` return is a Promise
        // at runtime — the documented annotation/type mismatch.
        const proxy = interceptMethods(new WovenFlaky(), [
            { when: hasAnnotation(retry), use: interceptor },
        ]) as unknown as { call: () => Promise<string> };

        expect(await proxy.call()).toBe('recovered');
    });
});

describe('@retry under shadow weaving', () => {
    it('advises a self-invoked annotated method (a deliberate behaviour change)', async () => {
        let attempts = 0;

        class Pipeline {
            run(): Promise<string> {
                return this.step();
            }

            @retry({ attempts: 3, backoff: fixedBackoff(0) })
            async step(): Promise<string> {
                attempts += 1;
                if (attempts < 3) {
                    throw new Error('down');
                }
                return 'ok';
            }
        }

        const pipeline = interceptMethods(new Pipeline(), [
            { when: hasAnnotation(retry), use: new RetryInterceptor() },
        ]);

        await expect(pipeline.run()).resolves.toBe('ok');
        // Under proxy weaving this call bypassed advice entirely and the
        // first rejection escaped; the instance now owns the wrapper, so the
        // nested call is advised.
        expect(attempts).toBe(3);
    });
});

describe('interceptor bands', () => {
    it('resilience sits outside the application band and inside observability', async () => {
        const order: string[] = [];

        class Service {
            @retry({ attempts: 3, backoff: fixedBackoff(0) })
            async run(): Promise<string> {
                order.push('method');
                if (order.filter((entry) => entry === 'method').length < 2) {
                    throw new Error('transient');
                }
                return 'ok';
            }
        }

        const service = interceptMethods(new Service(), [
            // Registered first, so it keeps the outer position within its band.
            { when: hasAnnotation(retry), use: new RetryInterceptor() },
            {
                order: AdviceOrder.Observability,
                use: {
                    async invoke(_invocation, next) {
                        order.push('observability');
                        return next();
                    },
                },
            },
            // The documented default band: inside resilience.
            {
                use: {
                    async invoke(_invocation, next) {
                        order.push('application');
                        return next();
                    },
                },
            },
        ]);

        await expect(service.run()).resolves.toBe('ok');

        // Observability wraps the retry, so it runs once; the application-band
        // rule sits inside retry, so it runs once per attempt.
        expect(order.filter((entry) => entry === 'observability')).toHaveLength(1);
        expect(order.filter((entry) => entry === 'application')).toHaveLength(2);
        expect(order.filter((entry) => entry === 'method')).toHaveLength(2);
        expect(order[0]).toBe('observability');
        expect(order).toEqual(['observability', 'application', 'method', 'application', 'method']);
    });
});
