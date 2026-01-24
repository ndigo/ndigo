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
    const otelModule = require('@blue/logger/lib/otel/entry-to-logrecord');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3RlbC1odHRwLWV4cG9ydGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2dlci9vdGVsLWh0dHAtZXhwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQWdCLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFckUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQWdDLFdBQVcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN2RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZDLDZCQUE2QjtBQUM3QixJQUFJLGdCQUFxQixDQUFDO0FBQzFCLElBQUksQ0FBQztJQUNELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0lBQ3ZFLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNuRCxDQUFDO0FBQUMsTUFBTSxDQUFDO0lBQ0wsNEJBQTRCO0FBQ2hDLENBQUM7QUFJRCxNQUFNLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxHQUFHLFdBQVcsQ0FBQztBQUNyRCxNQUFNLFFBQVEsR0FBcUI7SUFDL0IsTUFBTSxFQUFFLE1BQU07SUFDZCxPQUFPLEVBQUUsS0FBSyxFQUFFLDRCQUE0QjtDQUMvQyxDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0gsTUFBTSxPQUFPLHFCQUFxQjtJQUM5QixLQUFLLENBQU87SUFDSCxHQUFHLENBQVM7SUFDWixRQUFRLENBQW1CO0lBQzVCLE1BQU0sQ0FBYztJQUNwQixjQUFjLENBQXFCO0lBRTNDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDUixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsWUFBWSxHQUFXLEVBQUUsT0FBeUIsRUFBRTtRQUNoRCxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFHLFFBQVEsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBeUIsRUFBRSxjQUE4QztRQUM1RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsY0FBYyxDQUFDO2dCQUNYLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNO2dCQUM3QixLQUFLLEVBQUUsSUFBSSxLQUFLLENBQUMsa0RBQWtELENBQUM7YUFDdkUsQ0FBQyxDQUFDO1lBQ0gsT0FBTztRQUNYLENBQUM7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUNwQixjQUFjLENBQUM7Z0JBQ1gsSUFBSSxFQUFFLGdCQUFnQixDQUFDLE1BQU07Z0JBQzdCLEtBQUssRUFBRSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQzthQUMzRCxDQUFDLENBQUM7WUFDSCxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksQ0FBQztZQUNELGdDQUFnQztZQUNoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXpELDRCQUE0QjtZQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVqRCxnQkFBZ0I7WUFDaEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUM5QixZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0RSxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFNUMseUJBQXlCO1lBQ3pCLE1BQU0sZUFBZSxHQUFHO2dCQUNwQixHQUFHLElBQUksQ0FBQyxRQUFRO2dCQUNoQixJQUFJLEVBQUUsT0FBTztnQkFDYixPQUFPO2FBQ1YsQ0FBQztZQUVGLG9DQUFvQztZQUNwQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDYixjQUFjLENBQUM7Z0JBQ1gsSUFBSSxFQUFFLGdCQUFnQixDQUFDLE1BQU07Z0JBQzdCLEtBQUssRUFBRSxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNuRSxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ssY0FBYyxDQUNsQixHQUFXLEVBQ1gsUUFBYSxFQUNiLGNBQThDO1FBRTlDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEIsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUVqQyxPQUFPLElBQUksT0FBTyxDQUFXLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzdDLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztZQUNyQixJQUFJLE9BQU8sR0FBeUMsSUFBSSxDQUFDO1lBRXpELElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNkLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUN0QixRQUFRLEdBQUcsSUFBSSxDQUFDO29CQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsT0FBTyxJQUFJLENBQUMsQ0FBQztvQkFDckUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNkLGNBQWMsQ0FBQzt3QkFDWCxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsTUFBTTt3QkFDN0IsS0FBSztxQkFDUixDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hCLENBQUM7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUM7aUJBQ3RCLElBQUksQ0FBQyxDQUFDLFFBQWtCLEVBQUUsRUFBRTtnQkFDekIsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ25CLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDMUIsQ0FBQztnQkFDRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ1osT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNsQixjQUFjLENBQUMsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztZQUNMLENBQUMsQ0FBQztpQkFDRCxLQUFLLENBQUMsQ0FBQyxLQUFZLEVBQUUsRUFBRTtnQkFDcEIsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ25CLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDMUIsQ0FBQztnQkFDRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ1osTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNkLGNBQWMsQ0FBQzt3QkFDWCxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsTUFBTTt3QkFDN0IsS0FBSztxQkFDUixDQUFDLENBQUM7Z0JBQ1AsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxJQUFVO1FBQ2QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPO1FBQ0gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxDQUFDLE1BQW1CO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU07UUFDRixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxXQUFXO1FBQ1AsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxRQUFRO1FBQ1YsMkNBQTJDO1FBQzNDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQztnQkFDRCxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDOUIsQ0FBQztZQUFDLE1BQU0sQ0FBQztnQkFDTCxnQ0FBZ0M7WUFDcEMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsVUFBVTtRQUNaLDJDQUEyQztRQUMzQyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixNQUFNLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDOUIsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9