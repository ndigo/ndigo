/**
 * OP-8 negative: without an explicit `logExporter` the factory keeps its
 * console default, so dev-posture apps keep logging to the console.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { test, expect, vi } from 'vitest';
import { LoggerFactory } from '@ndigo/telemetry';
import { configureTelemetry } from '../src/node-config';

test('a config without a logExporter leaves LoggerFactory untouched', () => {
    const setType = vi.spyOn(LoggerFactory, 'setType');

    configureTelemetry({ traceExporter: 'none', metricExporter: 'none' });

    expect(setType).not.toHaveBeenCalled();
});
