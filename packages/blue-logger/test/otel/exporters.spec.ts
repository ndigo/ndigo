/**
 * @author Jeff Rose
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResultCode } from '@opentelemetry/core';
import { LayoutAwareConsoleExporter } from '../../src/otel/exporters/console-exporter';
import { AppenderLogRecordExporter } from '../../src/otel/exporters/appender-exporter';
import { FetchLogRecordExporter } from '../../src/otel/exporters/fetch-exporter';
import { Appender } from '../../src/appender';
import { Entry } from '../../src/entry';
import { PatternLayout } from '../../src/layouts/pattern-layout';
import { JSONLayout } from '../../src/layouts/json-layout';

describe('OTel Exporters', () => {
    const createMockLogRecord = (overrides?: Partial<ReadableLogRecord>): ReadableLogRecord => {
        const timestamp = Date.now();
        const hrTime: [number, number] = [Math.trunc(timestamp / 1000), (timestamp % 1000) * 1e6];

        return {
            hrTime,
            hrTimeObserved: hrTime,
            severityNumber: SeverityNumber.INFO,
            severityText: 'info',
            body: 'Test message',
            attributes: {
                'blue.logger.category': 'test',
            },
            resource: {} as any,
            instrumentationScope: { name: 'test', version: '1.0.0' },
            droppedAttributesCount: 0,
            ...overrides,
        };
    };

    describe('LayoutAwareConsoleExporter', () => {
        let consoleLog: any;
        let consoleError: any;
        let consoleWarn: any;
        let consoleInfo: any;
        let consoleDebug: any;

        beforeEach(() => {
            consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
            consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
            consoleDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});
        });

        it('should export log records to console', () => {
            const exporter = new LayoutAwareConsoleExporter();
            const logRecord = createMockLogRecord();

            exporter.export([logRecord], (result) => {
                expect(result.code).toBe(ExportResultCode.SUCCESS);
            });

            expect(consoleInfo).toHaveBeenCalled();
        });

        it('should use appropriate console method for severity', () => {
            const exporter = new LayoutAwareConsoleExporter();

            // ERROR severity
            exporter.export([createMockLogRecord({ severityNumber: SeverityNumber.ERROR })], () => {});
            expect(consoleError).toHaveBeenCalled();

            // WARN severity
            exporter.export([createMockLogRecord({ severityNumber: SeverityNumber.WARN })], () => {});
            expect(consoleWarn).toHaveBeenCalled();

            // DEBUG severity
            exporter.export([createMockLogRecord({ severityNumber: SeverityNumber.DEBUG })], () => {});
            expect(consoleDebug).toHaveBeenCalled();
        });

        it('should use custom layout', () => {
            const layout = new PatternLayout('%p - %m');
            const exporter = new LayoutAwareConsoleExporter({ layout });

            const logRecord = createMockLogRecord();
            exporter.export([logRecord], () => {});

            expect(consoleInfo).toHaveBeenCalledWith(expect.stringContaining('info'));
            expect(consoleInfo).toHaveBeenCalledWith(expect.stringContaining('Test message'));
        });

        it('should handle multiple log records', () => {
            const exporter = new LayoutAwareConsoleExporter();
            const records = [
                createMockLogRecord({ body: 'Message 1' }),
                createMockLogRecord({ body: 'Message 2' }),
                createMockLogRecord({ body: 'Message 3' }),
            ];

            exporter.export(records, (result) => {
                expect(result.code).toBe(ExportResultCode.SUCCESS);
            });

            expect(consoleInfo).toHaveBeenCalledTimes(3);
        });

        it('should shutdown gracefully', async () => {
            const exporter = new LayoutAwareConsoleExporter();
            await expect(exporter.shutdown()).resolves.toBeUndefined();
        });

        it('should flush gracefully', async () => {
            const exporter = new LayoutAwareConsoleExporter();
            await expect(exporter.forceFlush()).resolves.toBeUndefined();
        });

        it('should allow getting and setting layout', () => {
            const layout1 = new PatternLayout('%p - %m');
            const exporter = new LayoutAwareConsoleExporter({ layout: layout1 });

            expect(exporter.getLayout()).toBe(layout1);

            const layout2 = new PatternLayout('%m');
            exporter.setLayout(layout2);
            expect(exporter.getLayout()).toBe(layout2);
        });
    });

    describe('AppenderLogRecordExporter', () => {
        it('should wrap appender and export log records', () => {
            const mockAppender: Appender = {
                layout: new PatternLayout('%m'),
                errorHandler: null as any,
                append: vi.fn(),
            };

            const exporter = new AppenderLogRecordExporter(mockAppender);
            const logRecord = createMockLogRecord();

            exporter.export([logRecord], (result) => {
                expect(result.code).toBe(ExportResultCode.SUCCESS);
            });

            expect(mockAppender.append).toHaveBeenCalled();
        });

        it('should handle appender errors', () => {
            const mockAppender: Appender = {
                layout: new PatternLayout('%m'),
                errorHandler: null as any,
                append: vi.fn(() => {
                    throw new Error('Appender error');
                }),
            };

            const exporter = new AppenderLogRecordExporter(mockAppender);
            const logRecord = createMockLogRecord();

            exporter.export([logRecord], (result) => {
                expect(result.code).toBe(ExportResultCode.FAILED);
                expect(result.error).toBeInstanceOf(Error);
            });
        });

        it('should use custom layout if provided', () => {
            const customLayout = new PatternLayout('%p - %m');
            const mockAppender: Appender = {
                layout: new PatternLayout('%m'), // Original layout
                errorHandler: null as any,
                append: vi.fn(),
            };

            const exporter = new AppenderLogRecordExporter(mockAppender, customLayout);
            expect(mockAppender.layout).toBe(customLayout);
        });

        it('should get wrapped appender', () => {
            const mockAppender: Appender = {
                layout: new PatternLayout('%m'),
                errorHandler: null as any,
                append: vi.fn(),
            };

            const exporter = new AppenderLogRecordExporter(mockAppender);
            expect(exporter.getAppender()).toBe(mockAppender);
        });

        it('should shutdown gracefully', async () => {
            const mockAppender: Appender = {
                layout: new PatternLayout('%m'),
                errorHandler: null as any,
                append: vi.fn(),
            };

            const exporter = new AppenderLogRecordExporter(mockAppender);
            await expect(exporter.shutdown()).resolves.toBeUndefined();
        });
    });

    describe('FetchLogRecordExporter', () => {
        it('should export log records to HTTP endpoint', () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
            });

            const exporter = new FetchLogRecordExporter('http://localhost:8080/logs');
            const logRecord = createMockLogRecord();

            exporter.export([logRecord], (result) => {
                expect(result.code).toBe(ExportResultCode.SUCCESS);
            });

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:8080/logs',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(String),
                })
            );
        });

        it('should use custom layout for formatting', () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
            });

            const layout = new JSONLayout();
            const exporter = new FetchLogRecordExporter('http://localhost:8080/logs', { layout });

            expect(exporter.getLayout()).toBe(layout);
        });

        it('should handle fetch errors', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            const exporter = new FetchLogRecordExporter('http://localhost:8080/logs');
            const logRecord = createMockLogRecord();

            exporter.export([logRecord], (result) => {
                expect(result.code).toBe(ExportResultCode.FAILED);
            });
        });

        it('should handle HTTP errors', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            });

            const exporter = new FetchLogRecordExporter('http://localhost:8080/logs');
            const logRecord = createMockLogRecord();

            exporter.export([logRecord], (result) => {
                expect(result.code).toBe(ExportResultCode.FAILED);
            });
        });

        it('should get URL and options', () => {
            const exporter = new FetchLogRecordExporter('http://localhost:8080/logs', {
                timeout: 5000,
            });

            expect(exporter.getUrl()).toBe('http://localhost:8080/logs');
            expect(exporter.getOptions().timeout).toBe(5000);
        });

        it('should allow setting layout', () => {
            const exporter = new FetchLogRecordExporter('http://localhost:8080/logs');
            const newLayout = new JSONLayout();

            exporter.setLayout(newLayout);
            expect(exporter.getLayout()).toBe(newLayout);
        });

        it('should shutdown gracefully', async () => {
            const exporter = new FetchLogRecordExporter('http://localhost:8080/logs');
            await expect(exporter.shutdown()).resolves.toBeUndefined();
        });
    });
});
