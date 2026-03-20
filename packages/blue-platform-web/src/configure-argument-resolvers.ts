/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver } from '@blue/dispatcher';
import {
    ArgumentValueConverter,
    ArgumentValueConverterRegistry,
    ConverterResolutionOptions,
    ResolverConverterOption,
    argumentValueConverters,
    resolveConverter,
} from './argument-value-converter';
import { BrowserCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { BrowserBindMethodArgumentResolver } from './bind-argument-resolver';
import { BrowserModelValueMethodArgumentResolver } from './model-argument-resolver';
import { BrowserStateValueMethodArgumentResolver } from './state-argument-resolver';
import { BrowserSessionValueMethodArgumentResolver } from './session-argument-resolver';

export type BrowserArgumentResolverOptions = {
    bind?: ResolverConverterOption;
    cookie?: ResolverConverterOption;
    model?: ResolverConverterOption;
    session?: ResolverConverterOption;
    state?: ResolverConverterOption;
    converterRegistry?: ArgumentValueConverterRegistry;
    strictNamedConverterLookup?: boolean;
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
    const converterResolutionOptions: ConverterResolutionOptions = {
        strictNamedLookup: options.strictNamedConverterLookup ?? false,
    };

    const resolvers: HandlerMethodArgumentResolver[] = [
        new BrowserBindMethodArgumentResolver(
            resolveConverter(options.bind, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
        new BrowserCookieValueMethodArgumentResolver(
            resolveConverter(options.cookie, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
        new BrowserModelValueMethodArgumentResolver(
            resolveConverter(options.model, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
        new BrowserStateValueMethodArgumentResolver(
            resolveConverter(options.state, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
        new BrowserSessionValueMethodArgumentResolver(
            resolveConverter(options.session, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
    ];

    applicationContext.setValue('argumentResolvers', resolvers);

    return resolvers;
}
