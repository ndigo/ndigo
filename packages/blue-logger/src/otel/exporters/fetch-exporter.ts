/**
 * @author Jeff Rose
 */

import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { BatchLayout } from '../../layout';
import { JSONLayout } from '../../layouts/json-layout';
import { logRecordToEntry } from '../entry-to-logrecord';

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
export class FetchLogRecordExporter implements LogRecordExporter {
    readonly url: string;
    readonly options: FetchExporterOptions;
    private layout: BatchLayout;
    private pendingRequest?: Promise<Response>;

    constructor(url: string, options: FetchExporterOptions = {}) {
        this.url = url;
        this.options = {
            method: 'POST',
            timeout: 30000,
            ...options,
        };
        this.layout = options.layout || new JSONLayout();
    }

    /**
     * Export log records to HTTP endpoint
     *
     * @param logs - Array of log records to export
     * @param resultCallback - Callback to invoke with export result
     */
    export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void {
        // Convert LogRecords to Entries
        const entries = logs.map((log) => logRecordToEntry(log));

        // Format batch using layout
        const content = this.layout.formatBatch(entries);

        // Build headers
        const headers = new Headers(this.options.headers || {});
        headers.set('Content-Type', this.layout.mediaType.withCharset('utf-8').toString());
        headers.set('Content-Length', String(content.length));

        // Build fetch options
        const fetchOptions: RequestInit = {
            ...this.options,
            body: content,
            headers,
        };

        // Execute fetch with timeout
        this.pendingRequest = this.fetchWithTimeout(this.url, fetchOptions, this.options.timeout);

        this.pendingRequest
            .then(() => {
                resultCallback({ code: ExportResultCode.SUCCESS });
            })
            .catch((error) => {
                resultCallback({
                    code: ExportResultCode.FAILED,
                    error: error instanceof Error ? error : new Error(String(error)),
                });
            })
            .finally(() => {
                this.pendingRequest = undefined;
            });
    }

    /**
     * Fetch with timeout support
     */
    private fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            let timedOut = false;
            let timerId: ReturnType<typeof setTimeout> | null = null;

            if (timeout > 0) {
                timerId = setTimeout(() => {
                    timedOut = true;
                    reject(new Error(`Request to ${url} timed out after ${timeout}ms`));
                }, timeout);
            }

            fetch(url, options)
                .then((response) => {
                    if (timerId !== null) {
                        clearTimeout(timerId);
                    }
                    if (!timedOut) {
                        if (!response.ok) {
                            reject(
                                new Error(`HTTP request failed with status ${response.status}: ${response.statusText}`)
                            );
                        } else {
                            resolve(response);
                        }
                    }
                })
                .catch((error) => {
                    if (timerId !== null) {
                        clearTimeout(timerId);
                    }
                    if (!timedOut) {
                        reject(error);
                    }
                });
        });
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

    /**
     * Get the layout being used
     */
    getLayout(): BatchLayout {
        return this.layout;
    }

    /**
     * Set a new layout
     */
    setLayout(layout: BatchLayout): void {
        this.layout = layout;
    }

    /**
     * Get the target URL
     */
    getUrl(): string {
        return this.url;
    }

    /**
     * Get the request options
     */
    getOptions(): FetchExporterOptions {
        return { ...this.options };
    }
}
