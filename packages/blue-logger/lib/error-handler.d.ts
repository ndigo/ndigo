/**
 * @author Jeff Rose
 */
import { Appender } from './appender';
import { Entry } from './entry';
export interface ErrorHandler {
    handleError(entry: Entry): void;
}
export interface AsyncErrorHandler extends ErrorHandler {
    handleError(entry: Entry): Promise<void>;
}
/**
 * @class module:logger.StackTraceErrorHandler
 * @implements module:logger.AsyncErrorHandler
 */
export declare class StackTraceErrorHandler implements AsyncErrorHandler {
    readonly appender: Appender;
    constructor(appender: Appender);
    handleError(entry: Entry): Promise<void>;
}
/**
 * @class module:logger.WindowErrorHandler
 * @implements module:logger.ErrorHandler
 */
export declare class WindowErrorHandler implements ErrorHandler {
    handleError(entry: Entry): void;
}
//# sourceMappingURL=error-handler.d.ts.map