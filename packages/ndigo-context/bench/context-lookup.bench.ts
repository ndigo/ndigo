/**
 * ApplicationContext bean lookup and context startup.
 *
 * The metadata beans pin the `@entry` path and the AD-34 D1 string/token
 * same-cost claim. The dynamic contexts pin scale: 1, 10, 100, and 1,000
 * registered values. Each measured iteration performs 1,000 lookups.
 */

// oxlint-disable @ndigo/no-string-registry-lookup -- benchmark fixtures: the
// string-literal lookup hot path is a measured axis; AD-34 D1 tokens and
// strings share the description-keyed registry (the token case is benched too).

import { test } from 'vitest';
import '@tsmetadata/polyfill';
import {
    ApplicationContextAwareProcessor,
    ContextToken,
    MetadataConfigApplicationContext,
    configuration,
    entry,
} from '../src';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;

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

const context = new MetadataConfigApplicationContext('bench');
context.addProcessor(new ApplicationContextAwareProcessor(context));
context.register(BenchConfig);
for (const name of ['bean1', 'bean2', 'bean3', 'bean4', 'bean5']) context.getValue(name);

const bean1Token = new ContextToken<{ id: number; name: string }>('bean1');

/** Builds a context with `count` directly registered values. */
function dynamicContext(count: number): MetadataConfigApplicationContext {
    const ctx = new MetadataConfigApplicationContext(`bench-${count}`);
    for (let i = 0; i < count; i++) ctx.setValue(`dynamic${i}`, { index: i });
    for (let i = 0; i < count; i++) ctx.getValue(`dynamic${i}`);
    return ctx;
}

const ctx1 = dynamicContext(1);
const ctx10 = dynamicContext(10);
const ctx100 = dynamicContext(100);
const ctx1000 = dynamicContext(1_000);

test('getValue — metadata beans (five registered)', async ({ bench }) => {
    assertEquivalent('bean1 identity', context.getValue('bean1'), context.getValue('bean1'));
    assertEquivalent('bean5 identity', context.getValue('bean5'), context.getValue('bean5'));
    assertEquivalent('bean1 token identity', context.getValue(bean1Token), context.getValue('bean1'));
    await bench.compare(
        bench(benchName('getValue("bean1")', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(context.getValue('bean1'));
        }),
        bench(benchName('getValue("bean5")', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(context.getValue('bean5'));
        }),
        bench(benchName('getValue(ContextToken)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(context.getValue(bean1Token));
        })
    );
});

test('getValue — dynamic scale 1 / 10 / 100 / 1,000', async ({ bench }) => {
    for (const [ctx, count] of [
        [ctx1, 1],
        [ctx10, 10],
        [ctx100, 100],
        [ctx1000, 1_000],
    ] as const) {
        assertEquivalent(
            `dynamic identity ${count}`,
            ctx.getValue(`dynamic${count - 1}`),
            ctx.getValue(`dynamic${count - 1}`)
        );
    }
    await bench.compare(
        bench(benchName('1 value', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(ctx1.getValue('dynamic0'));
        }),
        bench(benchName('10 values', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(ctx10.getValue('dynamic0'));
        }),
        bench(benchName('100 values', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(ctx100.getValue('dynamic0'));
        }),
        bench(benchName('1,000 values', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(ctx1000.getValue('dynamic0'));
        })
    );
});

test('hasValue — hit and miss', async ({ bench }) => {
    assertEquivalent('hasValue hit', context.hasValue('bean1'), true);
    assertEquivalent('hasValue miss', context.hasValue('missing'), false);
    await bench.compare(
        bench(benchName('hasValue hit', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(context.hasValue('bean1'));
        }),
        bench(benchName('hasValue miss', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(context.hasValue('missing'));
        })
    );
});

test('context startup — five metadata beans', async ({ bench }) => {
    await bench('refresh()', () => {
        const ctx = new MetadataConfigApplicationContext('bench-startup');
        ctx.addProcessor(new ApplicationContextAwareProcessor(ctx));
        ctx.register(BenchConfig);
        ctx.refresh();
        retain(ctx.getValue('bean1'));
    }).run({ time: 2_000, warmupTime: 500 });
});
