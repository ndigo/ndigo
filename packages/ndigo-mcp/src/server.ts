/**
 * Low-level MCP server construction: `tools/list`, `tools/call`,
 * `resources/list`, `resources/read`, and `prompts/list`, plus the stdio
 * transport. JSON Schemas are carried verbatim, so projection and parity stay
 * exact.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListPromptsRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { InspectManifest } from '@ndigo/inspect';
import type { McpToolRegistry } from './registry.js';
import { MCP_APP_MIME_TYPE, type UiResource } from './ui-resource.js';

/** Options for {@link createMcpServer}. */
export interface McpServerOptions {
    /** Server name reported to clients. */
    readonly name?: string;
    /** Server version reported to clients. */
    readonly version?: string;
    /** The application manifest, exposed as MCP resources. */
    readonly inspect?: InspectManifest;
    /** MCP Apps `ui://` resources served as `text/html;profile=mcp-app`. */
    readonly uiResources?: readonly UiResource[];
}

/**
 * Creates an MCP server over a tool registry.
 *
 * @param registry - The projected tools.
 * @param options - Identity and the optional inspect manifest.
 * @returns A server ready to connect to a transport.
 */
export function createMcpServer(registry: McpToolRegistry, options: McpServerOptions = {}): Server {
    const uiResources = options.uiResources ?? [];
    const server = new Server(
        { name: options.name ?? 'ndigo', version: options.version ?? '0.0.1' },
        {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
                ...(uiResources.length === 0 ? {} : { extensions: { 'io.modelcontextprotocol/ui': {} } }),
            },
        }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: await registry.listTools() }));

    server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
        const callId = extra.requestId === undefined ? undefined : String(extra.requestId);
        try {
            const result = await registry.call(
                request.params.name,
                (request.params.arguments ?? {}) as Record<string, unknown>,
                callId === undefined ? {} : { callId }
            );
            return {
                content: [
                    {
                        type: 'text' as const,
                        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [{ type: 'text' as const, text: error instanceof Error ? error.message : String(error) }],
                isError: true,
            };
        }
    });

    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: resourcesOf(options.inspect, uiResources),
    }));

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const uiResource = uiResources.find((resource) => resource.uri === request.params.uri);
        if (uiResource !== undefined) {
            return {
                contents: [
                    {
                        uri: uiResource.uri,
                        mimeType: MCP_APP_MIME_TYPE,
                        text: uiResource.html,
                        ...(uiResource.ui === undefined
                            ? {}
                            : { _meta: { ui: { resourceUri: uiResource.uri, ...uiResource.ui } } }),
                    },
                ],
            };
        }
        const manifest = options.inspect;
        if (manifest === undefined) {
            throw new Error(`unknown MCP resource '${request.params.uri}'`);
        }
        const body = resourceBody(manifest, request.params.uri);
        if (body === undefined) {
            throw new Error(`unknown MCP resource '${request.params.uri}'`);
        }
        return {
            contents: [{ uri: request.params.uri, mimeType: 'application/json', text: JSON.stringify(body, null, 2) }],
        };
    });

    server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [] }));

    return server;
}

/**
 * Starts a server on stdin/stdout. Stdout is reserved for JSON-RPC.
 *
 * @param registry - The projected tools.
 * @param options - Identity and the optional inspect manifest.
 * @returns A promise that resolves once the transport is connected.
 */
export async function startStdioServer(registry: McpToolRegistry, options: McpServerOptions = {}): Promise<void> {
    const server = createMcpServer(registry, options);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write(`${options.name ?? 'ndigo'}: listening on stdio\n`);
}

function resourcesOf(manifest: InspectManifest | undefined, uiResources: readonly UiResource[]) {
    const manifestResources =
        manifest === undefined
            ? []
            : [
                  { uri: 'ndigo://manifest', name: 'Application manifest', mimeType: 'application/json' },
                  { uri: 'ndigo://routes', name: 'Application routes', mimeType: 'application/json' },
                  { uri: 'ndigo://config', name: 'Declared configuration keys', mimeType: 'application/json' },
              ];
    const appResources = uiResources.map((resource) => ({
        uri: resource.uri,
        name: resource.name,
        ...(resource.description === undefined ? {} : { description: resource.description }),
        mimeType: MCP_APP_MIME_TYPE,
        ...(resource.ui === undefined ? {} : { _meta: { ui: { resourceUri: resource.uri, ...resource.ui } } }),
    }));
    return [...manifestResources, ...appResources];
}

function resourceBody(manifest: InspectManifest, uri: string): unknown {
    switch (uri) {
        case 'ndigo://manifest':
            return manifest;
        case 'ndigo://routes':
            return manifest.routes;
        case 'ndigo://config':
            return manifest.config;
        default:
            return undefined;
    }
}
