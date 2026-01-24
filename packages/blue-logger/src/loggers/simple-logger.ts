/**
 * @author Jeff Rose
 */

import { Appender, AppenderRegistry } from '../appender';
import { Entry } from '../entry';
import { Level } from '../level';
import { AbstractLogger } from '../logger';

const defineProperty = Reflect.defineProperty;

export class SimpleLogger extends AbstractLogger implements AppenderRegistry<Appender> {
    readonly name: string;
    readonly appenders: Appender[];
    threshold: Level;

    constructor(name: string, appenders: Appender[] = []) {
        super();

        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'appenders', {
            value: appenders,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        this.threshold = Level.ALL;
    }

    addAppender(appender: Appender): void {
        this.appenders.push(appender);
    }

    clearAppenders(): void {
        let index = this.appenders.length;
        while (index--) {
            this.appenders.pop();
        }
    }

    protected _logEntry(entry: Entry): void {
        const length = this.appenders.length;
        let index = 0;
        for (; index < length; index++) {
            this.appenders[index].append(entry);
        }
    }

    removeAppender(appender: Appender): void {
        const index = this.appenders.indexOf(appender);
        if (index !== -1) {
            this.appenders.splice(index, 1);
        }
    }
}
