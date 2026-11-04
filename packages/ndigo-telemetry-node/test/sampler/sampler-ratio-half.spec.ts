/**
 * Sampler ratio 0.5: statistical bounds + parent-child inheritance
 * (AD-32 D-1). Both scenarios share the one provider this process can
 * register, so they live together.
 * @module ndigo-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { test, expect } from 'vitest';
import { childOf, countRecording, sampleBothDecisions, tracerWithSampler } from './sampler-test-helpers';

test('ratio 0.5 samples approximately half (statistical bounds)', () => {
    const tracer = tracerWithSampler({ ratio: 0.5 });

    const recording = countRecording(tracer, 200);
    expect(recording).toBeGreaterThanOrEqual(60);
    expect(recording).toBeLessThanOrEqual(140);
});

test('children inherit the root decision (parent-based)', () => {
    const tracer = tracerWithSampler({ ratio: 0.5 });
    const { recordingRoot, droppedRoot } = sampleBothDecisions(tracer);

    expect(childOf(tracer, recordingRoot).isRecording()).toBe(true);
    expect(childOf(tracer, droppedRoot).isRecording()).toBe(false);
});
