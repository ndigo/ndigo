/**
 * @author Jeff Rose
 */
import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult } from '@opentelemetry/core';
import { Layout } from '../../layout';
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
export declare class LayoutAwareConsoleExporter implements LogRecordExporter {
    private layout;
    private useColors;
    private console;
    constructor(options?: ConsoleExporterOptions);
    /**
     * Export log records to console
     *
     * @param logs - Array of log records to export
     * @param resultCallback - Callback to invoke with export result
     */
    export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void;
    /**
     * Export a single log record
     */
    private exportOne;
    /**
     * Map OTel severity to console method
     */
    private getConsoleMethod;
    /**
     * Shutdown the exporter
     */
    shutdown(): Promise<void>;
    /**
     * Force flush any pending records
     */
    forceFlush(): Promise<void>;
    /**
     * Get the layout being used
     */
    getLayout(): Layout;
    /**
     * Set a new layout
     */
    setLayout(layout: Layout): void;
}
//# sourceMappingURL=console-exporter.d.ts.map