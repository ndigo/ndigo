/**
 * @author Jeff Rose
 */
import { Null } from '@blue/core';
import { Level, LevelComparator } from './level';
import { Entry, loggable } from './entry';
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
declare const AbstractLogger_base: (new (...args: any[]) => LevelComparator) & typeof Null;
export declare abstract class AbstractLogger extends AbstractLogger_base implements Logger {
    readonly name: string;
    threshold: Level;
    get [Symbol.toStringTag](): string;
    constructor(name?: string);
    log(level: Level, message: loggable[]): void;
    protected abstract _logEntry(entry: Entry): void;
}
export declare const likeLogger: (value: any) => value is Logger;
export {};
//# sourceMappingURL=logger.d.ts.map