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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBhY2hlLWxvZ2dpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXBhY2hlLWxvZ2dpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRWhDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRTlFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBS3pELE1BQU0sT0FBTyxXQUFZLFNBQVEsS0FBSztJQUNsQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6QyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6QyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2QyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2QyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6QyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV6Qzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBWTtRQUMxQixPQUFPLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxjQUFjLENBQUMsV0FBVyxDQUFDO0lBQ3pGLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxZQUFZLENB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