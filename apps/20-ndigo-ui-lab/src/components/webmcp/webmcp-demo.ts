/**
 * WebMCP demo: the same handler metadata an HTTP route binds is projected into
 * a browser tool. `AsWebMcpElement` registers on connect and aborts on
 * disconnect; browsers without `document.modelContext` get a no-op
 * registration, so the element ships everywhere.
 */
import '@tsmetadata/polyfill';
import { parameters, queryValue, validatedBy } from '@ndigo/dispatcher';
import { AsWebMcpElement, type WebMcpTool, webMcpToolForHandler } from '@ndigo/view-webcomponent';
import { z } from 'zod';
import { defineElement, NdElement } from '@/lib/base-element';

/**
 * One catalogue row.
 */
interface CatalogueItem {
    readonly id: string;
    readonly name: string;
    readonly price: number;
}

const CATALOGUE: readonly CatalogueItem[] = [
    { id: 'tea-1', name: 'Sencha', price: 12 },
    { id: 'tea-2', name: 'Hojicha', price: 14 },
    { id: 'tea-3', name: 'Matcha', price: 22 },
];

/**
 * `<nd-webmcp-demo>` exposes a catalogue search as a WebMCP tool.
 */
export class WebMcpDemo extends AsWebMcpElement(NdElement) {
    /**
     * Searches the catalogue by name.
     *
     * @param query - The search text (at least two characters).
     * @returns The matching rows.
     */
    @parameters({ query: validatedBy(z.string().min(2), queryValue('query', { required: true })) })
    search(query: string): readonly CatalogueItem[] {
        const needle = query.toLowerCase();
        return CATALOGUE.filter((item) => item.name.toLowerCase().includes(needle));
    }

    /**
     * @returns The tools this element registers while connected.
     */
    override webMcpTools(): readonly WebMcpTool[] {
        return [
            webMcpToolForHandler({
                handler: this,
                method: 'search',
                name: 'search_catalogue',
                description: 'Search the tea catalogue by name.',
                readOnly: true,
            }),
        ];
    }
}

defineElement('nd-webmcp-demo', WebMcpDemo);
