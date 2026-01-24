/**
 * @author Jeff Rose
 */
import { fromError } from '../node_modules/stacktrace-js/stacktrace';
import { map, pipe, join } from '@blue/util';
/**
 * @interface module:logger.ErrorHandler
 */
/**
 * @function module:logger.ErrorHandler#handleError
 * @param {module:Logger.Entry} entry
 */
/**
 * @interface module:logger.AsyncErrorHandler
 * @extends module:logger.ErrorHandler
 */
/**
 * @function module:logger.AsyncErrorHandler#handleError
 * @param {module:Logger.Entry} entry
 * @returns {external:Promise<external:void>}
 */
const { defineProperty } = Reflect, joinOnEmptyString = join(''), serializeFrame = ({ source, fileName, functionName, lineNumber, columnNumber }) => `\tat ${functionName} (${fileName}:${lineNumber}:${columnNumber})\r\n`, serializeFrames = pipe(map(serializeFrame), joinOnEmptyString);
/**
 * @class module:logger.StackTraceErrorHandler
 * @implements module:logger.AsyncErrorHandler
 */
export class StackTraceErrorHandler {
    appender;
    constructor(appender) {
        defineProperty(this, 'appender', {
            value: appender,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    async handleError(entry) {
        const error = entry.message[0], stackframes = await fromError(error), message = `${error.name}: ${error.message}\r\n${serializeFrames(stackframes)}`;
        entry.message = [message];
        this.appender.append(entry);
    }
}
/**
 * @class module:logger.WindowErrorHandler
 * @implements module:logger.ErrorHandler
 */
export class WindowErrorHandler {
    handleError(entry) {
        const event = new ErrorEvent('error', entry.message[0]);
        window.dispatchEvent(event);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3ItaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lcnJvci1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFNBQVMsRUFBYyxNQUFNLDBDQUEwQyxDQUFDO0FBR2pGLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQVU3Qzs7R0FFRztBQUVIOzs7R0FHRztBQUVIOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixpQkFBaUIsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQzVCLGNBQWMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsQ0FDOUUsUUFBUSxZQUFZLEtBQUssUUFBUSxJQUFJLFVBQVUsSUFBSSxZQUFZLE9BQU8sRUFDMUUsZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUUsaUJBQWlCLENBQXFDLENBQUM7QUFFdkc7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLHNCQUFzQjtJQUN0QixRQUFRLENBQVc7SUFFNUIsWUFBWSxRQUFrQjtRQUMxQixjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUM3QixLQUFLLEVBQUUsUUFBUTtZQUNmLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQVk7UUFDMUIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQVUsRUFDbkMsV0FBVyxHQUFpQixNQUFNLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFDbEQsT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsT0FBTyxPQUFPLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQ25GLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0o7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sa0JBQWtCO0lBQzNCLFdBQVcsQ0FBQyxLQUFZO1FBQ3BCLE1BQU0sS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBVSxDQUFDLENBQUM7UUFDakUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0oifQ==