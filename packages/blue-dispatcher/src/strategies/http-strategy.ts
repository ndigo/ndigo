import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import {
    ContentTypeInterceptor,
    DataParameterInterceptor,
    ResponseTypeInterceptor,
    Fetch,
    HTTP,
    HTTPInterceptor,
    IfModifiedInterceptor,
    TimeoutInterceptor,
    HTTPInit,
} from '@blue/http';
import { StrategyInitializer } from './strategy-initializer';

export interface HTTPStrategy {
    httpInterceptors: HTTPInterceptor[];
    httpSettings: HTTPInit;
    initHTTP(context: ApplicationContext): void;
    getHTTP(fetch?: Fetch): HTTP;
}

/**
 */

/**
 */

/**
 */

/**
 * @param {module:context.ApplicationContext} context
 */

/**
 * @param {fetch} [fetch]
 * @returns {module:http.HTTP}
 */

const HTTP_INTERCEPTOR = 'httpInterceptor',
    HTTP_INTERCEPTORS = `${HTTP_INTERCEPTOR}s`,
    HTTP_SETTINGS = 'httpSettings',
    defaultHTTPInterceptors: HTTPInterceptor[] = [
        new ContentTypeInterceptor(),
        new DataParameterInterceptor(),
        new ResponseTypeInterceptor(),
        new IfModifiedInterceptor(),
        new TimeoutInterceptor(5000),
    ],
    defaultHTTPSettings: HTTPInit = {};

export const AsHTTPStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<HTTPStrategy> & T =>
    class extends superclass implements HTTPStrategy {
        readonly httpInterceptorKey: string;
        readonly httpInterceptorCollectionKey: string;
        readonly httpSettingsKey: string;

        httpInterceptors!: HTTPInterceptor[];
        httpSettings!: HTTPInit;

        constructor(...args: any[]) {
            super(...args);
            this.httpInterceptorKey = HTTP_INTERCEPTOR;
            this.httpInterceptorCollectionKey = HTTP_INTERCEPTORS;
            this.httpSettingsKey = HTTP_SETTINGS;
            this.addStrategy(HTTP_INTERCEPTORS);
        }

        initHTTP(context: ApplicationContext): void {
            const { httpInterceptorKey, httpInterceptorCollectionKey, httpSettingsKey } = this;
            this.initCollectionStrategy(
                context,
                httpInterceptorCollectionKey,
                httpInterceptorKey,
                HTTP_INTERCEPTORS,
                defaultHTTPInterceptors
            );
            this.initStrategy(context, httpSettingsKey, HTTP_SETTINGS, defaultHTTPSettings);
        }

        getHTTP(fetch: Fetch = globalThis.fetch): HTTP {
            const { httpInterceptors, httpSettings } = this;
            return new HTTP(httpInterceptors, httpSettings, fetch);
        }
    };
