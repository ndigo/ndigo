/**
 * @author Jeff Rose
 */

import { Null, likeComparator } from '@blue/core';
import { AsLevelComparator, Level, LevelComparator } from './level';
import { Entry, loggable, newEntry } from './entry';
import { allPass, like } from '@blue/util';

export interface Asserter {
    assert(value: any, message?: string, ...optionalParams: any[]): void;
}

export interface Counter {
    count(countTitle?: string): void;
}

export interface Timer {
    time(timerName?: string): void;
    timeEnd(timerName?: string): void;
}

export interface Logger extends LevelComparator {
    threshold: Level;
    log(level: Level, message: loggable[]): void;
}

const { defineProperty } = Reflect;

export abstract class AbstractLogger extends AsLevelComparator(Null) implements Logger {
    readonly name: string;
    threshold: Level;

    get [Symbol.toStringTag](): string {
        return 'Logger';
    }

    constructor(name: string = null) {
        super();
        defineProperty(this, 'name', {
            value: name,
            configurable: false,
            enumerable: true,
            writable: true,
        });
        this.threshold = Level.ALL;
    }

    log(level: Level, message: loggable[]): void {
        if ((this as any).compare(this.threshold, level) >= 0) {
            const entry: Entry = newEntry(this.name, level, message);

            this._logEntry(entry);
        }
    }

    protected abstract _logEntry(entry: Entry): void;
}

export const likeLogger = allPass([likeComparator, like({ threshold: Level, log: Function }) as any]) as (
    value
) => value is Logger;
