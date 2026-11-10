// @vitest-environment jsdom
/**
 * WebMCP demo: the descriptor comes from the same `@parameters` metadata an
 * HTTP route binds, and registration is a no-op in browsers without
 * `document.modelContext`.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { WebMcpDemo } from '../src/components/webmcp/webmcp-demo';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('<nd-webmcp-demo>', () => {
    it('projects the handler metadata into a tool descriptor', () => {
        const element = new WebMcpDemo();
        const [tool] = element.webMcpTools();

        expect(tool?.name).toBe('search_catalogue');
        expect(tool?.annotations?.readOnlyHint).toBe(true);
        expect(tool?.inputSchema).toMatchObject({
            type: 'object',
            properties: { query: { type: 'string', minLength: 2 } },
            required: ['query'],
        });
    });

    it('searches the catalogue', () => {
        const element = new WebMcpDemo();

        expect(element.search('match')).toEqual([{ id: 'tea-3', name: 'Matcha', price: 22 }]);
    });

    it('registers a no-op when the browser has no WebMCP', async () => {
        const element = document.createElement('nd-webmcp-demo') as WebMcpDemo;
        document.body.append(element);
        await new Promise<void>((resolve) => setTimeout(resolve, 0));

        element.remove();
        expect(document.querySelector('nd-webmcp-demo')).toBeNull();
    });
});
