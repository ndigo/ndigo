/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status}
 */

/**
 * Hooks keyed by exact HTTP status code.
 */
export interface ResponseCodeAwareHTTPInterceptor {
    [statusCode: number]: (response: Response, settings: HTTPInit) => Promise<void>;
}

/**
 * Interceptor map keyed by numeric response code.
 */

/**
 * Dispatches response hooks based on the numeric status code.
 */
export class MappedResponseCodeHTTPInterceptor implements ResponseAwareHTTPInterceptor {
    #interceptor: ResponseCodeAwareHTTPInterceptor;

    /**
     * The wrapped interceptor map.
     */
    get interceptor() {
        return this.#interceptor;
    }

    /**
     * Creates a response-code dispatcher.
     *
     * @param interceptor - The interceptor map to wrap.
     */
    constructor(interceptor: ResponseCodeAwareHTTPInterceptor) {
        this.#interceptor = interceptor;
    }

    /**
     * Dispatches the response to a matching status-code hook.
     *
     * @param response - The response to classify.
     * @param settings - The request settings used for the call.
     * @returns A promise that settles after the matching hook completes.
     */
    async postResponse(response: Response, settings: HTTPInit): Promise<Response | void> {
        const { status } = response;
        if (status in this.#interceptor) {
            await this.#interceptor[status](response, settings);
        }
    }
}
