/**
 * Sampler configuration validation: invalid ratios fail at configuration
 * time, before any provider is registered (AD-32 D-1). Validation runs
 * before the once-per-process latch, so every rejection throws in one
 * process.
 */
// @vitest-environment node
import { test, expect } from 'vitest';
import { configureTelemetry } from '../../src/node-config';

test('rejects ratios above 1', () => {
    expect(() => configureTelemetry({ sampler: { ratio: 1.5 } })).toThrow('ratio must be a number in [0, 1]');
});

test('rejects negative ratios', () => {
    expect(() => configureTelemetry({ sampler: { ratio: -0.1 } })).toThrow('ratio must be a number in [0, 1]');
});

test('rejects NaN ratios', () => {
    expect(() => configureTelemetry({ sampler: { ratio: Number.NaN } })).toThrow('ratio must be a number in [0, 1]');
});
