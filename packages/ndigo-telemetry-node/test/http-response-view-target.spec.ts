/**
 * `HTTPResponseViewTargetInstrumentation` span-kind/status regression spec
 * (TEL-11): committing a rendered view is internal lifecycle work — the span
 * must be INTERNAL, and the status code must use the numeric semconv
 * `http.response.status_code` (was the mislabeled string `http.status_code`).
 *
 * @module ndigo-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, expect, test, afterEach, vi } from 'vitest';
import { SpanKind, trace } from '@opentelemetry/api';
import type { Span, Tracer } from '@opentelemetry/api';
import { HTTPResponseViewTarget } from '@ndigo/platform-node';
import { HTTPResponseViewTargetInstrumentation } from '../src/instrumentation/http-response-view-target/http-response-view-target';

interface StartedSpan {
    name: string;
    kind?: SpanKind;
    attributes?: Record<string, unknown>;
}

/**
 * Installs a fake global tracer capturing every active-span start.
 *
 * @returns The captured span starts.
 */
function installFakeTracer(): StartedSpan[] {
    const started: StartedSpan[] = [];
    const span = {
        end: () => undefined,
        recordException: () => undefined,
        setStatus: () => undefined,
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

/** Model whose constructor name matches the instrumentation's status branch. */
class ResponseEntity {
    status = { code: 404 };
}

describe('HTTPResponseViewTargetInstrumentation span kind (TEL-11)', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('labels commit as INTERNAL and reports a numeric http.response.status_code', async () => {
        const original = HTTPResponseViewTarget.prototype.commit;
        HTTPResponseViewTarget.prototype.commit = async function (): Promise<void> {
            // no-op stub
        };
        try {
            const started = installFakeTracer();
            const instrumentation = new HTTPResponseViewTargetInstrumentation();

            const target = Object.create(HTTPResponseViewTarget.prototype) as HTTPResponseViewTarget;
            await target.commit({ ok: true }, new ResponseEntity(), undefined as never);

            expect(started).toEqual([
                {
                    name: 'HTTPResponseViewTarget.commit',
                    kind: SpanKind.INTERNAL,
                    attributes: {
                        'http.response.output': 'json',
                        'http.response.status_code': 404,
                    },
                },
            ]);
            instrumentation.disable();
        } finally {
            HTTPResponseViewTarget.prototype.commit = original;
        }
    });

    test('reports text output without a status when the model is not a ResponseEntity', async () => {
        const original = HTTPResponseViewTarget.prototype.commit;
        HTTPResponseViewTarget.prototype.commit = async function (): Promise<void> {
            // no-op stub
        };
        try {
            const started = installFakeTracer();
            const instrumentation = new HTTPResponseViewTargetInstrumentation();

            const target = Object.create(HTTPResponseViewTarget.prototype) as HTTPResponseViewTarget;
            await target.commit('<html></html>', {}, undefined as never);

            expect(started).toEqual([
                {
                    name: 'HTTPResponseViewTarget.commit',
                    kind: SpanKind.INTERNAL,
                    attributes: { 'http.response.output': 'text' },
                },
            ]);
            instrumentation.disable();
        } finally {
            HTTPResponseViewTarget.prototype.commit = original;
        }
    });
});
