/**
 * @author Jeff Rose
 */
import { ExportResultCode } from '@opentelemetry/core';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { PatternLayout } from '../../layouts/pattern-layout';
import { logRecordToEntry } from '../entry-to-logrecord';
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
export class LayoutAwareConsoleExporter {
    layout;
    useColors;
    console;
    constructor(options = {}) {
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
    export(logs, resultCallback) {
        try {
            for (const log of logs) {
                this.exportOne(log);
            }
            resultCallback({ code: ExportResultCode.SUCCESS });
        }
        catch (error) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }
    /**
     * Export a single log record
     */
    exportOne(log) {
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
    getConsoleMethod(severityNumber) {
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
    async shutdown() {
        // Console exporter doesn't need cleanup
    }
    /**
     * Force flush any pending records
     */
    async forceFlush() {
        // Console writes are synchronous, nothing to flush
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
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS1leHBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vdGVsL2V4cG9ydGVycy9jb25zb2xlLWV4cG9ydGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFnQixnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUV6RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUF5QnpEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sT0FBTywwQkFBMEI7SUFDM0IsTUFBTSxDQUFTO0lBQ2YsU0FBUyxDQUFVO0lBQ25CLE9BQU8sQ0FBVTtJQUV6QixZQUFZLFVBQWtDLEVBQUU7UUFDNUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLElBQUksYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQztRQUM3QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDO0lBQzlDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUF5QixFQUFFLGNBQThDO1FBQzVFLElBQUksQ0FBQztZQUNELEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsQ0FBQztZQUVELGNBQWMsQ0FBQyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsY0FBYyxDQUFDO2dCQUNYLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNO2dCQUM3QixLQUFLLEVBQUUsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbkUsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLFNBQVMsQ0FBQyxHQUFzQjtRQUNwQyxtREFBbUQ7UUFDbkQsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFcEMsc0JBQXNCO1FBQ3RCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTVDLDZDQUE2QztRQUM3QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRWhFLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRDs7T0FFRztJQUNLLGdCQUFnQixDQUFDLGNBQThCO1FBQ25ELElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6QyxPQUFPLE9BQU8sQ0FBQztRQUNuQixDQUFDO1FBRUQsSUFBSSxjQUFjLElBQUksY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hDLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxJQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEMsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUVELElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6QyxPQUFPLE9BQU8sQ0FBQztRQUNuQixDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFFBQVE7UUFDVix3Q0FBd0M7SUFDNUMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFVBQVU7UUFDWixtREFBbUQ7SUFDdkQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLENBQUMsTUFBYztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0NBQ0oifQ==