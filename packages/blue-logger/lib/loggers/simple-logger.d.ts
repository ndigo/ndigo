/**
 * @author Jeff Rose
 */
import { Appender, AppenderRegistry } from '../appender';
import { Entry } from '../entry';
import { Level } from '../level';
import { AbstractLogger } from '../logger';
export declare class SimpleLogger extends AbstractLogger implements AppenderRegistry<Appender> {
    readonly name: string;
    readonly appenders: Appender[];
    threshold: Level;
    constructor(name: string, appenders?: Appender[]);
    addAppender(appender: Appender): void;
    clearAppenders(): void;
    protected _logEntry(entry: Entry): void;
    removeAppender(appender: Appender): void;
}
//# sourceMappingURL=simple-logger.d.ts.map