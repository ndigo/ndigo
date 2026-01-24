/**
 * @author Jeff Rose
 */
import { ServiceInit, ResponseAwareServiceInterceptor } from './service';
export type AppResetInit = ServiceInit & {
    appResetHeader?: string;
    appResetCode?: number;
};
/**
 * @class module:http.AppResetInterceptor
 * @implements module:http.ResultAwareServiceInterceptor
 */
export declare class AppResetInterceptor implements ResponseAwareServiceInterceptor<AppResetInit> {
    postSuccess(response: Response, settings: AppResetInit): Promise<void>;
}
export default AppResetInterceptor;
//# sourceMappingURL=app-reset-interceptor.d.ts.map