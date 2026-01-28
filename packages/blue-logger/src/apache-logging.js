/**
 * @author Jeff Rose
 */
import { Level } from './level';
import { BrowserConsoleAppender } from './appenders/browser-console-appender';
import { like } from '@blue/util';
import { SeverityNumber } from '@opentelemetry/api-logs';
export class ApacheLevel extends Level {
    static FATAL = new Level('fatal', 10000);
    static ERROR = new Level('error', 20000);
    static WARN = new Level('warn', 30000);
    static INFO = new Level('info', 40000);
    static DEBUG = new Level('debug', 50000);
    static TRACE = new Level('trace', 60000);
    /**
     * Convert an Apache level to OpenTelemetry SeverityNumber
     *
     * @param level - The Apache level to convert
     * @returns The corresponding OpenTelemetry SeverityNumber
     */
    static toSeverity(level) {
        return ApacheLevelToSeverity[level.name.toLowerCase()] || SeverityNumber.UNSPECIFIED;
    }
    /**
     * Convert an OpenTelemetry SeverityNumber to an Apache level
     *
     * @param severityNumber - The severity number to convert
     * @returns The corresponding Apache level
     */
    static fromSeverity(severityNumber) {
        if (severityNumber >= SeverityNumber.FATAL) {
            return ApacheLevel.FATAL;
        }
        if (severityNumber >= SeverityNumber.ERROR) {
            return ApacheLevel.ERROR;
        }
        if (severityNumber >= SeverityNumber.WARN) {
            return ApacheLevel.WARN;
        }
        if (severityNumber >= SeverityNumber.INFO) {
            return ApacheLevel.INFO;
        }
        if (severityNumber >= SeverityNumber.DEBUG) {
            return ApacheLevel.DEBUG;
        }
        if (severityNumber >= SeverityNumber.TRACE) {
            return ApacheLevel.TRACE;
        }
        return Level.OFF;
    }
}
/**
 * Apache level to OpenTelemetry severity mapping table
 */
export const ApacheLevelToSeverity = {
    fatal: SeverityNumber.FATAL,
    error: SeverityNumber.ERROR,
    warn: SeverityNumber.WARN,
    info: SeverityNumber.INFO,
    debug: SeverityNumber.DEBUG,
    trace: SeverityNumber.TRACE,
    off: SeverityNumber.UNSPECIFIED,
    all: SeverityNumber.UNSPECIFIED,
};
export const ApacheColor = {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'cyan',
    trace: 'grey',
};
export const ApacheBrowserConsoleLevelMapping = {
    fatal: 'error',
    error: 'error',
    warn: 'warn',
    info: 'info',
    debug: 'debug',
    trace: 'debug',
};
export class ApacheBrowserConsoleAppender extends BrowserConsoleAppender {
    constructor() {
        super(ApacheBrowserConsoleLevelMapping);
    }
}
export const likeApacheLogger = like({
    fatal: Function,
    error: Function,
    warn: Function,
    info: Function,
    debug: Function,
    trace: Function,
});
export const AsApacheLogger = (superclass) => class extends superclass {
    threshold = Level.ALL;
    fatal(...message) {
        this.log(ApacheLevel.FATAL, message);
    }
    error(...message) {
        this.log(ApacheLevel.ERROR, message);
    }
    warn(...message) {
        this.log(ApacheLevel.WARN, message);
    }
    info(...message) {
        this.log(ApacheLevel.INFO, message);
    }
    debug(...message) {
        this.log(ApacheLevel.DEBUG, message);
    }
    trace(...message) {
        this.log(ApacheLevel.TRACE, message);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBhY2hlLWxvZ2dpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcGFjaGUtbG9nZ2luZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFaEMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFOUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNsQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFLekQsTUFBTSxPQUFPLFdBQVksU0FBUSxLQUFLO0lBQ2xDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRXpDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFZO1FBQzFCLE9BQU8scUJBQXFCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxXQUFXLENBQUM7SUFDekYsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyxjQUE4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