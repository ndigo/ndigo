// oxlint-disable no-await-in-loop -- resilience calls are awaited sequentially to measure per-call cost.
/**
 * `@ndigo/resilience` woven retry and circuit-breaker throughput.
 *
 * Interceptors are applied through `@ndigo/proxy` `interceptMethods` with
 * method annotations, exactly as applications wire them. Rows: unwoven
 * baseline, woven success (breaker + retry, both passing through), a
 * 3-attempt retry loop that exhausts, and the open-circuit fast-fail path.
 */
import { test } from 'vitest';
import {
    circuitBreaker,
    CircuitOpenError,
    CircuitBreakerInterceptor,
    retry,
    RetryInterceptor,
    fixedBackoff,
} from '../src';
import { interceptMethods } from '@ndigo/proxy';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 200; // async rows: fewer iterations, longer bodies
const retain = sink;

class Service {
    @circuitBreaker({ failureThreshold: 5, resetMs: 60_000 })
    @retry({ attempts: 3, backoff: fixedBackoff(0) })
    async fetch(n: number): Promise<number> {
        return n;
    }
}

class Exhausting {
    @retry({ attempts: 3, backoff: fixedBackoff(0) })
    async boom(): Promise<number> {
        throw new Error('boom');
    }
}

class BreakerOnly {
    @circuitBreaker({ failureThreshold: 3, resetMs: 60_000 })
    async call(): Promise<number> {
        throw new Error('failure');
    }
}

const plain = new Service();
const woven = interceptMethods(new Service(), [new CircuitBreakerInterceptor(), new RetryInterceptor()]);
const exhausting = interceptMethods(new Exhausting(), [new RetryInterceptor()]);
const breaker = interceptMethods(new BreakerOnly(), [new CircuitBreakerInterceptor()]);

test('resilience — unwoven baseline', async ({ bench }) => {
    assertEquivalent('plain result', await plain.fetch(7), 7);
    await bench(benchName('plain async call', BATCH), async () => {
        let acc = 0;
        for (let i = 0; i < BATCH; i++) acc += await plain.fetch(i);
        retain(acc);
    }).run();
});

test('resilience — woven success (breaker + retry pass-through)', async ({ bench }) => {
    assertEquivalent('woven result', await woven.fetch(7), 7);
    await bench(benchName('woven success', BATCH), async () => {
        let acc = 0;
        for (let i = 0; i < BATCH; i++) acc += await woven.fetch(i);
        retain(acc);
    }).run();
});

test('resilience — retry loop exhausts (3 attempts)', async ({ bench }) => {
    let throws = 0;
    await bench(benchName('retry exhaust (3 attempts)', BATCH), async () => {
        for (let i = 0; i < BATCH; i++) {
            try {
                await exhausting.boom();
            } catch {
                throws++;
            }
        }
        retain(throws);
    }).run();
});

test('resilience — open circuit fast-fail', async ({ bench }) => {
    // Prime: three consecutive failures open the circuit (threshold 3).
    for (let i = 0; i < 3; i++) await breaker.call().catch(() => undefined);
    let fastFails = 0;
    try {
        await breaker.call();
    } catch (error) {
        assertEquivalent('open error', error instanceof CircuitOpenError, true);
        fastFails++;
    }
    await bench(benchName('open circuit fast-fail', BATCH), async () => {
        for (let i = 0; i < BATCH; i++) {
            try {
                await breaker.call();
            } catch {
                fastFails++;
            }
        }
        retain(fastFails);
    }).run();
});
