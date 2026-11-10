/**
 * The Vercel AI SDK integration layer. Every AI SDK import in the repository
 * lives here; the rest of the framework talks to {@link AIModel} from
 * `@ndigo/ai`.
 */
import {
    generateObject,
    generateText,
    jsonSchema,
    streamText,
    zodSchema,
    type AssistantContent,
    type JSONValue,
    type LanguageModel,
    type ModelMessage,
    type ToolSet,
} from 'ai';
import type {
    AIFinishReason,
    AIMessage,
    AIModel,
    AIModelInfo,
    AIObjectRequest,
    AIObjectResult,
    AIStepRequest,
    AIStepResult,
    AIStepStream,
    AIStepStreamEvent,
    AITokenUsage,
    AIToolCall,
    AIToolDescriptor,
} from '@ndigo/ai';

/**
 * Optional identity overrides. Without them the adapter reads `provider` and
 * `modelId` from the AI SDK model and falls back to `ai-sdk`.
 */
export interface AISdkModelOptions {
    /** Provider name used in telemetry and rate-limit keys. */
    readonly provider?: string;
    /** Model id used in telemetry and rate-limit keys. */
    readonly model?: string;
}

/**
 * Adapts an AI SDK `LanguageModel` to the provider-neutral `AIModel`
 * contract.
 *
 * The adapter declares tools to the model but never executes them — the
 * `@ndigo/ai` agent loop owns execution and telemetry, so MCP tools and local
 * sources behave identically across providers.
 */
export class AISdkModel implements AIModel {
    /** Model identity used in telemetry and rate-limit keys. */
    readonly info: AIModelInfo;
    readonly #model: LanguageModel;

    /**
     * @param model - The AI SDK language model (provider package output).
     * @param options - Optional identity overrides.
     */
    constructor(model: LanguageModel, options: AISdkModelOptions = {}) {
        this.#model = model;
        const candidate = model as { readonly provider?: string; readonly modelId?: string };
        this.info = {
            provider: options.provider ?? candidate.provider ?? 'ai-sdk',
            model: options.model ?? candidate.modelId ?? String(model),
        };
    }

    /**
     * Performs one non-streaming AI SDK call.
     *
     * @param request - The conversation, tools, and sampling options.
     * @returns The settled step.
     */
    async generateStep(request: AIStepRequest): Promise<AIStepResult> {
        const { instructions, messages } = toPrompt(request.messages);
        const result = await generateText({
            model: this.#model,
            ...(instructions === undefined ? {} : { instructions }),
            messages,
            ...(request.tools === undefined || request.tools.length === 0 ? {} : { tools: toToolSet(request.tools) }),
            ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
            ...(request.maxOutputTokens === undefined ? {} : { maxOutputTokens: request.maxOutputTokens }),
            ...(request.signal === undefined ? {} : { abortSignal: request.signal }),
        });

        return {
            text: result.text,
            toolCalls: result.toolCalls.map(toToolCall),
            finishReason: asFinishReason(result.finishReason),
            usage: asUsage(result.usage),
        };
    }

    /**
     * Performs one streaming AI SDK call and returns the settled step.
     *
     * @param request - The conversation, tools, and sampling options.
     * @returns The step event stream; its return value is the settled step.
     */
    async *streamStep(request: AIStepRequest): AIStepStream {
        const { instructions, messages } = toPrompt(request.messages);
        const result = streamText({
            model: this.#model,
            ...(instructions === undefined ? {} : { instructions }),
            messages,
            ...(request.tools === undefined || request.tools.length === 0 ? {} : { tools: toToolSet(request.tools) }),
            ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
            ...(request.maxOutputTokens === undefined ? {} : { maxOutputTokens: request.maxOutputTokens }),
            ...(request.signal === undefined ? {} : { abortSignal: request.signal }),
        });

        const toolCalls: AIToolCall[] = [];
        let text = '';
        let finishReason: AIFinishReason = 'other';
        let usage: AITokenUsage = {};

        for await (const part of result.stream) {
            if (part.type === 'text-delta') {
                text += part.text;
                yield { type: 'text-delta', text: part.text } satisfies AIStepStreamEvent;
            } else if (part.type === 'tool-call') {
                const call = toToolCall(part);
                toolCalls.push(call);
                yield { type: 'tool-call', call } satisfies AIStepStreamEvent;
            } else if (part.type === 'finish') {
                finishReason = asFinishReason(part.finishReason);
                usage = asUsage(part.totalUsage);
            } else if (part.type === 'error') {
                throw part.error instanceof Error ? part.error : new Error(String(part.error));
            }
        }

        return { text, toolCalls, finishReason, usage };
    }

    /**
     * Generates a Zod-validated object through the AI SDK.
     *
     * @param request - The schema and conversation.
     * @returns The validated object and usage.
     */
    async generateObject<T>(request: AIObjectRequest<T>): Promise<AIObjectResult<T>> {
        const { instructions, messages } = toPrompt(request.messages);
        const result = await generateObject({
            model: this.#model,
            schema: zodSchema(request.schema),
            ...(instructions === undefined ? {} : { instructions }),
            messages,
            ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
            ...(request.maxOutputTokens === undefined ? {} : { maxOutputTokens: request.maxOutputTokens }),
            ...(request.signal === undefined ? {} : { abortSignal: request.signal }),
        });

        return {
            object: result.object,
            finishReason: asFinishReason(result.finishReason),
            usage: asUsage(result.usage),
        };
    }
}

