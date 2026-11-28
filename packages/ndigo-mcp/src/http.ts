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
import type { MCPToolRegistry } from './registry.js';
import { createMcpServer } from './server.js';
import type { UIResource } from './ui-resource.js';
import { FrameworkError } from '@ndigo/core';

/**
 * Options for {@link MCPHTTPEndpoint}.
 *
 * @example
 * ```ts
 * const options: MCPHTTPEndpointOptions = { source: 'http' };
 * ```
 */
export interface MCPHTTPEndpointOptions {
    /** The application manifest, exposed as MCP resources. */
    readonly inspect?: InspectManifest;
    /** MCP Apps `ui://` resources served as `text/html;profile=mcp-app`. */
    readonly uiResources?: readonly UIResource[];
    /**
     * The transport label recorded on tool-call spans as
     * `gen_ai.tool.call.source`; the endpoint defaults to `'http'`.
     */
    readonly source?: string;
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
 *
 * @example
 * ```ts
 * const endpoint = new MCPHTTPEndpoint(registry, { source: 'http' });
 * ```
 */
export class MCPHTTPEndpoint {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MCPHTTPEndpoint".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MCPHTTPEndpoint]"
     */
    get [Symbol.toStringTag](): string {
        return 'MCPHTTPEndpoint';
    }

    readonly #registry: MCPToolRegistry;
    readonly #options: MCPHTTPEndpointOptions;

    /**
     * Creates the endpoint.
     *
     * @param registry - The projected tools.
     * @param options - Endpoint options.
     */
    constructor(registry: MCPToolRegistry, options: MCPHTTPEndpointOptions = {}) {
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
            throw new FrameworkError('@ndigo/mcp HTTP transport requires the Node platform adapter');
        }
        const server = createMcpServer(this.#registry, { source: 'http', ...this.#options });
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

/**
 * Options for {@link protectedResourceMetadata}.
 *
 * @example
 * ```ts
 * const options: ProtectedResourceMetadataOptions = {
 *     resource: 'https://mcp.example.com/mcp',
 *     authorizationServers: ['https://auth.example.com'],
 * };
 * ```
 */
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
 *
 * @example
 * ```ts
 * const metadata = protectedResourceMetadata({
 *     resource: 'https://mcp.example.com/mcp',
 *     authorizationServers: ['https://auth.example.com'],
 * });
 * ```
 */
export function protectedResourceMetadata(options: ProtectedResourceMetadataOptions): Record<string, unknown> {
    return {
        resource: options.resource,
        authorization_servers: [...options.authorizationServers],
        ...(options.scopesSupported === undefined ? {} : { scopes_supported: [...options.scopesSupported] }),
        bearer_methods_supported: ['header'],
    };
}
