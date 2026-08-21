/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver } from '@blue/dispatcher';
import { BrowserCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { BrowserBindMethodArgumentResolver } from './bind-argument-resolver';
import { BrowserModelValueMethodArgumentResolver } from './model-argument-resolver';
import { BrowserStateValueMethodArgumentResolver } from './state-argument-resolver';
import { BrowserSessionValueMethodArgumentResolver } from './session-argument-resolver';

/**
 * Registers browser-specific argument resolvers into the application context.
 */
export function configureBrowserArgumentResolvers(
    applicationContext: ApplicationContext,
    _options?: any
): HandlerMethodArgumentResolver[] {
    const resolvers: HandlerMethodArgumentResolver[] = [
        new BrowserBindMethodArgumentResolver(),
        new BrowserCookieValueMethodArgumentResolver(),
        new BrowserModelValueMethodArgumentResolver(),
        new BrowserStateValueMethodArgumentResolver(),
        new BrowserSessionValueMethodArgumentResolver(),
    ];

    applicationContext.setValue('argumentResolvers', resolvers);

    return resolvers;
}
