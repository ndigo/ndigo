/**
 * @module blue-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import { WebComponentView } from '../src/view';
import { AbstractWebComponent } from '../src/abstract-web-component';

/**
 * Structural view of WebComponentView's protected internals, so tests can
 * exercise the render pipeline without widening the public API.
 */
interface ExposedView {
    _renderView(viewModel: unknown, request: unknown, target?: unknown): Promise<void>;
}

describe('WebComponentView', () => {
    test('it should expose the tag name', () => {
        const view = new WebComponentView('user-profile');

        expect(view.tagName).toBe('user-profile');
    });

    test('it should throw when _renderView has no target', async () => {
        const view = new WebComponentView('test-view') as unknown as ExposedView;

        await expect(view._renderView({}, {})).rejects.toThrow('WebComponentView requires a ViewTarget to render.');
    });

    test('it should create the custom element and commit it to the target', async () => {
        const view = new WebComponentView('test-view') as unknown as ExposedView;
        const target = { commit: vi.fn() };
        const route = { path: '/index' };
        const model = { items: [] };

        await view._renderView(model, route, target);

        expect(target.commit).toHaveBeenCalledTimes(1);
        const [element, committedModel] = target.commit.mock.calls[0] as [HTMLElement & { model?: unknown }, unknown];
        expect(element.tagName.toLowerCase()).toBe('test-view');
        expect(element.model).toBe(model);
        expect(committedModel).toBe(model);
    });
});

describe('AbstractWebComponent event registration', () => {
    // jsdom's custom-element registry persists across tests in a file, so the
    // tag is defined exactly once and each test creates fresh instances.
    customElements.define('event-test-component', class TestComponent extends AbstractWebComponent {});

    function makeComponent(): AbstractWebComponent {
        return document.createElement('event-test-component') as AbstractWebComponent;
    }

    test('it should register a DOM listener only once per unique listener', () => {
        const comp = makeComponent();
        let count = 0;
        const handler = () => {
            count++;
        };

        comp.on('click', handler);
        comp.on('click', handler); // duplicate registration must be a no-op

        comp.dispatchEvent(new Event('click'));

        expect(count).toBe(1);
    });

    test('it should re-register a listener after off()', () => {
        const comp = makeComponent();
        let count = 0;
        const handler = () => {
            count++;
        };

        comp.on('click', handler);
        comp.off('click', handler);
        comp.on('click', handler);

        comp.dispatchEvent(new Event('click'));

        expect(count).toBe(1);
    });
});
