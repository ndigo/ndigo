/**
 * The `ndigo ui mcp` stdio server: registry discovery and install tools for
 * MCP-capable agents.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getItem, installItems, listItems, searchItems, validateRegistrySource } from './mcp-tools.js';
import type { RegistryToolContext } from './mcp-tools.js';

/** Options for {@link createRegistryServer}. */
export interface RegistryServerOptions extends RegistryToolContext {
    /** Expose discovery tools only; omit `install_items`. */
    readonly readOnly?: boolean;
}

/**
 * Creates the MCP server and registers its tools.
 * @param options - Application directory, default registry, and mode.
 * @returns A server ready to connect to a transport.
 */
export function createRegistryServer(options: RegistryServerOptions): McpServer {
    const server = new McpServer(
        { name: 'ndigo-ui', version: '0.0.1' },
        {
            instructions:
                options.readOnly === true
                    ? 'Read-only Ndigo UI registry tools. Use list_items or search_items to find items, get_item for metadata and READMEs, and validate_registry to check a source.'
                    : 'Ndigo UI registry tools. Use list_items or search_items to find items, get_item for metadata and READMEs, and validate_registry to check a source. install_items plans by default; set dryRun:false to write files.',
        }
    );

    registerDiscoveryTools(server, options);
    if (options.readOnly !== true) registerInstallTool(server, options);
    return server;
}

/**
 * Starts the server on stdin/stdout. Stdout is reserved for JSON-RPC, so all
 * diagnostics go to stderr.
 * @param options - Application directory, default registry, and mode.
 */
export async function startRegistryServer(options: RegistryServerOptions): Promise<void> {
    const server = createRegistryServer(options);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write(`ndigo ui mcp: listening on stdio${options.readOnly === true ? ' (read-only)' : ''}\n`);
}

function registerDiscoveryTools(server: McpServer, options: RegistryServerOptions): void {
    server.registerTool(
        'list_items',
        {
            title: 'List Ndigo UI items',
            description: 'List registry items with optional type, category, or text filters.',
            inputSchema: {
                type: z.string().optional().describe('Exact registry type, e.g. registry:ui or registry:block.'),
                category: z.string().optional().describe('Category filter, e.g. form or overlay.'),
                query: z.string().optional().describe('Case-insensitive text filter over names and descriptions.'),
                registry: z.string().optional().describe('Registry source override (file, directory, or URL).'),
            },
            annotations: { readOnlyHint: true },
        },
        async (args) => runTool(() => listItems(options, args))
    );

    server.registerTool(
        'search_items',
        {
            title: 'Search Ndigo UI items',
            description: 'Search items by name, title, description, docs, or category.',
            inputSchema: {
                query: z.string().min(1).describe('Search text.'),
                limit: z.number().int().min(1).max(50).optional().describe('Maximum results (default 10).'),
                registry: z.string().optional().describe('Registry source override (file, directory, or URL).'),
            },
            annotations: { readOnlyHint: true },
        },
        async (args) => runTool(() => searchItems(options, args.query, args.limit, args.registry))
    );

    server.registerTool(
        'get_item',
        {
            title: 'Show a Ndigo UI item',
            description: 'Show one item’s metadata, file targets, dependencies, docs, and README.',
            inputSchema: {
                name: z.string().min(1).describe('Registry item name.'),
                includeReadme: z.boolean().optional().describe('Include the item README (default true).'),
                registry: z.string().optional().describe('Registry source override (file, directory, or URL).'),
            },
            annotations: { readOnlyHint: true },
        },
        async (args) => runTool(() => getItem(options, args))
    );

    server.registerTool(
        'validate_registry',
        {
            title: 'Validate a Ndigo UI registry',
            description: 'Validate a registry source and report item-shape and missing-file errors.',
            inputSchema: {
                registry: z.string().optional().describe('Registry source override (file, directory, or URL).'),
            },
            annotations: { readOnlyHint: true },
        },
        async (args) => runTool(() => validateRegistrySource(options, args.registry))
    );
}

function registerInstallTool(server: McpServer, options: RegistryServerOptions): void {
    server.registerTool(
        'install_items',
        {
            title: 'Install Ndigo UI items',
            description:
                'Plan (default) or install registry items into an application. Set dryRun:false to write files and install npm dependencies.',
            inputSchema: {
                items: z.array(z.string().min(1)).min(1).describe('Registry item names to install.'),
                dir: z.string().optional().describe('Application directory (default: the server --dir).'),
                registry: z.string().optional().describe('Registry source override (file, directory, or URL).'),
                dryRun: z.boolean().optional().describe('Plan only (default true); false writes files.'),
                overwrite: z.boolean().optional().describe('Replace files that differ from the registry content.'),
                skipInstall: z.boolean().optional().describe('Write files without installing npm dependencies.'),
            },
            annotations: { destructiveHint: true },
        },
        async (args) => runTool(() => installItems(options, args))
    );
}

async function runTool(run: () => Promise<unknown>): Promise<CallToolResult> {
    try {
        return { content: [{ type: 'text', text: JSON.stringify(await run(), null, 2) }] };
    } catch (error) {
        return {
            content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
            isError: true,
        };
    }
}
