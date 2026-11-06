
import { describe, expect, test } from 'vitest';
import { MediaTypes, type MediaType } from '@ndigo/core';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import type { Route } from '@ndigo/router';
import { ContentNegotiationManager, ContentNegotiationViewResolver, type View, type ViewResolver } from '@ndigo/view';
import { AbstractDispatcher } from '../src/dispatcher';
import { ModelAndView } from '../src/model-and-view';

/** Reads the `Accept` header a route double carries, without trusting its shape. */
const acceptOf = (request: unknown): unknown => {
    if (request !== null && typeof request === 'object' && 'headers' in request) {
        const headers = request.headers;
        if (headers !== null && typeof headers === 'object' && 'accept' in headers) {
            return headers.accept;
        }
    }
    return undefined;
};

/** A view that records the path of the route it rendered, tagged with its own media type. */
const recordingView = (mediaType: MediaType, rendered: Record<string, MediaType>): View => ({
    mediaType,
    render(_model: unknown, route: unknown) {
        if (route !== null && typeof route === 'object' && 'path' in route && typeof route.path === 'string') {
            rendered[route.path] = mediaType;
        }
    },
});

/** A delegate resolver that parks on the shared gate, then returns its view. */
const parkedResolver = (viewToReturn: View, gate: Promise<void>): ViewResolver => ({
    async resolveViewName() {
        await gate;
        return viewToReturn;
    },
});

describe('AbstractDispatcher interleaved content negotiation', () => {
    test("one request's Accept header does not leak into another in-flight dispatch", async () => {
        const rendered: Record<string, MediaType> = {};
        const html = recordingView(MediaTypes.TEXT_HTML, rendered);
        const json = recordingView(MediaTypes.APPLICATION_JSON, rendered);

        // Both dispatches park inside the negotiation resolver's candidate
        // aggregation until this gate opens, forcing the negotiation passes
        // (the reads of per-request data) to interleave.
        let openGate!: () => void;
        const gate = new Promise<void>((resolve) => {
            openGate = resolve;
        });

        const negotiation = new ContentNegotiationViewResolver({
            resolveMediaTypes: (request: unknown) =>
                acceptOf(request) === 'text/html' ? [MediaTypes.TEXT_HTML] : [MediaTypes.APPLICATION_JSON],
        } as unknown as ContentNegotiationManager);
        negotiation.viewResolvers = [parkedResolver(html, gate), parkedResolver(json, gate)];

        const dispatcher = new AbstractDispatcher();
        dispatcher.viewResolvers = [negotiation];
        dispatcher.applicationContext = new MetadataConfigApplicationContext('negotiation-interleave');

        const htmlRoute = { path: '/html', headers: { accept: 'text/html' } } as unknown as Route;
        const jsonRoute = { path: '/json', headers: { accept: 'application/json' } } as unknown as Route;

        const first = dispatcher.render(new ModelAndView('page'), htmlRoute);
        const second = dispatcher.render(new ModelAndView('other'), jsonRoute);
        openGate();
        await Promise.all([first, second]);

        expect(rendered['/html']).toBe(MediaTypes.TEXT_HTML);
        expect(rendered['/json']).toBe(MediaTypes.APPLICATION_JSON);
    });
});
