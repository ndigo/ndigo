/**
 * @author Jeff Rose
 */

import { ServiceInit, ResponseAwareServiceInterceptor } from './service';

export type AppResetInit = ServiceInit & { appResetHeader?: string; appResetCode?: number };

const defaults: AppResetInit = {
    appResetHeader: 'Alt-Location',
    appResetCode: 205,
};

/**
 * @implements module:http.ResultAwareServiceInterceptor
 */
export class AppResetInterceptor implements ResponseAwareServiceInterceptor<AppResetInit> {
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
