/**
 * @author Jeff Rose
 */

import { Logger, loggable, newEntry, AsLevelComparator, Level, LevelComparator } from '@blue/logger';
import { AsEventEmitter, EventEmitter } from './event-emitter';
import { Null } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { is } from '@blue/util';

const isLevel = is(Level) as (value) => value is Level;

/**
 * @class module:context.EventLogger
 * @implements module:context.EventEmitter
 * @implements module:logger.Logger
 * @implements module:logger.LevelComparator
 * @extends module:core.Null
 */
// EventLogger extends AsLevelComparator(AsEventEmitter(AsNameAware(Null)))
// which provides EventEmitter, Logger, and LevelComparator functionality via mixins.
// TypeScript 5.7 has stricter checking for mixin implementations, so we don't explicitly
// declare 'implements EventEmitter, Logger, LevelComparator' here - the mixin chain provides it.
export class EventLogger extends AsLevelComparator(AsEventEmitter(AsNameAware(Null))) {
    name: string;

    #threshold: Level;

    get threshold(): Level {
        return this.#threshold;
    }

    set threshold(newThreshold: Level) {
        if (isLevel(newThreshold)) {
            // emit comes from AsEventEmitter mixin
            (this as any).emit('change', this.#threshold, newThreshold);
            this.#threshold = newThreshold;
        }
    }

    constructor() {
        super();
        this.threshold = Level.ALL;
    }

    log(level: Level, message: loggable[]): void {
        // compare comes from AsLevelComparator mixin
        // emit comes from AsEventEmitter mixin
        if ((this as any).compare(this.threshold, level) >= 0) {
            const entry = newEntry(this.name, level, message);
            (this as any).emit(`log:${level.name}`, entry);
        }
    }
}
