/**
 *
 * Benchmark suite for ApplicationContext bean lookup throughput.
 *
 * Scenarios:
 *   1. getValue hit (first bean)    – warm singleton; direct property read after materialisation
 *   2. getValue hit (fifth bean)    – warm singleton; verifies O(1) regardless of registration order
 *   3. hasValue hit                 – boolean existence check on a registered bean name
 *   4. hasValue miss                – boolean existence check on an unknown name
 *   5. multi-bean scan (× 5)       – rotate through five beans per iteration; tests cache locality
 */

// oxlint-disable @blue/no-string-registry-lookup -- benchmark fixtures: the
// string-literal lookup hot path is a measured axis; AD-34 D1 tokens and
// strings share the description-keyed registry (a token case is benched
// below to pin the same-cost claim).

import { bench, describe } from 'vitest';
import '@tsmetadata/polyfill';
import {
    MetadataConfigApplicationContext,
    ApplicationContextAwareProcessor,
    configuration,
    entry,
    ContextToken,
} from '@blue/context';

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

@configuration
class BenchConfig {
    @entry()
    bean1() {
        return { id: 1, name: 'bean1' };
    }

    @entry()
    bean2() {
        return { id: 2, name: 'bean2' };
    }

    @entry()
    bean3() {
        return { id: 3, name: 'bean3' };
    }

    @entry()
    bean4() {
        return { id: 4, name: 'bean4' };
    }

    @entry()
    bean5() {
        return { id: 5, name: 'bean5' };
    }
}

/* ------------------------------------------------------------------ */
/*  One-time context setup (module level – not per-iteration)         */
/* ------------------------------------------------------------------ */

const ctx = new MetadataConfigApplicationContext('bench');
ctx.addProcessor(new ApplicationContextAwareProcessor(ctx));
ctx.register(BenchConfig);

// Warm up – materialise all singletons before benchmarking
ctx.getValue('bean1');
ctx.getValue('bean2');
ctx.getValue('bean3');
ctx.getValue('bean4');
ctx.getValue('bean5');

let _sink: unknown = 0;

/* ------------------------------------------------------------------ */
/*  Benchmarks                                                         */
/* ------------------------------------------------------------------ */

describe('ApplicationContext – getValue hit (first bean)', () => {
    bench('getValue("bean1")', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += ctx.getValue('bean1') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('ApplicationContext – getValue via ContextToken (D1 same-cost claim)', () => {
    const bean1Token = ContextToken('bean1');
    bench('getValue(bean1Token)', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += ctx.getValue(bean1Token) ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('ApplicationContext – getValue hit (fifth bean)', () => {
    bench('getValue("bean5")', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += ctx.getValue('bean5') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('ApplicationContext – hasValue hit', () => {
    bench('hasValue("bean1")', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += ctx.hasValue('bean1') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('ApplicationContext – hasValue miss', () => {
    bench('hasValue("missing")', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += ctx.hasValue('missing') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('ApplicationContext – multi-bean scan (5 beans per iteration)', () => {
    bench('getValue × 5', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += ctx.getValue('bean1') ? 1 : 0;
            accumulator += ctx.getValue('bean2') ? 1 : 0;
            accumulator += ctx.getValue('bean3') ? 1 : 0;
            accumulator += ctx.getValue('bean4') ? 1 : 0;
            accumulator += ctx.getValue('bean5') ? 1 : 0;
        }
        _sink = accumulator;
    });
});
