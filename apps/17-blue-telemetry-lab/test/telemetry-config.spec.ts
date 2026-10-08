/**
 * The lab's telemetry configuration surface: how `BLUE_TELEMETRY_SAMPLER` and
 * `OTEL_EXPORTER_OTLP_ENDPOINT` resolve, and that a typo fails loud rather than
 * silently meaning "always" (guide 10 §2).
 *
 * Nothing here touches the OpenTelemetry API — `resolveLabTelemetry` is pure by
 * design, which is exactly why it can be asserted in a plain worker.
 *
 * @module blue-telemetry-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { describeSampler, parseSamplerSpec, resolveLabTelemetry } from '../src/telemetry-config';

/** The environment variables this lane manipulates. */
const KEYS = [
    'OTEL_EXPORTER_OTLP_ENDPOINT',
    'BLUE_TELEMETRY_SAMPLER',
    'BLUE_TELEMETRY_BROWSER_TRACE_URL',
    'BLUE_TELEMETRY_METRIC_EXPORTER',
] as const;

const saved = new Map<string, string | undefined>();

beforeEach(() => {
    for (const key of KEYS) {
        saved.set(key, process.env[key]);
        delete process.env[key];
    }
});

afterEach(() => {
    for (const key of KEYS) {
        const value = saved.get(key);
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    }
});

describe('parseSamplerSpec', () => {
    test('defaults to always and accepts the literal presets', () => {
        expect(parseSamplerSpec(undefined)).toBe('always');
        expect(parseSamplerSpec('')).toBe('always');
        expect(parseSamplerSpec('  always ')).toBe('always');
        expect(parseSamplerSpec('off')).toBe('off');
    });

    test('accepts ratios and their boundaries', () => {
        expect(parseSamplerSpec('0.25')).toEqual({ ratio: 0.25 });
        expect(parseSamplerSpec('0')).toEqual({ ratio: 0 });
        expect(parseSamplerSpec('1')).toEqual({ ratio: 1 });
    });

    test('fails loud on a typo or an out-of-range ratio', () => {
        for (const bad of ['sometimes', '2', '-0.1', 'true']) {
            expect(() => parseSamplerSpec(bad), bad).toThrow(RangeError);
        }
    });

    test('describes each preset for /lab/config', () => {
        expect(describeSampler('always')).toContain('100%');
        expect(describeSampler('off')).toContain('dropped');
        expect(describeSampler({ ratio: 0.1 })).toContain('ratio 0.1');
    });
});

describe('resolveLabTelemetry', () => {
    test('console exporters and always-on sampling by default', () => {
        const telemetry = resolveLabTelemetry();

        expect(telemetry.exporters).toEqual({ trace: 'console', metric: 'console', log: 'console' });
        expect(telemetry.config.traceExporter).toBe('console');
        expect(telemetry.config.metricExporter).toBe('console');
        expect(telemetry.config.logExporter).toBe('console');
        expect(telemetry.otlpEndpoint).toBeUndefined();
        expect(telemetry.browserTraceUrl).toBeUndefined();
        expect(telemetry.sampler).toContain('always');
        // HTTP server, WebSocket server, and dispatcher instrumentations.
        expect(telemetry.config.instrumentations).toHaveLength(3);
    });

    test('the collector endpoint switches every signal to OTLP/HTTP', () => {
        process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] = 'http://collector:4318';
        const telemetry = resolveLabTelemetry();

        expect(telemetry.otlpEndpoint).toBe('http://collector:4318');
        expect(telemetry.exporters).toEqual({
            trace: 'http://collector:4318',
            metric: 'http://collector:4318',
            log: 'http://collector:4318',
        });
        expect(telemetry.config.traceExporter).toEqual({ url: 'http://collector:4318/v1/traces' });
        expect(telemetry.config.metricExporter).toEqual({ url: 'http://collector:4318/v1/metrics' });
        expect(telemetry.config.logExporter).toEqual({ url: 'http://collector:4318/v1/logs' });
    });

    test('BLUE_TELEMETRY_METRIC_EXPORTER=prometheus overrides only the metric signal (AD-77)', () => {
        process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] = 'http://collector:4318';
        process.env['BLUE_TELEMETRY_METRIC_EXPORTER'] = 'prometheus';
        const telemetry = resolveLabTelemetry();

        expect(telemetry.config.traceExporter).toEqual({ url: 'http://collector:4318/v1/traces' });
        expect(telemetry.config.metricExporter).toBe('prometheus');
        expect(telemetry.config.logExporter).toEqual({ url: 'http://collector:4318/v1/logs' });
        expect(telemetry.exporters.metric).toBe('prometheus (pull)');
    });

    test('the sampler and browser trace URL come from the environment', () => {
        process.env['BLUE_TELEMETRY_SAMPLER'] = '0.1';
        process.env['BLUE_TELEMETRY_BROWSER_TRACE_URL'] = 'http://localhost:4318/v1/traces';
        const telemetry = resolveLabTelemetry();

        expect(telemetry.config.sampler).toEqual({ ratio: 0.1 });
        expect(telemetry.sampler).toContain('ratio 0.1');
        expect(telemetry.browserTraceUrl).toBe('http://localhost:4318/v1/traces');
    });

    test('an invalid sampler fails at resolve time, not at export time', () => {
        process.env['BLUE_TELEMETRY_SAMPLER'] = 'nope';
        expect(() => resolveLabTelemetry()).toThrow(RangeError);
    });
});
