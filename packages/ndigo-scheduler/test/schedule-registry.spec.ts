/**
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { GenericApplicationContext } from '@ndigo/context';
import { scheduled } from '../src/scheduled';
import { ScheduleRegistry } from '../src/schedule-registry';
import { IntervalSchedule } from '../src/schedule';
import { TaskScheduler } from '../src/task-scheduler';

const T0 = new Date('2026-09-13T10:00:00Z');

class Housekeeping {
    runs = 0;

    @scheduled('*/30 * * * * *')
    purge() {
        this.runs += 1;
    }

    @scheduled({ fixedRate: '1m' })
    beat() {
        this.runs += 1;
    }

    plain() {
        // not scheduled
    }
}

class PlainEntry {
    plain() {
        // not scheduled
    }
}

describe('@ndigo/scheduler ScheduleRegistry', () => {
    let context: GenericApplicationContext;
    let scheduler: TaskScheduler;
    let registry: ScheduleRegistry;

    beforeEach(() => {
        context = new GenericApplicationContext('test');
        scheduler = new TaskScheduler({ clock: () => T0 });
        registry = new ScheduleRegistry();
    });

    afterEach(async () => {
        await scheduler.close();
        registry.close();
    });

    test('discovers scheduled methods on entry instances and names them <entry>.<method>', () => {
        context.setValue('housekeeping', new Housekeeping());
        registry.scan(context, scheduler);

        expect(registry.tasks).toHaveLength(2);
        expect(scheduler.taskNames().sort()).toEqual(['housekeeping.beat', 'housekeeping.purge']);
    });

    test('binds each run to its owner instance', async () => {
        const home = new Housekeeping();
        context.setValue('housekeeping', home);
        registry.scan(context, scheduler);

        const purge = registry.tasks.find((task) => task.name === 'housekeeping.purge');
        if (!purge) {
            throw new Error('expected a purge task');
        }

        expect(purge.schedule.kind).toBe('cron');
        await purge.run();
        expect(home.runs).toBe(1);

        const beat = registry.tasks.find((task) => task.name === 'housekeeping.beat');
        if (!beat) {
            throw new Error('expected a beat task');
        }
        expect(beat.schedule.kind).toBe('fixedRate');
        expect((beat.schedule as IntervalSchedule).intervalMs).toBe(60_000);
    });

    test('a @scheduled class registered as a prototype fails init loudly', () => {
        // The application context wraps even class values in proxies, so the
        // owner-resolution guard is exercised through a raw-value context:
        // the same shape a non-proxying registry would present (AD-20 D5.5).
        const rawContext = {
            housekeeping: Housekeeping,
            getValue(name: string): unknown {
                return this[name as 'housekeeping'];
            },
        };

        expect(() => registry.scan(rawContext as unknown as GenericApplicationContext, scheduler)).toThrow(
            /registered as a class/
        );
        expect(scheduler.taskNames()).toEqual([]);
    });

    test('ignores non-object values and entries without schedules', () => {
        context.setValue('plain', new PlainEntry());
        context.setValue('meaningless', 'just a string');
        registry.scan(context, scheduler);

        expect(scheduler.taskNames()).toEqual([]);
    });

    test('close clears the registry and allows re-init', () => {
        context.setValue('housekeeping', new Housekeeping());
        registry.scan(context, scheduler);
        expect(registry.tasks).toHaveLength(2);

        registry.close();
        expect(registry.tasks).toHaveLength(0);

        registry.scan(context, scheduler);
        expect(registry.tasks).toHaveLength(2);
    });

    test('init refuses to run twice without close', () => {
        context.setValue('housekeeping', new Housekeeping());
        registry.scan(context, scheduler);

        expect(() => registry.scan(context, scheduler)).toThrow(/already been initialized/);
    });
});
