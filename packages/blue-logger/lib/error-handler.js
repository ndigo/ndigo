/**
 * @author Jeff Rose
 */
import { fromError } from '../node_modules/stacktrace-js/stacktrace';
import { map, pipe, join } from '@blue/util';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3ItaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lcnJvci1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFNBQVMsRUFBYyxNQUFNLDBDQUEwQyxDQUFDO0FBR2pGLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQVU3QztHQUNHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLGlCQUFpQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFDNUIsY0FBYyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxDQUM5RSxRQUFRLFlBQVksS0FBSyxRQUFRLElBQUksVUFBVSxJQUFJLFlBQVksT0FBTyxFQUMxRSxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxpQkFBaUIsQ0FBcUMsQ0FBQztBQUV2Rzs7R0FFRztBQUNILE1BQU0sT0FBTyxzQkFBc0I7SUFDdEIsUUFBUSxDQUFXO0lBRTVCLFlBQVksUUFBa0I7UUFDMUIsY0FBYyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDN0IsS0FBSyxFQUFFLFFBQVE7WUFDZixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFZO1FBQzFCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFVLEVBQ25DLFdBQVcsR0FBaUIsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQ2xELE9BQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLE9BQU8sT0FBTyxlQUFlLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztRQUNuRixLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sa0JBQWtCO0lBQzNCLFdBQVcsQ0FBQyxLQUFZO1FBQ3BCLE1BQU0sS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBVSxDQUFDLENBQUM7UUFDakUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0oifQ==