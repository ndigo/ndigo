/**
 * `@scheduled({ lock })` runner specs (AD-73): the TaskScheduler acquires
 * the named distributed lock before each locked run, releases it in the
 * finally, skips contended fires (optionally after a bounded wait), and
 * fails loud when a locked task has no lock driver at all.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { FrameworkError } from '@ndigo/core';
import { InProcessLockDriver } from '@ndigo/locks';
import { TaskScheduler } from '../src/task-scheduler';
import { IntervalSchedule } from '../src/schedule';
import type { ScheduledTaskDefinition } from '../src/task-scheduler';

function schedule(fixedRateMs: number) {
    return new IntervalSchedule('fixedRate', fixedRateMs);
}

function walkingClock() {
    let now = new Date('2026-10-07T00:00:00.000Z');
    return {
        clock: () => now,
        advance: () => {
            now = new Date(now.getTime() + 1_000);
        },
    };
}

/**
 * A runnable counter task carrying a lock key.
 */
function lockedTask(name: string, lockKey: string, runs: string[], fail: boolean = false): ScheduledTaskDefinition {
    return {
        name,
        schedule: schedule(1_000),
        lockKey,
        run: () => {
            if (fail) {
                throw new Error(`${name} boom`);
            }
            runs.push(name);
        },
    };
}

describe('TaskScheduler locked tasks (AD-73)', () => {
    test('acquires the lock, runs, and releases it — consecutive fires both run', async () => {
        const time = walkingClock();
        const driver = new InProcessLockDriver();
        const runs: string[] = [];
        const scheduler = new TaskScheduler({ clock: time.clock, lockDriver: driver });

        scheduler.register({
            name: 'payroll',
            schedule: schedule(1_000),
            lockKey: 'payroll-window',
            run: () => {
                runs.push(time.clock().toISOString());
            },
        });

        time.advance(); // past the first fire
        expect(await scheduler.tick()).toBe(1);
        time.advance();
        expect(await scheduler.tick()).toBe(1);
        expect(runs).toHaveLength(2);
        await scheduler.close();
    });

    test('a contended lock skips the fire and keeps the task schedulable', async () => {
        const time = walkingClock();
        const driver = new InProcessLockDriver();
        const warnings: string[] = [];
        const scheduler = new TaskScheduler({ clock: time.clock, lockDriver: driver, warn: (m) => warnings.push(m) });
        scheduler.register(lockedTask('a', 'gate', []));

        const held = await driver.acquire('gate', { ttlMs: 60_000 });
        if (held === null) throw new Error('expected the external holder');

        time.advance(); // past the first fire
        expect(await scheduler.tick()).toBe(1); // the run STARTS (fire)…
        expect(scheduler.getStats('a')?.runs).toBe(1); // …but was skipped
        expect(scheduler.getStats('a')?.lastError).toBeNull();
        expect(warnings.some((message) => message.includes("lock 'gate' is held"))).toBe(true);

        // The finally normalized bookkeeping — a later fire runs normally.
        time.advance();
        await held.release();
        expect(await scheduler.tick()).toBe(1);
        await scheduler.close();
    });

    test('a bounded lockWait acquires as soon as the lock frees', async () => {
        const time = walkingClock();
        const driver = new InProcessLockDriver();
        const scheduler = new TaskScheduler({ clock: time.clock, lockDriver: driver, warn: () => {} });
        const runs: string[] = [];
        scheduler.register({
            name: 'patient',
            schedule: schedule(1_000),
            lockKey: 'wait-gate',
            lockWaitMs: 400,
            lockWaitStepMs: 25,
            run: () => {
                runs.push('ran');
            },
        });

        const held = await driver.acquire('wait-gate', { ttlMs: 60_000 });
        if (held === null) throw new Error('expected the external holder');

        const started = Date.now();
        // Release shortly after the tick starts waiting.
        const releaseSoon = (async () => {
            await new Promise<void>((resolve) => {
                setTimeout(resolve, 100);
            });
            await held.release();
        })();
        time.advance(); // past the first fire
        expect(await scheduler.tick()).toBe(1);
        await releaseSoon;

        expect(runs).toHaveLength(1);
        expect(Date.now() - started).toBeGreaterThan(50); // actually waited
        await scheduler.close();
    });

    test('a throwing run still releases the lease (finally)', async () => {
        const time = walkingClock();
        const driver = new InProcessLockDriver();
        const scheduler = new TaskScheduler({ clock: time.clock, lockDriver: driver, warn: () => {} });
        scheduler.register(lockedTask('boom', 'shared', [], true));

        time.advance(); // past the first fire
        expect(await scheduler.tick()).toBe(1);
        expect(scheduler.getStats('boom')?.failures).toBe(1);

        // The throwing run's finally released the lease: an immediate
        // external acquisition wins (no wait budget needed).
        const probe = await driver.acquire('shared', { ttlMs: 10_000 });
        if (probe === null) {
            throw new Error('the finally did not release the lease after the throw');
        }
        expect(await probe.release()).toBe(true);
        await scheduler.close();
    });

    test('a locked task with no lock driver fails loud instead of running unguarded', async () => {
        const time = walkingClock();
        const scheduler = new TaskScheduler({ clock: time.clock, warn: () => {} });
        const runs: string[] = [];
        scheduler.register(lockedTask('naive', 'gate', runs));

        time.advance(); // past the first fire
        expect(await scheduler.tick()).toBe(1);
        expect(runs).toHaveLength(0);
        expect(scheduler.getStats('naive')?.lastError).toBeInstanceOf(FrameworkError);
        await scheduler.close();
    });
});
