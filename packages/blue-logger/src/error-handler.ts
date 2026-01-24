/**
 * @author Jeff Rose
 */

import { fromError, StackFrame } from '../node_modules/stacktrace-js/stacktrace';
import { Appender } from './appender';
import { Entry } from './entry';
import { map, pipe, join } from '@blue/util';

export interface ErrorHandler {
    handleError(entry: Entry): void;
}

export interface AsyncErrorHandler extends ErrorHandler {
    handleError(entry: Entry): Promise<void>;
}

/**
 * @interface module:logger.ErrorHandler
 */

/**
 * @function module:logger.ErrorHandler#handleError
 * @param {module:Logger.Entry} entry
 */

/**
 * @interface module:logger.AsyncErrorHandler
 * @extends module:logger.ErrorHandler
 */

/**
 * @function module:logger.AsyncErrorHandler#handleError
 * @param {module:Logger.Entry} entry
 * @returns {external:Promise<external:void>}
 */

const { defineProperty } = Reflect,
    joinOnEmptyString = join(''),
    serializeFrame = ({ source, fileName, functionName, lineNumber, columnNumber }) =>
        `\tat ${functionName} (${fileName}:${lineNumber}:${columnNumber})\r\n`,
    serializeFrames = pipe(map(serializeFrame), joinOnEmptyString) as (frames: StackFrame[]) => string;

/**
 * @class module:logger.StackTraceErrorHandler
 * @implements module:logger.AsyncErrorHandler
 */
export class StackTraceErrorHandler implements AsyncErrorHandler {
    readonly appender: Appender;

    constructor(appender: Appender) {
        defineProperty(this, 'appender', {
            value: appender,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    async handleError(entry: Entry): Promise<void> {
        const error = entry.message[0] as Error,
            stackframes: StackFrame[] = await fromError(error),
            message = `${error.name}: ${error.message}\r\n${serializeFrames(stackframes)}`;
        entry.message = [message];
        this.appender.append(entry);
    }
}

/**
 * @class module:logger.WindowErrorHandler
 * @implements module:logger.ErrorHandler
 */
export class WindowErrorHandler implements ErrorHandler {
    handleError(entry: Entry): void {
        const event = new ErrorEvent('error', entry.message[0] as Error);
        window.dispatchEvent(event);
    }
}
