/**
 * @author Jeff Rose
 */
import ResponseError from '../response-error';
import { __ } from '@blue/util/function';
import { allPass } from '@blue/util/logic';
import { gt } from '@blue/util/relation';
import { isNumber } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZW91dC1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcmNlcHRvcnMvdGltZW91dC1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sYUFBYSxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN6QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDM0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQU81QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFJdkQsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLEVBQ3RCLGVBQWUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUMzQixnQkFBZ0IsR0FBRyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFFdkU7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxrQkFBa0I7SUFNM0IsVUFBVSxDQUFTO0lBRVYsT0FBTyxDQUFTO0lBRXpCLFlBQVksT0FBZTtRQUN2QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM3QixNQUFNLElBQUksU0FBUyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVEOztXQUVHO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDNUIsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU87WUFDbEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsR0FBUSxFQUFFLFFBQXFCO1FBQ25DLE1BQU0sVUFBVSxHQUFHLElBQUksZUFBZSxFQUFFLEVBQ3BDLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFNUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1FBQ3BDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXhGLCtFQUErRTtRQUMvRSxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBWSxFQUFFLE9BQWdCO1FBQzFDLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxZQUFZLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUNELE9BQU8sSUFBSSxhQUFhLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsWUFBWSxDQUFDLE9BQWdCLEVBQUUsUUFBa0I7UUFDN0MsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixDQUFDO0lBQ0wsQ0FBQztJQUVPLGFBQWE7UUFDakIsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUMzQixDQUFDO0NBQ0oifQ==