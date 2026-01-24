/**
 * @author Jeff Rose
 */

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
 * @interface module:dispatcher.HTTPStrategy
 */

/**
 * @member {external:Array<module:http.HTTPInterceptor>} module:dispatcher.HTTPStrategy#httpInterceptors
 */

/**
 * @member {module:http.HTTPInit} module:dispatcher.HTTPStrategy#httpSettings
 */

/**
 * @function module:dispatcher.HTTPStrategy#initHTTP
 * @param {module:context.ApplicationContext} context
 */

/**
 * @function module:dispatcher.HTTPStrategy#getHTTP
 * @param {external:fetch} [fetch]
 * @returns {module:http.HTTP}
 */

const { defineProperty } = Reflect,
    HTTP_INTERCEPTOR = 'httpInterceptor',
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

        httpInterceptors: HTTPInterceptor[];
        httpSettings: HTTPInit;

        constructor(...args: any[]) {
            super(...args);
            defineProperty(this, 'httpInterceptorKey', {
                get: () => HTTP_INTERCEPTOR,
                configurable: true,
                enumerable: true,
            });
            defineProperty(this, 'httpInterceptorCollectionKey', {
                get: () => HTTP_INTERCEPTORS,
                configurable: true,
                enumerable: true,
            });
            defineProperty(this, 'httpSettingsKey', {
                get: () => HTTP_SETTINGS,
                configurable: true,
                enumerable: true,
            });
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
