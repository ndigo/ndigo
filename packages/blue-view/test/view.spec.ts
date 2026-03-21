import { describe, expect, test, vi } from 'vitest';
import { AbstractView, AbstractPathBasedView, RerouteView } from '../src/view';
import { MediaTypes } from '@blue/core';

class TestView extends AbstractView {
    lastRender: { model: any; request: any; target: any } | null = null;

    protected _renderView(viewModel: any, request: any, target?: any): void {
        this.lastRender = { model: viewModel, request, target };
    }
}

class TestPathView extends AbstractPathBasedView {
    protected _renderView(viewModel: any, request: any, target?: any): void {
        /* no-op */
    }
}

describe('AbstractView', () => {
    test('it should initialize with default media type', () => {
        const view = new TestView();

        expect(view.mediaType.type).toBe(MediaTypes.TEXT_HTML.type);
        expect(view.mediaType.subtype).toBe(MediaTypes.TEXT_HTML.subtype);
    });

    test('it should render using _renderView', async () => {
        const view = new TestView();
        const model = { foo: 'bar' };
        const request = { path: '/index' };

        await view.render(model, request);

        expect(view.lastRender).toEqual({ model, request, target: undefined });
    });

    test('it should pass a target to _renderView', async () => {
        const view = new TestView();
        const model = { foo: 'bar' };
        const request = { path: '/index' };
        const target = { commit: () => null };

        await view.render(model, request, target as any);

        expect(view.lastRender).toEqual({ model, request, target });
    });

    test('it should serialize to JSON', () => {
        const view = new TestView();
        view.name = 'test-view';

        const json = view.toJSON() as any;

        expect(json.name).toBe('test-view');
        expect(json.mediaType).toBeTruthy();
    });
});

describe('AbstractPathBasedView', () => {
    test('it should include path in JSON when provided', () => {
        const view = new TestPathView('/foo/bar');
        view.name = 'path-view';

        const json = view.toJSON() as any;

        expect(json.path).toBe('/foo/bar');
    });
});

describe('RerouteView', () => {
    test('it should create query-string target path by default', () => {
        const view = new RerouteView('/users');

        expect((view as any)._createTargetPath({ page: '2' }, {})).toBe('/userspage=2');
    });

    test('it should create matrix-string target path for contextRelative mode', () => {
        const view = new RerouteView('/users', true);

        expect((view as any)._createTargetPath({ page: '2' }, {})).toBe('/userspage=2');
    });

    test('it should push target path to history', async () => {
        const spy = vi.spyOn(history, 'pushState').mockImplementation(() => null);
        const view = new RerouteView('/users');

        await view.render({ page: '3' }, {});

        expect(spy).toHaveBeenCalledWith(null, null, '/userspage=3');
        spy.mockRestore();
    });
});
