/**
 * @author Jeff Rose
 */
import { like } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtY2xhc3MtaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJjZXB0b3JzL3Jlc3BvbnNlLWNsYXNzLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRXhDLE9BQU8sYUFBYSxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sY0FBYyxNQUFNLG9CQUFvQixDQUFDO0FBaUNoRDtHQUNHO0FBRUg7Ozs7R0FJRztBQUVIO0dBQ0c7QUFFSDs7OztHQUlHO0FBRUg7R0FDRztBQUVIOzs7O0dBSUc7QUFFSDtHQUNHO0FBRUg7Ozs7R0FJRztBQUVIO0dBQ0c7QUFFSDs7OztHQUlHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLENBQUMsRUFBRSx5QkFBeUIsRUFBRSxRQUFRLEVBQUUsQ0FFbEQsQ0FBQztBQUU5Qzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSwrQkFBK0IsR0FBRyxJQUFJLENBQUMsRUFBRSxzQkFBc0IsRUFBRSxRQUFRLEVBQUUsQ0FFL0MsQ0FBQztBQUUxQzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxnQ0FBZ0MsR0FBRyxJQUFJLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsQ0FFN0MsQ0FBQztBQUUzQzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLENBQUMsRUFBRSx1QkFBdUIsRUFBRSxRQUFRLEVBQUUsQ0FFaEQsQ0FBQztBQUU5Qzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLENBQUMsRUFBRSx1QkFBdUIsRUFBRSxRQUFRLEVBQUUsQ0FFaEQsQ0FBQztBQUU5Qzs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sa0NB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