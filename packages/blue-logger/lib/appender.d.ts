/**
 * @author Jeff Rose
 */
import { Entry } from './entry';
import { BatchLayout, Layout } from './layouts';
import { Null } from '@blue/core';
import { ErrorHandler } from './error-handler';
export interface Appender {
    errorHandler: ErrorHandler;
    layout: Layout;
    append(entry: Entry): void;
}
export interface AsyncAppender extends Appender {
    append(entry: Entry): Promise<void>;
}
export interface AppenderRegistry<T extends Appender> {
    appenders: T[];
    addAppender(appender: T): void;
    clearAppenders(): void;
    removeAppender(appender: T): void;
}
export interface BatchAppender extends Appender {
    batchSize: number;
    layout: BatchLayout;
}
export interface AsyncBatchAppender extends AsyncAppender {
    batchSize: number;
    layout: BatchLayout;
}
export declare abstract class AbstractAppender extends Null implements Appender {
    errorHandler: ErrorHandler;
    layout: Layout;
    constructor();
    abstract append(entry: Entry): void;
}
export declare abstract class AbstractBatchAppender extends AbstractAppender implements BatchAppender {
    readonly entries: Entry[];
    batchSize: number;
    layout: BatchLayout;
    constructor();
    append(entry: Entry): void;
    abstract appendBatch(entries: Entry[]): void;
}
/**
 * @interface module:logger.Appender
 */
/**
 * @member {module:logger.ErrorHandler} module:logger.Appender#errorHandler
 */
/**
 * @member {module:logger.Layout} module:logger.Appender#layout
 */
/**
 * @function module:logger.Appender#append
 * @param {module:logger.Entry} entry
 */
/**
 * @interface module:logger.AsyncAppender
 * @extends module:logger.Appender
 */
/**
 * @function module:logger.AsyncAppender#append
 * @param {module:logger.Entry} entry
 * @returns {external:Promise}
 */
/**
 * @interface module:logger.BatchAppender
 * @extends module:logger.Appender
 */
/**
 * @member {external:number} module:logger.BatchAppender#batchSize
 */
/**
 * @member {module:logger.BatchLayout} module:logger.BatchAppender#layout
 */
/**
 * @abstract
 * @class module:logger.AbstractAppender
 * @implements module:logger.Appender
 * @param {external:string} name
 */
/**
 * @abstract
 * @function module:logger.AbstractAppender#append
 * @param {module:logger.Entry} entry
 */
/**
 * @abstract
 * @class module:logger.AbstractBatchAppender
 * @extends module:logger.AbstractAppender
 * @implements module:logger.BatchAppender
 */
//# sourceMappingURL=appender.d.ts.map