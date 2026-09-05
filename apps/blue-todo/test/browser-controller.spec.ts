// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootBrowserApp, BrowserMockMVC } from '@blue/test';
import AccountController from '../src/account-controller';

/**
 * Real blue-todo controller through BrowserMockMVC: dispatches `/account`
 * and `/account/settings` through the real BrowserDispatcher and asserts the
 * model produced by the actual AccountController — no stubbed context.
 */

describe('blue-todo AccountController via BrowserMockMVC', () => {
    let browser: BrowserMockMVC;
    let close: () => void;

    beforeAll(async () => {
        const app = await bootBrowserApp([AccountController]);
        browser = new BrowserMockMVC(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('/account renders the overview model', async () => {
        const render = await browser.dispatch('/account');
        expect(render.model).toEqual({ section: 'overview', title: 'Account Overview' });
    });

    test('/account/settings renders the settings model', async () => {
        const render = await browser.dispatch('/account/settings');
        expect(render.model).toEqual({ section: 'settings', title: 'Account Settings' });
    });

    test('rendered view targets the account-app web component', async () => {
        const render = await browser.dispatch('/account');
        expect((render.output as { tagName?: string }).tagName).toBe('ACCOUNT-APP');
    });
});
