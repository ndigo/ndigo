/**
 * @module blue-scheduler
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { CronSchedule, IntervalSchedule } from '../src/schedule';
import { TaskScheduler } from '../src/task-scheduler';

const T0 = new Date('2026-09-13T10:00:00Z');
const at = (secondsLater: number): Date => new Date(T0.getTime() + secondsLater * 1_000);

const makeScheduler = (
    warn: (message: string) => void = (): void => {}
): {
    scheduler: TaskScheduler;
    advance: (seconds: number) => void;
} => {
    let now = T0;
    const scheduler = new TaskScheduler({ clock: () => now, warn });
    return {
        scheduler,
        advance: (seconds: number) => {
            now = at(seconds);
        },
    };
};

/** A run we can release on demand (single-flight / drain tests). */
const deferred = (): { promise: Promise<void>; release: () => void } => {
    let releaseFn: (() => void) | undefined;
    const promise = new Promise<void>((resolve) => {
        releaseFn = resolve;
    });
    return {
        promise,
        release: () => {
            releaseFn?.();
        },
    };
};

describe('@blue/scheduler TaskScheduler', () => {
    test('fires interval tasks at their due time', async () => {
        const { scheduler } = makeScheduler();
        const run = new (class {
            calls = 0;
            async execute() {
                this.calls += 1;
            }
        })();
        scheduler.register({
            name: 'tick',
            schedule: new IntervalSchedule('fixedRate', 10_000),
            run: () => run.execute(),
        });

        expect(await scheduler.tick(T0)).toBe(0); // first fire is one interval out
        expect(await scheduler.tick(at(10))).toBe(1);
        expect(run.calls).toBe(1);
        expect(await scheduler.tick(at(10))).toBe(0); // already past, next is at +20s
        expect(await scheduler.tick(at(20))).toBe(1);
        expect(run.calls).toBe(2);
    });

    test('fixedDelay anchors the next fire at run completion', async () => {
        const { scheduler, advance } = makeScheduler();
        const run = new (class {
            calls = 0;
            async execute() {
                this.calls += 1;
            }
        })();
        scheduler.register({
            name: 'slow',
            schedule: new IntervalSchedule('fixedDelay', 10_000),
            run: () => run.execute(),
        });

        advance(10); // completion time = +10s → next fire at +20s
        await scheduler.tick();
        expect(run.calls).toBe(1);
        expect(await scheduler.tick(at(19))).toBe(0);
        await scheduler.tick(at(20));
        expect(run.calls).toBe(2);
    });

    test('fires cron tasks on their expression times', async () => {
        const { scheduler } = makeScheduler();
        let calls = 0;
        scheduler.register({
            name: 'cron-job',
            schedule: new CronSchedule('*/2 * * * * *', 'UTC'),
            run: () => {
                calls += 1;
            },
        });

        expect(await scheduler.tick(at(1))).toBe(0);
        expect(await scheduler.tick(at(2))).toBe(1);
        expect(await scheduler.tick(at(4))).toBe(1);
        expect(calls).toBe(2);
    });

    test('skips overlapping runs (single-flight) and slides the next fire', async () => {
        const { scheduler } = makeScheduler();
        const gate = deferred();
        let calls = 0;
        scheduler.register({
            name: 'long',
            schedule: new IntervalSchedule('fixedRate', 10_000),
            run: () => {
                calls += 1;
                return gate.promise;
            },
        });

        const first = scheduler.tick(at(10)); // starts run 1, completes later
        await Promise.resolve(); // let the run start
        expect(calls).toBe(1);

        expect(await scheduler.tick(at(20))).toBe(0); // in-flight → skipped
        expect(calls).toBe(1);

        gate.release();
        await first;
        expect(scheduler.getStats('long')?.inFlight).toBe(false);

        expect(await scheduler.tick(at(30))).toBe(1); // slid → fires again
        expect(calls).toBe(2);
    });

    test('isolates run errors and keeps firing', async () => {
        const { scheduler } = makeScheduler();
        const run = new (class {
            calls = 0;
            execute(): Promise<void> {
                this.calls += 1;
                if (this.calls === 1) {
                    throw new Error('boom');
                }
                return Promise.resolve();
            }
        })();
        scheduler.register({
            name: 'flaky',
            schedule: new IntervalSchedule('fixedRate', 10_000),
            run: () => run.execute(),
        });
        scheduler.register({
            name: 'steady',
            schedule: new IntervalSchedule('fixedRate', 10_000),
            run: () => Promise.resolve(),
        });

        expect(await scheduler.tick(at(10))).toBe(2); // both start, failure isolated
        expect(scheduler.getStats('flaky')?.failures).toBe(1);
        expect(scheduler.getStats('flaky')?.lastError?.message).toBe('boom');
        expect(scheduler.getStats('steady')?.failures).toBe(0);

        expect(await scheduler.tick(at(20))).toBe(2); // flaky fires again
        expect(run.calls).toBe(2);
        expect(scheduler.getStats('flaky')?.failures).toBe(1);
    });

    test('maxRunTime releases the slot and warns without cancelling', async () => {
        const warnings: string[] = [];
        const { scheduler } = makeScheduler((message) => warnings.push(message));
        const gate = deferred();
        let calls = 0;
        scheduler.register({
            name: 'stuck',
            schedule: new IntervalSchedule('fixedRate', 10_000),
            maxRunTimeMs: 20,
            run: () => {
                calls += 1;
                return gate.promise;
            },
        });

        await scheduler.tick(at(10)); // race: run never finishes → timeout wins
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('exceeded maxRunTime');
        expect(scheduler.getStats('stuck')?.inFlight).toBe(false); // slot released

        gate.release();
        await scheduler.close();
    });

    test('maxRunTime: a rejection after the timeout still records a failure', async () => {
        const { scheduler } = makeScheduler();
        const late = Promise.withResolvers<Error>();
        scheduler.register({
            name: 'slow-thrower',
            schedule: new IntervalSchedule('fixedRate', 1_000),
            maxRunTimeMs: 10,
            run: () =>
                late.promise.then((error) => {
                    throw error;
                }),
        });

        await scheduler.tick(at(10)); // timeout wins the race, slot released
        expect(scheduler.getStats('slow-thrower')?.failures).toBe(0);

        late.reject(new Error('late boom')); // run rejects after the race settled
        await new Promise((resolve) => setTimeout(resolve, 20));

        const stats = scheduler.getStats('slow-thrower');
        expect(stats?.failures).toBe(1);
        expect(stats?.lastError?.message).toBe('late boom');
        await scheduler.close();
    });

    test('maxRunTime clears its cap timer once the run settles', async () => {
        vi.useFakeTimers();
        try {
            const { scheduler } = makeScheduler();
            scheduler.register({
                name: 'quick',
                schedule: new IntervalSchedule('fixedRate', 10_000),
                maxRunTimeMs: 2_000,
                run: () => Promise.resolve(),
            });

            expect(await scheduler.tick(at(10))).toBe(1); // run settles well within the cap
            await scheduler.close();

            // Pre-fix the uncleared 2 s cap stayed armed after the run (and
            // close()) — pinning the event loop. A settled race must leave
            // no timer behind.
            expect(vi.getTimerCount()).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    test('schedules farther out than 2^31 ms never busy-loop the timer chain', async () => {
        const scheduler = new TaskScheduler();
        scheduler.register({
            name: 'yearly',
            schedule: new CronSchedule('0 0 2 1 *', 'UTC'),
            run: () => {},
        });

        const emitWarning = vi.spyOn(process, 'emitWarning');
        try {
            scheduler.start();
            // Without the clamp each re-arm would flood TimeoutOverflowWarning
            // (one per ~1ms wake); give the loop a window to misbehave.
            await new Promise((resolve) => setTimeout(resolve, 150));
        } finally {
            scheduler.stop();
        }
        const overflowWarnings = emitWarning.mock.calls.filter((call) =>
            String(call[0]).includes('32-bit signed integer')
        );
        emitWarning.mockRestore();

        expect(overflowWarnings).toHaveLength(0);
    });

    test('rejects duplicate names and registration after close', async () => {
        const { scheduler } = makeScheduler();
        const run = () => Promise.resolve();
        scheduler.register({ name: 'dup', schedule: new IntervalSchedule('fixedRate', 1_000), run });

        expect(() =>
            scheduler.register({ name: 'dup', schedule: new IntervalSchedule('fixedRate', 1_000), run })
        ).toThrow(/duplicate task/);

        await scheduler.close();
        expect(() =>
            scheduler.register({ name: 'late', schedule: new IntervalSchedule('fixedRate', 1_000), run })
        ).toThrow(/closed/);
    });

    test('close drains in-flight runs', async () => {
        const { scheduler } = makeScheduler();
        const gate = deferred();
        let finished = false;
        scheduler.register({
            name: 'drain',
            schedule: new IntervalSchedule('fixedRate', 10_000),
            run: () =>
                gate.promise.finally(() => {
                    finished = true;
                }),
        });

        const started = scheduler.tick(at(10));
        await Promise.resolve();
        expect(scheduler.getStats('drain')?.inFlight).toBe(true);

        let closed = false;
        const closing = scheduler.close().then(() => {
            closed = true;
        });
        await Promise.resolve();
        expect(closed).toBe(false); // close waits for the in-flight run

        gate.release();
        await started;
        await closing;
        expect(finished).toBe(true);
        expect(closed).toBe(true);
        expect(scheduler.taskNames()).toEqual([]);
    });
});

describe('@blue/scheduler TaskScheduler wall-clock loop (OP-13)', () => {
    const INTERVAL_MS = 30;

    /** Polls `predicate` every 5 ms on a real timer until true or timeout. */
    const waitFor = async (predicate: () => boolean, timeoutMs = 2_000): Promise<void> => {
        const deadline = Date.now() + timeoutMs;
        const poll = async (): Promise<void> => {
            if (predicate()) {
                return;
            }
            if (Date.now() >= deadline) {
                throw new Error('waitFor: condition did not become true in time');
            }
            const { promise, resolve } = Promise.withResolvers<void>();
            setTimeout(resolve, 5);
            await promise;
            return poll();
        };
        return poll();
    };

    const delay = (ms: number): Promise<void> => {
        const { promise, resolve } = Promise.withResolvers<void>();
        setTimeout(resolve, ms);
        return promise;
    };

    test('start() fires a fixedRate task repeatedly on the wall clock', async () => {
        const scheduler = new TaskScheduler({ warn: () => {} });
        let calls = 0;
        scheduler.register({
            name: 'beat',
            schedule: new IntervalSchedule('fixedRate', INTERVAL_MS),
            run: () => {
                calls += 1;
            },
        });

        try {
            scheduler.start();
            await waitFor(() => calls >= 3);
        } finally {
            scheduler.stop();
        }
        expect(calls).toBeGreaterThanOrEqual(3);
        expect(scheduler.isRunning).toBe(false);
        await scheduler.close();
    });

    test('stop() halts the loop: no further fires', async () => {
        const scheduler = new TaskScheduler({ warn: () => {} });
        let calls = 0;
        scheduler.register({
            name: 'beat',
            schedule: new IntervalSchedule('fixedRate', INTERVAL_MS),
            run: () => {
                calls += 1;
            },
        });

        try {
            scheduler.start();
            await waitFor(() => calls >= 1);
            scheduler.stop();
            const atStop = calls;
            expect(scheduler.isRunning).toBe(false);
            // Several intervals must elapse without another fire.
            await delay(INTERVAL_MS * 4);
            expect(calls).toBe(atStop);
        } finally {
            scheduler.stop();
            await scheduler.close();
        }
    });

    test('an in-flight fixedDelay run does not re-fire; the loop re-arms one interval after completion', async () => {
        const scheduler = new TaskScheduler({ warn: () => {} });
        const gate = deferred();
        let calls = 0;
        scheduler.register({
            name: 'slow',
            schedule: new IntervalSchedule('fixedDelay', INTERVAL_MS),
            run: () => {
                calls += 1;
                return gate.promise;
            },
        });

        try {
            scheduler.start();
            await waitFor(() => calls === 1);

            // In flight and overdue by several intervals: single-flight holds
            // — no extra fires (the 0-delay re-arm regression).
            await delay(INTERVAL_MS * 3);
            expect(calls).toBe(1);

            const completedAt = Date.now();
            gate.release();

            // The next fire is anchored at completion + one interval: it
            // must not fire immediately after the release.
            await delay(INTERVAL_MS / 2);
            expect(calls).toBe(1);

            await waitFor(() => calls === 2);
            expect(Date.now() - completedAt).toBeGreaterThanOrEqual(INTERVAL_MS - 5);
        } finally {
            gate.release();
            await scheduler.close();
        }
    });
});
