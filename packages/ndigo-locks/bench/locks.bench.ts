// oxlint-disable no-await-in-loop -- lock ops are sequential by contract.
/**
 * `@ndigo/locks` InProcessLockDriver acquire/release throughput.
 *
 * `acquire` returns a handle (or `null` on contention); `release` frees it.
 * Both are async. Rows cover the uncontended success path, contention
 * (immediate `null`), and renew.
 */
import { test } from 'vitest';
import { InProcessLockDriver } from '../src/in-process-lock-driver';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;

test('InProcessLockDriver — acquire + release (uncontended)', async ({ bench }) => {
    const driver = new InProcessLockDriver();
    await bench(benchName('acquire+release', BATCH), async () => {
        let ok = 0;
        for (let i = 0; i < BATCH; i++) {
            const h = await driver.acquire(`k${i}`, { ttlMs: 60_000 });
            if (h) {
                await h.release();
                ok++;
            }
        }
        retain(ok);
    }).run();
});

test('InProcessLockDriver — contention (null path)', async ({ bench }) => {
    const driver = new InProcessLockDriver();
    const held = await driver.acquire('hot', { ttlMs: 60_000 });
    assertEquivalent('held', held !== null, true);
    await bench(benchName('acquire contended', BATCH), async () => {
        let nulls = 0;
        for (let i = 0; i < BATCH; i++) {
            const h = await driver.acquire('hot', { ttlMs: 60_000 });
            if (h === null) nulls++;
        }
        retain(nulls);
    }).run();
    await held?.release();
});

test('InProcessLockDriver — renew', async ({ bench }) => {
    const driver = new InProcessLockDriver();
    const h = await driver.acquire('renew', { ttlMs: 60_000 });
    assertEquivalent('held', h !== null, true);
    await bench(benchName('renew', BATCH), async () => {
        let ok = 0;
        for (let i = 0; i < BATCH; i++) {
            if ((await h?.renew(60_000)) === true) ok++;
        }
        retain(ok);
    }).run();
    await h?.release();
});
