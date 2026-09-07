import { configuration, entry } from '@blue/context';
import { conditionalOnNode } from '@blue/core';
import { RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { IslandViewResolver } from '@blue/view';
import { NodeDispatcher } from './node-dispatcher';
import { HTTPServer } from './http-server';
import { argumentValueConverters } from './argument-value-converter';
import { NodeQueryValueMethodArgumentResolver } from './query-argument-resolver';
import { NodePathValueMethodArgumentResolver } from './path-argument-resolver';
import { NodeHeaderValueMethodArgumentResolver } from './header-argument-resolver';
import { NodeBodyValueMethodArgumentResolver } from './body-argument-resolver';
import { NodeCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { NodeSessionValueMethodArgumentResolver } from './session-argument-resolver';

/**
 * Auto-configuration for Node.js-based applications.
 * Provisions Node.js argument resolvers, a dispatcher, and an HTTP server.
 *
 * Register this configuration class with your `ApplicationContext` alongside
 * {@link NodeEnvironment} to enable full server-side request handling.
 */
@conditionalOnNode
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
        return [
            new NodeQueryValueMethodArgumentResolver(),
            new NodePathValueMethodArgumentResolver(),
            new NodeHeaderValueMethodArgumentResolver(),
            new NodeBodyValueMethodArgumentResolver(),
            new NodeCookieValueMethodArgumentResolver(),
            new NodeSessionValueMethodArgumentResolver(),
        ];
    }

    /**
     * Provides the default handler mapping for Node.js request dispatch.
     *
     * @returns The default metadata-driven handler mapping.
     */
    @entry
    handlerMapping() {
        return new RadixMetadataHandlerMapping();
    }

    /**
     * Creates the Node dispatcher used for server-side request dispatch and rendering.
     *
     * @returns The Node dispatcher.
     */
    @entry
    dispatcher() {
        return new NodeDispatcher();
    }

    /**
     * Creates the managed HTTP server used for server-side request handling.
     *
     * The server resolves the {@link NodeDispatcher} from the application
     * context when it starts, so no dispatcher is passed here. Start it
     * explicitly after `refresh()`: `await context.getValue('httpServer').start()`.
     * The context stops it when closed.
     *
     * @returns The managed HTTP server.
     */
    @entry
    httpServer(): HTTPServer {
        return new HTTPServer();
    }

    /**
     * Provides the default view resolver for server-side rendering:
     * island markers (server-rendered pairs of the client web components).
     *
     * @returns The island view resolver.
     */
    @entry
    viewResolver() {
        return new IslandViewResolver();
    }
}
