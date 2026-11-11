/**
 *
 * Benchmark suite for ApplicationContext / Factory lookup throughput.
 *
 * The factory's `getValue` hot path has three distinct branches:
 *
 *   1. Warm singleton  — instance already cached on the factory object;
 *      resolved in two checks: `hasInstance` (`name in this`) + direct property read.
 *      This is the O(1) fast path hit on every request after first instantiation.
 *
 *   2. Cold constructor — instance not yet created; must construct, configure, cache.
 *      Only hit once per name in singleton scope.
 *
 *   3. Miss            — neither instance nor constructor registered; falls through to
 *      `return this[name]` which yields `undefined`.
 *
 * Additional operations benchmarked:
 *
 *   4. `hasValue`  — dual `in` check: `name in this || '$'+name in this`
 *   5. `hasInstance` — single `in` check
 *   6. `keys(ctx)` — enumerates all registered values (Object.keys)
 *
 * Key things to watch for:
 *   - Warm singleton should be near-native property access (< 1 µs / call).
 *   - Cold constructor measures setup cost; should not appear on the hot path.
 *   - Miss cost should be similar to warm (just a falsy property read).
 *   - Large gap between warm and miss would indicate unexpected work on the miss path.
 */

// oxlint-disable @ndigo/no-string-registry-lookup -- benchmark fixtures: the
// string-literal lookup hot path is a measured axis; AD-34 D1 tokens and
// strings share the description-keyed registry (same-cost claim pinned in
// packages/ndigo-context/bench/context-lookup.bench.ts's token case).

import { test } from 'vitest';
import { DefaultFactory } from '../../ndigo-factory/src';
import { assertEquivalent, benchName } from '../../../benchmarks/lib/verify';

/* ------------------------------------------------------------------ */
/*  Factory setup                                                       */
/* ------------------------------------------------------------------ */

// Warm factory: singleton already instantiated and cached as a plain
// own property, so `hasInstance` returns true on the first call.
const warmFactory = new DefaultFactory();
const singletonValue = { id: 42, name: 'test-service' };
warmFactory.setValue('myService', singletonValue);
// Force the fast path by triggering getValue once (caches as own property)
warmFactory.getValue('myService');

// Miss factory: nothing registered under 'unknown'.
const missFactory = new DefaultFactory();
warmFactory.setValue('present', { x: 1 });

// Multi-value factory: 10 registered singletons to measure keys() cost.
const multiFactory = new DefaultFactory();
for (let i = 0; i < 10; i++) {
    multiFactory.setValue(`entry${i}`, { index: i });
    multiFactory.getValue(`entry${i}`); // warm each
}

let _sink: unknown = 0;

assertEquivalent('factory getValue', warmFactory.getValue('myService'), singletonValue);
assertEquivalent('factory hasValue', warmFactory.hasValue('myService'), true);
assertEquivalent('factory hasInstance', warmFactory.hasInstance('myService'), true);
assertEquivalent('factory keys count', Object.keys(multiFactory).length >= 10, true);

/* ------------------------------------------------------------------ */
/*  1. getValue – warm singleton (fast path)                           */
/* ------------------------------------------------------------------ */

test('getValue – warm singleton (fast path)', async ({ bench }) => {
    await bench(benchName('getValue — warm singleton', 1000), () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += warmFactory.getValue('myService') ? 1 : 0;
        }
        _sink = accumulator;
    }).run();
});

/* ------------------------------------------------------------------ */
/*  2. getValue – miss (no instance, no constructor)                   */
/* ------------------------------------------------------------------ */

test('getValue – miss (undefined result)', async ({ bench }) => {
    await bench(benchName('getValue — miss', 1000), () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            const v = missFactory.getValue('unknown');
            accumulator += v === undefined ? 0 : 1;
        }
        _sink = accumulator;
    }).run();
});

/* ------------------------------------------------------------------ */
/*  3. hasValue – present (instance path)                              */
/* ------------------------------------------------------------------ */

test('hasValue – present key', async ({ bench }) => {
    await bench(benchName('hasValue — present', 1000), () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += warmFactory.hasValue('myService') ? 1 : 0;
        }
        _sink = accumulator;
    }).run();
});

/* ------------------------------------------------------------------ */
/*  4. hasValue – absent key                                           */
/* ------------------------------------------------------------------ */

test('hasValue – absent key', async ({ bench }) => {
    await bench(benchName('hasValue — absent', 1000), () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += warmFactory.hasValue('nope') ? 1 : 0;
        }
        _sink = accumulator;
    }).run();
});

/* ------------------------------------------------------------------ */
/*  5. hasInstance – present vs absent                                 */
/* ------------------------------------------------------------------ */

test('hasInstance – present key', async ({ bench }) => {
    await bench(benchName('hasInstance — present', 1000), () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += warmFactory.hasInstance('myService') ? 1 : 0;
        }
        _sink = accumulator;
    }).run();
});

/* ------------------------------------------------------------------ */
/*  6. Object.keys() on a factory with 10 entries                     */
/* ------------------------------------------------------------------ */

test('Object.keys(factory) – 10 entries', async ({ bench }) => {
    await bench(benchName('Object.keys — 10 entries', 1000), () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += Object.keys(multiFactory).length;
        }
        _sink = accumulator;
    }).run();
});
