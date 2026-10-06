/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver, MethodParameterType, registerArgumentResolvers } from '@blue/dispatcher';
import { BrowserCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { BrowserDataBindingMethodArgumentResolver } from './data-binding-argument-resolver';
import { BrowserHistoryStateValueMethodArgumentResolver } from './history-state-argument-resolver';
import { BrowserStorageValueMethodArgumentResolver } from './browser-storage-argument-resolver';

/**
 * Builds the browser argument-resolver list in registration order (first
 * match wins). Single source of truth shared by
 * {@link configureBrowserArgumentResolvers} and the auto-configuration entry,
 * so the two lists can never drift (HG-7).
 */
export function createBrowserArgumentResolvers(): HandlerMethodArgumentResolver[] {
    return [
        new BrowserDataBindingMethodArgumentResolver(),
        new BrowserCookieValueMethodArgumentResolver(),
        new BrowserHistoryStateValueMethodArgumentResolver(),
        new BrowserStorageValueMethodArgumentResolver(
            () => globalThis.sessionStorage,
            MethodParameterType.SESSION_STORAGE,
            'BrowserSessionStorageValueMethodArgumentResolver'
        ),
        new BrowserStorageValueMethodArgumentResolver(
            () => globalThis.localStorage,
            MethodParameterType.LOCAL_STORAGE,
            'BrowserLocalStorageValueMethodArgumentResolver'
        ),
    ];
}

/**
 * Registers browser-specific argument resolvers into the application context.
 */
export function configureBrowserArgumentResolvers(
    applicationContext: ApplicationContext,
    _options?: unknown
): HandlerMethodArgumentResolver[] {
    return registerArgumentResolvers(applicationContext, createBrowserArgumentResolvers());
}
