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
