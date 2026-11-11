import { describe, expect, test, afterEach, vi } from 'vitest';
import { SpanKind, trace } from '@opentelemetry/api';
import type { Span, Tracer } from '@opentelemetry/api';
import { HTTP } from '@ndigo/http';
import { HTTPClientInstrumentation } from '../src/instrumentation/http-client/http-client';

interface StartedSpan {
    name: string;
    kind?: SpanKind;
    attributes?: Record<string, unknown>;
}

function installFakeTracer(): StartedSpan[] {
    const started: StartedSpan[] = [];
    const span = {
        end: () => undefined,
        recordException: () => undefined,
        setStatus: () => undefined,
        setAttribute: () => undefined,
    } as unknown as Span;
    const tracer = {
        startActiveSpan: (
            name: string,
            options: { kind?: SpanKind; attributes?: Record<string, unknown> },
            callback: (activeSpan: Span) => unknown
        ) => {
            started.push({ name, kind: options.kind, attributes: options.attributes });
            return callback(span);
        },
    } as unknown as Tracer;
    vi.spyOn(trace, 'getTracer').mockReturnValue(tracer);
    return started;
}

describe('HTTPClientInstrumentation', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('wraps HTTP.request as a CLIENT span', async () => {
        const original = HTTP.prototype.request;
        HTTP.prototype.request = async function (): Promise<Response> {
            return new Response(null, { status: 204 });
        };
        try {
            const started = installFakeTracer();
            const instrumentation = new HTTPClientInstrumentation();
            const http = Object.create(HTTP.prototype) as HTTP;
            await http.request('https://example.test/x', { method: 'post' } as never);
            expect(started[0]?.name).toBe('HTTP.request');
            expect(started[0]?.kind).toBe(SpanKind.CLIENT);
            expect(started[0]?.attributes?.['http.request.method']).toBe('POST');
            instrumentation.disable();
        } finally {
            HTTP.prototype.request = original;
        }
    });
});
