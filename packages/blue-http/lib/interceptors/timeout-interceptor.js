/**
 * @author Jeff Rose
 */
import ResponseError from '../response-error';
import { __, allPass, gt, isNumber } from '@blue/util';
import { REQUEST_TIMEOUT } from '../response-statuses';
const { defineProperty } = Reflect, { isInteger } = Number, greaterThanZero = gt(__, 0), isPositiveNumber = allPass([isNumber, isInteger, greaterThanZero]);
/**
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
         */
        defineProperty(this, 'timeout', {
            get: () => timeout,
            configurable: true,
            enumerable: true,
        });
        this.#timeoutId = null;
    }
    /**
     * @param {URL} url The requested URL.
     * @param {module:http.TimeoutInit} settings The HTTP request settings, including the `timeout` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
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
     * @param {Error} error The error that was thrown
     * @param {Request} request The HTTP request
     * @returns {exteral:Promise<external:Response | external:undefined>}
     */
    async postError(error, request) {
        if (error.name === 'AbortError') {
            this._clearTimeout();
        }
        return new ResponseError(REQUEST_TIMEOUT.createResponse(null), error);
    }
    /**
     * @param {Request} request The HTTP request
     * @param {Response} response The HTTP response
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZW91dC1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcmNlcHRvcnMvdGltZW91dC1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sYUFBYSxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFPdkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBSXZELE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxFQUN0QixlQUFlLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDM0IsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBRXZFOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sa0JBQWtCO0lBTTNCLFVBQVUsQ0FBUztJQUVWLE9BQU8sQ0FBUztJQUV6QixZQUFZLE9BQWU7UUFDdkIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDN0IsTUFBTSxJQUFJLFNBQVMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRDs7V0FFRztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzVCLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPO1lBQ2xCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLEdBQVEsRUFBRSxRQUFxQjtRQUNuQyxNQUFNLFVBQVUsR0FBRyxJQUFJLGVBQWUsRUFBRSxFQUNwQyxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTVDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUNwQyxRQUFRLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUV4RiwrRUFBK0U7UUFDL0UsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3RCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQVksRUFBRSxPQUFnQjtRQUMxQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxPQUFPLElBQUksYUFBYSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVEOzs7T0FHRztJQUNILFlBQVksQ0FBQyxPQUFnQixFQUFFLFFBQWtCO1FBQzdDLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsQ0FBQztJQUNMLENBQUM7SUFFTyxhQUFhO1FBQ2pCLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQztDQUNKIn0=