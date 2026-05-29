/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver } from '@blue/dispatcher';
import {
    ArgumentValueConverterRegistry,
    ConverterResolutionOptions,
    ResolverConverterOption,
    argumentValueConverters,
    resolveConverter,
} from './argument-value-converter';
import { NodeQueryValueMethodArgumentResolver } from './query-argument-resolver';
import { NodePathValueMethodArgumentResolver } from './path-argument-resolver';
import { NodeHeaderValueMethodArgumentResolver } from './header-argument-resolver';
import { NodeBodyValueMethodArgumentResolver } from './body-argument-resolver';
import { NodeCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { NodeSessionValueMethodArgumentResolver } from './session-argument-resolver';

/** Options for configuring Node.js argument resolvers. */
export type NodeArgumentResolverOptions = {
    query?: ResolverConverterOption;
    path?: ResolverConverterOption;
    header?: ResolverConverterOption;
    body?: ResolverConverterOption;
    cookie?: ResolverConverterOption;
    session?: ResolverConverterOption;
    converterRegistry?: ArgumentValueConverterRegistry;
    strictNamedConverterLookup?: boolean;
};

/**
 * Registers Node.js-specific argument resolvers into the application context.
 *
 * @param applicationContext - The application context to configure.
 * @param options - Resolver and converter overrides.
 * @returns The resolver instances registered with the context.
 */
export function configureNodeArgumentResolvers(
    applicationContext: ApplicationContext,
    options: NodeArgumentResolverOptions = {}
): HandlerMethodArgumentResolver[] {
    const contextRegistry = applicationContext.hasValue('argumentValueConverterRegistry')
        ? applicationContext.getValue<ArgumentValueConverterRegistry>('argumentValueConverterRegistry')
        : null;
    const converterRegistry = options.converterRegistry ?? contextRegistry ?? argumentValueConverters;
    const converterResolutionOptions: ConverterResolutionOptions = {
        strictNamedLookup: options.strictNamedConverterLookup ?? false,
    };

    const resolvers: HandlerMethodArgumentResolver[] = [
        new NodeQueryValueMethodArgumentResolver(
            resolveConverter(options.query, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
        new NodePathValueMethodArgumentResolver(
            resolveConverter(options.path, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
        new NodeHeaderValueMethodArgumentResolver(
            resolveConverter(options.header, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
        new NodeBodyValueMethodArgumentResolver(
            resolveConverter(options.body, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
        new NodeCookieValueMethodArgumentResolver(
            resolveConverter(options.cookie, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
        new NodeSessionValueMethodArgumentResolver(
            resolveConverter(options.session, converterRegistry, converterResolutionOptions),
            converterRegistry,
            converterResolutionOptions
        ),
    ];

    applicationContext.setValue('argumentResolvers', resolvers);

    return resolvers;
}