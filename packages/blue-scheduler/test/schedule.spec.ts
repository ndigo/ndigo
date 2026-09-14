/**
 * @module blue-scheduler
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { CronSchedule, IntervalSchedule, scheduleFromSpec } from '../src/schedule';

const T0 = new Date('2026-09-13T10:00:00Z');

describe('@blue/scheduler CronSchedule', () => {
    const at = (iso: string): Date => new Date(iso);

    test('6-field expressions fire on their second precision', () => {
        const schedule = new CronSchedule('*/5 * * * * *', 'UTC');

        expect(schedule.next(T0)?.toISOString()).toBe('2026-09-13T10:00:05.000Z');
        expect(schedule.next(at('2026-09-13T10:00:05Z'))?.toISOString()).toBe('2026-09-13T10:00:10.000Z');
    });

    test('5-field expressions are minute-first', () => {
        const schedule = new CronSchedule('*/5 * * * *', 'UTC');

        expect(schedule.next(T0)?.toISOString()).toBe('2026-09-13T10:05:00.000Z');
    });

    test('field counts are auto-detected (7 fields include year)', () => {
        const schedule = new CronSchedule('0 0 3 13 9 * 2027', 'UTC');

        expect(schedule.next(T0)?.toISOString()).toBe('2027-09-13T03:00:00.000Z');
    });

    test('time zone shifts the evaluated wall time', () => {
        const utc = new CronSchedule('0 0 3 * * *', 'UTC');
        const paris = new CronSchedule('0 0 3 * * *', 'Europe/Paris');

        // Paris is UTC+2 in September: 03:00 Paris = 01:00 UTC.
        expect(utc.next(T0)?.toISOString()).toBe('2026-09-14T03:00:00.000Z');
        expect(paris.next(T0)?.toISOString()).toBe('2026-09-14T01:00:00.000Z');
    });

    test('is a time-sequence with no interval', () => {
        const schedule = new CronSchedule('* * * * * *', 'UTC');

        expect(schedule.kind).toBe('cron');
        expect(schedule.intervalMs).toBeUndefined();
    });

    test('rejects malformed expressions at construction', () => {
        expect(() => new CronSchedule('99 99 * * * * *', 'UTC')).toThrow(TypeError);
    });
});

describe('@blue/scheduler IntervalSchedule', () => {
    test('kind and interval are exposed', () => {
        expect(new IntervalSchedule('fixedRate', 10_000).kind).toBe('fixedRate');
        expect(new IntervalSchedule('fixedDelay', 250).kind).toBe('fixedDelay');
        expect(new IntervalSchedule('fixedRate', 10_000).intervalMs).toBe(10_000);
    });

    test('next is the anchor plus the interval', () => {
        const schedule = new IntervalSchedule('fixedRate', 30_000);

        expect(schedule.next(T0)?.toISOString()).toBe('2026-09-13T10:00:30.000Z');
    });

    test('rejects non-positive intervals', () => {
        expect(() => new IntervalSchedule('fixedRate', 0)).toThrow(TypeError);
        expect(() => new IntervalSchedule('fixedDelay', -1)).toThrow(TypeError);
        expect(() => new IntervalSchedule('fixedDelay', Number.NaN)).toThrow(TypeError);
    });
});

describe('@blue/scheduler scheduleFromSpec', () => {
    test('maps each spec trigger to its schedule implementation', () => {
        expect(scheduleFromSpec({ cron: '*/5 * * * * *' }).kind).toBe('cron');
        expect(scheduleFromSpec({ cron: '*/5 * * * * *', timeZone: 'UTC' })).toBeInstanceOf(CronSchedule);
        expect(scheduleFromSpec({ fixedRateMs: 10_000 })).toBeInstanceOf(IntervalSchedule);
        expect(scheduleFromSpec({ fixedRateMs: 10_000 }).kind).toBe('fixedRate');
        expect(scheduleFromSpec({ fixedDelayMs: 250 }).kind).toBe('fixedDelay');
    });

    test('rejects specs without a trigger', () => {
        expect(() => scheduleFromSpec({ maxRunTimeMs: 100 })).toThrow(/no trigger/);
    });
});
