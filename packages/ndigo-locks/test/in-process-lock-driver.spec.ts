/**
 * InProcessLockDriver specs (AD-73): lease lifecycle, monotonic fencing
 * tokens, stale-holder isolation, and the process-wide single-node
 * guarantee via the injectable clock.
 *
 * The lease table is process-wide (single-node semantics), so every test
 * uses its own key — cross-test leftovers on the real clock must never
 * satisfy or break another test's expectations.
 */
import { describe, test, expect } from 'vitest';
import { FrameworkError } from '@ndigo/core';
import { InProcessLockDriver, likeLockDriver, type LockDriver, type LockHandle } from '../src/index';

/**
 * A controllable clock anchored at the real epoch scale: leases written by
 * tests on the default (real) clock expire relative to the fake `now`.
 */
function fakeClock() {
    let now = Date.now();
    return {
        clock: () => now,
        advance: (ms: number) => {
            now += ms;
        },
    };
}

/**
 * Acquires a handle, failing loudly when the key is held — the calls below
 * assert follow-ups on the handle, so a `null` here is a test bug.
 *
 * @param driver - The driver to acquire from.
 * @param key - The lock key.
 * @param ttlMs - Lease duration.
 * @returns A non-null handle.
 */
async function mustAcquire(driver: LockDriver, key: string, ttlMs: number): Promise<LockHandle> {
    const handle = await driver.acquire(key, { ttlMs });
    if (handle === null) {
        throw new Error(`expected to acquire '${key}' — it is held`);
    }
    return handle;
}

describe('InProcessLockDriver', () => {
    test('acquires a lease with a monotonic fencing token and expiry', async () => {
        const time = fakeClock();
        const driver = new InProcessLockDriver({ clock: time.clock });
        const handle = await mustAcquire(driver, 'tok-1', 1_000);

        expect(handle.token).toBe(1);
        expect(handle.expiresAt).toBe(time.clock() + 1_000);
        expect(await handle.isHeld()).toBe(true);
    });

    test('returns null while the key is held (non-blocking contract)', async () => {
        const driver = new InProcessLockDriver();
        await mustAcquire(driver, 'tok-2', 10_000);

        expect(await driver.acquire('tok-2', { ttlMs: 10_000 })).toBeNull();
        expect(await driver.acquire('tok-2b', { ttlMs: 10_000 })).not.toBeNull();
    });

    test('expired leases are simply expired — the next acquirer wins with a fresh token', async () => {
        const time = fakeClock();
        const driver = new InProcessLockDriver({ clock: time.clock });
        const first = await mustAcquire(driver, 'tok-3', 500);
        expect(first.token).toBe(1);

        time.advance(501);
        const second = await mustAcquire(driver, 'tok-3', 500);
        expect(second.token).toBe(2); // fresh monotonic token
    });

    test('a stale holder cannot renew, release, or report held (fencing)', async () => {
        const time = fakeClock();
        const driver = new InProcessLockDriver({ clock: time.clock });
        const stale = await mustAcquire(driver, 'tok-4', 500);
        time.advance(501);
        const successor = await mustAcquire(driver, 'tok-4', 10_000);

        expect(await stale.isHeld()).toBe(false);
        expect(await stale.renew(10_000)).toBe(false);
        // Fencing guard: the stale release must NOT free the successor's lease.
        expect(await stale.release()).toBe(false);
        expect(await successor.isHeld()).toBe(true);
    });

    test('renew extends the lease from now', async () => {
        const time = fakeClock();
        const driver = new InProcessLockDriver({ clock: time.clock });
        const handle = await mustAcquire(driver, 'tok-5', 500);

        time.advance(400);
        expect(await handle.renew(1_000)).toBe(true);
        expect(handle.expiresAt).toBe(time.clock() + 1_000);

        // Past the original expiry (500ms), inside the renewal (1000ms).
        time.advance(900);
        expect(await handle.isHeld()).toBe(true);
    });

    test('renew after expiry fails without touching the lease slot', async () => {
        const time = fakeClock();
        const driver = new InProcessLockDriver({ clock: time.clock });
        const handle = await mustAcquire(driver, 'tok-6', 500);

        time.advance(501);
        expect(await handle.renew(10_000)).toBe(false);
        // The slot is free: a new acquisition wins immediately.
        await mustAcquire(driver, 'tok-6', 500);
    });

    test('release frees the key; a subsequent acquisition gets the next token', async () => {
        const driver = new InProcessLockDriver();
        const first = await mustAcquire(driver, 'tok-7', 10_000);
        expect(await first.release()).toBe(true);

        const second = await mustAcquire(driver, 'tok-7', 10_000);
        expect(second.token).toBe(2);
    });

    test('every driver instance shares the process-wide lease table (single node)', async () => {
        const driverA = new InProcessLockDriver();
        const driverB = new InProcessLockDriver();

        await mustAcquire(driverA, 'tok-8', 10_000);
        expect(await driverB.acquire('tok-8', { ttlMs: 10_000 })).toBeNull();
    });

    test('close releases only the leases this driver acquired', async () => {
        const driverA = new InProcessLockDriver();
        const driverB = new InProcessLockDriver();
        const shared = await mustAcquire(driverA, 'tok-9', 10_000);
        await mustAcquire(driverB, 'tok-9b', 10_000);

        await driverB.close();
        // driverB's own handle is gone; driverA's lease lives on.
        expect(await shared.isHeld()).toBe(true);
        await mustAcquire(driverA, 'tok-9b', 10_000);

        await driverA.close();
        await mustAcquire(driverA, 'tok-9', 10_000);
    });

    test('prefixes isolate independent lock namespaces', async () => {
        const driverA = new InProcessLockDriver({ prefix: 'app-a' });
        const driverB = new InProcessLockDriver({ prefix: 'app-b' });
        await mustAcquire(driverA, 'p-1', 10_000);
        await mustAcquire(driverB, 'p-1', 10_000);
    });

    test('rejects non-positive ttl and empty keys loudly', async () => {
        const driver = new InProcessLockDriver({ clock: () => 0 });
        await expect(driver.acquire('bad-1', { ttlMs: 0 })).rejects.toThrow(TypeError);
        await expect(driver.acquire('bad-1', { ttlMs: Number.NaN })).rejects.toThrow(TypeError);
        await expect(driver.acquire('', { ttlMs: 1 })).rejects.toThrow(FrameworkError);
    });

    test('likeLockDriver guards the contract shape', async () => {
        const driver = new InProcessLockDriver();
        expect(likeLockDriver(driver)).toBe(true);
        expect(likeLockDriver({ kind: 'x', acquire: async () => null, close: async () => {} })).toBe(true);
        expect(likeLockDriver({ kind: 'x', acquire: async () => null })).toBe(false); // close missing
        expect(likeLockDriver(null)).toBe(false);
        expect(likeLockDriver(42)).toBe(false);
    });
});
