/**
 * @module blue-resilience
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { exponentialBackoff, fixedBackoff } from '@blue/resilience';

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
});
