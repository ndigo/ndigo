import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import { Route } from '@ndigo/router';
import type { MediaType } from '@ndigo/core';
import type { ProducerView, RenderResult, View, ViewTarget, ViewTargeter } from '@ndigo/view';
import { FixedViewTargeter, ViewTargetingContext } from '@ndigo/view';
import { AbstractDispatcher } from '../src/dispatcher';
import { ModelAndView } from '../src/model-and-view';
import { VIEW_TARGET, VIEW_TARGET_ATTRIBUTE } from '../src/context-tokens';

class RecordingView implements View {
    mediaType: MediaType | null = null;
    readonly rendered = vi.fn();

    constructor(readonly label: string) {}

    render(model: unknown, route: unknown, target?: ViewTarget): void {
        this.rendered(model, route, target);
    }
}

class ProducerViewStub extends RecordingView implements ProducerView {
    readonly produced = vi.fn<(model: unknown, route: unknown) => Promise<RenderResult>>();

    async renderTo(model: unknown, route: Route): Promise<RenderResult> {
        return this.produced(model, route);
    }
}

class RecordingTarget implements ViewTarget {
    constructor(readonly label: string) {}
    prepare = vi.fn();
    commit = vi.fn();
    clear = vi.fn();
}

const targeter = (
    resolve: (context: ViewTargetingContext) => ViewTarget | null
): ViewTargeter & { resolveViewTarget: ReturnType<typeof vi.fn> } => {
    return { resolveViewTarget: vi.fn(resolve) };
};

const route = (path = '/test', attributes: Record<string, unknown> = {}): Route =>
    ({ path, attributes }) as unknown as Route;

const createDispatcher = (values: Record<string, unknown> = {}): AbstractDispatcher => {
    const context = new MetadataConfigApplicationContext(`targeting-${Math.random()}`);
    for (const [key, value] of Object.entries(values)) {
        context.setValue(key, value);
    }
    const dispatcher = new AbstractDispatcher();
    dispatcher.initStrategies(context);
    return dispatcher;
};

describe('view targeting precedence', () => {
    let view: RecordingView,
        routeTarget: RecordingTarget,
        chainTarget: RecordingTarget,
        fallbackTarget: RecordingTarget,
        firstTargeter: ReturnType<typeof targeter>,
        secondTargeter: ReturnType<typeof targeter>,
        resolver: { resolveViewName: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        view = new RecordingView('main');
        routeTarget = new RecordingTarget('route');
        chainTarget = new RecordingTarget('chain');
        fallbackTarget = new RecordingTarget('fallback');
        firstTargeter = targeter(() => null);
        secondTargeter = targeter(() => chainTarget);
        resolver = { resolveViewName: vi.fn(async () => view) };
    });

    test('an explicit result target wins and the chain is never consulted', async () => {
        const dispatcher = createDispatcher({
            viewResolver: resolver,
            viewTargeters: [firstTargeter, secondTargeter],
            [VIEW_TARGET.description]: fallbackTarget,
        });
        const explicit = new RecordingTarget('explicit');
        const testRoute = route('/explicit', { [VIEW_TARGET_ATTRIBUTE]: routeTarget });

        await dispatcher.render(new ModelAndView('main', null, { viewTarget: explicit }), testRoute);

        expect(view.rendered).toHaveBeenCalledWith(undefined, testRoute, explicit);
        expect(firstTargeter.resolveViewTarget).not.toHaveBeenCalled();
        expect(secondTargeter.resolveViewTarget).not.toHaveBeenCalled();
    });

    test('a route attribute beats the chain', async () => {
        const dispatcher = createDispatcher({
            viewResolver: resolver,
            viewTargeters: [secondTargeter],
        });
        const testRoute = route('/attribute', { [VIEW_TARGET_ATTRIBUTE]: routeTarget });

        await dispatcher.render(new ModelAndView('main'), testRoute);

        expect(view.rendered).toHaveBeenCalledWith(undefined, testRoute, routeTarget);
        expect(secondTargeter.resolveViewTarget).not.toHaveBeenCalled();
    });

    test('the chain wins over the fallback, in order, first match only', async () => {
        const dispatcher = createDispatcher({
            viewResolver: resolver,
            viewTargeters: [firstTargeter, secondTargeter],
            [VIEW_TARGET.description]: fallbackTarget,
        });
        const testRoute = route('/chain');

        await dispatcher.render(new ModelAndView('main'), testRoute);

        expect(view.rendered).toHaveBeenCalledWith(undefined, testRoute, chainTarget);
        expect(firstTargeter.resolveViewTarget).toHaveBeenCalledTimes(1);
        expect(secondTargeter.resolveViewTarget).toHaveBeenCalledTimes(1);
    });

    test('the chain receives the resolved view, name, model, and language', async () => {
        const dispatcher = createDispatcher({
            viewResolver: resolver,
            viewTargeters: [secondTargeter],
        });
        const model = { id: 7 };

        await dispatcher.render(new ModelAndView('main', model), route('/context'));

        expect(secondTargeter.resolveViewTarget).toHaveBeenCalledWith(
            expect.objectContaining({ viewName: 'main', view, model, language: 'en-US', route: expect.anything() })
        );
    });

    test('an unregistered fallback leaves the target undefined', async () => {
        const dispatcher = createDispatcher({ viewResolver: resolver });
        const testRoute = route('/fallback');

        await dispatcher.render(new ModelAndView('main'), testRoute);

        expect(view.rendered).toHaveBeenCalledWith(undefined, testRoute, undefined);
    });

    test('a non-target result target is ignored and the chain still runs', async () => {
        const dispatcher = createDispatcher({
            viewResolver: resolver,
            viewTargeters: [secondTargeter],
        });
        const mv = new ModelAndView('main');
        // A request-derived string must never reach a selector lookup.
        (mv as unknown as { viewTarget: unknown }).viewTarget = '#site-footer';

        await dispatcher.render(mv, route('/invalid-result-target'));

        expect(view.rendered).toHaveBeenCalledWith(undefined, expect.anything(), chainTarget);
    });

    test('a non-target route attribute is ignored and the fallback is used', async () => {
        const dispatcher = createDispatcher({
            viewResolver: resolver,
            [VIEW_TARGET.description]: fallbackTarget,
        });
        const testRoute = route('/invalid-attribute', { [VIEW_TARGET_ATTRIBUTE]: '#site-footer' });

        await dispatcher.render(new ModelAndView('main'), testRoute);

        expect(view.rendered).toHaveBeenCalledWith(undefined, testRoute, fallbackTarget);
    });
});

