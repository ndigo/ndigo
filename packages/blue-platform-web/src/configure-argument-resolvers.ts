/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver } from '@blue/dispatcher';
import {
    ArgumentValueConverter,
    ArgumentValueConverterRegistry,
    ResolverConverterOption,
    argumentValueConverters,
    identityArgumentValueConverter,
    resolveConverter,
} from './argument-value-converter';
import { BrowserCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { BrowserModelValueMethodArgumentResolver } from './model-argument-resolver';
import { BrowserStateValueMethodArgumentResolver } from './state-argument-resolver';
import { BrowserSessionValueMethodArgumentResolver } from './session-argument-resolver';

export type BrowserArgumentResolverOptions = {
    cookie?: ResolverConverterOption;
    model?: ResolverConverterOption;
    session?: ResolverConverterOption;
    state?: ResolverConverterOption;
    converterRegistry?: ArgumentValueConverterRegistry;
};

/**
 * Registers browser-specific argument resolvers into application context.
 */
export function configureBrowserArgumentResolvers(
    applicationContext: ApplicationContext,
    options: BrowserArgumentResolverOptions = {}
): HandlerMethodArgumentResolver[] {
    const contextRegistry = applicationContext.hasValue('argumentValueConverterRegistry')
        ? applicationContext.getValue<ArgumentValueConverterRegistry>('argumentValueConverterRegistry')
        : null;
    const converterRegistry = options.converterRegistry ?? contextRegistry ?? argumentValueConverters;

    const resolvers: HandlerMethodArgumentResolver[] = [
        new BrowserCookieValueMethodArgumentResolver(resolveConverter(options.cookie, converterRegistry)),
        new BrowserModelValueMethodArgumentResolver(resolveConverter(options.model, converterRegistry)),
        new BrowserStateValueMethodArgumentResolver(resolveConverter(options.state, converterRegistry)),
        new BrowserSessionValueMethodArgumentResolver(resolveConverter(options.session, converterRegistry)),
    ];

    applicationContext.setValue('argumentResolvers', resolvers);

    return resolvers;
}
