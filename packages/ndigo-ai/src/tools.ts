/**
 * The tool-source contract the agent loop consumes. `McpToolRegistry`
 * (`@ndigo/mcp`) satisfies it structurally, so the loop never imports the
 * Node-only MCP package.
 */

/**
 * One tool as reported by a source: the same shape as MCP `tools/list`
 * entries (`name`, `description`, JSON Schema `inputSchema`).
 */
export interface AIToolDescriptor {
    /** The tool name the model must call. */
    readonly name: string;
    /** One-line description shown to the model. */
    readonly description?: string;
    /** JSON Schema for the tool arguments. */
    readonly inputSchema: Record<string, unknown>;
}

/**
 * Per-call context passed to {@link AIToolSource.call}. The `callId` is the
 * model-assigned tool-call id and is recorded as `gen_ai.tool.call.id`.
 */
export interface AIToolCallContext {
    /** The model-assigned tool-call id. */
    readonly callId?: string;
}

/**
 * A source of tools the agent may call. Implementations decide where tools
 * live and how they execute; `McpToolRegistry` is the canonical one.
 */
export interface AIToolSource {
    /**
     * Lists the tools visible under the source's policy.
     *
     * @returns The tool descriptors shown to the model.
     */
    listTools(): Promise<readonly AIToolDescriptor[]>;

    /**
     * Invokes one tool.
     *
     * @param name - The tool name.
     * @param args - The decoded JSON arguments.
     * @param context - The call context, including the model call id.
     * @returns The tool result.
     * @throws When the tool is unknown, hidden, or the handler fails.
     */
    call(name: string, args?: Record<string, unknown>, context?: AIToolCallContext): Promise<unknown>;
}
