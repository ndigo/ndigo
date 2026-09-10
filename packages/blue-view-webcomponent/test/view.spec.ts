import { describe, expect, test, vi } from 'vitest';
import { WebComponentView } from '../src/view';

/**
 * Structural view of WebComponentView's protected internals, so tests can
 * exercise the render pipeline without widening the public API.
 */
interface ExposedView {
    _renderTemplate(templateModel: unknown, request: unknown): void;
    _renderView(viewModel: unknown, request: unknown, target?: unknown): Promise<void>;
    setApplicationContext(context: unknown): void;
}

describe('WebComponentView', () => {
    test('it should create template from name', () => {
        const view = new WebComponentView('user-profile');

        expect(view.template).toBe('<user-profile>');
    });

    test('it should throw for unimplemented _renderTemplate', () => {
        const view = new WebComponentView('test-view') as unknown as ExposedView;

        expect(() => view._renderTemplate({}, {})).toThrow('Method not implemented.');
    });

    test('it should throw when _renderView has no target', async () => {
        const view = new WebComponentView('test-view') as unknown as ExposedView;

        await expect(view._renderView({}, {})).rejects.toThrow('WebComponentView requires a ViewTarget to render.');
    });

    test('it should throw when application context is missing', async () => {
        const view = new WebComponentView('test-view') as unknown as ExposedView;

        await expect(view._renderView({}, {}, {})).rejects.toThrow(
            'WebComponentView requires an ApplicationContext to resolve the ViewEngine.'
        );
    });

    test('it should throw when engine is missing from application context', async () => {
        const view = new WebComponentView('test-view') as unknown as ExposedView;
        view.setApplicationContext({ getValue: () => null });

        await expect(view._renderView({}, {}, {})).rejects.toThrow(
            'No WebComponentViewEngine found in ApplicationContext.'
        );
    });

    test('it should delegate rendering to resolved engine', async () => {
        const view = new WebComponentView('test-view') as unknown as ExposedView;
        const engine = { render: vi.fn().mockResolvedValue(undefined) };
        const target = { prepare: vi.fn(), commit: vi.fn(), clear: vi.fn() };
        const route = { path: '/index' };
        const model = { items: [] };

        view.setApplicationContext({ getValue: () => engine });

        await view._renderView(model, route, target);

        expect(engine.render).toHaveBeenCalledWith(view, model, target, route);
    });
});