/**
 * Creates an {@link AISdkModel} without `new`.
 *
 * @param model - The AI SDK language model.
 * @param options - Optional identity overrides.
 * @returns The adapter.
 */
export function aiSdkModel(model: LanguageModel, options: AISdkModelOptions = {}): AISdkModel {
    return new AISdkModel(model, options);
}

/**
 * Splits system messages into the AI SDK `instructions` option and maps the
 * remaining messages to AI SDK `ModelMessage`s.
 *
 * @param messages - The provider-neutral conversation.
 * @returns The instructions and model messages.
 */
function toPrompt(messages: readonly AIMessage[]): { instructions?: string; messages: ModelMessage[] } {
    const systems: string[] = [];
    const prompt: ModelMessage[] = [];

    for (const message of messages) {
        if (message.role === 'system') {
            systems.push(message.content);
        } else if (message.role === 'tool') {
            prompt.push({
                role: 'tool',
                content: [
                    {
                        type: 'tool-result',
                        toolCallId: message.toolCallId,
                        toolName: message.name,
                        output: toToolOutput(message.output),
                    },
                ],
            });
        } else if (message.role === 'assistant' && message.toolCalls !== undefined && message.toolCalls.length > 0) {
            const content: AssistantContent = [];
            if (message.content.length > 0) {
                content.push({ type: 'text', text: message.content });
            }
            for (const call of message.toolCalls) {
                content.push({
                    type: 'tool-call',
                    toolCallId: call.id,
                    toolName: call.name,
                    input: call.input,
                });
            }
            prompt.push({ role: 'assistant', content });
        } else {
            prompt.push({ role: message.role, content: message.content });
        }
    }

    return {
        ...(systems.length === 0 ? {} : { instructions: systems.join('\n\n') }),
        messages: prompt,
    };
}

/**
 * Builds the AI SDK tool set from provider-neutral descriptors. No `execute`
 * is supplied: the agent loop executes calls and reports results back.
 *
 * @param tools - The tool descriptors.
 * @returns The AI SDK tool set.
 */
function toToolSet(tools: readonly AIToolDescriptor[]): ToolSet {
    const set: ToolSet = {};
    for (const tool of tools) {
        set[tool.name] = {
            ...(tool.description === undefined ? {} : { description: tool.description }),
            inputSchema: jsonSchema(tool.inputSchema),
        };
    }
    return set;
}

/**
 * Normalizes a provider tool call into the shared call shape.
 *
 * @param part - The AI SDK tool-call part.
 * @returns The provider-neutral call.
 */
function toToolCall(part: {
    readonly toolCallId: string;
    readonly toolName: string;
    readonly input: unknown;
}): AIToolCall {
    return {
        id: part.toolCallId,
        name: part.toolName,
        input: asInput(part.input),
    };
}

/**
 * Coerces provider-supplied input to an arguments object. Providers normally
 * emit an object; a non-object value is preserved under `value` rather than
 * dropped.
 *
 * @param input - The decoded provider input.
 * @returns The arguments object.
 */
function asInput(input: unknown): Record<string, unknown> {
    return typeof input === 'object' && input !== null && !Array.isArray(input)
        ? (input as Record<string, unknown>)
        : { value: input };
}

/**
 * Serializes a tool result for an AI SDK tool message. Non-JSON values fall
 * back to text so a tool returning `undefined` or a class instance cannot
 * break the next model call.
 *
 * @param output - The tool handler result.
 * @returns The AI SDK tool-result output.
 */
function toToolOutput(output: unknown): { type: 'json'; value: JSONValue } | { type: 'text'; value: string } {
    try {
        const value = JSON.parse(JSON.stringify(output ?? null)) as JSONValue;
        return { type: 'json', value };
    } catch {
        return { type: 'text', value: String(output) };
    }
}

/**
 * Maps an AI SDK finish reason to the shared union. Unknown providers fall back
 * to `'other'` rather than passing an arbitrary value through to callers.
 *
 * @param reason - The AI SDK finish reason.
 * @returns The provider-neutral finish reason.
 */
function asFinishReason(reason: string): AIFinishReason {
    const knownFinishReasons: Record<string, true> = {
        'end-turn': true,
        'max-output-tokens': true,
        'max-steps': true,
        'max-token-limit': true,
        'no-step-result': true,
        'other-error': true,
        'provider-error': true,
        'stop-sequence': true,
        'content-filter': true,
        stop: true,
        length: true,
        toolCall: true,
        'tool-calls': true,
        error: true,
        other: true,
        unknown: true,
        none: true,
        abort: true,
        'unexpected-error': true,
        'rate-limit': true,
        'request-continued': true,
        'response-cancelled': true,
    };

    return knownFinishReasons[reason] === true ? (reason as AIFinishReason) : 'other';
}

/**
 * Maps AI SDK usage counters to the shared shape.
 *
 * @param usage - The AI SDK usage record.
 * @returns The provider-neutral usage.
 */
function asUsage(usage: {
    readonly inputTokens?: number | undefined;
    readonly outputTokens?: number | undefined;
    readonly totalTokens?: number | undefined;
}): AITokenUsage {
    return {
        ...(usage.inputTokens === undefined ? {} : { inputTokens: usage.inputTokens }),
        ...(usage.outputTokens === undefined ? {} : { outputTokens: usage.outputTokens }),
        ...(usage.totalTokens === undefined ? {} : { totalTokens: usage.totalTokens }),
    };
}
