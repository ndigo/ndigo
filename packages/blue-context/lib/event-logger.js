/**
 * @author Jeff Rose
 */
import { newEntry, AsLevelComparator, Level } from '@blue/logger';
import { AsEventEmitter } from './event-emitter';
import { Null } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { is } from '@blue/util';
const isLevel = is(Level);
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
    name;
    #threshold;
    get threshold() {
        return this.#threshold;
    }
    set threshold(newThreshold) {
        if (isLevel(newThreshold)) {
            // emit comes from AsEventEmitter mixin
            this.emit('change', this.#threshold, newThreshold);
            this.#threshold = newThreshold;
        }
    }
    constructor() {
        super();
        this.threshold = Level.ALL;
    }
    log(level, message) {
        // compare comes from AsLevelComparator mixin
        // emit comes from AsEventEmitter mixin
        if (this.compare(this.threshold, level) >= 0) {
            const entry = newEntry(this.name, level, message);
            this.emit(`log:${level.name}`, entry);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V2ZW50LWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBb0IsUUFBUSxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFDckcsT0FBTyxFQUFFLGNBQWMsRUFBZ0IsTUFBTSxpQkFBaUIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVoQyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUE4QixDQUFDO0FBRXZEOzs7Ozs7R0FNRztBQUNILDJFQUEyRTtBQUMzRSxxRkFBcUY7QUFDckYseUZBQXlGO0FBQ3pGLGlHQUFpRztBQUNqRyxNQUFNLE9BQU8sV0FBWSxTQUFRLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRixJQUFJLENBQVM7SUFFYixVQUFVLENBQVE7SUFFbEIsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLFNBQVMsQ0FBQyxZQUFtQjtRQUM3QixJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQ3hCLHVDQUF1QztZQUN0QyxJQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO1FBQ25DLENBQUM7SUFDTCxDQUFDO0lBRUQ7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUMvQixDQUFDO0lBRUQsR0FBRyxDQUFDLEtBQVksRUFBRSxPQUFtQjtRQUNqQyw2Q0FBNkM7UUFDN0MsdUNBQXVDO1FBQ3ZDLElBQUssSUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3BELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNqRCxJQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ25ELENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==