describe('view targeting fast paths', () => {
    test('a realized view never consults the resolver chain', async () => {
        const view = new RecordingView('realized'),
            resolver = { resolveViewName: vi.fn(async () => new RecordingView('resolved')) },
            dispatcher = createDispatcher({ viewResolver: resolver });

        await dispatcher.render(new ModelAndView(view), route('/realized'));

        expect(resolver.resolveViewName).not.toHaveBeenCalled();
        expect(view.rendered).toHaveBeenCalledTimes(1);
    });

    test('a bare view result is normalized and rendered without a resolver', async () => {
        const view = new RecordingView('bare'),
            resolver = { resolveViewName: vi.fn(async () => new RecordingView('resolved')) },
            dispatcher = createDispatcher({ viewResolver: resolver });

        // Controllers may return a view directly; on the web a producer view is
        // still a fragment view, so it renders into the target.
        await dispatcher.render(view as unknown as ModelAndView, route('/bare'));

        expect(resolver.resolveViewName).not.toHaveBeenCalled();
        expect(view.rendered).toHaveBeenCalledWith(undefined, expect.anything(), undefined);
    });

    test('a resolved producer falls through to fragment rendering on the base pipeline', async () => {
        const view = new ProducerViewStub('producer'),
            dispatcher = createDispatcher({ viewResolver: { resolveViewName: async () => view } });

        await dispatcher.render(new ModelAndView('producer'), route('/producer'));

        // The base `renderDocument` declines, and `AbstractTemplateView`
        // renders producers into targets on the web.
        expect(view.rendered).toHaveBeenCalledTimes(1);
        expect(view.produced).not.toHaveBeenCalled();
    });

    test('a platform that handles documents skips fragment rendering', async () => {
        const view = new ProducerViewStub('document'),
            rendered: View[] = [];

        class DocumentDispatcher extends AbstractDispatcher {
            override async renderDocument(): Promise<boolean> {
                rendered.push(view);
                return true;
            }
        }

        const context = new MetadataConfigApplicationContext('document-platform');
        context.setValue('viewResolver', { resolveViewName: async () => view });
        const dispatcher = new DocumentDispatcher();
        dispatcher.initStrategies(context);

        await dispatcher.render(new ModelAndView('document'), route('/document'));

        expect(rendered).toEqual([view]);
        expect(view.rendered).not.toHaveBeenCalled();
    });
});

describe('view-targeter strategy', () => {
    test('the viewTargeters collection shadows a single viewTargeter entry', async () => {
        const view = new RecordingView('main'),
            single = new RecordingTarget('single'),
            collection = new RecordingTarget('collection'),
            dispatcher = createDispatcher({
                viewResolver: { resolveViewName: async () => view },
                viewTargeter: new FixedViewTargeter(single),
                viewTargeters: [new FixedViewTargeter(collection)],
            });

        await dispatcher.render(new ModelAndView('main'), route('/precedence'));

        expect(view.rendered).toHaveBeenCalledWith(undefined, expect.anything(), collection);
    });

    test('a single viewTargeter entry is installed as a one-element chain', async () => {
        const view = new RecordingView('main'),
            single = new RecordingTarget('single'),
            dispatcher = createDispatcher({
                viewResolver: { resolveViewName: async () => view },
                viewTargeter: new FixedViewTargeter(single),
            });

        await dispatcher.render(new ModelAndView('main'), route('/single'));

        expect(view.rendered).toHaveBeenCalledWith(undefined, expect.anything(), single);
    });

    test('installed targeters receive the application context', () => {
        const targeterWithContext = {
            context: null as unknown,
            setApplicationContext(context: unknown) {
                this.context = context;
            },
            resolveViewTarget: vi.fn(),
        };
        const context = new MetadataConfigApplicationContext('context-propagation');
        context.setValue('viewTargeters', [targeterWithContext]);

        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(context);

        expect(targeterWithContext.context).toBe(context);
    });
});
