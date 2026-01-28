/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';
import ResponseError from '../response-error';
import ResponseStatus from '../response-status';
/**
 */
/**
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {Promise<module:core.JSONObject | undefined>}
 */
/**
 */
/**
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {Promise<module:core.JSONObject | undefined>}
 */
/**
 */
/**
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {Promise<module:core.JSONObject | undefined>}
 */
/**
 */
/**
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {Promise<module:core.JSONObject | undefined>}
 */
/**
 */
/**
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {Promise<module:core.JSONObject | undefined>}
 */
/**
 * @typedef {module:http.InformationAwareHTTPInterceptor|module:http.SuccessAwareHTTPInterceptor|module:http.RedirectAwareHTTPInterceptor|module:http.ClientErrorAwareHTTPInterceptor|module:http.ServerErrorAwareHTTPInterceptor} module:http.ResponseClassAwareHTTPInterceptor
 */
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link InformationAwareHTTPInterceptor}.
 */
export const likeInformationAwareHTTPInterceptor = like({ postInformationalResponse: Function });
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link SuccessAwareHTTPInterceptor}.
 */
export const likeSuccessAwareHTTPInterceptor = like({ postSuccessfulResponse: Function });
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link RedirectAwareHTTPInterceptor}.
 */
export const likeRedirectAwareHTTPInterceptor = like({ postRedirectResponse: Function });
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link ClientErrorAwareHTTPInterceptor}.
 */
export const likeClientErrorAwareHTTPInterceptor = like({ postClientErrorResponse: Function });
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link ServerErrorAwareHTTPInterceptor}.
 */
export const likeServerErrorAwareHTTPInterceptor = like({ postServerErrorResponse: Function });
/**
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseClassAwareHTTPInterceptor} interceptor
 */
export class MappedResponseClassHTTPInterceptor {
    #interceptor;
    #hasInformationAwareInterceptor;
    #hasSuccessAwareInterceptor;
    #hasRedirectAwareInterceptor;
    #hasClientErrorAwareInterceptor;
    #hasServerErrorAwareInterceptor;
    /**
     * @readonly
     */
    get interceptor() {
        return this.#interceptor;
    }
    constructor(interceptor) {
        this.#interceptor = interceptor;
        this.#hasInformationAwareInterceptor = likeInformationAwareHTTPInterceptor(interceptor);
        this.#hasSuccessAwareInterceptor = likeSuccessAwareHTTPInterceptor(interceptor);
        this.#hasRedirectAwareInterceptor = likeRedirectAwareHTTPInterceptor(interceptor);
        this.#hasClientErrorAwareInterceptor = likeClientErrorAwareHTTPInterceptor(interceptor);
        this.#hasServerErrorAwareInterceptor = likeServerErrorAwareHTTPInterceptor(interceptor);
    }
    /**
     * @async
     * @param {Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {Promise<external:void>}
     */
    async postResponse(response, settings) {
        if (response.ok && this.#hasSuccessAwareInterceptor) {
            await this.#interceptor.postSuccessfulResponse(response, settings);
        }
        else {
            const status = ResponseStatus.for(response);
            if (status.isInformationClass && this.#hasInformationAwareInterceptor) {
                await this.#interceptor.postInformationalResponse(response, settings);
            }
            else if (status.isRedirectClass && this.#hasRedirectAwareInterceptor) {
                await this.#interceptor.postRedirectResponse(response, settings);
            }
            else if (status.isClientErrorClass && this.#hasClientErrorAwareInterceptor) {
                await this.#interceptor.postClientErrorResponse(response, settings);
            }
            else if (status.isServerErrorClass && this.#hasServerErrorAwareInterceptor) {
                await this.#interceptor.postServerErrorResponse(response, settings);
            }
            else if (response instanceof ResponseError) {
                throw response;
            }
            else {
                throw new ResponseError(response, `Invalid status code: ${status.code}`);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtY2xhc3MtaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJjZXB0b3JzL3Jlc3BvbnNlLWNsYXNzLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVsQyxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLGNBQWMsTUFBTSxvQkFBb0IsQ0FBQztBQWlDaEQ7R0FDRztBQUVIOzs7O0dBSUc7QUFFSDtHQUNHO0FBRUg7Ozs7R0FJRztBQUVIO0dBQ0c7QUFFSDs7OztHQUlHO0FBRUg7R0FDRztBQUVIOzs7O0dBSUc7QUFFSDtHQUNHO0FBRUg7Ozs7R0FJRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUNBQW1DLEdBQUcsSUFBSSxDQUFDLEVBQUUseUJBQXlCLEVBQUUsUUFBUSxFQUFFLENBRWxELENBQUM7QUFFOUM7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxDQUFDLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLENBRS9DLENBQUM7QUFFMUM7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0NBQWdDLEdBQUcsSUFBSSxDQUFDLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLENBRTdDLENBQUM7QUFFM0M7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUNBQW1DLEdBQUcsSUFBSSxDQUFDLEVBQUUsdUJBQXVCLEVBQUUsUUFBUSxFQUFFLENBRWhELENBQUM7QUFFOUM7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUNBQW1DLEdBQUcsSUFBSSxDQUFDLEVBQUUsdUJBQXVCLEVBQUUsUUFBUSxFQUFFLENBRWhELENBQUM7QUFFOUM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGtDQUFr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