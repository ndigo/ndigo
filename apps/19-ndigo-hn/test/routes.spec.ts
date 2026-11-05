/**
 * Route wiring through the real browser pipeline: `BrowserDispatcher` → handler
 * mapping → argument binding → view resolution, with only the HN API stubbed.
 *
 * Covers the feed routes and the `#/item/:id` deep link (including its
 * cache-backed second dispatch).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { configuration, entry } from '@ndigo/context';
import { bootBrowserApp, BrowserMockClient } from '@ndigo/test';
import '../src/views/hn-item';
import '../src/views/hn-list';
import ItemController from '../src/controllers/item-controller';
import ListController from '../src/controllers/list-controller';
import { HN_API, HN_SERVICE } from '../src/app/hn-tokens';
import { createHnApiClient, type HNAPI } from '../src/api/hn-api';
import { HnService } from '../src/services/hn-service';
import type { ItemModel, ListModel } from '../src/views/models';
import { HN_TEST_BASE, commentItem, createHnServer, storyItem } from './support/hn-fixtures';

const server = createHnServer({
    feeds: { top: [1, 2], new: [3] },
    items: { 1: storyItem(1, { kids: [11] }), 2: storyItem(2), 3: storyItem(3), 11: commentItem(11, 1) },
});

// Built after the stub server starts so the client captures the msw-patched
// `fetch`; the configuration reads them through this closure at dispatch time.
let api: HNAPI;
let service: HnService;

@configuration
class HnTestConfiguration {
    @entry(HN_API)
    hnApi() {
        return api;
    }

    @entry(HN_SERVICE)
    hnService() {
        return service;
    }

    @entry()
    listController() {
        return new ListController();
    }

    @entry()
    itemController() {
        return new ItemController();
    }
}

let browser: BrowserMockClient;
let close: () => void;

beforeAll(async () => {
    server.server.listen({ onUnhandledFrame: 'error' });
    api = createHnApiClient({ base: HN_TEST_BASE });
    service = new HnService(api);
    const app = await bootBrowserApp([HnTestConfiguration]);
    browser = new BrowserMockClient(app);
    close = app.close;
});

beforeEach(() => {
    localStorage.clear();
    server.requests.length = 0;
    server.itemRequests.length = 0;
});

afterAll(() => {
    close();
    server.server.close();
});

describe('HN route table', () => {
    test('#/ resolves the top feed into hn-list', async () => {
        const render = await browser.dispatch('/');
        const output = render.output as HTMLElement;
        expect(output.tagName.toLowerCase()).toBe('hn-list');
        expect((render.model as ListModel).feed).toBe('top');
        expect(output.textContent).toContain('Top stories');
        expect(output.textContent).toContain('Story 1');
    });

    test('#/new resolves the new feed', async () => {
        const render = await browser.dispatch('/new');
        expect((render.model as ListModel).feed).toBe('new');
        expect((render.output as HTMLElement).textContent).toContain('Story 3');
    });

    test('#/item/:id binds the id and renders the thread with its comments', async () => {
        const render = await browser.dispatch('/item/1');
        const output = render.output as HTMLElement;
        expect(output.tagName.toLowerCase()).toBe('hn-item');
        expect((render.model as ItemModel).id).toBe(1);
        expect(output.textContent).toContain('Story 1');
        expect(output.textContent).toContain('Comment 11');
    });

    test('a repeated deep link is served from resident state, not refetched', async () => {
        await browser.dispatch('/item/1');
        const afterFirst = server.itemRequests.filter((id) => id === 1).length;
        await browser.dispatch('/item/1');
        expect(server.itemRequests.filter((id) => id === 1)).toHaveLength(afterFirst);
    });
});
