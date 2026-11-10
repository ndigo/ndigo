/**
 * The agent loop: drives a provider-neutral model, executes the tools the
 * model requests through an {@link AiToolSource}, and records one GenAI span
 * per run. Tool execution is deliberately outside the adapter so every
 * provider gets the same loop, telemetry, limits, and error handling.
 */
import { context, SpanStatusCode, trace, type Attributes, type Span } from '@opentelemetry/api';
import type { FlagEvaluator } from '@ndigo/flags';
import type { RateLimitPolicy, RateLimiter } from '@ndigo/rate-limit';
import { AiModelDisabledError, AiRateLimitError } from './errors';
import type { AiFinishReason, AiMessage, AiTokenUsage, AiToolCall, AiToolResult } from './messages';
import type { AiModel, AiObjectRequest, AiObjectResult, AiStepRequest, AiStepResult } from './model';
import type { AiToolDescriptor, AiToolSource } from './tools';

/**
 * Per-run rate-limit policy. The limiter is the shared `@ndigo/rate-limit`
 * backend; the key defaults to `provider:model`.
 */
export interface AiRateLimitOptions {
    /** The shared rate-limiter backend. */
    readonly limiter: RateLimiter;
    /** The window and request budget. */
    readonly policy: RateLimitPolicy;
    /** Override the counter key (defaults to `provider:model`). */
    readonly key?: string;
}

/**
 * Model-rollout gate. The flag is evaluated as a boolean with a `false`
 * default, so a broken or missing flag disables the model (fail closed).
 */
export interface AiRolloutOptions {
    /** The feature-flag evaluator. */
    readonly evaluator: FlagEvaluator;
    /** The flag key that must evaluate to `true`. */
    readonly key: string;
}

/**
 * Agent construction options.
 */
export interface AiAgentOptions {
    /** The provider-neutral model. */
    readonly model: AiModel;
    /** The tool source; omit for a chat-only agent. */
    readonly tools?: AiToolSource;
    /** Maximum model calls per run; defaults to `8`. */
    readonly maxSteps?: number;
    /** Optional per-model rate limit. */
    readonly rateLimit?: AiRateLimitOptions;
    /** Optional model-rollout flag. */
    readonly rollout?: AiRolloutOptions;
}

/**
 * One agent run request.
 */
export interface AiRunRequest {
    /** The conversation, typically system + user messages. */
    readonly messages: readonly AiMessage[];
    /** Sampling temperature, when the provider supports it. */
    readonly temperature?: number;
    /** Output-token cap, when the provider supports it. */
    readonly maxOutputTokens?: number;
    /** Cancels the run and the in-flight provider call. */
    readonly signal?: AbortSignal;
}

/**
 * The settled result of a run.
 */
export interface AiRunResult {
    /** Assistant text from the final step. */
    readonly text: string;
    /** The full conversation, including assistant tool calls and results. */
    readonly messages: readonly AiMessage[];
    /** Every tool call the model requested, in order. */
    readonly toolCalls: readonly AiToolCall[];
    /** Every tool execution, in call order. */
    readonly toolResults: readonly AiToolResult[];
    /** Why the run ended. `max-steps` means the loop hit its bound. */
    readonly finishReason: AiFinishReason;
    /** Summed token usage across all steps. */
    readonly usage: AiTokenUsage;
    /** Number of model calls made. */
    readonly steps: number;
}

/**
 * Incremental events from {@link AiAgent.stream}.
 */
export type AiStreamEvent =
    | { readonly type: 'text-delta'; readonly text: string }
    | { readonly type: 'tool-call'; readonly call: AiToolCall }
    | { readonly type: 'tool-result'; readonly result: AiToolResult }
    | { readonly type: 'finish'; readonly result: AiRunResult };

/**
 * The streaming run handle: an async generator of events whose return value
 * is the settled {@link AiRunResult}.
 */
export type AiAgentStream = AsyncGenerator<AiStreamEvent, AiRunResult, void>;

const DEFAULT_MAX_STEPS = 8;

/**
 * Drives one model through a bounded tool-calling loop.
 */
export class AiAgent {
    readonly #model: AiModel;
    readonly #tools: AiToolSource | undefined;
    readonly #maxSteps: number;
    readonly #rateLimit: AiRateLimitOptions | undefined;
    readonly #rollout: AiRolloutOptions | undefined;

    /**
     * @param options - The model, optional tool source, and policy.
     * @throws When `maxSteps` is not a positive integer.
     */
    constructor(options: AiAgentOptions) {
        const maxSteps = options.maxSteps ?? DEFAULT_MAX_STEPS;
        if (!Number.isInteger(maxSteps) || maxSteps < 1) {
            throw new TypeError(`AiAgent maxSteps must be a positive integer — got ${String(maxSteps)}`);
        }
        this.#model = options.model;
        this.#tools = options.tools;
        this.#maxSteps = maxSteps;
        this.#rateLimit = options.rateLimit;
        this.#rollout = options.rollout;
    }

    /**
     * The model identity this agent drives.
     */
    get modelInfo(): AiModel['info'] {
        return this.#model.info;
    }

