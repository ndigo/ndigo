// @vitest-environment node
/**
 * Characterization tests for `NodeDispatcher.render`: the four Node-only
 * platform results and the shared fragment/document pipeline.
 *
 * These pin behavior before the pipeline is consolidated onto
 * `AbstractDispatcher`, so the collapse is a refactor, not a rewrite.
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ServerResponse } from 'node:http';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import { ResponseStatuses } from '@ndigo/http';
import { Route } from '@ndigo/router';
import type { MediaType } from '@ndigo/core';
import type { ProducerView, RenderResult, View, ViewTarget } from '@ndigo/view';
import { ModelAndView } from '@ndigo/dispatcher';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NODE_RESPONSE_ATTRIBUTE } from '../src/node-request';
import { ResponseEntity } from '../src/response-entity';

/** Minimal `ServerResponse` capture. */
function memorySink() {
    const captured: { status: number; headers: Record<string, string>; body: unknown } = {
        status: 200,
        headers: {},
        body: undefined,
    };
    const sink = {
        headersSent: false,
        writeHead(status: number, headers?: Record<string, string>): void {
            captured.status = status;
            if (headers) {
                Object.assign(captured.headers, headers);
            }
        },
        end(body?: unknown): void {
            captured.body = body;
            sink.headersSent = true;
        },
    };
    return { captured, sink };
}

class FragmentView implements View {
    mediaType: MediaType | null = null;
    readonly rendered = vi.fn<(model: unknown, route: unknown, target?: ViewTarget) => void>();

    render(model: unknown, route: unknown, target?: ViewTarget): void {
        this.rendered(model, route, target);
    }
}

class DocumentView implements View, ProducerView {
    mediaType: MediaType | null = null;
    readonly rendered = vi.fn();
    readonly produced = vi.fn<(model: unknown, route: unknown) => Promise<RenderResult>>();

    async renderTo(model: unknown, route: Route): Promise<RenderResult> {
        return this.produced(model, route);
    }

    render(): void {
        this.rendered();
    }
}

const routeFor = (sink?: unknown): Route =>
    ({ path: '/widgets/42', attributes: sink ? { [NODE_RESPONSE_ATTRIBUTE]: sink } : {} }) as unknown as Route;

const createDispatcher = (
    values: Record<string, unknown> = {}
): { dispatcher: NodeDispatcher; context: MetadataConfigApplicationContext } => {
    const context = new MetadataConfigApplicationContext(`node-render-${Math.random()}`);
    for (const [key, value] of Object.entries(values)) {
        context.setValue(key, value);
    }
    const dispatcher = new NodeDispatcher();
    dispatcher.initStrategies(context);
    return { dispatcher, context };
};

/** In-memory destination, as an app or test would supply per result. */
class CaptureTarget implements ViewTarget {
    readonly prepared: unknown[] = [];
    readonly committed: unknown[] = [];

    prepare(route: Route): void {
        this.prepared.push(route);
    }

    commit(output: unknown): void {
        this.committed.push(output);
    }

    clear(): void {
        // Nothing retained.
    }
}

/** Counts fallback-target construction, which the platform branches must skip. */
class CountingDispatcher extends NodeDispatcher {
    fallbackCalls = 0;

    protected override getFallbackViewTarget(route: Route): ViewTarget {
        this.fallbackCalls++;
        return super.getFallbackViewTarget(route);
    }
}

const createCountingDispatcher = (
    values: Record<string, unknown> = {}
): { dispatcher: CountingDispatcher; context: MetadataConfigApplicationContext } => {
    const context = new MetadataConfigApplicationContext(`node-counting-${Math.random()}`);
    for (const [key, value] of Object.entries(values)) {
        context.setValue(key, value);
    }
    const dispatcher = new CountingDispatcher();
    dispatcher.initStrategies(context);
    return { dispatcher, context };
};

describe('NodeDispatcher.render — platform results', () => {
    test('a ResponseEntity writes a response document', async () => {
        const { captured, sink } = memorySink(),
            { dispatcher } = createDispatcher();

        await dispatcher.render(
            new ResponseEntity({ widgets: 3 }, ResponseStatuses.OK) as unknown as ModelAndView,
            routeFor(sink)
        );

        expect(captured.status).toBe(200);
        expect(captured.headers['Content-Type']).toContain('application/json');
        expect(JSON.parse(captured.body as string)).toEqual({ widgets: 3 });
    });

    test('a producing view streams its document', async () => {
        const { captured, sink } = memorySink(),
            { dispatcher } = createDispatcher(),
            view = new DocumentView();
        view.produced.mockResolvedValue({ body: 'event: ping\n\n', headers: { 'Content-Type': 'text/event-stream' } });

        await dispatcher.render(view as unknown as ModelAndView, routeFor(sink));

        expect(captured.body).toBe('event: ping\n\n');
        expect(captured.headers['Content-Type']).toBe('text/event-stream');
    });

    test('a plain object serializes as JSON', async () => {
        const { captured, sink } = memorySink(),
            { dispatcher } = createDispatcher();

        await dispatcher.render({ ok: true } as unknown as ModelAndView, routeFor(sink));

        expect(captured.headers['Content-Type']).toContain('application/json');
        expect(JSON.parse(captured.body as string)).toEqual({ ok: true });
    });

    test('a ModelAndView with neither a view nor a name serializes its model as JSON', async () => {
        const { captured, sink } = memorySink(),
            { dispatcher } = createDispatcher(),
            mv = new ModelAndView('placeholder', { fallback: true });
        mv.viewName = null;

        await dispatcher.render(mv, routeFor(sink));

        expect(JSON.parse(captured.body as string)).toEqual({ fallback: true });
    });
});

