/**
 */
// @vitest-environment jsdom
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { routeMapping, ModelAndView } from '@ndigo/dispatcher';
import { WebComponentView } from '@ndigo/view-webcomponent';
import { configuration, entry } from '@ndigo/context';
import type { ViewTarget, ViewTargeter } from '@ndigo/view';
import { bootWebApp, MockWebClient } from '../src/index';

/**
 * MockWebClient: dispatches routes through the real BrowserDispatcher and
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

describe('MockWebClient', () => {
    let browser: MockWebClient;
    let close: () => void;

    beforeAll(async () => {
        const app = await bootWebApp([AccountController]);
        browser = new MockWebClient(app);
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

/**
 * A destination the application's chain owns, recording what it receives.
 */
class RecordingTarget implements ViewTarget {
    readonly committed: unknown[] = [];

    prepare(): void {
        // No container to clear.
    }

    commit(output: unknown): void {
        this.committed.push(output);
    }

    clear(): void {
        // Nothing retained outside `committed`.
    }
}

const appOwnedTarget = new RecordingTarget();

/**
 * Redirects `/account/settings` to the application's own target; `/account`
 * keeps the fallback, which `bootWebApp` registers as the harness capture
 * target.
 */
@configuration
class RedirectingConfiguration {
    @entry()
    viewTargeters(): ViewTargeter[] {
        return [
            {
                resolveViewTarget: (context) => (context.route.path === '/account/settings' ? appOwnedTarget : null),
            },
        ];
    }
}

describe('MockWebClient with a view-targeter chain', () => {
    let browser: MockWebClient;
    let close: () => void;

    beforeAll(async () => {
        const app = await bootWebApp([AccountController, RedirectingConfiguration]);
        browser = new MockWebClient(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('a redirected dispatch is not reported as the previous dispatch render', async () => {
        const render = await browser.dispatch('/account');
        expect(render.model).toMatchObject({ section: 'overview' });

        // The chain redirects this one, so the capture target stays empty —
        // and it must not surface the previous dispatch's render as its own.
        await expect(browser.dispatch('/account/settings')).rejects.toThrow(/No view was rendered/);
        expect(appOwnedTarget.committed.length).toBeGreaterThan(0);
    });

    test('the error names the targeter chain as the likely destination', async () => {
        await expect(browser.dispatch('/account/settings')).rejects.toThrow(/view targeter/);
    });
});
