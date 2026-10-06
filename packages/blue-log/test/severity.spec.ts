/**
 * @module blue-log
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { SeverityNumber } from '@opentelemetry/api-logs';
import {
    detectSeverityScheme,
    getSeverityMapping,
    levelToSeverityNumber,
    severityNumberToLevel,
} from '../src/severity';

describe('severity mapping', () => {
    it('detects severity scheme from known levels', () => {
        expect(detectSeverityScheme('http')).toBe('npm');
        expect(detectSeverityScheme('prompt')).toBe('cli');
        expect(detectSeverityScheme('emerg')).toBe('syslog');
        expect(detectSeverityScheme('notice')).toBe('apache');
        expect(detectSeverityScheme('warning')).toBe('syslog');
    });

    it('maps level names to OTel severity numbers', () => {
        expect(levelToSeverityNumber('error', 'apache')).toBe(SeverityNumber.ERROR);
        expect(levelToSeverityNumber('warn', 'npm')).toBe(SeverityNumber.WARN);
        expect(levelToSeverityNumber('silly', 'cli')).toBe(SeverityNumber.TRACE);
        expect(levelToSeverityNumber('warning')).toBe(SeverityNumber.WARN);
    });

    it('maps OTel severity number back to level names', () => {
        expect(severityNumberToLevel(SeverityNumber.ERROR, 'apache')).toBe('error');
        expect(severityNumberToLevel(SeverityNumber.INFO2, 'cli')).toBe('data');
    });

    it('maps fatal and critical names to FATAL severities, not INFO', () => {
        expect(levelToSeverityNumber('fatal')).toBe(SeverityNumber.FATAL);
        expect(levelToSeverityNumber('FATAL')).toBe(SeverityNumber.FATAL);
        expect(levelToSeverityNumber('critical')).toBe(SeverityNumber.FATAL);
        expect(levelToSeverityNumber('fatal', 'syslog')).toBe(SeverityNumber.FATAL);
        expect(levelToSeverityNumber('critical', 'syslog')).toBe(SeverityNumber.FATAL);
        expect(levelToSeverityNumber('fatal', 'apache')).toBe(SeverityNumber.FATAL);
        expect(levelToSeverityNumber('critical', 'apache')).toBe(SeverityNumber.FATAL);
    });

    it('documents unknown level names as an INFO fallback', () => {
        // The fallback is deliberate — an unrecognized name must not throw
        // inside logging; pass the scheme that knows the name to avoid the
        // unintended downgrade.
        expect(levelToSeverityNumber('bogus')).toBe(SeverityNumber.INFO);
        expect(levelToSeverityNumber('bogus', 'syslog')).toBe(SeverityNumber.INFO);
        expect(getSeverityMapping('apache').toSeverityNumber('bogus')).toBe(SeverityNumber.INFO);
    });

    it('returns mapping objects by scheme', () => {
        const mapping = getSeverityMapping('syslog');
        expect(mapping.toSeverityNumber('err')).toBe(SeverityNumber.ERROR);
        expect(mapping.toSeverityText(SeverityNumber.WARN)).toBe('warning');
    });
});
