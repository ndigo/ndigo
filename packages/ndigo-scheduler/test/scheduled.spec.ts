/**
 * @module ndigo-scheduler
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { getScheduledSpec, resolveScheduledSpec, scheduled } from '../src/scheduled';

describe('@ndigo/scheduler resolveScheduledSpec', () => {
    test('normalizes a bare cron string', () => {
        expect(resolveScheduledSpec('*/5 * * * * *')).toEqual({ cron: '*/5 * * * * *' });
    });

    test('normalizes cron specs with time zone and max run time', () => {
        expect(resolveScheduledSpec({ cron: '0 3 * * *', timeZone: 'Europe/Paris', maxRunTime: '2m' })).toEqual({
            cron: '0 3 * * *',
            timeZone: 'Europe/Paris',
            maxRunTimeMs: 120_000,
        });
    });

    test('normalizes interval specs with exactly one trigger', () => {
        expect(resolveScheduledSpec({ fixedRate: '10s' })).toEqual({ fixedRateMs: 10_000 });
        expect(resolveScheduledSpec({ fixedDelay: 5_000, maxRunTime: '1m' })).toEqual({
            fixedDelayMs: 5_000,
            maxRunTimeMs: 60_000,
        });
    });

    test('rejects invalid cron expressions', () => {
        expect(() => resolveScheduledSpec('99 99 * * * * *')).toThrow(/invalid cron expression/);
        expect(() => resolveScheduledSpec({ cron: 'not a cron' })).toThrow(TypeError);
    });

    test('rejects invalid time zones', () => {
        expect(() => resolveScheduledSpec({ cron: '* * * * * *', timeZone: 'Bogus/Zone' })).toThrow(
            /invalid time zone/
        );
    });

    test('rejects malformed durations', () => {
        expect(() => resolveScheduledSpec({ fixedRate: 'soon' })).toThrow(/fixedRate/);
        expect(() => resolveScheduledSpec({ fixedRate: 1000, maxRunTime: 'nope' })).toThrow(/maxRunTime/);
    });

    test('rejects interval specs with both or neither trigger', () => {
        expect(() => resolveScheduledSpec({ fixedRate: '10s', fixedDelay: '10s' })).toThrow(/exactly one/);
        expect(() => resolveScheduledSpec({})).toThrow(/unknown spec/);
        expect(() => resolveScheduledSpec({ maxRunTime: '1m' })).toThrow(/unknown spec/);
    });

    test('rejects zero intervals at decoration time', () => {
        expect(() => resolveScheduledSpec({ fixedRate: 0 })).toThrow(/positive/);
        expect(() => resolveScheduledSpec({ fixedRate: '0s' })).toThrow(/positive/);
        expect(() => resolveScheduledSpec({ fixedDelay: 0 })).toThrow(/positive/);
        expect(() => resolveScheduledSpec({ fixedDelay: '0h' })).toThrow(/positive/);
    });

    test('rejects non-object specs', () => {
        expect(() => resolveScheduledSpec(42 as unknown as never)).toThrow(TypeError);
        expect(() => resolveScheduledSpec(undefined as unknown as never)).toThrow(TypeError);
    });

    test('normalizes lock fields (AD-73)', () => {
        expect(resolveScheduledSpec({ cron: '* * * * * *', lock: 'gate', lockWait: 500, lockTtl: '10s' })).toEqual({
            cron: '* * * * * *',
            lockKey: 'gate',
            lockWaitMs: 500,
            lockTtlMs: 10_000,
        });
        expect(resolveScheduledSpec({ fixedRate: '1m', lock: 'gate', lockWaitStep: 25 })).toEqual({
            fixedRateMs: 60_000,
            lockKey: 'gate',
            lockWaitStepMs: 25,
        });
    });

    test('rejects malformed lock fields at decoration time (AD-73)', () => {
        expect(() => resolveScheduledSpec({ cron: '* * * * * *', lock: '' })).toThrow(/invalid lock name/);
        expect(() => resolveScheduledSpec({ cron: '* * * * * *', lock: 'bad name' })).toThrow(/invalid lock name/);
        expect(() => resolveScheduledSpec({ cron: '* * * * * *', lock: 'gate', lockWait: 'soon' })).toThrow(/lockWait/);
        expect(() => resolveScheduledSpec({ cron: '* * * * * *', lock: 'gate', lockTtl: 0 })).toThrow(/lockTtl/);
        expect(() => resolveScheduledSpec({ cron: '* * * * * *', lock: 'gate', lockWaitStep: -5 })).toThrow(
            /lockWaitStep/
        );
    });
});

describe('@ndigo/scheduler @scheduled decorator', () => {
    test('records the normalized spec in Symbol.metadata', () => {
        class Tasks {
            @scheduled('*/30 * * * * *')
            tick() {}
        }

        expect(getScheduledSpec(Tasks, 'tick')).toEqual({ cron: '*/30 * * * * *' });
        expect(getScheduledSpec(Tasks, 'other')).toBeUndefined();
    });

    test('records multiple scheduled methods independently', () => {
        class Tasks {
            @scheduled({ fixedRate: '10s' })
            first() {}

            @scheduled({ cron: '0 4 * * *', timeZone: 'UTC' })
            second() {}
        }

        expect(getScheduledSpec(Tasks, 'first')).toEqual({ fixedRateMs: 10_000 });
        expect(getScheduledSpec(Tasks, 'second')).toEqual({ cron: '0 4 * * *', timeZone: 'UTC' });
    });

    test('rejects non-method application', () => {
        const decorator = scheduled('* * * * * *');

        expect(() => decorator(() => {}, { kind: 'class' } as unknown as ClassMethodDecoratorContext)).toThrow(
            /can only be applied/
        );
        expect(() => decorator(() => {}, { kind: 'field' } as unknown as ClassMethodDecoratorContext)).toThrow(
            /can only be applied/
        );
    });

    test('rejects bad specs at decoration time', () => {
        expect(() => scheduled('a b c')).toThrow(/invalid cron expression/);
        expect(() => scheduled({ cron: '* * * * * *', timeZone: 'Bogus/Zone' })).toThrow(/invalid time zone/);
    });

    test('refuses to run without a Node runtime (browser guard)', () => {
        const savedProcess = globalThis.process;
        try {
            Object.defineProperty(globalThis, 'process', { value: undefined, configurable: true });
            expect(() => scheduled('* * * * * *')).toThrow(/Node-only/);
        } finally {
            Object.defineProperty(globalThis, 'process', { value: savedProcess, configurable: true });
        }
    });
});
