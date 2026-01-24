/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';
import ResponseError from '../response-error';
import ResponseStatus from '../response-status';
/**
 * @interface module:http.InformationAwareHTTPInterceptor
 */
/**
 * @function module:http.InformationAwareHTTPInterceptor#postInformationalResponse
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {external:Promise<module:core.JSONObject | undefined>}
 */
/**
 * @interface module:http.SuccessAwareHTTPInterceptor
 */
/**
 * @function module:http.SuccessAwareHTTPInterceptor#postSuccessfulResponse
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {external:Promise<module:core.JSONObject | undefined>}
 */
/**
 * @interface module:http.RedirectAwareHTTPInterceptor
 */
/**
 * @function module:http.RedirectAwareHTTPInterceptor#postRedirectResponse
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {external:Promise<module:core.JSONObject | undefined>}
 */
/**
 * @interface module:http.ClientErrorAwareHTTPInterceptor
 */
/**
 * @function module:http.ClientErrorAwareHTTPInterceptor#postClientErrorResponse
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {external:Promise<module:core.JSONObject | undefined>}
 */
/**
 * @interface module:http.ServerErrorAwareHTTPInterceptor
 */
/**
 * @function module:http.ServerErrorAwareHTTPInterceptor#postServerErrorResponse
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {external:Promise<module:core.JSONObject | undefined>}
 */
/**
 * @typedef {module:http.InformationAwareHTTPInterceptor|module:http.SuccessAwareHTTPInterceptor|module:http.RedirectAwareHTTPInterceptor|module:http.ClientErrorAwareHTTPInterceptor|module:http.ServerErrorAwareHTTPInterceptor} module:http.ResponseClassAwareHTTPInterceptor
 */
/**
 * @function module:http.likeInformationAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.InformationAwareHTTPInterceptor}.
 */
export const likeInformationAwareHTTPInterceptor = like({ postInformationalResponse: Function });
/**
 * @function module:http.likeSuccessAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.SuccessAwareHTTPInterceptor}.
 */
export const likeSuccessAwareHTTPInterceptor = like({ postSuccessfulResponse: Function });
/**
 * @function module:http.likeRedirectAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.RedirectAwareHTTPInterceptor}.
 */
export const likeRedirectAwareHTTPInterceptor = like({ postRedirectResponse: Function });
/**
 * @function module:http.likeClientErrorAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.ClientErrorAwareHTTPInterceptor}.
 */
export const likeClientErrorAwareHTTPInterceptor = like({ postClientErrorResponse: Function });
/**
 * @function module:http.likeServerErrorAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.ServerErrorAwareHTTPInterceptor}.
 */
export const likeServerErrorAwareHTTPInterceptor = like({ postServerErrorResponse: Function });
/**
 * @class module:http.MappedResponseClassHTTPInterceptor
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
     * @member {module:http.ResponseClassAwareHTTPInterceptor} module:http.MappedResponseClassHTTPInterceptor#interceptor
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
     * @function module:http.MappedResponseClassHTTPInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {external:Promise<external:void>}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtY2xhc3MtaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJjZXB0b3JzL3Jlc3BvbnNlLWNsYXNzLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVsQyxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLGNBQWMsTUFBTSxvQkFBb0IsQ0FBQztBQWlDaEQ7O0dBRUc7QUFFSDs7Ozs7R0FLRztBQUVIOztHQUVHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7R0FFRztBQUVIOzs7OztHQUtHO0FBRUg7O0dBRUc7QUFFSDs7Ozs7R0FLRztBQUVIOztHQUVHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLENBQUMsRUFBRSx5QkFBeUIsRUFBRSxRQUFRLEVBQUUsQ0FFbEQsQ0FBQztBQUU5Qzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxDQUFDLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLENBRS9DLENBQUM7QUFFMUM7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUFHLElBQUksQ0FBQyxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxDQUU3QyxDQUFDO0FBRTNDOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLENBQUMsRUFBRSx1QkFBdUIsRUFBRSxRQUFRLEVBQUUsQ0FFaEQsQ0FBQztBQUU5Qzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUNBQW1DLEdBQUcsSUFBSSxDQUFDLEVBQUUsdUJBQXVCLEVBQUUsUUFBUSxFQUFFLENBRWhELENBQUM7QUFFOUM7Ozs7R0FJRztBQUNI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