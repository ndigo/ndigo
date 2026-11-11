import { describe, expect, test, afterEach, vi } from 'vitest';
import { SpanKind, trace } from '@opentelemetry/api';
import type { Span, Tracer } from '@opentelemetry/api';
import { HostManager } from '@ndigo/host';
import { HostInstrumentation } from '../src/instrumentation/host/host';

function installFakeTracer() {
    const started: { name: string; kind?: SpanKind }[] = [];
    const span = { end() {}, recordException() {}, setStatus() {}, setAttribute() {} } as unknown as Span;
    const tracer = {
        startActiveSpan: (name: string, opts: { kind?: SpanKind }, cb: (s: Span) => unknown) => {
            started.push({ name, kind: opts.kind });
            return cb(span);
        },
        startSpan: (name: string, opts: { kind?: SpanKind }) => {
            started.push({ name, kind: opts.kind });
            return { end() {}, setAttribute() {}, recordException() {}, setStatus() {} } as unknown as Span;
        },
    } as unknown as Tracer;
    vi.spyOn(trace, 'getTracer').mockReturnValue(tracer);
    return started;
}

describe('HostInstrumentation', () => {
    afterEach(() => vi.restoreAllMocks());
    test('wraps HostManager.registerFeature as INTERNAL', () => {
        const original = HostManager.prototype.registerFeature;
        HostManager.prototype.registerFeature = function (): HostManager {
            return this;
        };
        try {
            const started = installFakeTracer();
            const inst = new HostInstrumentation();
            const host = Object.create(HostManager.prototype) as HostManager;
            host.registerFeature({} as unknown as Parameters<typeof HostManager.prototype.registerFeature>[0]);
            expect(started[0]?.name).toBe('HostManager.registerFeature');
            expect(started[0]?.kind).toBe(SpanKind.INTERNAL);
            inst.disable();
        } finally {
            HostManager.prototype.registerFeature = original;
        }
    });
});
