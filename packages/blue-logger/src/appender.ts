/**
 * @author Jeff Rose
 */

import { Entry } from './entry';
import { BatchLayout, Layout, NullLayout } from './layouts';
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

const { defineProperty } = Reflect;

export abstract class AbstractAppender extends Null implements Appender {
    errorHandler: ErrorHandler;
    layout: Layout;

    constructor() {
        super();
        this.layout = new NullLayout();
    }

    abstract append(entry: Entry): void;
}

export abstract class AbstractBatchAppender extends AbstractAppender implements BatchAppender {
    readonly entries: Entry[];
    batchSize: number;
    declare layout: BatchLayout;

    constructor() {
        super();
        this.batchSize = 1;
        defineProperty(this, 'entries', {
            value: [],
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }

    append(entry: Entry): void {
        this.entries.push(entry);

        const length: number = this.entries.length;

        if (length >= this.batchSize) {
            const batch: Entry[] = new Array(length);

            for (let index = 0; index < length; index++) {
                batch[index] = this.entries.shift();
            }

            this.appendBatch(batch);
        }
    }

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
