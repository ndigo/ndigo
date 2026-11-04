/**
 * OP-8: a configured `logExporter` must make node log export live — the
 * factory switches to the OpenTelemetry logger (web parity). One
 * `configureTelemetry` call per process, hence one case per spec file.
 * @module ndigo-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { test, expect, vi } from 'vitest';
import { LoggerFactory } from '@ndigo/telemetry';
import { configureTelemetry } from '../src/node-config';

test("configuring a logExporter switches LoggerFactory to 'open-telemetry'", () => {
    const setType = vi.spyOn(LoggerFactory, 'setType');

    configureTelemetry({ logExporter: { url: 'http://localhost:4318/v1/logs' } });

    expect(setType).toHaveBeenCalledWith('open-telemetry');
});
