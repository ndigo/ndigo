/**
 * `ToonView`: media type, round-trip contract, resolver, and negotiation —
 * the A2UI view's test shape, with conformance against the same pinned SDK's
 * `decode` (not a mock): the decoder is the spec's referee for `encode`.
 */
import { IllegalStateError, MediaTypes } from '@ndigo/core';
import type { MediaType } from '@ndigo/core';
import type { Route } from '@ndigo/router';
import {
    ContentNegotiationManager,
    ContentNegotiationViewResolver,
    JSONView,
    PathExtensionContentNegotiationStrategy,
} from '@ndigo/view';
import type { View, ViewResolver } from '@ndigo/view';
import { decode } from '@toon-format/toon';
import { describe, expect, it } from 'vitest';
import { encodeToon } from '../src/toon-encode';
import { ToonView, toonViewResolver } from '../src';

/** A delegate resolver that always returns the same view. */
const staticResolver = (view: View): ViewResolver => ({
    resolveViewName: async () => view,
});

const requireMediaType = (value: MediaType | null): MediaType => {
    if (value === null) throw new Error('expected a registered media type');
    return value;
};

const ROUTE = {} as unknown as Route; // renderTo ignores the route

const UNIFORM_ROWS = [
    { id: 'nd-button', type: 'ui', downloads: 1200 },
    { id: 'nd-input', type: 'ui', downloads: 980 },
];

describe('ToonView', () => {
    it('declares the text/toon media type with the utf-8 charset', () => {
        expect(new ToonView().mediaType?.toString()).toContain('text/toon');
        expect(new ToonView().mediaType?.toString()).toContain('charset=UTF-8');
    });

    it('round-trips uniform tabular rows through the reference decoder', async () => {
        const result = await new ToonView().renderTo(UNIFORM_ROWS, ROUTE);

        expect(result.mediaType?.toString()).toContain('text/toon');
        expect(decode(result.body as string)).toEqual(UNIFORM_ROWS);
        // The tabular form: one field header instead of N x key repetition.
        expect(result.body as string).toContain('[2]{id,type,downloads}:');
    });

    it('round-trips nested, scalar, and degenerate payloads', async () => {
        const view = new ToonView();
        const models: unknown[] = [
            { server: { port: 8080 }, profiles: ['production', 'us-east'] },
            [1, 2, 3],
            'scalar',
            {},
        ];
        const results = await Promise.all(models.map((model) => view.renderTo(model, ROUTE)));
        results.forEach((result, index) => {
            expect(decode(result.body as string)).toEqual(models[index]);
        });
    });

    it('round-trips strings with newlines, quotes, and unicode', async () => {
        const model = { note: 'line one\nline "two" — é?' };
        const result = await new ToonView().renderTo(model, ROUTE);
        expect(decode(result.body as string)).toEqual(model);
    });

    it('honors the delimiter option', async () => {
        const result = await new ToonView({ delimiter: '|' }).renderTo(UNIFORM_ROWS, ROUTE);
        expect(decode(result.body as string)).toEqual(UNIFORM_ROWS);
        // The delimiter is honored end to end: the tabular body differs from
        // the comma default (the decoder infers it from the document marker).
        const comma = await new ToonView().renderTo(UNIFORM_ROWS, ROUTE);
        expect(result.body).not.toBe(comma.body);
    });

    it('honors the indentSize option', async () => {
        const model = { outer: { inner: 1 } };
        const result = await new ToonView({ indentSize: 4 }).renderTo(model, ROUTE);
        expect(result.body as string).toContain('    inner: 1');
        // Indentation units are part of the document, so decoding mirrors them.
        expect(decode(result.body as string, { indentSize: 4 })).toEqual(model);
    });

    it('maps a non-encodable model to an IllegalStateError with a bounded message', async () => {
        const circular: Record<string, unknown> = {};
        circular['self'] = circular;

        let caught: unknown;
        try {
            await new ToonView().renderTo(circular, ROUTE);
        } catch (error) {
            caught = error;
        }
        expect(caught).toBeInstanceOf(IllegalStateError);
        const message = (caught as Error).message;
        expect(message).toContain('TOON encoding failed');
        expect(message.length).toBeLessThan(260);
    });

    it('resolves only its configured view name', async () => {
        const resolver = toonViewResolver();
        expect(await resolver.resolveViewName('toon')).toBeInstanceOf(ToonView);
        expect(await resolver.resolveViewName('report')).toBeNull();
    });

    it('produces an options-tuned view per resolution', async () => {
        const resolver = toonViewResolver('report', { delimiter: '|' });
        const view = (await resolver.resolveViewName('report')) as ToonView;
        const result = await view.renderTo(UNIFORM_ROWS, ROUTE);
        expect(decode(result.body as string)).toEqual(UNIFORM_ROWS);
    });
});

describe('toon negotiation (opt-in)', () => {
    it('wins negotiation for a .toon request and falls back to JSON otherwise', async () => {
        const resolver = new ContentNegotiationViewResolver(
            new ContentNegotiationManager([
                new PathExtensionContentNegotiationStrategy(
                    new Map([
                        // The app's own extension map: nothing framework-wired
                        // registers `.toon` (AD-102 D-3).
                        ['toon', requireMediaType(MediaTypes.TEXT_TOON)],
                        ['json', requireMediaType(MediaTypes.APPLICATION_JSON)],
                    ])
                ),
            ])
        );
        // JSON is registered FIRST: without a negotiable Accept hint the
        // resolver serves the first candidate, so registration order is what
        // makes JSON the default for unopinionated clients (AD-102 D-3).
        resolver.viewResolvers = [staticResolver(new JSONView()), toonViewResolver('report')];

        expect(await resolver.resolveViewName('report', '', { path: '/report.toon' })).toBeInstanceOf(ToonView);
        expect(await resolver.resolveViewName('report', '', { path: '/report.json' })).toBeInstanceOf(JSONView);
        // An unopinionated client gets the default: JSON.
        expect(await resolver.resolveViewName('report', '', { path: '/report' })).toBeInstanceOf(JSONView);
        expect(await resolver.resolveViewName('report', '')).toBeInstanceOf(JSONView);
    });

    it('keeps JSON the default when .toon is not in the extension map', async () => {
        const resolver = new ContentNegotiationViewResolver(
            new ContentNegotiationManager([
                new PathExtensionContentNegotiationStrategy(
                    new Map([['json', requireMediaType(MediaTypes.APPLICATION_JSON)]])
                ),
            ])
        );
        // JSON first — a `.toon` address, unregistered here because the app's
        // extension map contains only JSON, keeps extending to the default
        // JSON representation (AD-102 D-3: no framework extension wiring).
        resolver.viewResolvers = [staticResolver(new JSONView()), toonViewResolver('report')];

        expect(await resolver.resolveViewName('report', '', { path: '/report' })).toBeInstanceOf(JSONView);
    });
});

describe('encodeToon', () => {
    it('matches the view serialize output', async () => {
        const result = await new ToonView().renderTo(UNIFORM_ROWS, ROUTE);
        expect(encodeToon(UNIFORM_ROWS)).toBe(result.body);
    });
});
