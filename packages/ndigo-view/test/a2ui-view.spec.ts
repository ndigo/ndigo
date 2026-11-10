/**
 * `A2UIView`: media type, serialization contract, resolver, and negotiation.
 */
import { MediaType, MediaTypes } from '@ndigo/core';
import type { Route } from '@ndigo/router';
import { describe, expect, it } from 'vitest';
import { A2UIView, a2uiViewResolver } from '../src/a2ui-view';
import {
    ContentNegotiationManager,
    ContentNegotiationViewResolver,
    PathExtensionContentNegotiationStrategy,
} from '../src/content-negotiation-view-resolver';
import { JSONView } from '../src/json-view';
import type { View } from '../src/view';
import type { ViewResolver } from '../src/view-resolver';

const MESSAGES = [
    { version: '1.0', createSurface: { surfaceId: 'orders', catalogId: 'ndigo-ui' } },
    {
        version: '1.0',
        updateComponents: {
            surfaceId: 'orders',
            components: [{ id: 'root', component: 'AppShell' }],
        },
    },
];

const staticResolver = (view: View): ViewResolver => ({ resolveViewName: async () => view });

const requireMediaType = (value: MediaType | null): MediaType => {
    if (value === null) throw new Error('expected a registered media type');
    return value;
};

describe('A2UIView', () => {
    it('declares the application/a2ui+json media type', () => {
        expect(new A2UIView().mediaType?.toString()).toContain('application/a2ui+json');
    });

    it('serializes the message array', async () => {
        const view = new A2UIView();
        const result = await view.renderTo(MESSAGES, {} as unknown as Route); // renderTo ignores the route
        expect(result.body).toBe(JSON.stringify(MESSAGES));
        expect(result.mediaType?.toString()).toContain('application/a2ui+json');
    });

    it('rejects a non-array payload', async () => {
        await expect(new A2UIView().renderTo({ message: 'not-an-array' }, {} as unknown as Route)).rejects.toThrow(
            /array of A2UI messages/u
        );
    });

    it('resolves only its configured view name', async () => {
        const resolver = a2uiViewResolver();
        expect(await resolver.resolveViewName('a2ui')).toBeInstanceOf(A2UIView);
        expect(await resolver.resolveViewName('report')).toBeNull();
    });

    it('wins negotiation for .a2ui and falls back to JSON otherwise', async () => {
        const resolver = new ContentNegotiationViewResolver(
            new ContentNegotiationManager([
                new PathExtensionContentNegotiationStrategy(
                    new Map([
                        ['a2ui', requireMediaType(MediaTypes.APPLICATION_A2UI_JSON)],
                        ['json', requireMediaType(MediaTypes.APPLICATION_JSON)],
                    ])
                ),
            ])
        );
        resolver.viewResolvers = [a2uiViewResolver('report'), staticResolver(new JSONView())];

        expect(await resolver.resolveViewName('report', '', { path: '/report.a2ui' })).toBeInstanceOf(A2UIView);
        expect(await resolver.resolveViewName('report', '', { path: '/report.json' })).toBeInstanceOf(JSONView);
    });
});
