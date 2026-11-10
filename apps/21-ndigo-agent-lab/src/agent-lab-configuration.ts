/**
 * Demo wiring: order tools, the SSE chat controller, the Streamable HTTP MCP
 * endpoint, and the A2UI report. Controllers are beans so `@routeMapping`
 * scans their handlers; the view resolver makes the report negotiable.
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@ndigo/context';
import { MediaTypes } from '@ndigo/core';
import {
    a2uiViewResolver,
    ContentNegotiationManager,
    ContentNegotiationViewResolver,
    JSONView,
    PathExtensionContentNegotiationStrategy,
    type ViewResolver,
} from '@ndigo/view';
import { ChatController } from './chat-controller';
import { McpHTTPController } from './http-mcp-controller';
import { OrderTools } from './order-tools';
import { ReportController } from './report-controller';

/**
 * The lab's controller composition.
 */
@configuration
export class AgentLabConfiguration {
    readonly #chat = new ChatController();
    readonly #orders = new OrderTools();
    readonly #mcp = new McpHTTPController();
    readonly #reports = new ReportController();

    /**
     * @returns The SSE chat controller.
     */
    @entry()
    chatController(): ChatController {
        return this.#chat;
    }

    /**
     * @returns The shared order tool handlers.
     */
    @entry()
    orderTools(): OrderTools {
        return this.#orders;
    }

    /**
     * @returns The Streamable HTTP MCP endpoint.
     */
    @entry()
    mcpController(): McpHTTPController {
        return this.#mcp;
    }

    /**
     * @returns The A2UI order report controller.
     */
    @entry()
    reportController(): ReportController {
        return this.#reports;
    }

    /**
     * Negotiates the `orders` view: JSON by default, A2UI when the client asks
     * for `application/a2ui+json` (or the `.a2ui` extension on a route that
     * declares it).
     */
    @entry()
    viewResolver(): ContentNegotiationViewResolver {
        const manager = new ContentNegotiationManager([
            new PathExtensionContentNegotiationStrategy(
                new Map([
                    ['json', MediaTypes.APPLICATION_JSON],
                    ['a2ui', MediaTypes.APPLICATION_A2UI_JSON],
                ])
            ),
        ]);
        const resolver = new ContentNegotiationViewResolver(manager);
        const jsonOrders: ViewResolver = {
            resolveViewName: async (name: string) => (name === 'orders' ? new JSONView() : null),
        };
        resolver.viewResolvers = [jsonOrders, a2uiViewResolver('orders')];
        return resolver;
    }
}
