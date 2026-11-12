/**
 * `ANY /mcp`: the Streamable HTTP transport for the same tool registry the
 * stdio server and the agent use. The endpoint is built lazily so the
 * dispatcher mappings are complete before the registry projects them.
 */
import '@tsmetadata/polyfill';
import type { ApplicationContext, ApplicationContextAware } from '@ndigo/context';
import { ARGUMENT_RESOLVERS, DISPATCHER, parameters, requestMapping, routeValue } from '@ndigo/dispatcher';
import { $aware } from '@ndigo/factory';
import { McpHTTPEndpoint, McpToolRegistry } from '@ndigo/mcp';
import type { Route } from '@ndigo/router';
import { ordersUi } from './orders-ui';

/**
 * Serves the MCP tool registry over Streamable HTTP at `/mcp`.
 */
@requestMapping('/')
export class McpHTTPController implements ApplicationContextAware {
    #context: ApplicationContext | null = null;
    #endpoint: McpHTTPEndpoint | null = null;

    /**
     * Marks this entry for aware injection; the endpoint is resolved lazily so
     * the dispatcher mappings are registered before the registry is built.
     */
    get [$aware](): boolean {
        return true;
    }

    /**
     * @param context - The application context that owns this controller.
     */
    setApplicationContext(context: ApplicationContext): void {
        this.#context = context;
    }

    /**
     * Hands the raw Node request and response to the MCP transport.
     *
     * @param route - The current route.
     * @returns A promise that resolves once the transport finished.
     */
    @requestMapping('/mcp')
    @parameters({ route: routeValue() })
    async mcp(route: Route): Promise<void> {
        await this.#resolveEndpoint().handle(route);
    }

    #resolveEndpoint(): McpHTTPEndpoint {
        if (this.#endpoint !== null) return this.#endpoint;
        if (this.#context === null) {
            throw new Error('McpHTTPController has no application context');
        }
        const registry = McpToolRegistry.from(this.#context.getValue(DISPATCHER), {
            readOnly: true,
            argumentResolvers: this.#context.getValue(ARGUMENT_RESOLVERS),
        });
        this.#endpoint = new McpHTTPEndpoint(registry, { uiResources: [ordersUi] });
        return this.#endpoint;
    }
}
