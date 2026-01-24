/**
 * @author Jeff Rose
 */
import ResponseError from '../response-error';
import { __, allPass, gt, isNumber } from '@blue/util';
import { REQUEST_TIMEOUT } from '../response-statuses';
const { defineProperty } = Reflect, { isInteger } = Number, greaterThanZero = gt(__, 0), isPositiveNumber = allPass([isNumber, isInteger, greaterThanZero]);
/**
 * @class module:http.TimeoutInterceptor
 * @implements module:http.CompletionAwareHTTPInterceptor
 * @implements module:http.ErrorAwareHTTPInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export class TimeoutInterceptor {
    #timeoutId;
    timeout;
    constructor(timeout) {
        if (!isPositiveNumber(timeout)) {
            throw new TypeError(`timeout must be a positive integer`);
        }
        /**
         * @readonly
         * @member {external:number} module:http.TimeoutInterceptor#timeout
         */
        defineProperty(this, 'timeout', {
            get: () => timeout,
            configurable: true,
            enumerable: true,
        });
        this.#timeoutId = null;
    }
    /**
     * @function module:http.TimeoutInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.TimeoutInit} settings The HTTP request settings, including the `timeout` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url, settings) {
        const controller = new AbortController(), fetchTimeout = () => controller.abort();
        settings.signal = controller.signal;
        settings.timeout = isPositiveNumber(settings.timeout) ? settings.timeout : this.timeout;
        // @ts-ignore: TypeScript is confusing Web setTimeout with Node setTimeout -JBR
        this.#timeoutId = setTimeout(fetchTimeout, settings.timeout);
        return true;
    }
    /**
     * @async
     * @function module:http.TimeoutInterceptor#postError
     * @param {external:Error} error The error that was thrown
     * @param {external:Request} request The HTTP request
     * @returns {exteral:Promise<external:Response | external:undefined>}
     */
    async postError(error, request) {
        if (error.name === 'AbortError') {
            this._clearTimeout();
        }
        return new ResponseError(REQUEST_TIMEOUT.createResponse(null), error);
    }
    /**
     * @function module:http.TimeoutInterceptor#postComplete
     * @param {external:Request} request The HTTP request
     * @param {external:Response} response The HTTP response
     */
    postComplete(request, response) {
        if (this.#timeoutId !== null) {
            this._clearTimeout();
        }
    }
    _clearTimeout() {
        clearTimeout(this.#timeoutId);
        this.#timeoutId = null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZW91dC1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcmNlcHRvcnMvdGltZW91dC1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sYUFBYSxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFPdkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBSXZELE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxFQUN0QixlQUFlLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDM0IsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBRXZFOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLGtCQUFrQjtJQU0zQixVQUFVLENBQVM7SUFFVixPQUFPLENBQVM7SUFFekIsWUFBWSxPQUFlO1FBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzdCLE1BQU0sSUFBSSxTQUFTLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDNUIsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU87WUFDbEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsT0FBTyxDQUFDLEdBQVEsRUFBRSxRQUFxQjtRQUNuQyxNQUFNLFVBQVUsR0FBRyxJQUFJLGVBQWUsRUFBRSxFQUNwQyxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTVDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUNwQyxRQUFRLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUV4RiwrRUFBK0U7UUFDL0UsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3RCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFZLEVBQUUsT0FBZ0I7UUFDMUMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBQ0QsT0FBTyxJQUFJLGFBQWEsQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWSxDQUFDLE9BQWdCLEVBQUUsUUFBa0I7UUFDN0MsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixDQUFDO0lBQ0wsQ0FBQztJQUVPLGFBQWE7UUFDakIsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUMzQixDQUFDO0NBQ0oifQ==