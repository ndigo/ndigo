import { describe, expect, test, afterEach, vi } from 'vitest';
import { SpanKind, trace } from '@opentelemetry/api';
import type { Span, Tracer } from '@opentelemetry/api';
import { MemoryCache } from '@ndigo/cache';
import { CacheInstrumentation } from '../src/instrumentation/cache/cache';

interface StartedSpan {
    name: string;
    kind?: SpanKind;
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
            started.push({ name, kind: options.kind });
            return callback(span);
        },
    } as unknown as Tracer;
    vi.spyOn(trace, 'getTracer').mockReturnValue(tracer);
    return started;
}

describe('CacheInstrumentation', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('wraps MemoryCache.get as an INTERNAL span', async () => {
        const original = MemoryCache.prototype.get;
        MemoryCache.prototype.get = async function (): Promise<unknown> {
            return undefined;
        };
        try {
            const started = installFakeTracer();
            const instrumentation = new CacheInstrumentation();
            const cache = new MemoryCache();
            await cache.get('k');
            expect(started[0]?.name).toBe('Cache.get');
            expect(started[0]?.kind).toBe(SpanKind.INTERNAL);
            instrumentation.disable();
        } finally {
            MemoryCache.prototype.get = original;
        }
    });
});
