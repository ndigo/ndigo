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
 */
/**
 */
/**
 */
/**
 * @param {module:logger.Entry} entry
 */
/**
 * @extends module:logger.Appender
 */
/**
 * @param {module:logger.Entry} entry
 * @returns {Promise}
 */
/**
 * @extends module:logger.Appender
 */
/**
 */
/**
 */
/**
 * @abstract
 * @implements module:logger.Appender
 * @param {string} name
 */
/**
 * @abstract
 * @param {module:logger.Entry} entry
 */
/**
 * @abstract
 * @extends module:logger.AbstractAppender
 * @implements module:logger.BatchAppender
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHBlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFBdUIsVUFBVSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzVELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUE4QmxDLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFbkMsTUFBTSxPQUFnQixnQkFBaUIsU0FBUSxJQUFJO0lBQy9DLFlBQVksQ0FBZTtJQUMzQixNQUFNLENBQVM7SUFFZjtRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0lBQ25DLENBQUM7Q0FHSjtBQUVELE1BQU0sT0FBZ0IscUJBQXNCLFNBQVEsZ0JBQWdCO0lBQ3ZELE9BQU8sQ0FBVTtJQUMxQixTQUFTLENBQVM7SUFHbEI7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzVCLEtBQUssRUFBRSxFQUFFO1lBQ1QsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFZO1FBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFekIsTUFBTSxNQUFNLEdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFM0MsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzNCLE1BQU0sS0FBSyxHQUFZLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXpDLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDMUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDeEMsQ0FBQztZQUVELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUIsQ0FBQztJQUNMLENBQUM7Q0FHSjtBQUVEO0dBQ0c7QUFFSDtHQUNHO0FBRUg7R0FDRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVIO0dBQ0c7QUFFSDtHQUNHO0FBRUg7Ozs7R0FJRztBQUVIOzs7R0FHRztBQUVIOzs7O0dBSUcifQ==