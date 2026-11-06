/**
 * Telemetry hook spec (AD-87 D-7): one `feature_flag.evaluation` span per
 * evaluation with the OTel feature-flag semconv attributes; abnormal
 * outcomes classified via `error.type` (resolved errors) or the ERROR span
 * status (thrown errors).
 */
// @vitest-environment node
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { InMemoryProvider, OpenFeature } from '@openfeature/server-sdk';
import { FeatureFlagTelemetryHook } from '../src/feature-flag-telemetry-hook';
import { scriptedProvider } from './_providers';

describe('FeatureFlagTelemetryHook', () => {
    let exporter: InMemorySpanExporter;
    let provider: BasicTracerProvider;

    beforeAll(() => {
        // One provider for the whole describe: the OTel API caches the tracer
        // against the first global provider it saw (scheduler-test precedent).
        exporter = new InMemorySpanExporter();
        provider = new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(exporter)] });
        trace.setGlobalTracerProvider(provider);
    });

    beforeEach(() => {
        exporter.reset();
    });

    afterEach(async () => {
        await OpenFeature.clearProviders();
    });

    afterAll(async () => {
        await OpenFeature.clearProviders();
        void provider.shutdown();
        trace.setGlobalTracerProvider(undefined as never);
    });

    test('emits one feature_flag.evaluation span with the semconv attributes', async () => {
        await OpenFeature.setProviderAndWait(
            new InMemoryProvider({
                beta: { variants: { on: true, off: false }, defaultVariant: 'on', disabled: false },
            })
        );
        const client = OpenFeature.getClient();
        client.addHooks(new FeatureFlagTelemetryHook());

        const details = await client.getBooleanDetails('beta', false);

        expect(details.value).toBe(true);
        const spans = exporter.getFinishedSpans();
        expect(spans).toHaveLength(1);
        expect(spans[0].name).toBe('feature_flag.evaluation');
        expect(spans[0].attributes).toMatchObject({
            'feature_flag.key': 'beta',
            'feature_flag.provider.name': 'in-memory',
            'feature_flag.result.reason': 'STATIC',
            'feature_flag.result.variant': 'on',
        });
        expect(spans[0].status.code).not.toBe(SpanStatusCode.ERROR);
    });

    test('classifies an errorCode resolution via error.type and the ERROR status', async () => {
        await OpenFeature.setProviderAndWait(new InMemoryProvider({}));
        const client = OpenFeature.getClient();
        client.addHooks(new FeatureFlagTelemetryHook());

        const details = await client.getBooleanDetails('missing', true);

        expect(details.value).toBe(true);
        const [span] = exporter.getFinishedSpans();
        // The SDK routes any errorCode resolution through the error hook
        // phase — the span reflects the abnormal evaluation.
        expect(span?.attributes['error.type']).toBe('FLAG_NOT_FOUND');
        expect(span?.status.code).toBe(SpanStatusCode.ERROR);
    });

    test('records a thrown provider error as span ERROR with the exception', async () => {
        await OpenFeature.setProviderAndWait(
            scriptedProvider(() => {
                throw new Error('provider exploded');
            })
        );
        const client = OpenFeature.getClient();
        client.addHooks(new FeatureFlagTelemetryHook());

        const details = await client.getBooleanDetails('flag', true);

        expect(details.value).toBe(true);
        const [span] = exporter.getFinishedSpans();
        expect(span?.status.code).toBe(SpanStatusCode.ERROR);
        expect(span?.events.some((event) => event.name === 'exception')).toBe(true);
        // No OpenFeature classification on the raw provider error — the
        // fallback reports the error's name.
        expect(span?.attributes['error.type']).toBe('Error');
    });

    test('one span per evaluation — hook data does not leak between calls', async () => {
        await OpenFeature.setProviderAndWait(
            new InMemoryProvider({
                beta: { variants: { on: true, off: false }, defaultVariant: 'on', disabled: false },
            })
        );
        const client = OpenFeature.getClient();
        client.addHooks(new FeatureFlagTelemetryHook());

        await client.getBooleanDetails('beta', false);
        await client.getBooleanDetails('beta', false);

        expect(exporter.getFinishedSpans()).toHaveLength(2);
    });
});
