/**
 * Sampler default: parent-based always-on (AD-32 D-1) — the current
 * effective behavior, pinned before any drift is possible.
 */
// @vitest-environment node
import { test, expect } from 'vitest';
import { countRecording, tracerWithSampler } from './sampler-test-helpers';

test("configureTelemetry defaults to 100% sampling — today's behavior, pinned", () => {
    const tracer = tracerWithSampler(undefined);

    expect(countRecording(tracer, 50)).toBe(50);
});