    /**
     * Runs the tool loop to completion.
     *
     * @param request - The conversation and sampling options.
     * @returns The settled run result.
     */
    async run(request: AiRunRequest): Promise<AiRunResult> {
        await this.#enforcePolicy();
        const tools = await this.#toolDefinitions();
        return this.#withSpan('chat', request, async (span) => {
            const messages: AiMessage[] = [...request.messages];
            const toolCalls: AiToolCall[] = [];
            const toolResults: AiToolResult[] = [];
            let text = '';
            let finishReason: AiFinishReason = 'other';
            let usage: AiTokenUsage = {};
            let steps = 0;

            while (steps < this.#maxSteps) {
                steps += 1;
                // eslint-disable-next-line no-await-in-loop -- each step depends on the previous tool results
                const step = await this.#model.generateStep(this.#stepRequest(messages, tools, request));
                text = step.text;
                finishReason = step.finishReason;
                usage = addUsage(usage, step.usage);
                appendAssistant(messages, step);
                toolCalls.push(...step.toolCalls);

                if (step.toolCalls.length === 0) {
                    break;
                }

                for (const call of step.toolCalls) {
                    // eslint-disable-next-line no-await-in-loop -- tool results must be appended in call order
                    const result = await this.#execute(call);
                    toolResults.push(result);
                    messages.push({ role: 'tool', toolCallId: call.id, name: call.name, output: result.output });
                }

                if (steps === this.#maxSteps) {
                    finishReason = 'max-steps';
                    break;
                }
            }

            setUsageAttributes(span, usage);
            span.setAttribute('gen_ai.response.finish_reasons', [finishReason]);
            return {
                text,
                messages,
                toolCalls,
                toolResults,
                finishReason,
                usage,
                steps,
            };
        });
    }

    /**
     * Streams a run. Text deltas and tool calls arrive as they happen; the
     * generator returns the settled result after the loop.
     *
     * @param request - The conversation and sampling options.
     * @returns The event generator; consume it to completion.
     */
    async *stream(request: AiRunRequest): AiAgentStream {
        await this.#enforcePolicy();
        const tools = await this.#toolDefinitions();
        const span = this.#startSpan('chat', request);
        const spanContext = trace.setSpan(context.active(), span);
        const messages: AiMessage[] = [...request.messages];
        const toolCalls: AiToolCall[] = [];
        const toolResults: AiToolResult[] = [];
        let text = '';
        let finishReason: AiFinishReason = 'other';
        let usage: AiTokenUsage = {};
        let steps = 0;

        try {
            while (steps < this.#maxSteps) {
                steps += 1;
                const stepStream = this.#model.streamStep(this.#stepRequest(messages, tools, request));
                let step: AiStepResult | undefined;
                while (true) {
                    // eslint-disable-next-line no-await-in-loop -- the provider stream is consumed in order
                    const next = await context.with(spanContext, () => stepStream.next());
                    if (next.done) {
                        step = next.value;
                        break;
                    }
                    if (next.value.type === 'text-delta') {
                        yield { type: 'text-delta', text: next.value.text };
                    } else {
                        yield { type: 'tool-call', call: next.value.call };
                    }
                }

                if (step === undefined) {
                    throw new Error('model stream ended without a settled step');
                }

                text = step.text;
                finishReason = step.finishReason;
                usage = addUsage(usage, step.usage);
                appendAssistant(messages, step);
                toolCalls.push(...step.toolCalls);

                if (step.toolCalls.length === 0) {
                    break;
                }

                for (const call of step.toolCalls) {
                    // eslint-disable-next-line no-await-in-loop -- tool results must be appended in call order
                    const result = await context.with(spanContext, () => this.#execute(call));
                    toolResults.push(result);
                    messages.push({ role: 'tool', toolCallId: call.id, name: call.name, output: result.output });
                    yield { type: 'tool-result', result };
                }

                if (steps === this.#maxSteps) {
                    finishReason = 'max-steps';
                    break;
                }
            }

            setUsageAttributes(span, usage);
            span.setAttribute('gen_ai.response.finish_reasons', [finishReason]);
            const result: AiRunResult = { text, messages, toolCalls, toolResults, finishReason, usage, steps };
            yield { type: 'finish', result };
            return result;
        } catch (error) {
            span.recordException(error instanceof Error ? error : String(error));
            span.setStatus({ code: SpanStatusCode.ERROR });
            throw error;
        } finally {
            span.end();
        }
    }

    /**
     * Generates a schema-validated object, without tools.
     *
     * @param request - The Zod schema and conversation.
     * @returns The validated object and usage.
     */
    async object<T>(request: AiObjectRequest<T>): Promise<AiObjectResult<T>> {
        await this.#enforcePolicy();
        return this.#withSpan('chat', request, async (span) => {
            const result = await this.#model.generateObject(request);
            setUsageAttributes(span, result.usage);
            span.setAttribute('gen_ai.response.finish_reasons', [result.finishReason]);
            return result;
        });
    }

    async #enforcePolicy(): Promise<void> {
        if (this.#rollout !== undefined) {
            const evaluation = await this.#rollout.evaluator.evaluate<boolean>(this.#rollout.key, false, {
                targetingKey: this.#model.info.model,
                attributes: { provider: this.#model.info.provider },
            });
            if (!evaluation.value) {
                throw new AiModelDisabledError(this.#rollout.key);
            }
        }

        if (this.#rateLimit !== undefined) {
            const key = this.#rateLimit.key ?? `${this.#model.info.provider}:${this.#model.info.model}`;
            const result = await this.#rateLimit.limiter.consume(key, this.#rateLimit.policy);
            if (!result.allowed) {
                throw new AiRateLimitError(key, result.retryAfterMs);
            }
        }
    }

    async #toolDefinitions(): Promise<readonly AiToolDescriptor[]> {
        return this.#tools === undefined ? [] : this.#tools.listTools();
    }

    #stepRequest(
        messages: readonly AiMessage[],
        tools: readonly AiToolDescriptor[],
        request: AiRunRequest
    ): AiStepRequest {
        return {
            messages,
            tools: tools.length > 0 ? tools : undefined,
            ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
            ...(request.maxOutputTokens === undefined ? {} : { maxOutputTokens: request.maxOutputTokens }),
            ...(request.signal === undefined ? {} : { signal: request.signal }),
        };
    }

    async #execute(call: AiToolCall): Promise<AiToolResult> {
        if (this.#tools === undefined) {
            return { callId: call.id, name: call.name, output: { error: `no tool source exposes '${call.name}'` } };
        }
        try {
            const output = await this.#tools.call(call.name, call.input, { callId: call.id });
            return { callId: call.id, name: call.name, output };
        } catch (error) {
            return {
                callId: call.id,
                name: call.name,
                output: { error: error instanceof Error ? error.message : String(error) },
            };
        }
    }

    #startSpan(operation: string, request: { temperature?: number; maxOutputTokens?: number }): Span {
        const attributes: Attributes = {
            'gen_ai.operation.name': 'chat',
            'gen_ai.provider.name': this.#model.info.provider,
            'gen_ai.request.model': this.#model.info.model,
        };
        if (request.temperature !== undefined) attributes['gen_ai.request.temperature'] = request.temperature;
        if (request.maxOutputTokens !== undefined) attributes['gen_ai.request.max_tokens'] = request.maxOutputTokens;
        return trace.getTracer('@ndigo/ai').startSpan(`${operation} ${this.#model.info.model}`, { attributes });
    }

    async #withSpan<T>(
        operation: string,
        request: { temperature?: number; maxOutputTokens?: number },
        execute: (span: Span) => Promise<T>
    ): Promise<T> {
        const span = this.#startSpan(operation, request);
        return context.with(trace.setSpan(context.active(), span), async () => {
            try {
                return await execute(span);
            } catch (error) {
                span.recordException(error instanceof Error ? error : String(error));
                span.setStatus({ code: SpanStatusCode.ERROR });
                throw error;
            } finally {
                span.end();
            }
        });
    }
}

