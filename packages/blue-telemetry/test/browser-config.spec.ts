/** @author opencode */

import { trace, metrics, diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureBrowserTelemetry } from '../src/browser-config';
import { LoggerFactory } from '../src/logger/logger-factory';

describe('configureBrowserTelemetry', () => {
    afterEach(() => {
        trace.disable();
        metrics.disable();
        logs.disable();
        diag.disable();
        LoggerFactory.reset();
        vi.restoreAllMocks();
    });

    it('registers trace, metrics, and logs providers', () => {
        configureBrowserTelemetry({ serviceName: 'test-app' });

        expect(trace.getTracer('test')).toBeTruthy();
        expect(metrics.getMeter('test')).toBeTruthy();
        expect(logs.getLogger('test')).toBeTruthy();
    });

    it('configures LoggerFactory to open-telemetry type', () => {
        const setTypeSpy = vi.spyOn(LoggerFactory, 'setType');

        configureBrowserTelemetry({ serviceName: 'test-app' });

        expect(setTypeSpy).toHaveBeenCalledWith('open-telemetry');
    });

    it('sets LoggerFactory threshold when minimumSeverity is provided', () => {
        const setThresholdSpy = vi.spyOn(LoggerFactory, 'setThreshold');

        configureBrowserTelemetry({ serviceName: 'test', minimumSeverity: SeverityNumber.WARN });

        expect(setThresholdSpy).toHaveBeenCalledWith(SeverityNumber.WARN);
    });

    it('does not set LoggerFactory threshold when minimumSeverity is undefined', () => {
        const setThresholdSpy = vi.spyOn(LoggerFactory, 'setThreshold');

        configureBrowserTelemetry({ serviceName: 'test' });

        expect(setThresholdSpy).not.toHaveBeenCalled();
    });

    it('enables diagnostics when configured', () => {
        const diagSpy = vi.spyOn(diag, 'setLogger').mockImplementation(() => undefined);

        configureBrowserTelemetry({ serviceName: 'test', enableDiagnostics: true });

        expect(diagSpy).toHaveBeenCalledWith(expect.any(DiagConsoleLogger), DiagLogLevel.DEBUG);
    });

    it('does not enable diagnostics by default', () => {
        const diagSpy = vi.spyOn(diag, 'setLogger').mockImplementation(() => undefined);

        configureBrowserTelemetry({ serviceName: 'test' });

        expect(diagSpy).not.toHaveBeenCalled();
    });
});
