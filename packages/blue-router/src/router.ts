import { RouterInterceptorRegistry, RouterInterceptor } from './router-interceptor';

export type RouterCallback = (route: string) => void;

export interface Router {
    readonly route: string;
    callback: RouterCallback;
}

export abstract class AbstractRouter implements Router, RouterInterceptorRegistry {
    #interceptors: RouterInterceptor[];

    route: string;
    callback: RouterCallback;

    addInterceptor(interceptor: RouterInterceptor): void {
        if (this.#interceptors.indexOf(interceptor) === -1) {
            this.#interceptors.push(interceptor);
        }
    }
}

/**
 */
