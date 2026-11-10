/**
 * Agent loop behavior: multi-step tool execution, bounds, policy gates,
 * streaming events, structured output, and GenAI telemetry.
 */
import { trace } from '@opentelemetry/api';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
    AIAgent,
    AIModelDisabledError,
    AIRateLimitError,
    type AIMessage,
    type AIModel,
    type AIModelInfo,
    type AIObjectRequest,
    type AIObjectResult,
    type AIStepRequest,
    type AIStepResult,
    type AIStepStream,
    type AIStepStreamEvent,
    type AIToolCall,
    type AIToolSource,
} from '../src';
import { toServerSentEvents } from '../src';

const INFO: AIModelInfo = { provider: 'test', model: 'scripted' };

function step(text: string, toolCalls: readonly AIToolCall[] = []): AIStepResult {
    return {
        text,
        toolCalls,
        finishReason: toolCalls.length === 0 ? 'stop' : 'tool-calls',
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    };
}

class ScriptedModel implements AIModel {
    readonly info = INFO;
    readonly steps: AIStepResult[];
    readonly requests: AIStepRequest[] = [];
    objectResult: unknown = { answer: 'ok' };

    constructor(steps: readonly AIStepResult[]) {
        this.steps = [...steps];
    }

    async generateStep(request: AIStepRequest): Promise<AIStepResult> {
        this.requests.push(request);
        return this.steps.shift() ?? step('fallback');
    }

    async *streamStep(request: AIStepRequest): AIStepStream {
        this.requests.push(request);
        const settled = this.steps.shift() ?? step('fallback');
        if (settled.text.length > 0) {
            yield { type: 'text-delta', text: settled.text } satisfies AIStepStreamEvent;
        }
        for (const call of settled.toolCalls) {
            yield { type: 'tool-call', call } satisfies AIStepStreamEvent;
        }
        return settled;
    }

    async generateObject<T>(request: AIObjectRequest<T>): Promise<AIObjectResult<T>> {
        return {
            object: request.schema.parse(this.objectResult),
            finishReason: 'stop',
            usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
        };
    }
}

class FakeTools implements AIToolSource {
    readonly calls: Array<{ name: string; args: Record<string, unknown> | undefined; callId: string | undefined }> = [];
    readonly fail: boolean;

    constructor(fail = false) {
        this.fail = fail;
    }

    listTools(): Promise<readonly { name: string; description?: string; inputSchema: Record<string, unknown> }[]> {
        return Promise.resolve([{ name: 'lookup', description: 'Looks up a value', inputSchema: { type: 'object' } }]);
    }

    call(name: string, args?: Record<string, unknown>, context?: { callId?: string }): Promise<unknown> {
        this.calls.push({ name, args, callId: context?.callId });
        if (this.fail) {
            return Promise.reject(new Error('lookup failed'));
        }
        return Promise.resolve({ found: args?.['id'] ?? null });
    }
}

const CALL: AIToolCall = { id: 'call-1', name: 'lookup', input: { id: 'a' } };

