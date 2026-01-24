/**
 * @author Jeff Rose
 */
import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult } from '@opentelemetry/core';
import { BatchLayout } from '../../layout';
/**
 * Fetch exporter options
 */
export interface FetchExporterOptions extends RequestInit {
    /**
     * Request timeout in milliseconds
     * Set to -1 for no timeout
     * Default: 30000 (30 seconds)
     */
    timeout?: number;
    /**
     * Layout to use for formatting log batches
     * Default: JSONLayout
     */
    layout?: BatchLayout;
    /**
     * Additional headers to include in the request
     */
    headers?: HeadersInit;
}
/**
 * FetchLogRecordExporter exports log records to an HTTP endpoint using the Fetch API.
 *
 * This is the OTel-native replacement for FetchAppender, with support for
 * blue-logger's Layout system for backward compatibility.
 *
 * @example
 * ```typescript
 * import { FetchLogRecordExporter, JSONLayout } from '@blue/logger';
 * import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
 *
 * const exporter = new FetchLogRecordExporter('https://logs.example.com/api/logs', {
 *   layout: new JSONLayout(),
 *   timeout: 10000
 * });
 *
 * const processor = new BatchLogRecordProcessor(exporter);
 * ```
 */
export declare class FetchLogRecordExporter implements LogRecordExporter {
    readonly url: string;
    readonly options: FetchExporterOptions;
    private layout;
    private pendingRequest?;
    constructor(url: string, options?: FetchExporterOptions);
    /**
     * Export log records to HTTP endpoint
     *
     * @param logs - Array of log records to export
     * @param resultCallback - Callback to invoke with export result
     */
    export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void;
    /**
     * Fetch with timeout support
     */
    private fetchWithTimeout;
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
    getLayout(): BatchLayout;
    /**
     * Set a new layout
     */
    setLayout(layout: BatchLayout): void;
    /**
     * Get the target URL
     */
    getUrl(): string;
    /**
     * Get the request options
     */
    getOptions(): FetchExporterOptions;
}
//# sourceMappingURL=fetch-exporter.d.ts.map