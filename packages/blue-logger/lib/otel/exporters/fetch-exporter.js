/**
 * @author Jeff Rose
 */
import { ExportResultCode } from '@opentelemetry/core';
import { JSONLayout } from '../../layouts/json-layout';
import { logRecordToEntry } from '../entry-to-logrecord';
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
export class FetchLogRecordExporter {
    url;
    options;
    layout;
    pendingRequest;
    constructor(url, options = {}) {
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
    export(logs, resultCallback) {
        // Convert LogRecords to Entries
        const entries = logs.map((log) => logRecordToEntry(log));
        // Format batch using layout
        const content = this.layout.formatBatch(entries);
        // Build headers
        const headers = new Headers(this.options.headers || {});
        headers.set('Content-Type', this.layout.mediaType.withCharset('utf-8').toString());
        headers.set('Content-Length', String(content.length));
        // Build fetch options
        const fetchOptions = {
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
    fetchWithTimeout(url, options, timeout) {
        return new Promise((resolve, reject) => {
            let timedOut = false;
            let timerId = null;
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
                        reject(new Error(`HTTP request failed with status ${response.status}: ${response.statusText}`));
                    }
                    else {
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
    /**
     * Get the layout being used
     */
    getLayout() {
        return this.layout;
    }
    /**
     * Set a new layout
     */
    setLayout(layout) {
        this.layout = layout;
    }
    /**
     * Get the target URL
     */
    getUrl() {
        return this.url;
    }
    /**
     * Get the request options
     */
    getOptions() {
        return { ...this.options };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2gtZXhwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3RlbC9leHBvcnRlcnMvZmV0Y2gtZXhwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQWdCLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFckUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBeUJ6RDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0gsTUFBTSxPQUFPLHNCQUFzQjtJQUN0QixHQUFHLENBQVM7SUFDWixPQUFPLENBQXVCO0lBQy9CLE1BQU0sQ0FBYztJQUNwQixjQUFjLENBQXFCO0lBRTNDLFlBQVksR0FBVyxFQUFFLFVBQWdDLEVBQUU7UUFDdkQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHO1lBQ1gsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsS0FBSztZQUNkLEdBQUcsT0FBTztTQUNiLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSSxVQUFVLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBeUIsRUFBRSxjQUE4QztRQUM1RSxnQ0FBZ0M7UUFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUV6RCw0QkFBNEI7UUFDNUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFakQsZ0JBQWdCO1FBQ2hCLE1BQU0sT0FBTyxH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