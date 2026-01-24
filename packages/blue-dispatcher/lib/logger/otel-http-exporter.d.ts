/**
 * @author Jeff Rose
 */
import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult } from '@opentelemetry/core';
import { BatchLayout } from '@blue/logger';
import { TimeoutInit, HTTPAware, HTTP } from '@blue/http';
import { $aware } from '@blue/factory';
export type HTTPExporterInit = TimeoutInit;
/**
 * HTTPLogRecordExporter is an OpenTelemetry LogRecordExporter that sends log records
 * to an HTTP endpoint using blue-dispatcher's HTTP service with dependency injection.
 *
 * This is the OTel-native replacement for HTTPAppender, preserving the dependency
 * injection pattern and Layout formatting system.
 *
 * @example
 * ```typescript
 * import { HTTPLogRecordExporter } from '@blue/dispatcher';
 * import { BlueLoggerProvider, BatchLogRecordProcessor, JSONLayout } from '@blue/logger';
 *
 * const exporter = new HTTPLogRecordExporter('/api/logs', {
 *   timeout: 10000
 * });
 * exporter.setLayout(new JSONLayout());
 *
 * const processor = new BatchLogRecordProcessor(exporter);
 * const provider = new BlueLoggerProvider({ processors: [processor] });
 * ```
 */
export declare class HTTPLogRecordExporter implements LogRecordExporter, HTTPAware {
    #private;
    readonly url: string;
    readonly settings: HTTPExporterInit;
    private layout;
    private pendingRequest?;
    get [$aware](): boolean;
    constructor(url: string, init?: HTTPExporterInit);
    /**
     * Export log records to HTTP endpoint
     *
     * @param logs - Array of log records to export
     * @param resultCallback - Callback to invoke with export result
     */
    export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void;
    /**
     * Execute HTTP request with timeout handling
     */
    private executeRequest;
    /**
     * Set the HTTP service (dependency injection)
     *
     * @param http - The HTTP service to use for requests
     */
    setHTTP(http: HTTP): void;
    /**
     * Get the HTTP service
     *
     * @returns The injected HTTP service or undefined
     */
    getHTTP(): HTTP | undefined;
    /**
     * Set the layout for formatting log batches
     *
     * @param layout - The BatchLayout to use
     */
    setLayout(layout: BatchLayout): void;
    /**
     * Get the current layout
     *
     * @returns The current BatchLayout
     */
    getLayout(): BatchLayout;
    /**
     * Get the target URL
     *
     * @returns The HTTP endpoint URL
     */
    getUrl(): string;
    /**
     * Get the request settings
     *
     * @returns Copy of the request settings
     */
    getSettings(): HTTPExporterInit;
    /**
     * Shutdown the exporter
     */
    shutdown(): Promise<void>;
    /**
     * Force flush any pending records
     */
    forceFlush(): Promise<void>;
}
//# sourceMappingURL=otel-http-exporter.d.ts.map