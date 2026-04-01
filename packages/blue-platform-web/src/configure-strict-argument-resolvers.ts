/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver } from '@blue/dispatcher';
import { ArgumentValueConverterRegistry } from './argument-value-converter';
import { BrowserArgumentResolverOptions, configureBrowserArgumentResolvers } from './configure-argument-resolvers';
import { configureArgumentValueConverterRegistry } from './configure-converter-registry';

/** Options for strict browser argument resolvers. */
export type StrictBrowserArgumentResolverOptions = Omit<
    BrowserArgumentResolverOptions,
    'strictNamedConverterLookup'
> & {
    registerConverterRegistry?: ArgumentValueConverterRegistry;
};

/**
 * Registers browser argument resolvers with strict named converter lookup enabled.
 *
 * @param applicationContext - The application context to configure.
 * @param options - Resolver overrides and optional registry registration.
 * @returns The resolver instances registered with the context.
 */
export function configureStrictBrowserArgumentResolvers(
    applicationContext: ApplicationContext,
    options: StrictBrowserArgumentResolverOptions = {}
): HandlerMethodArgumentResolver[] {
    const { registerConverterRegistry, converterRegistry, ...resolverOptions } = options;

    registerConverterRegistry && configureArgumentValueConverterRegistry(applicationContext, registerConverterRegistry);

    return configureBrowserArgumentResolvers(applicationContext, {
        ...resolverOptions,
        converterRegistry: converterRegistry ?? registerConverterRegistry,
        strictNamedConverterLookup: true,
    });
}
