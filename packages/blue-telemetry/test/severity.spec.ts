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

    it('returns mapping objects by scheme', () => {
        const mapping = getSeverityMapping('syslog');
        expect(mapping.toSeverityNumber('err')).toBe(SeverityNumber.ERROR);
        expect(mapping.toSeverityText(SeverityNumber.WARN)).toBe('warning');
    });
});
