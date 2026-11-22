/**
 * Registry policy errors: a tool call refused by `authorize`, or withheld
 * pending a person's confirmation (`confirm`).
 */

/**
 * Options for {@link McpToolDeniedError}.
 *
 * @example
 * ```ts
 * const options: McpToolDeniedOptions = { confirm: 'Ask the person before sending.' };
 * ```
 */
export interface McpToolDeniedOptions {
    /** The person-facing confirmation sentence that withheld the call. */
    readonly confirm?: string;
}

/**
 * Thrown when a registry policy refuses a tool call. Transports render it as
 * an `isError` tool result, never as a protocol failure.
 *
 * @example
 * ```ts
 * throw new McpToolDeniedError('send_email', { confirm: 'Ask the person before sending.' });
 * ```
 */
export class McpToolDeniedError extends Error {
    /** The refused tool's name. */
    readonly tool: string;
    /** The required confirmation sentence, when the refusal is a pending confirmation. */
    readonly confirm?: string;

    /**
     * Creates the error.
     *
     * @param tool - The refused tool's name.
     * @param options - The confirmation sentence, when there is one.
     */
    constructor(tool: string, options: McpToolDeniedOptions = {}) {
        super(
            options.confirm === undefined ? `MCP tool '${tool}' denied by policy` : `Needs a person: ${options.confirm}`
        );
        this.name = 'McpToolDeniedError';
        this.tool = tool;
        if (options.confirm !== undefined) this.confirm = options.confirm;
    }
}
