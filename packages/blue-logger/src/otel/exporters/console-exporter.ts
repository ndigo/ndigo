/**
 * @author Jeff Rose
 */

import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Layout } from '../../layout';
import { PatternLayout } from '../../layouts/pattern-layout';
import { logRecordToEntry } from '../entry-to-logrecord';

/**
 * Console exporter options
 */
export interface ConsoleExporterOptions {
    /**
     * Layout to use for formatting log records
     * Default: PatternLayout with '[%d] %c %p - %m'
     */
    layout?: Layout;

    /**
     * Whether to use colored output (if supported by console)
     * Default: true
     */
    useColors?: boolean;

    /**
     * Custom console object (for testing)
     * Default: global console
     */
    console?: Console;
}

/**
 * LayoutAwareConsoleExporter exports log records to the browser/Node.js console
 * with support for blue-logger Layout formatting.
 *
 * @example
 * ```typescript
 * import { LayoutAwareConsoleExporter, PatternLayout } from '@blue/logger';
 *
 * const exporter = new LayoutAwareConsoleExporter({
 *   layout: new PatternLayout('[%d] %c %p - %m')
 * });
 * ```
 */
export class LayoutAwareConsoleExporter implements LogRecordExporter {
    private layout: Layout;
    private useColors: boolean;
    private console: Console;

    constructor(options: ConsoleExporterOptions = {}) {
        this.layout = options.layout || new PatternLayout('[%d] %c %p - %m');
        this.useColors = options.useColors !== false;
        this.console = options.console || console;
    }

    /**
     * Export log records to console
     *
     * @param logs - Array of log records to export
     * @param resultCallback - Callback to invoke with export result
     */
    export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void {
        try {
            for (const log of logs) {
                this.exportOne(log);
            }

            resultCallback({ code: ExportResultCode.SUCCESS });
        } catch (error) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }

    /**
     * Export a single log record
     */
    private exportOne(log: ReadableLogRecord): void {
        // Convert LogRecord to Entry for layout formatting
        const entry = logRecordToEntry(log);

        // Format using layout
        const formatted = this.layout.format(entry);

        // Determine console method based on severity
        const consoleMethod = this.getConsoleMethod(log.severityNumber);

        // Output to console
        this.console[consoleMethod](formatted);
    }

    /**
     * Map OTel severity to console method
     */
    private getConsoleMethod(severityNumber: SeverityNumber): 'error' | 'warn' | 'info' | 'debug' | 'log' {
        if (severityNumber >= SeverityNumber.ERROR) {
            return 'error';
        }

        if (severityNumber >= SeverityNumber.WARN) {
            return 'warn';
        }

        if (severityNumber >= SeverityNumber.INFO) {
            return 'info';
        }

        if (severityNumber >= SeverityNumber.DEBUG) {
            return 'debug';
        }

        return 'log';
    }

    /**
     * Shutdown the exporter
     */
    async shutdown(): Promise<void> {
        // Console exporter doesn't need cleanup
    }

    /**
     * Force flush any pending records
     */
    async forceFlush(): Promise<void> {
        // Console writes are synchronous, nothing to flush
    }

    /**
     * Get the layout being used
     */
    getLayout(): Layout {
        return this.layout;
    }

    /**
     * Set a new layout
     */
    setLayout(layout: Layout): void {
        this.layout = layout;
    }
}
