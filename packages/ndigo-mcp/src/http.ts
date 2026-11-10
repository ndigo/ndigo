/**
 * Streamable HTTP endpoint for a tool registry, mounted on an ordinary
 * dispatcher route. The route participates in the normal interceptor chain,
 * so auth, rate limiting, CSRF, and feature gates apply before the transport
 * sees the request.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { InspectManifest } from '@ndigo/inspect';
import { getNodeRequest, NODE_INCOMING_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE } from '@ndigo/platform-node';
import type { Route } from '@ndigo/router';
import type { McpToolRegistry } from './registry.js';
import { createMcpServer } from './server.js';
import type { UiResource } from './ui-resource.js';

/** Options for {@link McpHTTPEndpoint}. */
export interface McpHTTPEndpointOptions {
    /** The application manifest, exposed as MCP resources. */
    readonly inspect?: InspectManifest;
    /** MCP Apps `ui://` resources served as `text/html;profile=mcp-app`. */
    readonly uiResources?: readonly UiResource[];
}

/**
 * A stateless Streamable HTTP MCP endpoint.
 *
 * Wire it into an application with a methodless route:
 *
 * ```ts
 * @requestMapping({ value: '/mcp' })
 * async mcp(route: Route) { await endpoint.handle(route); }
 * ```
 */
export class McpHTTPEndpoint {
    readonly #registry: McpToolRegistry;
    readonly #options: McpHTTPEndpointOptions;

    /**
     * Creates the endpoint.
     *
     * @param registry - The projected tools.
     * @param options - Endpoint options.
     */
    constructor(registry: McpToolRegistry, options: McpHTTPEndpointOptions = {}) {
        this.#registry = registry;
        this.#options = options;
    }

    /**
     * Handles one HTTP request from a dispatcher route.
     *
     * @param route - The route carrying the raw Node request and response.
     * @returns A promise that resolves once the transport finished.
     */
    async handle(route: Route): Promise<void> {
        const req = route.attributes[NODE_INCOMING_ATTRIBUTE] as IncomingMessage | undefined;
        const res = route.attributes[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
        if (req === undefined || res === undefined) {
            throw new Error('@ndigo/mcp HTTP transport requires the Node platform adapter');
        }
        const server = createMcpServer(this.#registry, this.#options);
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        const close = (): void => {
            void transport.close();
            void server.close();
        };
        res.once('close', close);
        try {
            await server.connect(transport);
            await transport.handleRequest(req, res, getNodeRequest(route)?.body);
        } catch (error) {
            res.off('close', close);
            close();
            throw error;
        }
    }
}

/** Options for {@link protectedResourceMetadata}. */
export interface ProtectedResourceMetadataOptions {
    /** The protected resource identifier (the MCP endpoint URL). */
    readonly resource: string;
    /** Authorization server issuer URLs. */
    readonly authorizationServers: readonly string[];
    /** Scopes the resource accepts. */
    readonly scopesSupported?: readonly string[];
}

/**
 * Builds RFC 9728 protected-resource metadata for an MCP endpoint.
 *
 * @param options - Resource identifier and authorization servers.
 * @returns The metadata document.
 */
export function protectedResourceMetadata(options: ProtectedResourceMetadataOptions): Record<string, unknown> {
    return {
        resource: options.resource,
        authorization_servers: [...options.authorizationServers],
        ...(options.scopesSupported === undefined ? {} : { scopes_supported: [...options.scopesSupported] }),
        bearer_methods_supported: ['header'],
    };
}
