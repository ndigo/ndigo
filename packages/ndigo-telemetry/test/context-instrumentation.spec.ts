/**
 * `ContextInstrumentation` span-kind regression spec (TEL-11): application
 * context teardown is internal lifecycle work, not a network boundary — the
 * span must be INTERNAL (it was mislabeled CLIENT).
 */
import { describe, expect, it, afterEach, vi } from 'vitest';
import { SpanKind, trace } from '@opentelemetry/api';
import type { Span, Tracer } from '@opentelemetry/api';
import { GenericApplicationContext } from '@ndigo/context';
import { ContextInstrumentation } from '../src/instrumentation/context/context';

interface StartedSpan {
    name: string;
    kind?: SpanKind;
    attributes?: Record<string, unknown>;
}

/**
 * Installs a fake global tracer capturing every `startSpan` call.
 *
 * @returns The captured span starts and the count of ended spans.
 */
function installFakeTracer(): { started: StartedSpan[]; ended: () => number } {
    let ended = 0;
    const started: StartedSpan[] = [];
    const span = {
        end: () => {
            ended += 1;
        },
        recordException: () => undefined,
        setStatus: () => undefined,
    } as unknown as Span;
    const tracer = {
        startSpan: (name: string, options?: { kind?: SpanKind; attributes?: Record<string, unknown> }) => {
            started.push({ name, kind: options?.kind, attributes: options?.attributes });
            return span;
        },
    } as unknown as Tracer;
    vi.spyOn(trace, 'getTracer').mockReturnValue(tracer);
    return { started, ended: () => ended };
}

describe('ContextInstrumentation span kind (TEL-11)', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('labels ApplicationContext.destroy as INTERNAL', () => {
        const original = GenericApplicationContext.prototype.destroy;
        // Stub the real teardown: this spec pins the span kind, not the
        // teardown internals. The wrapper captures the stub at enable time.
        GenericApplicationContext.prototype.destroy = function (): void {
            // no-op stub
        };
        try {
            const { started, ended } = installFakeTracer();
            // Constructed after the stub so the constructor-time enable wraps it.
            const instrumentation = new ContextInstrumentation();

            // `name`/`id` are prototype getters without setters, so call the
            // (wrapped) prototype method with a plain receiver carrying them.
            const fake = { name: 'ctx', id: 'ctx-1' };
            GenericApplicationContext.prototype.destroy.call(fake);

            expect(started).toEqual([
                {
                    name: 'ApplicationContext.destroy',
                    kind: SpanKind.INTERNAL,
                    attributes: { 'context.name': 'ctx', 'context.id': 'ctx-1' },
                },
            ]);
            expect(ended()).toBe(1);
            instrumentation.disable();
        } finally {
            GenericApplicationContext.prototype.destroy = original;
        }
    });
});
