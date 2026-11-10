/**
 * The language-model contract: one provider call per step plus structured
 * output. Adapters (`@ndigo/ai-sdk`) translate it to their SDK; the agent
 * loop owns tool execution and multi-step control flow.
 */
import type { z } from 'zod';
import type { AIFinishReason, AIMessage, AITokenUsage, AIToolCall } from './messages';
import type { AIToolDescriptor } from './tools';

/**
 * Human-readable model identity used in telemetry attributes and rate-limit
 * keys.
 */
export interface AIModelInfo {
    /** Provider name, e.g. `lmstudio` or `openai`. */
    readonly provider: string;
    /** Model id, e.g. `qwen3-8b`. */
    readonly model: string;
}

/**
 * One model call, including the full conversation so far and the tools the
 * model may call. Adapters MUST NOT execute tools: the agent loop does that,
 * which keeps execution and telemetry provider-independent.
 */
export interface AIStepRequest {
    /** The conversation, including prior tool results. */
    readonly messages: readonly AIMessage[];
    /** Tools the model may call in this step. */
    readonly tools?: readonly AIToolDescriptor[];
    /** Sampling temperature, when the provider supports it. */
    readonly temperature?: number;
    /** Output-token cap, when the provider supports it. */
    readonly maxOutputTokens?: number;
    /** Cancels the provider call. */
    readonly signal?: AbortSignal;
}

/**
 * One completed model step: text, tool calls (if any), and usage.
 */
export interface AIStepResult {
    /** The assistant text produced in this step. */
    readonly text: string;
    /** Tool calls the model requested; the agent executes them. */
    readonly toolCalls: readonly AIToolCall[];
    /** Why the provider stopped. */
    readonly finishReason: AIFinishReason;
    /** Token usage for this step. */
    readonly usage: AITokenUsage;
}

/**
 * Incremental step output. The agent forwards `text-delta` events and
 * collects `tool-call` events; the generator's return value is the settled
 * {@link AIStepResult}.
 */
export type AIStepStreamEvent =
    | { readonly type: 'text-delta'; readonly text: string }
    | { readonly type: 'tool-call'; readonly call: AIToolCall };

/**
 * A streaming model step. The generator returns the settled step once the
 * provider stream ends.
 */
export type AIStepStream = AsyncGenerator<AIStepStreamEvent, AIStepResult, void>;

/**
 * A structured-output request: the model must return an object matching the
 * Zod schema.
 */
export interface AIObjectRequest<T> {
    /** The schema the returned object must satisfy. */
    readonly schema: z.ZodType<T>;
    /** The conversation driving the generation. */
    readonly messages: readonly AIMessage[];
    /** Sampling temperature, when the provider supports it. */
    readonly temperature?: number;
    /** Output-token cap, when the provider supports it. */
    readonly maxOutputTokens?: number;
    /** Cancels the provider call. */
    readonly signal?: AbortSignal;
}

/**
 * A structured-output result.
 */
export interface AIObjectResult<T> {
    /** The schema-validated object. */
    readonly object: T;
    /** Why the provider stopped. */
    readonly finishReason: AIFinishReason;
    /** Token usage for the call. */
    readonly usage: AITokenUsage;
}

/**
 * The provider-neutral language-model contract.
 */
export interface AIModel {
    /** Identity used in telemetry and rate limits. */
    readonly info: AIModelInfo;

    /**
     * Performs one non-streaming model call. Tools are declared to the model
     * but never executed by the adapter.
     *
     * @param request - The conversation, tools, and sampling options.
     * @returns The settled step.
     */
    generateStep(request: AIStepRequest): Promise<AIStepResult>;

    /**
     * Performs one streaming model call. Tools are declared but never
     * executed by the adapter.
     *
     * @param request - The conversation, tools, and sampling options.
     * @returns The step event stream; its return value is the settled step.
     */
    streamStep(request: AIStepRequest): AIStepStream;

    /**
     * Generates a schema-validated object.
     *
     * @param request - The schema and conversation.
     * @returns The validated object and usage.
     */
    generateObject<T>(request: AIObjectRequest<T>): Promise<AIObjectResult<T>>;
}
