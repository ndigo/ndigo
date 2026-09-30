/**
 * @module blue-telemetry-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { trace, metrics, diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureBrowserTelemetry } from '../src/browser-config';
import { LoggerFactory } from '@blue/telemetry';

// Capture the exporter each SimpleSpanProcessor is built with so tests can
// assert on the processor list without reaching into the registered provider.
const spanProcessors: { exporter: unknown }[] = [];
vi.mock('@opentelemetry/sdk-trace-base', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        SimpleSpanProcessor: class extends actual.SimpleSpanProcessor {
            constructor(exporter: unknown) {
                super(exporter);
                spanProcessors.push({ exporter });
            }
        },
    };
});

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

    describe('SPAN exporter gating (DSG-1)', () => {
        beforeEach(() => {
            spanProcessors.length = 0;
        });

        it('configures the OTLP processor when traceUrl is set even with useConsoleExporters false', () => {
            configureBrowserTelemetry({
                serviceName: 'test',
                traceUrl: 'http://collector:4318/v1/traces',
                useConsoleExporters: false,
            });

            expect(spanProcessors).toHaveLength(1);
            expect(spanProcessors[0].exporter).toBeInstanceOf(OTLPTraceExporter);
        });

        it('configures no span processors when useConsoleExporters false and no traceUrl (unchanged)', () => {
            configureBrowserTelemetry({ serviceName: 'test', useConsoleExporters: false });

            expect(spanProcessors).toHaveLength(0);
        });

        it('configures the OTLP processor when traceUrl is set and console exporters enabled', () => {
            configureBrowserTelemetry({ serviceName: 'test', traceUrl: 'http://collector:4318/v1/traces' });

            expect(spanProcessors).toHaveLength(1);
            expect(spanProcessors[0].exporter).toBeInstanceOf(OTLPTraceExporter);
        });
    });
});
