/**
 * @author Jeff Rose
 */
import { NullLayout } from './layouts';
import { Null } from '@blue/core';
const { defineProperty } = Reflect;
export class AbstractAppender extends Null {
    errorHandler;
    layout;
    constructor() {
        super();
        this.layout = new NullLayout();
    }
}
export class AbstractBatchAppender extends AbstractAppender {
    entries;
    batchSize;
    constructor() {
        super();
        this.batchSize = 1;
        defineProperty(this, 'entries', {
            value: [],
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }
    append(entry) {
        this.entries.push(entry);
        const length = this.entries.length;
        if (length >= this.batchSize) {
            const batch = new Array(length);
            for (let index = 0; index < length; index++) {
                batch[index] = this.entries.shift();
            }
            this.appendBatch(batch);
        }
    }
}
/**
 * @interface module:logger.Appender
 */
/**
 * @member {module:logger.ErrorHandler} module:logger.Appender#errorHandler
 */
/**
 * @member {module:logger.Layout} module:logger.Appender#layout
 */
/**
 * @function module:logger.Appender#append
 * @param {module:logger.Entry} entry
 */
/**
 * @interface module:logger.AsyncAppender
 * @extends module:logger.Appender
 */
/**
 * @function module:logger.AsyncAppender#append
 * @param {module:logger.Entry} entry
 * @returns {external:Promise}
 */
/**
 * @interface module:logger.BatchAppender
 * @extends module:logger.Appender
 */
/**
 * @member {external:number} module:logger.BatchAppender#batchSize
 */
/**
 * @member {module:logger.BatchLayout} module:logger.BatchAppender#layout
 */
/**
 * @abstract
 * @class module:logger.AbstractAppender
 * @implements module:logger.Appender
 * @param {external:string} name
 */
/**
 * @abstract
 * @function module:logger.AbstractAppender#append
 * @param {module:logger.Entry} entry
 */
/**
 * @abstract
 * @class module:logger.AbstractBatchAppender
 * @extends module:logger.AbstractAppender
 * @implements module:logger.BatchAppender
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXBwZW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQXVCLFVBQVUsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUM1RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBOEJsQyxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBRW5DLE1BQU0sT0FBZ0IsZ0JBQWlCLFNBQVEsSUFBSTtJQUMvQyxZQUFZLENBQWU7SUFDM0IsTUFBTSxDQUFTO0lBRWY7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0NBR0o7QUFFRCxNQUFNLE9BQWdCLHFCQUFzQixTQUFRLGdCQUFnQjtJQUN2RCxPQUFPLENBQVU7SUFDMUIsU0FBUyxDQUFTO0lBR2xCO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUM1QixLQUFLLEVBQUUsRUFBRTtZQUNULFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBWTtRQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXpCLE1BQU0sTUFBTSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRTNDLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMzQixNQUFNLEtBQUssR0FBWSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUV6QyxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7Z0JBQzFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3hDLENBQUM7WUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLENBQUM7SUFDTCxDQUFDO0NBR0o7QUFFRDs7R0FFRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7OztHQUlHO0FBRUg7OztHQUdHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7R0FJRztBQUVIOzs7OztHQUtHIn0=