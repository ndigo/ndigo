/**
 * @module blue-log
 * @since 1.0.0
 * @author Jeff Rose
 */
import { trace } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';
import { describe, expect, it, vi } from 'vitest';
import { ContextAwareLogger } from '../src/logger/context-aware-logger';
import { Logger } from '../src/logger/logger';
import { SeverityNumber } from '@opentelemetry/api-logs';

function createMockLogger(): Logger {
    return {
        threshold: SeverityNumber.DEBUG,
        setThreshold: vi.fn(),
        isEnabled: vi.fn(() => true),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    };
}

describe('ContextAwareLogger', () => {
    it('passes through empty attributes when no active span exists', () => {
        const baseLogger = createMockLogger();
        const logger = new ContextAwareLogger(baseLogger);

        logger.info('message');

        expect(baseLogger.info).toHaveBeenCalledWith('message', {});
    });

    it('injects trace and span ids when active span exists', () => {
        const baseLogger = createMockLogger();
        const logger = new ContextAwareLogger(baseLogger);
        const getSpanSpy = vi.spyOn(trace, 'getSpan').mockReturnValue({
            // ContextAwareLogger only consults spanContext(); OTel's Span
            // interface requires the full surface, so assert at the boundary.
            spanContext: () => ({
                traceId: 'trace-id',
                spanId: 'span-id',
                traceFlags: 1,
            }),
        } as unknown as Span);

        logger.debug('message', { origin: 'test' });

        expect(baseLogger.debug).toHaveBeenCalledTimes(1);
        const [, attributes] = vi.mocked(baseLogger.debug).mock.calls[0];

        expect(attributes?.origin).toBe('test');
        expect(attributes?.traceId).toBe('trace-id');
        expect(attributes?.spanId).toBe('span-id');

        getSpanSpy.mockRestore();
    });
});
