import {
    RouterInterceptorRegistry,
    RouterInterceptor,
    RouterMiddleware,
    MappedRouterInterceptor,
} from './router-interceptor';

export type RouterCallback = (route: string) => void;

export interface Router {
    readonly route: string;
    callback: RouterCallback;
}

export abstract class AbstractRouter implements Router, RouterInterceptorRegistry {
    #interceptors: RouterInterceptor[];

    constructor() {
        this.#interceptors = [];
    }

    route: string;
    callback: RouterCallback;

    addInterceptor(interceptor: RouterInterceptor): void {
        if (this.#interceptors.indexOf(interceptor) === -1) {
            this.#interceptors.push(interceptor);
        }
    }

    use(
        interceptorOrPatterns: RouterInterceptor | RouterMiddleware | string | string[],
        interceptor?: RouterInterceptor | RouterMiddleware,
        excludePatterns: string[] = []
    ): void {
        if (typeof interceptorOrPatterns === 'string' || Array.isArray(interceptorOrPatterns)) {
            const includePatterns = Array.isArray(interceptorOrPatterns)
                ? interceptorOrPatterns
                : [interceptorOrPatterns];

            if (!interceptor) {
                throw new TypeError('interceptor is required for mapped middleware');
            }

            this.addInterceptor(
                new MappedRouterInterceptor(this._toRouterInterceptor(interceptor), includePatterns, excludePatterns)
            );
            return;
        }

        this.addInterceptor(this._toRouterInterceptor(interceptorOrPatterns));
    }

    protected _toRouterInterceptor(interceptor: RouterInterceptor | RouterMiddleware): RouterInterceptor {
        if (typeof interceptor === 'function') {
            return {
                preRoute(route) {
                    const result = interceptor(route);
                    return result === false ? false : true;
                },
            };
        }

        return interceptor;
    }
}

/**
 */
