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
        // TODO(Wave 4): move to @blue/http interceptor layer; location is a browser global
        // eslint-disable-next-line @blue/no-browser-globals-in-isomorphic -- Wave 4: migrate to @blue/http
        response.headers.has(header) &&
            response.status === statusCode &&
            // eslint-disable-next-line @blue/no-browser-globals-in-isomorphic -- Wave 4: migrate to @blue/http
            location?.hostname !== 'localhost' &&
            // eslint-disable-next-line @blue/no-browser-globals-in-isomorphic -- Wave 4: migrate to @blue/http
            location.reload();
    }
}
