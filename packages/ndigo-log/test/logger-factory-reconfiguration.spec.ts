/**
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Regression specs for KRN-REV-LOG-11: `LoggerFactory` switches must reach
 * loggers created earlier (the framework logs through module-load
 * `getLogger(...)` handles), so `configureTelemetry` routing through
 * OpenTelemetry is not inert for already-created loggers.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { trace } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';

import { LoggerFactory } from '../src/logger/logger-factory';

describe('LoggerFactory lazily-resolved handles', () => {
    afterEach(() => {
        LoggerFactory.reset();
        vi.restoreAllMocks();
    });

    it('applies a threshold set after the logger was created', () => {
        LoggerFactory.reset();
        const logger = LoggerFactory.getLogger('late');

        expect(logger.isEnabled(SeverityNumber.WARN)).toBe(true);

        LoggerFactory.setThreshold(SeverityNumber.ERROR);

        expect(logger.isEnabled(SeverityNumber.WARN)).toBe(false);
        expect(logger.isEnabled(SeverityNumber.ERROR)).toBe(true);
    });

    it('routes a pre-created logger through a type switch', () => {
        LoggerFactory.reset();
        const logger = LoggerFactory.getLogger('late');
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

        LoggerFactory.setType('none');
        logger.debug('dropped');
        expect(debugSpy).not.toHaveBeenCalled();

        LoggerFactory.setType('console');
        logger.debug('kept');
        expect(debugSpy).toHaveBeenCalledTimes(1);
    });

    it('honours setContextAware on a pre-created logger', () => {
        LoggerFactory.reset();
        const logger = LoggerFactory.getLogger('late');
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        vi.spyOn(trace, 'getSpan').mockReturnValue({
            spanContext: () => ({ traceId: 'trace-id', spanId: 'span-id', traceFlags: 1 }),
        } as unknown as Span);

        LoggerFactory.setContextAware(false);
        logger.debug('no-context');
        expect(debugSpy.mock.calls[0]?.[1]).not.toHaveProperty('traceId');

        LoggerFactory.setContextAware(true);
        logger.debug('with-context');
        expect(debugSpy.mock.calls[1]?.[1]).toHaveProperty('traceId', 'trace-id');
    });

    it('returns pre-created loggers to defaults after reset()', () => {
        LoggerFactory.setType('none');
        const logger = LoggerFactory.getLogger('late');
        expect(logger.isEnabled(SeverityNumber.DEBUG)).toBe(false);

        LoggerFactory.reset();

        expect(logger.isEnabled(SeverityNumber.DEBUG)).toBe(true);
    });

    it('keeps an explicit per-logger threshold across global changes', () => {
        LoggerFactory.reset();
        const logger = LoggerFactory.getLogger('late');

        logger.setThreshold(SeverityNumber.INFO);
        LoggerFactory.setThreshold(SeverityNumber.ERROR);

        expect(logger.threshold).toBe(SeverityNumber.INFO);
    });
});
