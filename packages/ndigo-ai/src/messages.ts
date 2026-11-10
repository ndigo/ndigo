/**
 * The provider-neutral message vocabulary shared by every model adapter, the
 * agent loop, and SSE consumers.
 */

/**
 * A tool call produced by a model. `input` is the decoded JSON arguments
 * object; the model's schema has already been applied by the adapter.
 */
export interface AIToolCall {
    /** Provider-assigned call id, used to pair the call with its result. */
    readonly id: string;
    /** The tool name from the model's tool definition. */
    readonly name: string;
    /** Decoded JSON arguments. */
    readonly input: Record<string, unknown>;
}

/**
 * Token usage reported by a provider. Fields are optional because not every
 * provider reports every counter; the agent sums the values it receives.
 */
export interface AITokenUsage {
    /** Input (prompt) tokens. */
    readonly inputTokens?: number;
    /** Output (completion) tokens. */
    readonly outputTokens?: number;
    /** Total tokens, when the provider reports one directly. */
    readonly totalTokens?: number;
}

/**
 * Why a model step or the whole run finished. `max-steps` is produced by the
 * agent loop; the remaining values mirror the provider finish reasons.
 */
export type AIFinishReason =
    | 'stop'
    | 'length'
    | 'content-filter'
    | 'tool-calls'
    | 'error'
    | 'interrupted'
    | 'other'
    | 'max-steps';

/**
 * One message in a conversation.
 *
 * Assistant messages may carry tool calls alongside text. Tool messages are
 * produced by the agent loop after executing those calls; callers normally
 * construct only `system`, `user`, and `assistant` messages.
 */
export type AIMessage =
    | { readonly role: 'system'; readonly content: string }
    | { readonly role: 'user'; readonly content: string }
    | {
          readonly role: 'assistant';
          readonly content: string;
          readonly toolCalls?: readonly AIToolCall[];
      }
    | {
          readonly role: 'tool';
          readonly toolCallId: string;
          readonly name: string;
          readonly output: unknown;
      };

/**
 * A completed tool execution, as reported in `AIRunResult`.
 */
export interface AIToolResult {
    /** The call id this result answers. */
    readonly callId: string;
    /** The tool name. */
    readonly name: string;
    /** The handler result, or an `{ error }` object when execution failed. */
    readonly output: unknown;
}