/**
 * Appends the assistant message for a settled step. Tool-only steps still
 * contribute an assistant message containing their tool calls.
 *
 * @param messages - The conversation to append to.
 * @param step - The settled model step.
 */
function appendAssistant(messages: AiMessage[], step: AiStepResult): void {
    messages.push(
        step.toolCalls.length === 0
            ? { role: 'assistant', content: step.text }
            : { role: 'assistant', content: step.text, toolCalls: step.toolCalls }
    );
}

/**
 * Sums two usage records, ignoring missing counters.
 *
 * @param left - The accumulated usage.
 * @param right - The step usage.
 * @returns The summed usage.
 */
function addUsage(left: AiTokenUsage, right: AiTokenUsage): AiTokenUsage {
    return {
        ...(addToken(left.inputTokens, right.inputTokens) === undefined
            ? {}
            : { inputTokens: addToken(left.inputTokens, right.inputTokens) }),
        ...(addToken(left.outputTokens, right.outputTokens) === undefined
            ? {}
            : { outputTokens: addToken(left.outputTokens, right.outputTokens) }),
        ...(addToken(left.totalTokens, right.totalTokens) === undefined
            ? {}
            : { totalTokens: addToken(left.totalTokens, right.totalTokens) }),
    };
}

/**
 * Adds an optional token counter pair.
 *
 * @param left - The accumulated value.
 * @param right - The step value.
 * @returns The sum, or `undefined` when both are absent.
 */
function addToken(left: number | undefined, right: number | undefined): number | undefined {
    if (left === undefined && right === undefined) return undefined;
    return (left ?? 0) + (right ?? 0);
}

/**
 * Records usage counters on a span, omitting unreported counters.
 *
 * @param span - The run span.
 * @param usage - The summed usage.
 */
function setUsageAttributes(span: Span, usage: AiTokenUsage): void {
    if (usage.inputTokens !== undefined) span.setAttribute('gen_ai.usage.input_tokens', usage.inputTokens);
    if (usage.outputTokens !== undefined) span.setAttribute('gen_ai.usage.output_tokens', usage.outputTokens);
}
