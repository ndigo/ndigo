/**
 */
// @vitest-environment jsdom
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { routeMapping, ModelAndView } from '@ndigo/dispatcher';
import { WebComponentView } from '@ndigo/view-webcomponent';
import { bootWebApp, BrowserMockClient } from '../src/index';

/**
 * BrowserMockClient: dispatches routes through the real BrowserDispatcher and
 * captures the rendered view (output element + model) with no DOM container
 * assertions — just the model produced by the handler.
 */

@routeMapping('/account')
class AccountController {
    @routeMapping('/')
    handleIndex() {
        return new ModelAndView(new WebComponentView('account-app'), {
            section: 'overview',
            title: 'Account Overview',
        });
    }

    @routeMapping('/settings')
    handleSettings() {
        return new ModelAndView(new WebComponentView('account-app'), {
            section: 'settings',
            title: 'Account Settings',
        });
    }
}

describe('BrowserMockClient', () => {
    let browser: BrowserMockClient;
    let close: () => void;

    beforeAll(async () => {
        const app = await bootWebApp([AccountController]);
        browser = new BrowserMockClient(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('GET /account renders the overview model', async () => {
        const render = await browser.dispatch('/account');
        expect(render.model).toEqual({ section: 'overview', title: 'Account Overview' });
    });

    test('GET /account/settings renders the settings model', async () => {
        const render = await browser.dispatch('/account/settings');
        expect(render.model).toEqual({ section: 'settings', title: 'Account Settings' });
    });

    test('rendered output is a web-component element for the view tag', async () => {
        const render = await browser.dispatch('/account');
        const element = render.output as { tagName?: string };
        expect(element.tagName).toBe('ACCOUNT-APP');
    });
});
