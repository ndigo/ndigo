/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { MediaType, MediaTypes } from '@ndigo/core';
import type { View } from '../src/view';
import type { ViewResolver } from '../src/view-resolver';
import {
    ContentNegotiationManager,
    ContentNegotiationViewResolver,
    PathExtensionContentNegotiationStrategy,
} from '../src/content-negotiation-view-resolver';
import { CSVView } from '../src/csv-view';
import { JSONView } from '../src/json-view';
import { TextView } from '../src/text-view';

/** A delegate resolver that always returns the same view. */
const staticResolver = (viewToReturn: View): ViewResolver => ({
    resolveViewName: async () => viewToReturn,
});

const requireMediaType = (value: MediaType | null): MediaType => {
    if (value === null) {
        throw new Error('expected a registered media type');
    }
    return value;
};

const EXTENSIONS = new Map<string, MediaType>([
    ['json', requireMediaType(MediaTypes.APPLICATION_JSON)],
    ['csv', requireMediaType(MediaTypes.TEXT_CSV)],
    ['txt', requireMediaType(MediaTypes.TEXT_PLAIN)],
    ['html', requireMediaType(MediaTypes.TEXT_HTML)],
]);

describe('representation negotiation with real views', () => {
    const buildResolver = () => {
        const html = new TextView();
        html.mediaType = MediaTypes.TEXT_HTML?.withCharset('UTF-8') ?? null;
        const resolver = new ContentNegotiationViewResolver(
            new ContentNegotiationManager([new PathExtensionContentNegotiationStrategy(EXTENSIONS)])
        );
        resolver.viewResolvers = [
            staticResolver(html),
            staticResolver(new TextView()),
            staticResolver(new CSVView()),
            staticResolver(new JSONView()),
        ];
        return resolver;
    };

    it('selects the CSV representation for a .csv request', async () => {
        const view = await buildResolver().resolveViewName('report', '', { path: '/report.csv' });
        expect(view).toBeInstanceOf(CSVView);
    });

    it('selects the JSON representation for a .json request', async () => {
        const view = await buildResolver().resolveViewName('report', '', { path: '/report.json' });
        expect(view).toBeInstanceOf(JSONView);
    });

    it('selects the text representation for a .txt request', async () => {
        const view = await buildResolver().resolveViewName('report', '', { path: '/report.txt' });
        expect(view).toBeInstanceOf(TextView);
    });

    it('falls back to the first candidate for extensionless requests', async () => {
        const view = await buildResolver().resolveViewName('report', '', { path: '/report' });
        expect(view).toBeInstanceOf(TextView);
    });
});
