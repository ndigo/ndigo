/**
 * @author Jeff Rose
 */

import { AbstractAppender } from '../appender';
import { Entry } from '../entry';
import { Level } from '../level';

const { defineProperty } = Reflect;

export class BrowserConsoleAppender extends AbstractAppender {
    protected readonly levels: string[];
    readonly levelMapping;

    constructor(levelMapping = {}) {
        super();

        defineProperty(this, 'levelMapping', {
            value: levelMapping,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'levels', {
            value: ['debug', 'error', 'info', 'warn'],
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    append(entry: Entry): void {
        this.appendMessage(entry.level, this.layout.format(entry));
    }

    appendMessage(level: Level, message: string): void {
        let mappedLevel = this.levelMapping[level.name];

        if (!mappedLevel) {
            mappedLevel = this.levels.indexOf(level.name) !== -1 ? level.name : 'log';
        }

        switch (mappedLevel) {
            case 'debug':
                console.debug(message);
                break;
            case 'error':
                console.error(message);
                break;
            case 'info':
                console.info(message);
                break;
            case 'warn':
                console.warn(message);
                break;
            default:
                console.log(message);
                break;
        }
    }
}
