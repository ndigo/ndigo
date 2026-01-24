/**
 * @author Jeff Rose
 */
import { loggable, Level } from '@blue/logger';
declare const EventLogger_base: any;
/**
 * @class module:context.EventLogger
 * @implements module:context.EventEmitter
 * @implements module:logger.Logger
 * @implements module:logger.LevelComparator
 * @extends module:core.Null
 */
export declare class EventLogger extends EventLogger_base {
    #private;
    name: string;
    get threshold(): Level;
    set threshold(newThreshold: Level);
    constructor();
    log(level: Level, message: loggable[]): void;
}
export {};
//# sourceMappingURL=event-logger.d.ts.map