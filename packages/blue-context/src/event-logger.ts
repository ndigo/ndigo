/**
 * @author Jeff Rose
 */

import { Logger, loggable, newEntry, AsLevelComparator, Level, LevelComparator } from '@blue/logger';
import { AsEventEmitter, EventEmitter } from './event-emitter';
import { Null } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { is } from '@blue/util';

const isLevel = is( Level ) as ( value ) => value is Level;

/**
 * @class module:context.EventLogger
 * @implements module:context.EventEmitter
 * @implements module:logger.Logger
 * @implements module:logger.LevelComparator
 * @extends module:core.Null
 */
export class EventLogger extends AsLevelComparator( AsEventEmitter( AsNameAware( Null ) ) ) implements EventEmitter, Logger, LevelComparator {
    name: string;

    #threshold: Level;

    get threshold(): Level {
        return this.#threshold;
    }

    set threshold( newThreshold: Level ){
        if( isLevel( newThreshold ) ){
            this.emtest( 'change', this.#threshold, newThreshold );
            this.#threshold = newThreshold;
        }
    }

    constructor(){
        super();
        this.threshold = Level.ALL;
    }

    log( level: Level, message: loggable[] ): void {
        if( this.compare( this.threshold, level ) >= 0 ){
            const entry = newEntry( this.name, level, message );
            this.emit( `log:${ level.name }`, entry );
        }
    }

}
