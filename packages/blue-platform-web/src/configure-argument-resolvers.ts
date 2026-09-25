/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver } from '@blue/dispatcher';
import { BrowserCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { BrowserDataBindingMethodArgumentResolver } from './data-binding-argument-resolver';
import { BrowserHistoryStateValueMethodArgumentResolver } from './history-state-argument-resolver';
import { BrowserLocalStorageValueMethodArgumentResolver } from './local-storage-argument-resolver';
import { BrowserSessionStorageValueMethodArgumentResolver } from './session-storage-argument-resolver';

/**
 * Registers browser-specific argument resolvers into the application context.
 */
export function configureBrowserArgumentResolvers(
    applicationContext: ApplicationContext,
    _options?: unknown
): HandlerMethodArgumentResolver[] {
    const resolvers: HandlerMethodArgumentResolver[] = [
        new BrowserDataBindingMethodArgumentResolver(),
        new BrowserCookieValueMethodArgumentResolver(),
        new BrowserHistoryStateValueMethodArgumentResolver(),
        new BrowserSessionStorageValueMethodArgumentResolver(),
        new BrowserLocalStorageValueMethodArgumentResolver(),
    ];

    applicationContext.setValue('argumentResolvers', resolvers);

    return resolvers;
}
