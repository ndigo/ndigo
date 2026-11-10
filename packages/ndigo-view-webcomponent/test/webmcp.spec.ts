// @vitest-environment jsdom
/**
 * WebMCP declaration: registration, element lifecycle, and handler projection.
 */
import { parameters, queryValue, validatedBy } from '@ndigo/dispatcher';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AsWebMcpElement, declareWebMcpTool, provideWebMcpTools, webMcpToolForHandler } from '../src/webmcp';
import type { WebMcpTool } from '../src/webmcp';

interface RegisterOptions {
    readonly signal?: AbortSignal;
    readonly exposedTo?: readonly string[];
}

const registered = new Map<string, RegisterOptions>();

function installFakeContext(): void {
    const context = {
        async registerTool(tool: { name: string }, options?: RegisterOptions): Promise<void> {
            registered.set(tool.name, options ?? {});
            options?.signal?.addEventListener('abort', () => registered.delete(tool.name));
        },
    };
    Object.defineProperty(document, 'modelContext', { configurable: true, value: context });
}

const ECHO: WebMcpTool = {
    name: 'echo',
    description: 'Echo a value.',
    inputSchema: { type: 'object', properties: { value: { type: 'string' } } },
    execute: (args) => args['value'],
};

afterEach(() => {
    Reflect.deleteProperty(document, 'modelContext');
    registered.clear();
    document.body.innerHTML = '';
});

describe('provideWebMcpTools', () => {
    it('registers tools and unregisters them when disposed', async () => {
        installFakeContext();
        const registration = await provideWebMcpTools([ECHO, { ...ECHO, name: 'echo_two' }]);

        expect(registration.supported).toBe(true);
        expect([...registered.keys()]).toEqual(['echo', 'echo_two']);

        registration.dispose();
        expect(registered.size).toBe(0);
    });

    it('is a no-op when the browser lacks WebMCP', async () => {
        const registration = await provideWebMcpTools([ECHO]);
        expect(registration.supported).toBe(false);
        expect(() => registration.dispose()).not.toThrow();
    });

    it('declares one tool with its exposed origins', async () => {
        installFakeContext();
        const registration = await declareWebMcpTool({ ...ECHO, exposedTo: ['https://example.test'] });
        expect(registration.supported).toBe(true);
        expect(registered.get('echo')?.exposedTo).toEqual(['https://example.test']);
    });
});

describe('AsWebMcpElement', () => {
    it('registers on connect and aborts on disconnect', async () => {
        installFakeContext();
        class TestToolElement extends AsWebMcpElement(HTMLElement) {
            override webMcpTools(): readonly WebMcpTool[] {
                return [ECHO];
            }
        }
        customElements.define('test-webmcp-element', TestToolElement);

        const element = document.createElement('test-webmcp-element');
        document.body.append(element);
        await new Promise<void>((resolve) => setTimeout(resolve, 0));

        expect(registered.has('echo')).toBe(true);
        element.remove();
        expect(registered.has('echo')).toBe(false);
    });
});

describe('webMcpToolForHandler', () => {
    class Controller {
        @parameters({ query: validatedBy(z.string().min(2), queryValue('query')) })
        search(query: string): string {
            return query;
        }
    }

    it('projects the validatedBy schema and validates at execution', async () => {
        const tool = webMcpToolForHandler({
            handler: new Controller(),
            method: 'search',
            name: 'search',
            description: 'Search the catalogue.',
            readOnly: true,
        });

        expect(tool.inputSchema).toEqual({
            type: 'object',
            properties: { query: { type: 'string', minLength: 2 } },
        });
        expect(tool.annotations).toEqual({ readOnlyHint: true });
        expect(await tool.execute({ query: 'books' }, { signal: new AbortController().signal })).toBe('books');
        const untrusted: unknown = { query: 'x' };
        await expect(
            Promise.resolve().then(() =>
                tool.execute(untrusted as unknown as Record<string, unknown>, { signal: new AbortController().signal })
            )
        ).rejects.toThrow();
    });
});
