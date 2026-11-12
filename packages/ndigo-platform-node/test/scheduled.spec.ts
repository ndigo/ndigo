/**
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import { scheduled, TASK_SCHEDULER, TaskScheduler } from '@ndigo/scheduler';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';

/** A `@scheduled` entry registered before refresh (AD-20 demo shape). */
class Heartbeat {
    beats = 0;

    @scheduled({ fixedRate: '1h' })
    beat() {
        this.beats += 1;
    }
}

describe('NodeAutoConfiguration scheduler wiring (AD-20)', () => {
    let context: MetadataConfigApplicationContext;
    let scheduler: TaskScheduler;

    beforeAll(async () => {
        context = new MetadataConfigApplicationContext('scheduling');
        context.register(NodeAutoConfiguration);
        context.setValue('heartbeat', new Heartbeat());
        context.refresh();

        scheduler = context.getValue<TaskScheduler>(TASK_SCHEDULER);
    });

    afterAll(() => {
        context.close();
    });

    test('provisions a taskScheduler and an auto-starting schedule registry', () => {
        expect(context.hasValue(TASK_SCHEDULER)).toBe(true);
        expect(context.hasValue('scheduleRegistry')).toBe(true);

        const registry = context.getValue('scheduleRegistry');
        const running = (registry as { isRunning?: boolean }).isRunning;
        expect(running).toBe(true); // SmartLifecycle auto-start on refresh
    });

    test('discovers the scheduled entry and runs it on demand', async () => {
        const names = scheduler.taskNames();
        expect(names).toContain('heartbeat.beat');

        // The auto-started timer is live with the system clock — stop it and
        // drive the engine deterministically relative to that clock.
        scheduler.stop();

        // First fire is one hour out from registration: now is not yet due.
        await scheduler.tick(new Date());
        expect(scheduler.getStats('heartbeat.beat')?.runs).toBe(0);

        // Any time past the first interval fires it.
        await scheduler.tick(new Date(Date.now() + 7_200_000));
        expect(scheduler.getStats('heartbeat.beat')?.runs).toBe(1);
    });
});
