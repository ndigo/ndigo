/**
 * Shared MCP host for the CLI's stdio servers: server construction,
 * read-only tool gating, JSON-text results, and error mapping. Each server
 * supplies its own tool set; this module owns the protocol plumbing only.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ShapeOutput, ZodRawShapeCompat } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';

/** A raw tool schema: named zod validators, as the MCP SDK expects. */
export type ToolSchema = ZodRawShapeCompat;

/** The validated arguments of a tool with schema `Shape`. */
export type ToolArguments<Shape extends ToolSchema> = ShapeOutput<Shape>;

/** Options for {@link createMcpHost}. */
export interface McpHostOptions {
    /** Server name reported to clients. */
    readonly name: string;
    /** Server version reported to clients. */
    readonly version: string;
    /** Usage guidance handed to the client's model. */
    readonly instructions?: string;
    /** Register read-only tools only; mutating tools are skipped. */
    readonly readOnly?: boolean;
}

/** One tool registered on an {@link McpHost}. */
export interface McpToolDefinition<Shape extends ToolSchema = ToolSchema> {
    /** Stable tool name (snake_case). */
    readonly name: string;
    /** Human-readable title. */
    readonly title: string;
    /** What the tool does and when to use it. */
    readonly description: string;
    /** Zod raw shape validating the tool arguments. */
    readonly inputSchema: Shape;
    /** Behaviour hints for the client. */
    readonly annotations?: ToolAnnotations;
    /** When `true`, the tool is omitted in read-only mode. */
    readonly mutating?: boolean;
    /** Executes the tool; the resolved value is serialized as JSON text. */
    readonly run: (args: ToolArguments<Shape>) => Promise<unknown> | unknown;
}

/** A configured MCP server plus registration and stdio helpers. */
export interface McpHost {
    /** The underlying server, for tests and advanced wiring. */
    readonly server: McpServer;
    /** Registers a tool, skipping it under {@link McpHostOptions.readOnly}. */
    registerTool<Shape extends ToolSchema>(tool: McpToolDefinition<Shape>): void;
    /** Connects a stdio transport and writes the listening line to stderr. */
    startStdio(label: string): Promise<void>;
}

/**
 * Creates an MCP host with no tools registered yet.
 *
 * @param options - Server identity, instructions, and read-only mode.
 * @returns The host; registration and transport are separate steps.
 */
export function createMcpHost(options: McpHostOptions): McpHost {
    const server = new McpServer(
        { name: options.name, version: options.version },
        options.instructions === undefined ? undefined : { instructions: options.instructions }
    );

    function registerTool<Shape extends ToolSchema>(tool: McpToolDefinition<Shape>): void {
        if (options.readOnly === true && tool.mutating === true) return;
        // `ToolCallback<Shape>` cannot resolve its conditional argument type
        // while `Shape` is generic (TS erases it to the constraint), so the
        // handler's precise parameter type is asserted at the SDK boundary.
        const handler = (async (args: ToolArguments<Shape>) =>
            runTool(() => tool.run(args))) as unknown as ToolCallback<Shape>;
        server.registerTool<ToolSchema, Shape>(
            tool.name,
            {
                title: tool.title,
                description: tool.description,
                inputSchema: tool.inputSchema,
                ...(tool.annotations === undefined ? {} : { annotations: tool.annotations }),
            },
            handler
        );
    }

    return {
        server,
        registerTool,
        async startStdio(label) {
            const transport = new StdioServerTransport();
            await server.connect(transport);
            process.stderr.write(`${label}: listening on stdio${options.readOnly === true ? ' (read-only)' : ''}\n`);
        },
    };
}

/**
 * Runs one tool callback and maps the outcome to an MCP result: one JSON text
 * block on success, an `isError` text block carrying the message on failure.
 *
 * @param run - The tool body.
 * @returns The MCP tool result.
 */
export async function runTool(run: () => Promise<unknown> | unknown): Promise<CallToolResult> {
    try {
        return { content: [{ type: 'text', text: JSON.stringify(await run(), null, 2) }] };
    } catch (error) {
        return {
            content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
            isError: true,
        };
    }
}
