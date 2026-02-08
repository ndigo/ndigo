/**
 * @author Jeff Rose
 */

import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { BatchLayout } from '@blue/logger';
import { JSONLayout } from '@blue/logger';
import { TimeoutInit, HTTPAware, HTTP, HTTPHeaders } from '@blue/http';
import { $aware } from '@blue/factory';

// Import conversion function
let logRecordToEntry: any;
try {
    const otelModule = await import('@blue/logger/otel/entry-to-logrecord');
    logRecordToEntry = otelModule.logRecordToEntry;
} catch {
    // OTel module not available
}

export type HTTPExporterInit = TimeoutInit;

const { CONTENT_LENGTH, CONTENT_TYPE } = HTTPHeaders;
const defaults: HTTPExporterInit = {
    method: 'POST',
    timeout: 30000, // 30 second default timeout
};

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
export class HTTPLogRecordExporter implements LogRecordExporter, HTTPAware {
    #http: HTTP;
    readonly url: string;
    readonly settings: HTTPExporterInit;
    private layout: BatchLayout;
    private pendingRequest?: Promise<Response>;

    get [$aware](): boolean {
        return true;
    }

    constructor(url: string, init: HTTPExporterInit = {}) {
        this.url = url;
        this.settings = { ...defaults, ...init };
        this.layout = new JSONLayout();
    }

    /**
     * Export log records to HTTP endpoint
     *
     * @param logs - Array of log records to export
     * @param resultCallback - Callback to invoke with export result
     */
    export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void {
        if (!this.#http) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: new Error('HTTP service not injected. Call setHTTP() first.'),
            });
            return;
        }

        if (!logRecordToEntry) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: new Error('OTel conversion module not available'),
            });
            return;
        }

        try {
            // Convert LogRecords to Entries
            const entries = logs.map((log) => logRecordToEntry(log));

            // Format batch using layout
            const content = this.layout.formatBatch(entries);

            // Build headers
            const headers = new Headers();
            CONTENT_TYPE.set(headers, this.layout.mediaType.toContentType());
            CONTENT_LENGTH.set(headers, content.length);

            // Build request settings
            const requestSettings = {
                ...this.settings,
                body: content,
                headers,
            };

            // Execute HTTP request with timeout
            this.pendingRequest = this.executeRequest(this.url, requestSettings, resultCallback);
        } catch (error) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }

    /**
     * Execute HTTP request with timeout handling
     */
    private executeRequest(
        url: string,
        settings: any,
        resultCallback: (result: ExportResult) => void
    ): Promise<Response> {
        const http = this.#http;
        const timeout = settings.timeout;

        return new Promise<Response>((resolve, reject) => {
            let timedOut = false;
            let timerId: ReturnType<typeof setTimeout> | null = null;

            if (timeout > 0) {
                timerId = setTimeout(() => {
                    timedOut = true;
                    const error = new Error(`HTTP request timed out after ${timeout}ms`);
                    reject(error);
                    resultCallback({
                        code: ExportResultCode.FAILED,
                        error,
                    });
                }, timeout);
            }

            http.request(url, settings)
                .then((response: Response) => {
                    if (timerId !== null) {
                        clearTimeout(timerId);
                    }
                    if (!timedOut) {
                        resolve(response);
                        resultCallback({ code: ExportResultCode.SUCCESS });
                    }
                })
                .catch((error: Error) => {
                    if (timerId !== null) {
                        clearTimeout(timerId);
                    }
                    if (!timedOut) {
                        reject(error);
                        resultCallback({
                            code: ExportResultCode.FAILED,
                            error,
                        });
                    }
                });
        });
    }

    /**
     * Set the HTTP service (dependency injection)
     *
     * @param http - The HTTP service to use for requests
     */
    setHTTP(http: HTTP): void {
        this.#http = http;
    }

    /**
     * Get the HTTP service
     *
     * @returns The injected HTTP service or undefined
     */
    getHTTP(): HTTP | undefined {
        return this.#http;
    }

    /**
     * Set the layout for formatting log batches
     *
     * @param layout - The BatchLayout to use
     */
    setLayout(layout: BatchLayout): void {
        this.layout = layout;
    }

    /**
     * Get the current layout
     *
     * @returns The current BatchLayout
     */
    getLayout(): BatchLayout {
        return this.layout;
    }

    /**
     * Get the target URL
     *
     * @returns The HTTP endpoint URL
     */
    getUrl(): string {
        return this.url;
    }

    /**
     * Get the request settings
     *
     * @returns Copy of the request settings
     */
    getSettings(): HTTPExporterInit {
        return { ...this.settings };
    }

    /**
     * Shutdown the exporter
     */
    async shutdown(): Promise<void> {
        // Wait for any pending request to complete
        if (this.pendingRequest) {
            try {
                await this.pendingRequest;
            } catch {
                // Ignore errors during shutdown
            }
        }
    }

    /**
     * Force flush any pending records
     */
    async forceFlush(): Promise<void> {
        // Wait for any pending request to complete
        if (this.pendingRequest) {
            await this.pendingRequest;
        }
    }
}