describe('AIAgent', () => {
    it('executes tool calls and feeds results back until the model stops', async () => {
        const model = new ScriptedModel([step('', [CALL]), step('the answer')]);
        const tools = new FakeTools();
        const agent = new AIAgent({ model, tools });

        const result = await agent.run({
            messages: [
                { role: 'system', content: 'be brief' },
                { role: 'user', content: 'find a' },
            ],
        });

        expect(result.text).toBe('the answer');
        expect(result.finishReason).toBe('stop');
        expect(result.steps).toBe(2);
        expect(result.usage).toEqual({ inputTokens: 20, outputTokens: 10, totalTokens: 30 });
        expect(result.toolCalls).toEqual([CALL]);
        expect(result.toolResults).toEqual([{ callId: 'call-1', name: 'lookup', output: { found: 'a' } }]);
        expect(tools.calls).toEqual([{ name: 'lookup', args: { id: 'a' }, callId: 'call-1' }]);
        expect(result.messages.map((message) => message.role)).toEqual([
            'system',
            'user',
            'assistant',
            'tool',
            'assistant',
        ]);
        expect(model.requests[0]?.tools).toEqual([
            { name: 'lookup', description: 'Looks up a value', inputSchema: { type: 'object' } },
        ]);
    });

    it('reports handler failures back to the model instead of aborting the run', async () => {
        const model = new ScriptedModel([step('', [CALL]), step('recovered')]);
        const agent = new AIAgent({ model, tools: new FakeTools(true) });

        const result = await agent.run({ messages: [{ role: 'user', content: 'find a' }] });

        expect(result.text).toBe('recovered');
        expect(result.toolResults[0]?.output).toEqual({ error: 'lookup failed' });
    });

    it('feeds unknown tools back when no source is configured', async () => {
        const model = new ScriptedModel([step('', [CALL]), step('no tools')]);
        const agent = new AIAgent({ model });

        const result = await agent.run({ messages: [{ role: 'user', content: 'find a' }] });

        expect(result.toolResults[0]?.output).toEqual({ error: "no tool source exposes 'lookup'" });
    });

    it('stops at maxSteps and marks the finish reason', async () => {
        const model = new ScriptedModel([
            step('', [{ id: 'c1', name: 'lookup', input: {} }]),
            step('', [{ id: 'c2', name: 'lookup', input: {} }]),
            step('never reached'),
        ]);
        const agent = new AIAgent({ model, tools: new FakeTools(), maxSteps: 2 });

        const result = await agent.run({ messages: [{ role: 'user', content: 'loop' }] });

        expect(result.steps).toBe(2);
        expect(result.finishReason).toBe('max-steps');
        expect(result.toolResults).toHaveLength(2);
        expect(model.requests).toHaveLength(2);
    });

    it('rejects a non-positive maxSteps', () => {
        expect(() => new AIAgent({ model: new ScriptedModel([]), maxSteps: 0 })).toThrow(/positive integer/u);
    });

    it('refuses calls when the rollout flag is off', async () => {
        const model = new ScriptedModel([]);
        const agent = new AIAgent({
            model,
            rollout: {
                key: 'ai.chat',
                evaluator: {
                    kind: 'test',
                    evaluate: (() =>
                        Promise.resolve({
                            value: false,
                            reason: 'STATIC',
                        })) as import('@ndigo/flags').FlagEvaluator['evaluate'],
                },
            },
        });

        await expect(agent.run({ messages: [{ role: 'user', content: 'hi' }] })).rejects.toBeInstanceOf(
            AIModelDisabledError
        );
        expect(model.requests).toHaveLength(0);
    });

    it('refuses calls when the rate limit is exhausted', async () => {
        const model = new ScriptedModel([]);
        const agent = new AIAgent({
            model,
            rateLimit: {
                policy: { limit: 1, windowMs: 60_000 },
                limiter: {
                    kind: 'test',
                    consume: () => Promise.resolve({ allowed: false, retryAfterMs: 2500 }),
                },
            },
        });

        const error = await agent.run({ messages: [{ role: 'user', content: 'hi' }] }).catch((caught) => caught);
        expect(error).toBeInstanceOf(AIRateLimitError);
        expect((error as AIRateLimitError).retryAfterMs).toBe(2500);
        expect(model.requests).toHaveLength(0);
    });

    it('streams text, tool calls, results, and a finish event', async () => {
        const model = new ScriptedModel([step('partial ', [CALL]), step('final')]);
        const agent = new AIAgent({ model, tools: new FakeTools() });

        const iterator = agent.stream({ messages: [{ role: 'user', content: 'go' }] });
        const events = [];
        let settled: unknown;
        while (true) {
            // eslint-disable-next-line no-await-in-loop -- stream events are consumed in order
            const next = await iterator.next();
            if (next.done) {
                settled = next.value;
                break;
            }
            events.push(next.value);
        }

        expect(events.map((event) => event.type)).toEqual([
            'text-delta',
            'tool-call',
            'tool-result',
            'text-delta',
            'finish',
        ]);
        expect(settled).toMatchObject({ text: 'partial \nfinal', finishReason: 'stop', steps: 2 });
    });

    it('frames agent events as SSE envelopes', async () => {
        const model = new ScriptedModel([step('hello')]);
        const agent = new AIAgent({ model });
        const frames = [];
        for await (const frame of toServerSentEvents(agent.stream({ messages: [{ role: 'user', content: 'hi' }] }))) {
            frames.push(frame);
        }

        expect(frames.map((frame) => frame.event)).toEqual(['text-delta', 'finish']);
        expect(frames[0]?.data).toEqual({ type: 'text-delta', text: 'hello' });
    });

    it('generates a schema-validated object through the model', async () => {
        const model = new ScriptedModel([]);
        const agent = new AIAgent({ model });
        const result = await agent.object({
            schema: z.object({ answer: z.string() }),
            messages: [{ role: 'user', content: 'answer' }],
        });

        expect(result.object).toEqual({ answer: 'ok' });
        expect(result.usage).toEqual({ inputTokens: 1, outputTokens: 2, totalTokens: 3 });
    });

    it('records one GenAI span with request and usage attributes', async () => {
        const exporter = new InMemorySpanExporter();
        const provider = new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(exporter)] });
        trace.setGlobalTracerProvider(provider);
        try {
            const model = new ScriptedModel([step('hi')]);
            const agent = new AIAgent({ model });
            const messages: AIMessage[] = [{ role: 'user', content: 'hello' }];
            await agent.run({ messages, temperature: 0.2, maxOutputTokens: 100 });

            const spans = exporter.getFinishedSpans();
            const span = spans.find((candidate) => candidate.name === 'chat scripted');
            expect(span?.attributes['gen_ai.operation.name']).toBe('chat');
            expect(span?.attributes['gen_ai.provider.name']).toBe('test');
            expect(span?.attributes['gen_ai.request.model']).toBe('scripted');
            expect(span?.attributes['gen_ai.request.temperature']).toBe(0.2);
            expect(span?.attributes['gen_ai.request.max_tokens']).toBe(100);
            expect(span?.attributes['gen_ai.usage.input_tokens']).toBe(10);
            expect(span?.attributes['gen_ai.usage.output_tokens']).toBe(5);
            expect(span?.attributes['gen_ai.response.finish_reasons']).toEqual(['stop']);
        } finally {
            await provider.shutdown();
        }
    });
});
