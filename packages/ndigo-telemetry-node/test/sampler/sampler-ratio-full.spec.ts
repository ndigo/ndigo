/**
 * Sampler ratio boundary 1: always samples.
 */
// @vitest-environment node
import { test, expect } from 'vitest';
import { countRecording, tracerWithSampler } from './sampler-test-helpers';

test('ratio 1 always samples a root span', () => {
    const tracer = tracerWithSampler({ ratio: 1 });

    expect(countRecording(tracer, 50)).toBe(50);
});
