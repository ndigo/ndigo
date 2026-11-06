/**
 */
import { trace, metrics, diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import type { Logger } from '@opentelemetry/api-logs';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BasicTracerProvider, ConsoleSpanExporter, type SpanExporter } from '@opentelemetry/sdk-trace-base';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureBrowserTelemetry } from '../src/browser-config';
import { LoggerFactory } from '@ndigo/telemetry';

// Capture the processor + exporter each span processor is built with so
// tests can assert on the processor list without reaching into the
// registered provider (DSG-1 gating + OP-14 batching).
const spanProcessors: { kind: 'simple' | 'batch'; exporter: unknown }[] = [];
vi.mock('@opentelemetry/sdk-trace-base', async (importOriginal) => {
    // vitest types the factory's importOriginal as Promise<unknown> — the
    // real module shape is needed for the class-extension spreads below.
    const actual = (await importOriginal()) as typeof import('@opentelemetry/sdk-trace-base');
    return {
        ...actual,
        SimpleSpanProcessor: class extends actual.SimpleSpanProcessor {
            constructor(exporter: SpanExporter) {
                super(exporter);
                spanProcessors.push({ kind: 'simple', exporter });
            }
        },
        BatchSpanProcessor: class extends actual.BatchSpanProcessor {
            constructor(exporter: SpanExporter) {
                super(exporter);
                spanProcessors.push({ kind: 'batch', exporter });
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
        const diagSpy = vi.spyOn(diag, 'setLogger').mockImplementation(() => true);

        configureBrowserTelemetry({ serviceName: 'test', enableDiagnostics: true });

        expect(diagSpy).toHaveBeenCalledWith(expect.any(DiagConsoleLogger), DiagLogLevel.DEBUG);
    });

    it('does not enable diagnostics by default', () => {
        const diagSpy = vi.spyOn(diag, 'setLogger').mockImplementation(() => true);

        configureBrowserTelemetry({ serviceName: 'test' });

        expect(diagSpy).not.toHaveBeenCalled();
    });

    it('does not switch LoggerFactory to OTel when the log pipeline is disabled (TEL-04)', () => {
        const setTypeSpy = vi.spyOn(LoggerFactory, 'setType');

        configureBrowserTelemetry({ serviceName: 'test', useConsoleExporters: false });

        // No log exporter => routing app logs through OTel would strand them
        // in a disabled provider. The factory must stay on the console bridge.
        expect(setTypeSpy).not.toHaveBeenCalled();
    });

    it('is idempotent: a second configure warns and keeps the live providers (TEL-05)', () => {
        const handle = configureBrowserTelemetry({ serviceName: 'first' });
        const provider = trace.getTracerProvider();
        // The first configure switched the logger factory to OpenTelemetry, so
        // the ignore notice is emitted through the OTel log pipeline (not the
        // console bridge). Capture it at the OTel logger seam.
        const emit = vi.fn();
        vi.spyOn(logs, 'getLogger').mockReturnValue({ emit } as unknown as Logger);

        const second = configureBrowserTelemetry({ serviceName: 'second' });

        expect(emit).toHaveBeenCalledWith(expect.objectContaining({ body: expect.stringContaining('called again') }));
        expect(trace.getTracerProvider()).toBe(provider);
        expect(second).toBe(handle);
    });

    it('force-flushes on pagehide and when the document becomes hidden (TEL-05)', () => {
        const handle = configureBrowserTelemetry({ serviceName: 'test' });
        const flushSpy = vi.spyOn(BasicTracerProvider.prototype, 'forceFlush').mockResolvedValue();

        window.dispatchEvent(new Event('pagehide'));
        expect(flushSpy).toHaveBeenCalledTimes(1);

        flushSpy.mockClear();
        Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        expect(flushSpy).toHaveBeenCalledTimes(1);

        Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
        void handle.shutdown();
    });

    it('shutdown detaches the unload listeners and shuts the providers down (TEL-05)', async () => {
        const handle = configureBrowserTelemetry({ serviceName: 'test' });
        const flushSpy = vi.spyOn(BasicTracerProvider.prototype, 'forceFlush').mockResolvedValue();

        await handle.shutdown();
        window.dispatchEvent(new Event('pagehide'));

        expect(flushSpy).not.toHaveBeenCalled();
    });

    describe('SPAN exporter gating (DSG-1)', () => {
        beforeEach(() => {
            spanProcessors.length = 0;
        });

        it('configures a BatchSpanProcessor over OTLP when traceUrl is set even with useConsoleExporters false', () => {
            configureBrowserTelemetry({
                serviceName: 'test',
                traceUrl: 'http://collector:4318/v1/traces',
                useConsoleExporters: false,
            });

            expect(spanProcessors).toHaveLength(1);
            expect(spanProcessors[0].kind).toBe('batch');
            expect(spanProcessors[0].exporter).toBeInstanceOf(OTLPTraceExporter);
        });

        it('configures no span processors when useConsoleExporters false and no traceUrl (unchanged)', () => {
            configureBrowserTelemetry({ serviceName: 'test', useConsoleExporters: false });

            expect(spanProcessors).toHaveLength(0);
        });

        it('configures a BatchSpanProcessor over OTLP when traceUrl is set and console exporters enabled', () => {
            configureBrowserTelemetry({ serviceName: 'test', traceUrl: 'http://collector:4318/v1/traces' });

            expect(spanProcessors).toHaveLength(1);
            expect(spanProcessors[0].kind).toBe('batch');
            expect(spanProcessors[0].exporter).toBeInstanceOf(OTLPTraceExporter);
        });

        it('keeps a SimpleSpanProcessor for the console exporter when no traceUrl is set', () => {
            configureBrowserTelemetry({ serviceName: 'test' });

            expect(spanProcessors).toHaveLength(1);
            expect(spanProcessors[0].kind).toBe('simple');
            expect(spanProcessors[0].exporter).toBeInstanceOf(ConsoleSpanExporter);
        });
    });
});
