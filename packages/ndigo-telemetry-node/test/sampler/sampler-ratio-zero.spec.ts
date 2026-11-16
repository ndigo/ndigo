/**
 * Sampler ratio boundary 0: never samples.
 */
// @vitest-environment node
import { test, expect } from 'vitest';
import { countRecording, tracerWithSampler } from './sampler-test-helpers';

test('ratio 0 never samples a root span', () => {
    const tracer = tracerWithSampler({ ratio: 0 });

    expect(countRecording(tracer, 50)).toBe(0);
});
