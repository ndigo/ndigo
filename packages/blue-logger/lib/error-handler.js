/**
 * @author Jeff Rose
 */
import { fromError } from '../node_modules/stacktrace-js/stacktrace';
import { pipe } from '@blue/util/function';
import { join, map } from '@blue/util/list';
/**
 */
/**
 * @param {module:Logger.Entry} entry
 */
/**
 * @extends module:logger.ErrorHandler
 */
/**
 * @param {module:Logger.Entry} entry
 * @returns {Promise<external:void>}
 */
const { defineProperty } = Reflect, joinOnEmptyString = join(''), serializeFrame = ({ source, fileName, functionName, lineNumber, columnNumber }) => `\tat ${functionName} (${fileName}:${lineNumber}:${columnNumber})\r\n`, serializeFrames = pipe(map(serializeFrame), joinOnEmptyString);
/**
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
 * @implements module:logger.ErrorHandler
 */
export class WindowErrorHandler {
    handleError(entry) {
        const event = new ErrorEvent('error', entry.message[0]);
        window.dispatchEvent(event);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3ItaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lcnJvci1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFNBQVMsRUFBYyxNQUFNLDBDQUEwQyxDQUFDO0FBR2pGLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBVTVDO0dBQ0c7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUM1QixjQUFjLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLENBQzlFLFFBQVEsWUFBWSxLQUFLLFFBQVEsSUFBSSxVQUFVLElBQUksWUFBWSxPQUFPLEVBQzFFLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLGlCQUFpQixDQUFxQyxDQUFDO0FBRXZHOztHQUVHO0FBQ0gsTUFBTSxPQUFPLHNCQUFzQjtJQUN0QixRQUFRLENBQVc7SUFFNUIsWUFBWSxRQUFrQjtRQUMxQixjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUM3QixLQUFLLEVBQUUsUUFBUTtZQUNmLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQVk7UUFDMUIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQVUsRUFDbkMsV0FBVyxHQUFpQixNQUFNLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFDbEQsT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsT0FBTyxPQUFPLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQ25GLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTyxrQkFBa0I7SUFDM0IsV0FBVyxDQUFDLEtBQVk7UUFDcEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFVLENBQUMsQ0FBQztRQUNqRSxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLENBQUM7Q0FDSiJ9