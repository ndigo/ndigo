/**
 * @author Jeff Rose
 */

import { configuration, entry } from '@blue/context';
import { MetadataHandlerMapping } from '@blue/dispatcher';
import { argumentValueConverters } from './argument-value-converter';
import { NodeQueryValueMethodArgumentResolver } from './query-argument-resolver';
import { NodePathValueMethodArgumentResolver } from './path-argument-resolver';
import { NodeHeaderValueMethodArgumentResolver } from './header-argument-resolver';
import { NodeBodyValueMethodArgumentResolver } from './body-argument-resolver';
import { NodeCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { NodeSessionValueMethodArgumentResolver } from './session-argument-resolver';

/**
 * Auto-configuration for Node.js-based applications.
 * Provisions Node.js argument resolvers and converter registries.
 *
 * Register this configuration class with your {@link ApplicationContext} alongside
 * {@link NodeEnvironment} to enable full server-side argument resolution.
 */
@configuration
export class NodeAutoConfiguration {
    /**
     * Exposes the shared argument-value converter registry.
     *
     * @returns The Node.js argument-value converter registry.
     */
    @entry
    argumentValueConverterRegistry() {
        return argumentValueConverters;
    }

    /**
     * Creates the Node.js argument resolvers used for request binding.
     *
     * @returns The Node.js argument resolvers.
     */
    @entry
    argumentResolvers() {
        const registry = argumentValueConverters;
        const options = { strictNamedLookup: true };

        return [
            new NodeQueryValueMethodArgumentResolver(undefined, registry, options),
            new NodePathValueMethodArgumentResolver(undefined, registry, options),
            new NodeHeaderValueMethodArgumentResolver(undefined, registry, options),
            new NodeBodyValueMethodArgumentResolver(undefined, registry, options),
            new NodeCookieValueMethodArgumentResolver(undefined, registry, options),
            new NodeSessionValueMethodArgumentResolver(undefined, registry, options),
        ];
    }

    /**
     * Provides the default handler mapping for Node.js request dispatch.
     *
     * @returns The default metadata-driven handler mapping.
     */
    @entry
    handlerMapping() {
        return new MetadataHandlerMapping();
    }
}