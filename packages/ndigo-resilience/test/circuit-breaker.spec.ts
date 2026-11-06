/**
 */
import { describe, expect, it } from 'vitest';
import { createMethodDescriptor, invokeChain, type AnnotationKey, type MethodInvocation } from '@ndigo/proxy';
import {
    CircuitBreakerInterceptor,
    CircuitOpenError,
    RetryInterceptor,
    circuitBreaker,
    retry,
    type CircuitBreakerSpec,
} from '@ndigo/resilience';

class Downstream {
    call(): string {
        return 'ok';
    }
}

/** Invocation whose `@circuitBreaker` annotation resolves to `spec`. */
function breakerInvocation(spec: CircuitBreakerSpec, methodName = 'call'): MethodInvocation {
    const instance = new Downstream();
    const descriptor = createMethodDescriptor(Downstream, 'downstream', methodName);
    return {
        ...descriptor,
        target: instance,
        args: [],
        annotation: <T>(key: AnnotationKey<T>): T | undefined => (key === circuitBreaker ? (spec as T) : undefined),
    };
}

/** Tail that throws on the first `failures` calls, then returns 'ok'. */
function failingTail(failures: number, failure = new Error('down')) {
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

describe('CircuitBreakerInterceptor', () => {
    function clock() {
        let time = 0;
        return {
            now: () => time,
            advance: (ms: number) => {
                time += ms;
            },
        };
    }

    it('matches only methods carrying @circuitBreaker', () => {
        const interceptor = new CircuitBreakerInterceptor();

        expect(interceptor.matches(breakerInvocation({ failureThreshold: 2, resetMs: 100 }))).toBe(true);

        const plain = new Downstream();
        const plainDescriptor = createMethodDescriptor(Downstream, 'downstream', 'other');
        expect(interceptor.matches(plainDescriptor)).toBe(false);
    });

    it('fails loudly on invalid failureThreshold/resetMs instead of silently inverting the policy', async () => {
        const interceptor = new CircuitBreakerInterceptor();
        const invalid: CircuitBreakerSpec[] = [
            { failureThreshold: 0 },
            { failureThreshold: NaN },
            { failureThreshold: -1 },
            { failureThreshold: 1.5 },
            { resetMs: 0 },
            { resetMs: NaN },
            { resetMs: -1 },
            { resetMs: Infinity },
        ];

        // Weave-time validation (matches), naming the offending field/value.
        for (const spec of invalid) {
            expect(() => interceptor.matches(breakerInvocation(spec))).toThrow(TypeError);
        }
        expect(() => interceptor.matches(breakerInvocation({ failureThreshold: 0 }))).toThrow(
            '@circuitBreaker failureThreshold must be a positive integer — got 0'
        );
        expect(() => interceptor.matches(breakerInvocation({ resetMs: -5 }))).toThrow(
            '@circuitBreaker resetMs must be a positive finite number — got -5'
        );

        // Hand-built chains validate at invoke time too — the tail never runs.
        const { tail, runs } = failingTail(99);
        await expect(invokeChain([interceptor], breakerInvocation({ failureThreshold: 0 }), tail)).rejects.toThrow(
            TypeError
        );
        await expect(invokeChain([interceptor], breakerInvocation({ resetMs: NaN }), tail)).rejects.toThrow(TypeError);
        expect(runs()).toBe(0);
    });

    it('accepts valid specs unchanged', async () => {
        const interceptor = new CircuitBreakerInterceptor();
        expect(interceptor.matches(breakerInvocation({ failureThreshold: 1, resetMs: 1 }))).toBe(true);

        const { tail, runs } = failingTail(99);
        await expect(
            invokeChain([interceptor], breakerInvocation({ failureThreshold: 2, resetMs: 10_000 }), tail)
        ).rejects.toThrow('down');
        expect(runs()).toBe(1);
    });

    it('opens after failureThreshold consecutive failures and fails fast', async () => {
        const { tail, runs } = failingTail(99);
        const interceptor = new CircuitBreakerInterceptor();
        const invocation = breakerInvocation({ failureThreshold: 2, resetMs: 10_000 });

        await expect(invokeChain([interceptor], invocation, tail)).rejects.toThrow('down');
        await expect(invokeChain([interceptor], invocation, tail)).rejects.toThrow('down');
        // Open: fails fast without touching the tail.
        await expect(invokeChain([interceptor], invocation, tail)).rejects.toBeInstanceOf(CircuitOpenError);
        expect(runs()).toBe(2);
    });

    it('does not open below the threshold and resets failures on success', async () => {
        // Fails on call 1 and call 3; succeeds on calls 2 and 4.
        let runs = 0;
        const tail = () => {
            runs += 1;
            if (runs === 1 || runs === 3) {
                throw new Error('down');
            }
            return 'ok';
        };
        const interceptor = new CircuitBreakerInterceptor();
        const invocation = breakerInvocation({ failureThreshold: 3, resetMs: 10_000 });

        await expect(invokeChain([interceptor], invocation, tail)).rejects.toThrow('down');
        expect(await invokeChain([interceptor], invocation, tail)).toBe('ok');
        // Counter reset on success: another failure stays below the threshold.
        await expect(invokeChain([interceptor], invocation, tail)).rejects.toThrow('down');
        expect(await invokeChain([interceptor], invocation, tail)).toBe('ok');
        expect(runs).toBe(4);
    });

    it('probes once after the reset window and recovers on success', async () => {
        const { tail, runs } = failingTail(99);
        const time = clock();
        const interceptor = new CircuitBreakerInterceptor({ now: time.now });
        const invocation = breakerInvocation({ failureThreshold: 1, resetMs: 1_000 });

        await expect(invokeChain([interceptor], invocation, tail)).rejects.toThrow('down');
        await expect(invokeChain([interceptor], invocation, tail)).rejects.toBeInstanceOf(CircuitOpenError);
        expect(runs()).toBe(1);

        time.advance(1_001);
        // Probing call reaches the tail.
        await expect(invokeChain([interceptor], invocation, tail)).rejects.toThrow('down');
        expect(runs()).toBe(2);
    });

    it('re-opens with a fresh window when the probe fails', async () => {
        const { tail, runs } = failingTail(2);
        const time = clock();
        const interceptor = new CircuitBreakerInterceptor({ now: time.now });
        const invocation = breakerInvocation({ failureThreshold: 1, resetMs: 1_000 });

        await expect(invokeChain([interceptor], invocation, tail)).rejects.toThrow('down');
        time.advance(1_001);
        // Probe attempt fails → re-opened with a fresh window.
        await expect(invokeChain([interceptor], invocation, tail)).rejects.toThrow('down');
        time.advance(999);
        await expect(invokeChain([interceptor], invocation, tail)).rejects.toBeInstanceOf(CircuitOpenError);
        expect(runs()).toBe(2);
    });

    it('isolates circuit state per method', async () => {
        const { tail, runs } = failingTail(99);
        const interceptor = new CircuitBreakerInterceptor();
        const callA = breakerInvocation({ failureThreshold: 1, resetMs: 10_000 }, 'callA');
        const callB = breakerInvocation({ failureThreshold: 1, resetMs: 10_000 }, 'callB');

        await expect(invokeChain([interceptor], callA, tail)).rejects.toThrow('down');
        await expect(invokeChain([interceptor], callA, tail)).rejects.toBeInstanceOf(CircuitOpenError);
        // Method B is untouched by A's failure.
        expect(await invokeChain([interceptor], callB, () => 'ok')).toBe('ok');
        expect(runs()).toBe(1);
    });

    it('does not share circuit state across same-named classes', async () => {
        const Alpha = class Service {
            call(): string {
                return 'alpha';
            }
        };
        const Beta = class Service {
            call(): string {
                return 'beta';
            }
        };
        const invocationFor = (serviceClass: Function, instance: object): MethodInvocation => ({
            ...createMethodDescriptor(serviceClass, 'Service', 'call'),
            target: instance,
            args: [],
            annotation: <T>(key: AnnotationKey<T>): T | undefined =>
                key === circuitBreaker ? ({ failureThreshold: 1, resetMs: 10_000 } as T) : undefined,
        });

        const breaker = new CircuitBreakerInterceptor();
        const alpha = invocationFor(Alpha, new Alpha());
        const beta = invocationFor(Beta, new Beta());
        const { tail, runs } = failingTail(99);

        // Alpha's circuit opens...
        await expect(invokeChain([breaker], alpha, tail)).rejects.toThrow('down');
        await expect(invokeChain([breaker], alpha, tail)).rejects.toBeInstanceOf(CircuitOpenError);
        expect(runs()).toBe(1);

        // Beta shares the entry name ('Service') and method name, but is a
        // different class — its circuit must be independent.
        expect(await invokeChain([breaker], beta, () => 'beta-ok')).toBe('beta-ok');
    });

    it('counts one failure per chain pass when composed outside retry', async () => {
        const boom = new Error('always');
        const { tail, runs } = failingTail(99, boom);
        const time = clock();
        const circuit = new CircuitBreakerInterceptor({ now: time.now });
        const retryInterceptor = new RetryInterceptor();
        const instance = new Downstream();
        const descriptor = createMethodDescriptor(Downstream, 'downstream', 'call');
        const invocation: MethodInvocation = {
            ...descriptor,
            target: instance,
            args: [],
            annotation: <T>(key: AnnotationKey<T>): T | undefined =>
                key === circuitBreaker
                    ? ({ failureThreshold: 2, resetMs: 10_000 } as T)
                    : key === retry
                      ? ({ attempts: 3 } as T)
                      : undefined,
        };

        // CB outside Retry: retry absorbs inner failures; the single final
        // rejection trips the counter once per chain pass.
        await expect(invokeChain([circuit, retryInterceptor], invocation, tail)).rejects.toBe(boom);
        await expect(invokeChain([circuit, retryInterceptor], invocation, tail)).rejects.toBe(boom);
        await expect(invokeChain([circuit, retryInterceptor], invocation, tail)).rejects.toBeInstanceOf(
            CircuitOpenError
        );
        // Retry burned 3 attempts per pass, but the circuit only saw the
        // final failure each time — 2 recorded, and the third pass failed
        // fast before the tail could run.
        expect(runs()).toBe(6);
    });

    it('accumulates concurrent in-flight failures and opens at the threshold (TEL-02)', async () => {
        const interceptor = new CircuitBreakerInterceptor();
        const invocation = breakerInvocation({ failureThreshold: 2, resetMs: 10_000 });
        const pending = Array.from({ length: 3 }, () => Promise.withResolvers<string>());
        let started = 0;
        const tail = () => {
            const deferred = pending[started];
            started += 1;
            return deferred.promise;
        };

        const calls = pending.map(() => invokeChain([interceptor], invocation, tail));
        // Plain async `invoke()` runs synchronously up to its first `await`,
        // so all three calls are suspended at the tail before any completes.
        expect(started).toBe(3);

        const boom = new Error('down');
        for (const deferred of pending) {
            deferred.reject(boom);
        }
        const results = await Promise.allSettled(calls);
        expect(results.every((result) => result.status === 'rejected')).toBe(true);

        // Two in-place failures opened the circuit; the third outcome belongs
        // to the superseded epoch. A fresh call fails fast (pre-fix: each
        // call read `failures: 0` and wrote back `1`, so it never opened).
        await expect(invokeChain([interceptor], invocation, tail)).rejects.toBeInstanceOf(CircuitOpenError);
        expect(started).toBe(3);
    });

    it('lets exactly one half-open probe through after the reset window (TEL-02)', async () => {
        const time = clock();
        const interceptor = new CircuitBreakerInterceptor({ now: time.now });
        const invocation = breakerInvocation({ failureThreshold: 1, resetMs: 1_000 });
        const boom = new Error('down');
        let runs = 0;

        // Trip the circuit.
        await expect(
            invokeChain([interceptor], invocation, () => {
                runs += 1;
                throw boom;
            })
        ).rejects.toThrow('down');
        time.advance(1_001);

        const probe = Promise.withResolvers<string>();
        const tail = () => {
            runs += 1;
            return probe.promise;
        };
        const calls = Array.from({ length: 4 }, () => invokeChain([interceptor], invocation, tail));
        // One claimed the probe and reached the tail; the rest fail fast
        // instead of all probing at once (pre-fix: 4/4 reached the tail).
        expect(runs).toBe(2);

        probe.resolve('ok');
        const results = await Promise.allSettled(calls);
        expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
        expect(results.filter((result) => result.status === 'rejected')).toHaveLength(3);

        // The successful probe closed the circuit.
        expect(await invokeChain([interceptor], invocation, () => 'ok')).toBe('ok');
    });

    it('does not let a stale in-flight success re-close an open circuit (TEL-02)', async () => {
        const interceptor = new CircuitBreakerInterceptor();
        const invocation = breakerInvocation({ failureThreshold: 1, resetMs: 10_000 });
        const slow = Promise.withResolvers<string>();
        const boom = new Error('down');

        // Call A starts and blocks in the tail.
        const a = invokeChain([interceptor], invocation, () => slow.promise);
        // Call B fails and trips the circuit (threshold 1).
        await expect(
            invokeChain([interceptor], invocation, () => {
                throw boom;
            })
        ).rejects.toThrow('down');

        // A's success arrives late — it belongs to the pre-open epoch and
        // must not close the circuit (pre-fix: it unconditionally re-closed).
        slow.resolve('late');
        await expect(a).resolves.toBe('late');

        await expect(invokeChain([interceptor], invocation, () => 'ok')).rejects.toBeInstanceOf(CircuitOpenError);
    });
});
