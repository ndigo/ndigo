/**
 * @module blue-resilience
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { createMethodDescriptor, invokeChain, type AnnotationKey, type MethodInvocation } from '@blue/proxy';
import {
    CircuitBreakerInterceptor,
    CircuitOpenError,
    RetryInterceptor,
    circuitBreaker,
    retry,
    type CircuitBreakerSpec,
} from '@blue/resilience';

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
});