describe('NodeDispatcher.render — shared pipeline', () => {
    let fragment: FragmentView,
        sink: ReturnType<typeof memorySink>['sink'],
        captured: ReturnType<typeof memorySink>['captured'],
        resolver: { resolveViewName: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        fragment = new FragmentView();
        ({ sink, captured } = memorySink());
        resolver = { resolveViewName: vi.fn(async () => fragment) };
    });

    test('a named fragment view renders into the response target', async () => {
        const { dispatcher } = createDispatcher({ viewResolver: resolver });

        await dispatcher.render(new ModelAndView('widget'), routeFor(sink));

        expect(fragment.rendered).toHaveBeenCalledWith(
            undefined,
            expect.anything(),
            expect.objectContaining({ commit: expect.any(Function) })
        );
    });

    test('a realized fragment view is rendered without resolving a name', async () => {
        const { dispatcher } = createDispatcher({ viewResolver: resolver });

        await dispatcher.render(new ModelAndView(fragment), routeFor(sink));

        expect(resolver.resolveViewName).not.toHaveBeenCalled();
        expect(fragment.rendered).toHaveBeenCalledTimes(1);
    });

    test('a resolved document view writes its document instead of fragment rendering', async () => {
        const document = new DocumentView();
        document.produced.mockResolvedValue({ body: '<html>page</html>' });
        const { dispatcher } = createDispatcher({ viewResolver: { resolveViewName: async () => document } });

        await dispatcher.render(new ModelAndView('page'), routeFor(sink));

        expect(captured.body).toBe('<html>page</html>');
        expect(document.rendered).not.toHaveBeenCalled();
    });

    test('a document view wrapped by a handler writes its document', async () => {
        const document = new DocumentView();
        document.produced.mockResolvedValue({ body: '<html>wrapped</html>' });
        const { dispatcher } = createDispatcher();

        await dispatcher.render(new ModelAndView(document), routeFor(sink));

        expect(captured.body).toBe('<html>wrapped</html>');
        expect(document.rendered).not.toHaveBeenCalled();
    });

    test('an unresolved view name writes a 404 problem document', async () => {
        const { dispatcher } = createDispatcher({ viewResolver: { resolveViewName: async () => null } });

        await dispatcher.render(new ModelAndView('missing'), routeFor(sink));

        expect(captured.status).toBe(404);
        expect(JSON.parse(captured.body as string)).toMatchObject({ status: 404, detail: 'View not found: missing' });
    });
});

describe('NodeDispatcher.render — targeting', () => {
    test('platform results construct no target and never consult the chain', async () => {
        const { captured, sink } = memorySink(),
            targeter = { resolveViewTarget: vi.fn() },
            { dispatcher } = createCountingDispatcher({ viewTargeters: [targeter] }),
            route = routeFor(sink);

        await dispatcher.render(
            new ResponseEntity({ ok: true }, ResponseStatuses.OK) as unknown as ModelAndView,
            route
        );
        expect(JSON.parse(captured.body as string)).toEqual({ ok: true });

        await dispatcher.render(new DocumentView() as unknown as ModelAndView, route);
        await dispatcher.render({ json: true } as unknown as ModelAndView, route);

        const nameless = new ModelAndView('placeholder', { model: true });
        nameless.viewName = null;
        await dispatcher.render(nameless, route);

        expect(targeter.resolveViewTarget).not.toHaveBeenCalled();
        expect(dispatcher.fallbackCalls).toBe(0);
    });

    test('the targeter chain chooses the destination for a fragment render', async () => {
        const view = new FragmentView(),
            capture = new CaptureTarget(),
            targeter = { resolveViewTarget: vi.fn(() => capture) },
            { dispatcher } = createCountingDispatcher({
                viewResolver: { resolveViewName: async () => view },
                viewTargeters: [targeter],
            });

        await dispatcher.render(new ModelAndView('widget'), routeFor(undefined));

        expect(targeter.resolveViewTarget).toHaveBeenCalledTimes(1);
        expect(view.rendered).toHaveBeenCalledWith(undefined, expect.anything(), capture);
    });

    test('with no targeter the response fallback is used', async () => {
        const view = new FragmentView(),
            { dispatcher } = createCountingDispatcher({ viewResolver: { resolveViewName: async () => view } });

        await dispatcher.render(new ModelAndView('widget'), routeFor(undefined));

        expect(dispatcher.fallbackCalls).toBe(1);
    });

    test('an explicit result target wins and skips chain and fallback', async () => {
        const view = new FragmentView(),
            capture = new CaptureTarget(),
            targeter = { resolveViewTarget: vi.fn() },
            { dispatcher } = createCountingDispatcher({
                viewResolver: { resolveViewName: async () => view },
                viewTargeters: [targeter],
            });

        await dispatcher.render(new ModelAndView('widget', null, { viewTarget: capture }), routeFor(undefined));

        expect(view.rendered).toHaveBeenCalledWith(undefined, expect.anything(), capture);
        expect(targeter.resolveViewTarget).not.toHaveBeenCalled();
        expect(dispatcher.fallbackCalls).toBe(0);
    });

    test('a bare view result renders instead of serializing as JSON', async () => {
        const view = new FragmentView(),
            { captured, sink } = memorySink(),
            { dispatcher } = createDispatcher();

        await dispatcher.render(view as unknown as ModelAndView, routeFor(sink));

        expect(view.rendered).toHaveBeenCalledTimes(1);
        expect(captured.body).toBeUndefined();
    });
});
