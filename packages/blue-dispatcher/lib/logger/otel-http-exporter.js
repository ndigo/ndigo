/**
 * @author Jeff Rose
 */
import { ExportResultCode } from '@opentelemetry/core';
import { JSONLayout } from '@blue/logger';
import { HTTPHeaders } from '@blue/http';
import { $aware } from '@blue/factory';
// Import conversion function
let logRecordToEntry;
try {
    const otelModule = await import('@blue/logger/otel/entry-to-logrecord');
    logRecordToEntry = otelModule.logRecordToEntry;
}
catch {
    // OTel module not available
}
const { CONTENT_LENGTH, CONTENT_TYPE } = HTTPHeaders;
const defaults = {
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
export class HTTPLogRecordExporter {
    #http;
    url;
    settings;
    layout;
    pendingRequest;
    get [$aware]() {
        return true;
    }
    constructor(url, init = {}) {
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
    export(logs, resultCallback) {
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
            CONTENT_TYPE.set(headers, this.layout.mediaType.withCharset('utf-8'));
            CONTENT_LENGTH.set(headers, content.length);
            // Build request settings
            const requestSettings = {
                ...this.settings,
                body: content,
                headers,
            };
            // Execute HTTP request with timeout
            this.pendingRequest = this.executeRequest(this.url, requestSettings, resultCallback);
        }
        catch (error) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }
    /**
     * Execute HTTP request with timeout handling
     */
    executeRequest(url, settings, resultCallback) {
        const http = this.#http;
        const timeout = settings.timeout;
        return new Promise((resolve, reject) => {
            let timedOut = false;
            let timerId = null;
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
                .then((response) => {
                if (timerId !== null) {
                    clearTimeout(timerId);
                }
                if (!timedOut) {
                    resolve(response);
                    resultCallback({ code: ExportResultCode.SUCCESS });
                }
            })
                .catch((error) => {
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
    setHTTP(http) {
        this.#http = http;
    }
    /**
     * Get the HTTP service
     *
     * @returns The injected HTTP service or undefined
     */
    getHTTP() {
        return this.#http;
    }
    /**
     * Set the layout for formatting log batches
     *
     * @param layout - The BatchLayout to use
     */
    setLayout(layout) {
        this.layout = layout;
    }
    /**
     * Get the current layout
     *
     * @returns The current BatchLayout
     */
    getLayout() {
        return this.layout;
    }
    /**
     * Get the target URL
     *
     * @returns The HTTP endpoint URL
     */
    getUrl() {
        return this.url;
    }
    /**
     * Get the request settings
     *
     * @returns Copy of the request settings
     */
    getSettings() {
        return { ...this.settings };
    }
    /**
     * Shutdown the exporter
     */
    async shutdown() {
        // Wait for any pending request to complete
        if (this.pendingRequest) {
            try {
                await this.pendingRequest;
            }
            catch {
                // Ignore errors during shutdown
            }
        }
    }
    /**
     * Force flush any pending records
     */
    async forceFlush() {
        // Wait for any pending request to complete
        if (this.pendingRequest) {
            await this.pendingRequest;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3RlbC1odHRwLWV4cG9ydGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2dlci9vdGVsLWh0dHAtZXhwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQWdCLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFckUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQWdDLFdBQVcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN2RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZDLDZCQUE2QjtBQUM3QixJQUFJLGdCQUFxQixDQUFDO0FBQzFCLElBQUksQ0FBQztJQUNELE1BQU0sVUFBVSxHQUFHLE1BQU0sTUFBTSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7SUFDeEUsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDO0FBQ25ELENBQUM7QUFBQyxNQUFNLENBQUM7SUFDTCw0QkFBNEI7QUFDaEMsQ0FBQztBQUlELE1BQU0sRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLEdBQUcsV0FBVyxDQUFDO0FBQ3JELE1BQU0sUUFBUSxHQUFxQjtJQUMvQixNQUFNLEVBQUUsTUFBTTtJQUNkLE9BQU8sRUFBRSxLQUFLLEVBQUUsNEJBQTRCO0NBQy9DLENBQUM7QUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFDSCxNQUFNLE9BQU8scUJBQXFCO0lBQzlCLEtBQUssQ0FBTztJQUNILEdBQUcsQ0FBUztJQUNaLFFBQVEsQ0FBbUI7SUFDNUIsTUFBTSxDQUFjO0lBQ3BCLGNBQWMsQ0FBcUI7SUFFM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNSLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxZQUFZLEdBQVcsRUFBRSxPQUF5QixFQUFFO1FBQ2hELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFD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