/**
 * @module ndigo-log
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it, vi } from 'vitest';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { ConsoleLogger } from '../src/logger/console-logger';

describe('ConsoleLogger threshold', () => {
    it('filters logs below threshold', () => {
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const logger = new ConsoleLogger('test', SeverityNumber.WARN);

        logger.debug('debug');
        logger.info('info');
        logger.warn('warn');
        logger.error('error');

        expect(debugSpy).not.toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledTimes(1);

        debugSpy.mockRestore();
        infoSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('supports threshold changes at runtime', () => {
        const logger = new ConsoleLogger('test');
        expect(logger.isEnabled(SeverityNumber.DEBUG)).toBe(true);

        logger.setThreshold(SeverityNumber.ERROR);

        expect(logger.isEnabled(SeverityNumber.WARN)).toBe(false);
        expect(logger.isEnabled(SeverityNumber.ERROR)).toBe(true);
    });
});
