/**
 * @module ndigo-scheduler
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { parseDuration } from '../src/spec';

describe('@ndigo/scheduler parseDuration', () => {
    test('passes millisecond numbers through', () => {
        expect(parseDuration(1_000)).toBe(1_000);
        expect(parseDuration(0)).toBe(0);
    });

    test('parses compact unit strings', () => {
        expect(parseDuration('10s')).toBe(10_000);
        expect(parseDuration('5m')).toBe(300_000);
        expect(parseDuration('2h')).toBe(7_200_000);
        expect(parseDuration('1d')).toBe(86_400_000);
        expect(parseDuration('1.5h')).toBe(5_400_000);
    });

    test('accepts uppercase units', () => {
        expect(parseDuration('2S')).toBe(2_000);
        expect(parseDuration('1H')).toBe(3_600_000);
    });

    test('rejects malformed durations', () => {
        expect(() => parseDuration('soon')).toThrow(TypeError);
        expect(() => parseDuration('10')).toThrow(TypeError); // bare number string
        expect(() => parseDuration('s10')).toThrow(TypeError);
        expect(() => parseDuration(-5)).toThrow(TypeError);
        expect(() => parseDuration(Number.NaN)).toThrow(TypeError);
        expect(() => parseDuration(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    });

    test('names the field in error messages', () => {
        expect(() => parseDuration('bogus', 'fixedRate')).toThrow(/fixedRate/);
    });
});
