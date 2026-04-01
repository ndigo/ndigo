/**
 * @author Jeff Rose
 */

import { ServiceInit, ResponseAwareServiceInterceptor } from './service';

/**
 * Extends service initialization with app-reset response handling options.
 */
export type AppResetInit = ServiceInit & { appResetHeader?: string; appResetCode?: number };

const defaults: AppResetInit = {
    appResetHeader: 'Alt-Location',
    appResetCode: 205,
};

/**
 * @implements module:http.ResultAwareServiceInterceptor
 */
export class AppResetInterceptor implements ResponseAwareServiceInterceptor<AppResetInit> {
    /**
     * Reloads the current page when a matching reset response is received.
     *
     * @param response - Response returned by the service call.
     * @param settings - Interceptor settings used to match the reset signal.
     * @returns A promise that resolves once post-processing completes.
     */
    async postSuccess(response: Response, settings: AppResetInit): Promise<void> {
        settings = Object.assign({}, defaults, settings);
        const header = settings.appResetHeader,
            statusCode = settings.appResetCode;
        response.headers.has(header) &&
            response.status === statusCode &&
            location?.hostname !== 'localhost' &&
            location.reload();
    }
}
