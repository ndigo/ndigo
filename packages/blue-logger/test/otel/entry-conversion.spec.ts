/**
 * @author Jeff Rose
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { context, trace, ROOT_CONTEXT } from '@opentelemetry/api';
import { ApacheLevel } from '../../src/apache-logging';
import { newEntry, Entry } from '../../src/entry';
import { entryToLogRecord, logRecordToEntry } from '../../src/otel/entry-to-logrecord';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';

describe('OTel Entry Conversion', () => {
    describe('entryToLogRecord', () => {
        it('should convert basic entry to log record', () => {
            const entry = newEntry('test-category', ApacheLevel.INFO, ['Test message']);
            const logRecord = entryToLogRecord(entry);

            expect(logRecord.severityNumber).toBe(SeverityNumber.INFO);
            expect(logRecord.severityText).toBe('info');
            expect(logRecord.body).toBe('Test message');
            expect(logRecord.attributes).toHaveProperty('blue.logger.category', 'test-category');
            expect(logRecord.timestamp).toBe(entry.timestamp);
            expect(logRecord.observedTimestamp).toBeGreaterThanOrEqual(entry.timestamp);
        });

        it('should include source in attributes if present', () => {
            const entry = newEntry('test-category', ApacheLevel.INFO, ['Test message'], 'test-source');
            const logRecord = entryToLogRecord(entry);

            expect(logRecord.attributes).toHaveProperty('blue.logger.source', 'test-source');
        });

        it('should mark error flag in attributes', () => {
            const error = new Error('Test error');
            const entry = newEntry('test-category', ApacheLevel.ERROR, [error]);
            const logRecord = entryToLogRecord(entry);

            expect(logRecord.attributes).toHaveProperty('blue.logger.error', true);
        });

        it('should extract exception information from Error objects', () => {
            const error = new Error('Test error');
            error.name = 'TestError';
            const entry = newEntry('test-category', ApacheLevel.ERROR, [error, 'Additional context']);
            const logRecord = entryToLogRecord(entry);

            expect(logRecord.attributes).toHaveProperty('exception.type', 'TestError');
            expect(logRecord.attributes).toHaveProperty('exception.message', 'Test error');
            expect(logRecord.attributes).toHaveProperty('exception.stacktrace');
            expect(logRecord.body).toContain('TestError: Test error');
            expect(logRecord.body).toContain('Additional context');
        });

        it('should format multiple message items', () => {
            const entry = newEntry('test-category', ApacheLevel.INFO, ['Message 1', 'Message 2', { foo: 'bar' }]);
            const logRecord = entryToLogRecord(entry);

            expect(logRecord.body).toContain('Message 1');
            expect(logRecord.body).toContain('Message 2');
            expect(logRecord.body).toContain('"foo":"bar"');
        });

        it('should use specified scheme for severity mapping', () => {
            const entry = newEntry('test-category', ApacheLevel.DEBUG, ['Debug message']);
            const logRecord = entryToLogRecord(entry, { scheme: 'apache' });

            expect(logRecord.severityNumber).toBe(SeverityNumber.DEBUG);
        });

        it('should include additional attributes from options', () => {
            const entry = newEntry('test-category', ApacheLevel.INFO, ['Test']);
            const logRecord = entryToLogRecord(entry, {
                attributes: {
                    'custom.attribute': 'custom-value',
                },
            });

            expect(logRecord.attributes).toHaveProperty('custom.attribute', 'custom-value');
            expect(logRecord.attributes).toHaveProperty('blue.logger.category', 'test-category');
        });

        it('should handle objects in message gracefully', () => {
            const entry = newEntry('test-category', ApacheLevel.INFO, [{ complex: { nested: 'object' } }]);
            const logRecord = entryToLogRecord(entry);

            expect(logRecord.body).toContain('complex');
            expect(logRecord.body).toContain('nested');
        });

        it('should handle circular objects without crashing', () => {
            const circular: any = { name: 'test' };
            circular.self = circular;
            const entry = newEntry('test-category', ApacheLevel.INFO, [circular]);

            expect(() => {
                const logRecord = entryToLogRecord(entry);
                expect(logRecord.body).toBeTruthy();
            }).not.toThrow();
        });
    });

    describe('logRecordToEntry', () => {
        it('should convert log record back to entry', () => {
            const timestamp = Date.now();
            const hrTime: [number, number] = [Math.trunc(timestamp / 1000), (timestamp % 1000) * 1e6];

            const logRecord: ReadableLogRecord = {
                hrTime,
                hrTimeObserved: hrTime,
                severityNumber: SeverityNumber.INFO,
                severityText: 'info',
                body: 'Test message',
                attributes: {
                    'blue.logger.category': 'test-category',
                    'blue.logger.source': 'test-source',
                },
                resource: {} as any,
                instrumentationScope: { name: 'test' },
                droppedAttributesCount: 0,
            };

            const entry = logRecordToEntry(logRecord);

            expect(entry.level.name).toBe('info');
            expect(entry.message).toContain('Test message');
            expect(entry.category).toBe('test-category');
            expect(entry.source).toBe('test-source');
        });

        it('should reconstruct Error from exception attributes', () => {
            const timestamp = Date.now();
            const hrTime: [number, number] = [Math.trunc(timestamp / 1000), (timestamp % 1000) * 1e6];

            const logRecord: ReadableLogRecord = {
                hrTime,
                hrTimeObserved: hrTime,
                severityNumber: SeverityNumber.ERROR,
                severityText: 'error',
                body: 'TestError: Something failed',
                attributes: {
                    'blue.logger.category': 'test-category',
                    'blue.logger.error': true,
                    'exception.type': 'TestError',
                    'exception.message': 'Something failed',
                    'exception.stacktrace': 'Error: Something failed\n  at ...',
                },
                resource: {} as any,
                instrumentationScope: { name: 'test' },
                droppedAttributesCount: 0,
            };

            const entry = logRecordToEntry(logRecord);

            expect(entry.error).toBe(true);
            expect(entry.message[0]).toBeInstanceOf(Error);
            const error = entry.message[0] as Error;
            expect(error.name).toBe('TestError');
            expect(error.message).toBe('Something failed');
            expect(error.stack).toBeTruthy();
        });

        it('should use default category if not present', () => {
            const timestamp = Date.now();
            const hrTime: [number, number] = [Math.trunc(timestamp / 1000), (timestamp % 1000) * 1e6];

            const logRecord: ReadableLogRecord = {
                hrTime,
                hrTimeObserved: hrTime,
                severityNumber: SeverityNumber.INFO,
                body: 'Test',
                attributes: {},
                resource: {} as any,
                instrumentationScope: { name: 'test' },
                droppedAttributesCount: 0,
            };

            const entry = logRecordToEntry(logRecord);
            expect(entry.category).toBe('default');
        });

        it('should handle non-string body types', () => {
            const timestamp = Date.now();
            const hrTime: [number, number] = [Math.trunc(timestamp / 1000), (timestamp % 1000) * 1e6];

            const logRecord: ReadableLogRecord = {
                hrTime,
                hrTimeObserved: hrTime,
                severityNumber: SeverityNumber.INFO,
                body: { complex: 'object' },
                attributes: {
                    'blue.logger.category': 'test',
                },
                resource: {} as any,
                instrumentationScope: { name: 'test' },
                droppedAttributesCount: 0,
            };

            const entry = logRecordToEntry(logRecord);
            expect(entry.message).toHaveLength(1);
            expect(entry.message[0]).toEqual({ complex: 'object' });
        });
    });

    describe('Round-trip conversion', () => {
        it('should preserve data through entry -> logRecord -> entry', () => {
            const originalEntry = newEntry(
                'test-category',
                ApacheLevel.WARN,
                ['Warning message', 'with', 'multiple', 'parts'],
                'test-source'
            );

            const logRecord = entryToLogRecord(originalEntry);
            const convertedEntry = logRecordToEntry(logRecord as any);

            expect(convertedEntry.category).toBe(originalEntry.category);
            expect(convertedEntry.source).toBe(originalEntry.source);
            expect(convertedEntry.level.name).toBe(originalEntry.level.name);
            expect(convertedEntry.message.join(' ')).toContain('Warning message');
        });
    });
});
