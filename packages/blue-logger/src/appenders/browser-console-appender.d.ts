/**
 * @author Jeff Rose
 */
import { AbstractAppender } from '../appender';
import { Entry } from '../entry';
import { Level } from '../level';
export declare class BrowserConsoleAppender extends AbstractAppender {
    protected readonly levels: string[];
    readonly levelMapping: any;
    constructor(levelMapping?: {});
    append(entry: Entry): void;
    appendMessage(level: Level, message: string): void;
}
//# sourceMappingURL=browser-console-appender.d.ts.map