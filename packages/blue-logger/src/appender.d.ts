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
 */
/**
 */
/**
 */
/**
 * @param {module:logger.Entry} entry
 */
/**
 * @extends module:logger.Appender
 */
/**
 * @param {module:logger.Entry} entry
 * @returns {Promise}
 */
/**
 * @extends module:logger.Appender
 */
/**
 */
/**
 */
/**
 * @abstract
 * @implements module:logger.Appender
 * @param {string} name
 */
/**
 * @abstract
 * @param {module:logger.Entry} entry
 */
/**
 * @abstract
 * @extends module:logger.AbstractAppender
 * @implements module:logger.BatchAppender
 */
//# sourceMappingURL=appender.d.ts.map