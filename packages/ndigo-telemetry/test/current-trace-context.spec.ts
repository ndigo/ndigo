/**
 * `currentTraceContext` (AD-32 D-4): boundary-mocked like
 * `ContextAwareLogger`, so no global provider is needed and every case
 * runs in one process.
 * @module ndigo-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { trace } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';
import { currentTraceContext } from '../src/trace/correlation';

function spanWith(traceId: string, spanId: string): Span {
    return {
        spanContext: () => ({ traceId, spanId, traceFlags: 1 }),
    } as unknown as Span;
}

describe('currentTraceContext', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns undefined when no span is active', () => {
        vi.spyOn(trace, 'getSpan').mockReturnValue(undefined);

        expect(currentTraceContext()).toBeUndefined();
    });

    it('returns the active span ids from its span context', () => {
        vi.spyOn(trace, 'getSpan').mockReturnValue(spanWith('trace-1', 'span-1'));

        expect(currentTraceContext()).toEqual({ traceId: 'trace-1', spanId: 'span-1' });
    });
});
