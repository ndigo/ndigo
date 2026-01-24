/**
 * @author Jeff Rose
 */

import { describe, it, expect } from 'vitest';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Level } from '../../src/level';
import { ApacheLevel } from '../../src/apache-logging';
import { NPMLevel } from '../../src/npm-logging';
import { CLILevel } from '../../src/cli-logging';
import { SyslogLevel } from '../../src/syslog-logging';
import {
    levelToSeverity,
    severityToLevel,
    detectLevelScheme,
    ApacheLevelToSeverity,
    NPMLevelToSeverity,
    CLILevelToSeverity,
    SyslogLevelToSeverity,
} from '../../src/otel/level-mapping';

describe('OTel Level Mapping', () => {
    describe('ApacheLevelToSeverity', () => {
        it('should map Apache levels to severity numbers', () => {
            expect(ApacheLevelToSeverity['fatal']).toBe(SeverityNumber.FATAL);
            expect(ApacheLevelToSeverity['error']).toBe(SeverityNumber.ERROR);
            expect(ApacheLevelToSeverity['warn']).toBe(SeverityNumber.WARN);
            expect(ApacheLevelToSeverity['info']).toBe(SeverityNumber.INFO);
            expect(ApacheLevelToSeverity['debug']).toBe(SeverityNumber.DEBUG);
            expect(ApacheLevelToSeverity['trace']).toBe(SeverityNumber.TRACE);
        });

        it('should map special levels', () => {
            expect(ApacheLevelToSeverity['off']).toBe(SeverityNumber.UNSPECIFIED);
            expect(ApacheLevelToSeverity['all']).toBe(SeverityNumber.UNSPECIFIED);
        });
    });

    describe('NPMLevelToSeverity', () => {
        it('should map NPM levels to severity numbers', () => {
            expect(NPMLevelToSeverity['error']).toBe(SeverityNumber.ERROR);
            expect(NPMLevelToSeverity['warn']).toBe(SeverityNumber.WARN);
            expect(NPMLevelToSeverity['info']).toBe(SeverityNumber.INFO);
            expect(NPMLevelToSeverity['http']).toBe(SeverityNumber.INFO);
            expect(NPMLevelToSeverity['verbose']).toBe(SeverityNumber.DEBUG);
            expect(NPMLevelToSeverity['debug']).toBe(SeverityNumber.DEBUG);
            expect(NPMLevelToSeverity['silly']).toBe(SeverityNumber.TRACE);
        });
    });

    describe('CLILevelToSeverity', () => {
        it('should map CLI levels to severity numbers', () => {
            expect(CLILevelToSeverity['error']).toBe(SeverityNumber.ERROR);
            expect(CLILevelToSeverity['warn']).toBe(SeverityNumber.WARN);
            expect(CLILevelToSeverity['help']).toBe(SeverityNumber.INFO);
            expect(CLILevelToSeverity['data']).toBe(SeverityNumber.INFO);
            expect(CLILevelToSeverity['info']).toBe(SeverityNumber.INFO);
            expect(CLILevelToSeverity['debug']).toBe(SeverityNumber.DEBUG);
            expect(CLILevelToSeverity['prompt']).toBe(SeverityNumber.INFO);
            expect(CLILevelToSeverity['verbose']).toBe(SeverityNumber.DEBUG);
            expect(CLILevelToSeverity['input']).toBe(SeverityNumber.DEBUG);
            expect(CLILevelToSeverity['silly']).toBe(SeverityNumber.TRACE);
        });
    });

    describe('SyslogLevelToSeverity', () => {
        it('should map Syslog levels to severity numbers', () => {
            expect(SyslogLevelToSeverity['emerg']).toBe(SeverityNumber.FATAL4);
            expect(SyslogLevelToSeverity['alert']).toBe(SeverityNumber.FATAL);
            expect(SyslogLevelToSeverity['crit']).toBe(SeverityNumber.FATAL);
            expect(SyslogLevelToSeverity['error']).toBe(SeverityNumber.ERROR);
            expect(SyslogLevelToSeverity['warning']).toBe(SeverityNumber.WARN);
            expect(SyslogLevelToSeverity['notice']).toBe(SeverityNumber.WARN);
            expect(SyslogLevelToSeverity['info']).toBe(SeverityNumber.INFO);
            expect(SyslogLevelToSeverity['debug']).toBe(SeverityNumber.DEBUG);
        });
    });

    describe('levelToSeverity', () => {
        it('should convert Apache levels to severity', () => {
            const result = levelToSeverity(ApacheLevel.ERROR, 'apache');
            expect(result.severityNumber).toBe(SeverityNumber.ERROR);
            expect(result.severityText).toBe('error');
        });

        it('should convert NPM levels to severity', () => {
            const result = levelToSeverity(NPMLevel.VERBOSE, 'npm');
            expect(result.severityNumber).toBe(SeverityNumber.DEBUG);
            expect(result.severityText).toBe('verbose');
        });

        it('should convert CLI levels to severity', () => {
            const result = levelToSeverity(CLILevel.HELP, 'cli');
            expect(result.severityNumber).toBe(SeverityNumber.INFO);
            expect(result.severityText).toBe('help');
        });

        it('should convert Syslog levels to severity', () => {
            const result = levelToSeverity(SyslogLevel.ALERT, 'syslog');
            expect(result.severityNumber).toBe(SeverityNumber.FATAL);
            expect(result.severityText).toBe('alert');
        });

        it('should default to apache scheme', () => {
            const result = levelToSeverity(ApacheLevel.INFO);
            expect(result.severityNumber).toBe(SeverityNumber.INFO);
        });

        it('should return UNSPECIFIED for unknown levels', () => {
            const customLevel = new Level('custom', 99999);
            const result = levelToSeverity(customLevel, 'apache');
            expect(result.severityNumber).toBe(SeverityNumber.UNSPECIFIED);
        });
    });

    describe('severityToLevel', () => {
        it('should convert severity to Apache level', () => {
            const level = severityToLevel(SeverityNumber.ERROR, 'error');
            expect(level).toBe(ApacheLevel.ERROR);
        });

        it('should handle severity without text', () => {
            const level = severityToLevel(SeverityNumber.WARN);
            expect(level.name).toBe('warn');
        });

        it('should map to closest level for intermediate severities', () => {
            const level = severityToLevel(SeverityNumber.ERROR2);
            expect(level).toBe(ApacheLevel.ERROR);
        });

        it('should return Level.OFF for unspecified', () => {
            const level = severityToLevel(SeverityNumber.UNSPECIFIED);
            expect(level).toBe(Level.OFF);
        });
    });

    describe('detectLevelScheme', () => {
        it('should detect Apache scheme', () => {
            expect(detectLevelScheme(ApacheLevel.FATAL)).toBe('apache');
            expect(detectLevelScheme(ApacheLevel.ERROR)).toBe('apache');
        });

        it('should detect NPM scheme', () => {
            expect(detectLevelScheme(NPMLevel.HTTP)).toBe('npm');
            expect(detectLevelScheme(NPMLevel.SILLY)).toBe('npm');
        });

        it('should detect CLI scheme', () => {
            expect(detectLevelScheme(CLILevel.HELP)).toBe('cli');
            expect(detectLevelScheme(CLILevel.PROMPT)).toBe('cli');
        });

        it('should detect Syslog scheme', () => {
            expect(detectLevelScheme(SyslogLevel.EMERG)).toBe('syslog');
            expect(detectLevelScheme(SyslogLevel.ALERT)).toBe('syslog');
        });

        it('should return unknown for custom levels', () => {
            const customLevel = new Level('custom', 99999);
            expect(detectLevelScheme(customLevel)).toBe('unknown');
        });

        it('should detect ambiguous levels correctly', () => {
            // 'error' exists in multiple schemes but apache is checked first
            expect(detectLevelScheme(ApacheLevel.ERROR)).toBe('apache');
        });
    });

    describe('Level class static methods', () => {
        it('ApacheLevel.toSeverity should convert to severity', () => {
            expect(ApacheLevel.toSeverity(ApacheLevel.ERROR)).toBe(SeverityNumber.ERROR);
        });

        it('ApacheLevel.fromSeverity should convert from severity', () => {
            expect(ApacheLevel.fromSeverity(SeverityNumber.ERROR)).toBe(ApacheLevel.ERROR);
        });

        it('NPMLevel.toSeverity should convert to severity', () => {
            expect(NPMLevel.toSeverity(NPMLevel.HTTP)).toBe(SeverityNumber.INFO);
        });

        it('NPMLevel.fromSeverity should convert from severity', () => {
            expect(NPMLevel.fromSeverity(SeverityNumber.DEBUG)).toBe(NPMLevel.DEBUG);
        });

        it('CLILevel.toSeverity should convert to severity', () => {
            expect(CLILevel.toSeverity(CLILevel.HELP)).toBe(SeverityNumber.INFO);
        });

        it('CLILevel.fromSeverity should convert from severity', () => {
            expect(CLILevel.fromSeverity(SeverityNumber.INFO)).toBe(CLILevel.INFO);
        });

        it('SyslogLevel.toSeverity should convert to severity', () => {
            expect(SyslogLevel.toSeverity(SyslogLevel.ALERT)).toBe(SeverityNumber.FATAL);
        });

        it('SyslogLevel.fromSeverity should convert from severity', () => {
            expect(SyslogLevel.fromSeverity(SeverityNumber.FATAL)).toBe(SyslogLevel.ALERT);
        });
    });
});
