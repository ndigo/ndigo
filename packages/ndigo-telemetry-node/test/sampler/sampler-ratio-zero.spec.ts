/**
 * Sampler ratio boundary 0: never samples (AD-32 D-1).
 */
// @vitest-environment node
import { test, expect } from 'vitest';
import { countRecording, tracerWithSampler } from './sampler-test-helpers';

test('ratio 0 never samples a root span', () => {
    const tracer = tracerWithSampler({ ratio: 0 });

    expect(countRecording(tracer, 50)).toBe(0);
});
