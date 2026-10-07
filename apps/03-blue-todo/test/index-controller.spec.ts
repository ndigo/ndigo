/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { configuration, entry } from '@blue/context';
import { bootBrowserApp, BrowserMockClient } from '@blue/test';
import IndexController from '../src/index-controller';
import TodoService from '../src/todo-service';

const starterTodos = [
    { text: 'a', checked: false },
    { text: 'b', checked: true },
];

/**
 * Test-local configuration: registers the REAL IndexController and real
 * TodoService through the framework DI, so the handler mapping discovers them
 * and the TODO_SERVICE token resolves — no stubbed context.
 */
@configuration
class IndexTestConfiguration {
    @entry()
    indexController() {
        return new IndexController();
    }

    @entry()
    todoService() {
        return new TodoService(starterTodos);
    }
}

describe('IndexController through BrowserMockClient', () => {
    let browser: BrowserMockClient;
    let close: () => void;

    beforeAll(async () => {
        const app = await bootBrowserApp([IndexTestConfiguration]);
        browser = new BrowserMockClient(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('/index returns the full model with all filter', async () => {
        const { model } = await browser.dispatch('/index');
        expect(model).toMatchObject({ filter: 'all' });
        expect(model).toMatchObject({ items: starterTodos });
    });

    test('/ returns the model with items and the all filter', async () => {
        // Items are always included: the view filters locally, and a fresh
        // load (or deep link) must seed its list from the model.
        const { model } = await browser.dispatch('/');
        expect(model).toMatchObject({ filter: 'all' });
        expect(model).toMatchObject({ items: starterTodos });
    });

    test('/active and /completed return their filters with the full list', async () => {
        const active = await browser.dispatch('/active');
        const completed = await browser.dispatch('/completed');

        expect(active.model).toMatchObject({ filter: 'active', items: starterTodos });
        expect(completed.model).toMatchObject({ filter: 'completed', items: starterTodos });
    });
});
