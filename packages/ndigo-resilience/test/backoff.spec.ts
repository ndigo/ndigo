/**
 * @module ndigo-resilience
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { exponentialBackoff, fixedBackoff } from '@ndigo/resilience';

describe('fixedBackoff', () => {
    it('returns a constant delay for every attempt', () => {
        const policy = fixedBackoff(25);

        expect(policy.delay(1)).toBe(25);
        expect(policy.delay(2)).toBe(25);
        expect(policy.delay(9)).toBe(25);
    });
});

describe('exponentialBackoff', () => {
    it('grows by the factor per attempt starting from initialMs', () => {
        const policy = exponentialBackoff({ initialMs: 10, factor: 2 });

        expect(policy.delay(1)).toBe(10);
        expect(policy.delay(2)).toBe(20);
        expect(policy.delay(3)).toBe(40);
    });

    it('defaults the factor to 2', () => {
        expect(exponentialBackoff({ initialMs: 5 }).delay(4)).toBe(40);
    });

    it('caps growth at maxMs when provided', () => {
        const policy = exponentialBackoff({ initialMs: 10, factor: 3, maxMs: 100 });

        expect(policy.delay(1)).toBe(10);
        expect(policy.delay(3)).toBe(90);
        expect(policy.delay(4)).toBe(100);
        expect(policy.delay(10)).toBe(100);
    });

    it('is stateless — delay depends only on the attempt number', () => {
        const policy = exponentialBackoff({ initialMs: 10, factor: 2 });

        expect(policy.delay(2)).toBe(20);
        expect(policy.delay(2)).toBe(20);
    });

    it('rejects invalid options at construction instead of silently disabling backoff (TEL-09)', () => {
        // NaN would schedule the next attempt on the next tick (backoff off).
        expect(() => exponentialBackoff({ initialMs: NaN })).toThrow(TypeError);
        expect(() => exponentialBackoff({ initialMs: -1 })).toThrow(TypeError);
        expect(() => exponentialBackoff({ initialMs: Infinity })).toThrow(TypeError);
        expect(() => exponentialBackoff({ initialMs: 10, factor: 0 })).toThrow(TypeError);
        expect(() => exponentialBackoff({ initialMs: 10, factor: NaN })).toThrow(TypeError);
        expect(() => exponentialBackoff({ initialMs: 10, maxMs: -1 })).toThrow(TypeError);
        expect(() => exponentialBackoff({ initialMs: 10, jitter: 2 })).toThrow(TypeError);
        expect(() => exponentialBackoff({ initialMs: 10, jitter: NaN })).toThrow(TypeError);
    });

    it('applies multiplicative jitter within the configured band, capped at maxMs (TEL-09)', () => {
        const policy = exponentialBackoff({ initialMs: 100, factor: 2, jitter: 0.2, maxMs: 250 });

        for (let attempt = 1; attempt <= 10; attempt += 1) {
            const raw = Math.min(100 * Math.pow(2, attempt - 1), 250);
            const delay = policy.delay(attempt);
            expect(delay).toBeGreaterThanOrEqual(raw * 0.8 - Number.EPSILON);
            expect(delay).toBeLessThanOrEqual(250);
        }
    });
});
