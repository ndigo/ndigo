/**
 * Sampler 'off' preset: never records a root span (AD-32 D-1).
 */
// @vitest-environment node
import { test, expect } from 'vitest';
import { countRecording, tracerWithSampler } from './sampler-test-helpers';

test("'off' never samples a root span", () => {
    const tracer = tracerWithSampler('off');

    expect(countRecording(tracer, 50)).toBe(0);
});
