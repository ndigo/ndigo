import { describe, expect, test, afterEach, vi } from 'vitest';
import { SpanKind, trace } from '@opentelemetry/api';
import type { Span, Tracer } from '@opentelemetry/api';
import { Application } from '@ndigo/boot';
import { BootInstrumentation } from '../src/instrumentation/boot/boot';

function installFakeTracer() {
    const started: { name: string; kind?: SpanKind }[] = [];
    const span = { end() {}, recordException() {}, setStatus() {}, setAttribute() {} } as unknown as Span;
    const tracer = {
        startActiveSpan: (name: string, opts: { kind?: SpanKind }, cb: (s: Span) => unknown) => {
            started.push({ name, kind: opts.kind });
            return cb(span);
        },
    } as unknown as Tracer;
    vi.spyOn(trace, 'getTracer').mockReturnValue(tracer);
    return started;
}

describe('BootInstrumentation', () => {
    afterEach(() => vi.restoreAllMocks());
    test('wraps Application.run as INTERNAL', async () => {
        const original = Application.prototype.run;
        Application.prototype.run = async function (): Promise<unknown> {
            return undefined;
        };
        try {
            const started = installFakeTracer();
            const inst = new BootInstrumentation();
            const app = Object.create(Application.prototype) as Application;
            await app.run();
            expect(started[0]?.name).toBe('Application.run');
            expect(started[0]?.kind).toBe(SpanKind.INTERNAL);
            inst.disable();
        } finally {
            Application.prototype.run = original;
        }
    });
});
