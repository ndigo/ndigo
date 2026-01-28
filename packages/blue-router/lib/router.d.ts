import { RouterInterceptorRegistry, RouterInterceptor } from './router-interceptor';
export type RouterCallback = (route: string) => void;
export interface Router {
    readonly route: string;
    callback: RouterCallback;
}
export declare abstract class AbstractRouter implements Router, RouterInterceptorRegistry {
    #private;
    route: string;
    callback: RouterCallback;
    addInterceptor(interceptor: RouterInterceptor): void;
}
/**
 */
//# sourceMappingURL=router.d.ts.map