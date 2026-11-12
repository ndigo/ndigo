/**
 * ApplicationContext entry lookup and context startup.
 *
 * The metadata entries pin the `@entry` path and the AD-34 D1 string/token
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
    entry1() {
        return { id: 1, name: 'entry1' };
    }

    @entry()
    entry2() {
        return { id: 2, name: 'entry2' };
    }

    @entry()
    entry3() {
        return { id: 3, name: 'entry3' };
    }

    @entry()
    entry4() {
        return { id: 4, name: 'entry4' };
    }

    @entry()
    entry5() {
        return { id: 5, name: 'entry5' };
    }
}

const context = new MetadataConfigApplicationContext('bench');
context.addProcessor(new ApplicationContextAwareProcessor(context));
context.register(BenchConfig);
for (const name of ['entry1', 'entry2', 'entry3', 'entry4', 'entry5']) context.getValue(name);

const entry1Token = new ContextToken<{ id: number; name: string }>('entry1');

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

test('getValue — metadata entries (five registered)', async ({ bench }) => {
    assertEquivalent('entry1 identity', context.getValue('entry1'), context.getValue('entry1'));
    assertEquivalent('entry5 identity', context.getValue('entry5'), context.getValue('entry5'));
    assertEquivalent('entry1 token identity', context.getValue(entry1Token), context.getValue('entry1'));
    await bench.compare(
        bench(benchName('getValue("entry1")', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(context.getValue('entry1'));
        }),
        bench(benchName('getValue("entry5")', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(context.getValue('entry5'));
        }),
        bench(benchName('getValue(ContextToken)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(context.getValue(entry1Token));
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
    assertEquivalent('hasValue hit', context.hasValue('entry1'), true);
    assertEquivalent('hasValue miss', context.hasValue('missing'), false);
    await bench.compare(
        bench(benchName('hasValue hit', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(context.hasValue('entry1'));
        }),
        bench(benchName('hasValue miss', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(context.hasValue('missing'));
        })
    );
});

test('context startup — five metadata entries', async ({ bench }) => {
    await bench('refresh()', () => {
        const ctx = new MetadataConfigApplicationContext('bench-startup');
        ctx.addProcessor(new ApplicationContextAwareProcessor(ctx));
        ctx.register(BenchConfig);
        ctx.refresh();
        retain(ctx.getValue('entry1'));
    }).run({ time: 2_000, warmupTime: 500 });
});
