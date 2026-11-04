/**
 * Per-name logger registry specs (AD-76 D-7).
 * @module ndigo-log
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { LoggerFactory, getLogger } from '../src/logger/logger-factory';

const NS = 'registry-spec';

describe('LoggerFactory per-name registry (AD-76 D-7)', () => {
    beforeEach(() => {
        LoggerFactory.reset();
    });

    test('setLevel applies to handles created before the call', () => {
        const handle = LoggerFactory.getLogger(`${NS}:a`);
        expect(handle.threshold).toBe(SeverityNumber.DEBUG);
        LoggerFactory.setLevel(`${NS}:a`, SeverityNumber.ERROR);
        expect(handle.threshold, 'an existing handle must follow the registry').toBe(SeverityNumber.ERROR);
        expect(LoggerFactory.configuredLevel(`${NS}:a`)).toBe(SeverityNumber.ERROR);
        expect(LoggerFactory.effectiveLevel(`${NS}:a`)).toBe(SeverityNumber.ERROR);
    });

    test('clearLevel falls back to the global threshold', () => {
        LoggerFactory.setLevel(`${NS}:b`, SeverityNumber.WARN);
        LoggerFactory.clearLevel(`${NS}:b`);
        expect(LoggerFactory.configuredLevel(`${NS}:b`)).toBeUndefined();
        expect(LoggerFactory.effectiveLevel(`${NS}:b`)).toBe(SeverityNumber.DEBUG);
    });

    test('the registry override wins over a handle-local one', () => {
        const handle = LoggerFactory.getLogger(`${NS}:c`);
        handle.setThreshold(SeverityNumber.INFO);
        LoggerFactory.setLevel(`${NS}:c`, SeverityNumber.ERROR);
        expect(handle.threshold).toBe(SeverityNumber.ERROR);
        LoggerFactory.clearLevel(`${NS}:c`);
        expect(handle.threshold, 'clearing restores the handle-local override').toBe(SeverityNumber.INFO);
    });

    test('an override survives a global threshold change until cleared', () => {
        LoggerFactory.setLevel(`${NS}:d`, SeverityNumber.ERROR);
        LoggerFactory.setThreshold(SeverityNumber.WARN);
        expect(LoggerFactory.effectiveLevel(`${NS}:d`)).toBe(SeverityNumber.ERROR);
        LoggerFactory.clearLevel(`${NS}:d`);
        expect(LoggerFactory.effectiveLevel(`${NS}:d`)).toBe(SeverityNumber.WARN);
    });

    test('loggerNames and hasLogger enumerate requested names', () => {
        getLogger(`${NS}:x`);
        getLogger(`${NS}:y`);
        expect(LoggerFactory.hasLogger(`${NS}:x`)).toBe(true);
        expect(LoggerFactory.hasLogger('missing')).toBe(false);
        expect(LoggerFactory.loggerNames()).toEqual(expect.arrayContaining([`${NS}:x`, `${NS}:y`]));
    });

    test('reset clears the per-name state (AD-76 D-7)', () => {
        getLogger(`${NS}:z`);
        LoggerFactory.setLevel(`${NS}:z`, SeverityNumber.ERROR);
        LoggerFactory.reset();
        expect(LoggerFactory.hasLogger(`${NS}:z`)).toBe(false);
        expect(LoggerFactory.configuredLevel(`${NS}:z`)).toBeUndefined();
        expect(LoggerFactory.loggerNames()).toEqual([]);
    });
});
