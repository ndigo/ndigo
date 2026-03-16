/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver } from '@blue/dispatcher';
import {
    ArgumentValueConverter,
    argumentValueConverters,
    createOptionalConverter,
    identityArgumentValueConverter,
} from './argument-value-converter';
import { BrowserCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { BrowserModelValueMethodArgumentResolver } from './model-argument-resolver';
import { BrowserStateValueMethodArgumentResolver } from './state-argument-resolver';
import { BrowserSessionValueMethodArgumentResolver } from './session-argument-resolver';

export type ResolverConverterOption =
    | ArgumentValueConverter
    | keyof typeof argumentValueConverters
    | {
          optional?: boolean;
          use: ArgumentValueConverter | keyof typeof argumentValueConverters;
      };

export type BrowserArgumentResolverOptions = {
    cookie?: ResolverConverterOption;
    model?: ResolverConverterOption;
    session?: ResolverConverterOption;
    state?: ResolverConverterOption;
};

function resolveConverter(option?: ResolverConverterOption): ArgumentValueConverter {
    if (!option) {
        return identityArgumentValueConverter;
    }

    if (typeof option === 'function') {
        return option;
    }

    if (typeof option === 'string') {
        return argumentValueConverters[option] ?? identityArgumentValueConverter;
    }

    const baseConverter =
        typeof option.use === 'function'
            ? option.use
            : (argumentValueConverters[option.use] ?? identityArgumentValueConverter);

    return option.optional ? createOptionalConverter(baseConverter) : baseConverter;
}

/**
 * Registers browser-specific argument resolvers into application context.
 */
export function configureBrowserArgumentResolvers(
    applicationContext: ApplicationContext,
    options: BrowserArgumentResolverOptions = {}
): HandlerMethodArgumentResolver[] {
    const resolvers: HandlerMethodArgumentResolver[] = [
        new BrowserCookieValueMethodArgumentResolver(resolveConverter(options.cookie)),
        new BrowserModelValueMethodArgumentResolver(resolveConverter(options.model)),
        new BrowserStateValueMethodArgumentResolver(resolveConverter(options.state)),
        new BrowserSessionValueMethodArgumentResolver(resolveConverter(options.session)),
    ];

    applicationContext.setValue('argumentResolvers', resolvers);

    return resolvers;
}
