/**
 * AI SDK adapter mapping: step generation, tool declarations, streaming,
 * and structured output.
 */
import { MockLanguageModelV4, convertArrayToReadableStream } from 'ai/test';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AISdkModel, aiSdkModel } from '../src';

const USAGE = {
    inputTokens: { total: 7, noCache: 7, cacheRead: undefined, cacheWrite: undefined },
    outputTokens: { total: 3, text: 3, reasoning: undefined },
};

describe('AISdkModel', () => {
    it('derives identity from the AI SDK model and maps a tool-call step', async () => {
        const model = new MockLanguageModelV4({
            provider: 'mock',
            modelId: 'm1',
            doGenerate: {
                content: [{ type: 'tool-call', toolCallId: 'c1', toolName: 'lookup', input: '{"id":"a"}' }],
                finishReason: { unified: 'tool-calls', raw: 'tool_calls' },
                usage: USAGE,
                warnings: [],
            },
        });
        const adapter = new AISdkModel(model);

        expect(adapter.info).toEqual({ provider: 'mock', model: 'm1' });

        const result = await adapter.generateStep({
            messages: [
                { role: 'system', content: 'be brief' },
                { role: 'user', content: 'find a' },
            ],
            tools: [{ name: 'lookup', description: 'Look up', inputSchema: { type: 'object', properties: {} } }],
            temperature: 0.1,
            maxOutputTokens: 50,
        });

        expect(result.text).toBe('');
        expect(result.toolCalls).toEqual([{ id: 'c1', name: 'lookup', input: { id: 'a' } }]);
        expect(result.finishReason).toBe('tool-calls');
        expect(result.usage).toEqual({ inputTokens: 7, outputTokens: 3, totalTokens: 10 });

        const call = model.doGenerateCalls[0];
        expect(call?.temperature).toBe(0.1);
        expect(call?.maxOutputTokens).toBe(50);
        expect(call?.tools).toEqual([
            {
                type: 'function',
                name: 'lookup',
                description: 'Look up',
                inputSchema: { type: 'object', properties: {} },
            },
        ]);
        expect(call?.prompt.some((message) => message.role === 'user')).toBe(true);
    });

    it('streams text deltas and returns the settled step', async () => {
        const model = new MockLanguageModelV4({
            provider: 'mock',
            modelId: 'm1',
            doStream: {
                stream: convertArrayToReadableStream([
                    { type: 'text-start', id: 't1' },
                    { type: 'text-delta', id: 't1', delta: 'Hel' },
                    { type: 'text-delta', id: 't1', delta: 'lo' },
                    { type: 'tool-call', toolCallId: 'c1', toolName: 'lookup', input: '{"id":"a"}' },
                    {
                        type: 'finish',
                        finishReason: { unified: 'tool-calls', raw: 'tool_calls' },
                        usage: USAGE,
                    },
                ]),
            },
        });
        const adapter = aiSdkModel(model);
        const iterator = adapter.streamStep({ messages: [{ role: 'user', content: 'find a' }] });

        const deltas: string[] = [];
        const calls: unknown[] = [];
        let settled: unknown;
        while (true) {
            // eslint-disable-next-line no-await-in-loop -- stream events are consumed in order
            const next = await iterator.next();
            if (next.done) {
                settled = next.value;
                break;
            }
            if (next.value.type === 'text-delta') deltas.push(next.value.text);
            else calls.push(next.value.call);
        }

        expect(deltas).toEqual(['Hel', 'lo']);
        expect(calls).toEqual([{ id: 'c1', name: 'lookup', input: { id: 'a' } }]);
        expect(settled).toMatchObject({
            text: 'Hello',
            finishReason: 'tool-calls',
            toolCalls: [{ id: 'c1', name: 'lookup', input: { id: 'a' } }],
        });
    });

    it('generates a schema-validated object', async () => {
        const model = new MockLanguageModelV4({
            provider: 'mock',
            modelId: 'm1',
            doGenerate: {
                content: [{ type: 'text', text: '{"answer":"ok"}' }],
                finishReason: { unified: 'stop', raw: 'stop' },
                usage: USAGE,
                warnings: [],
            },
        });
        const adapter = aiSdkModel(model);

        const result = await adapter.generateObject({
            schema: z.object({ answer: z.string() }),
            messages: [{ role: 'user', content: 'answer' }],
        });

        expect(result.object).toEqual({ answer: 'ok' });
        expect(result.finishReason).toBe('stop');
    });
});
