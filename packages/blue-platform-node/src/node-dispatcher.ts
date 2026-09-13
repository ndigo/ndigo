/**
 * Node.js dispatcher extending the platform-independent `AbstractDispatcher` for server-side rendering.
 *
 * Overrides `render()` to write the view output to the HTTP response via
 * `HTTPResponseViewTarget` or — for document-producing views — directly as a
 * `RenderResult`. The dispatch pipeline (handler mapping, interceptors, error
 * resolution) is inherited unchanged.
 *
 * @module
 * @since 1.0.0
 */

import { AbstractDispatcher } from '@blue/dispatcher';
import { ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { likeApplicationContextAware } from '@blue/context';
import { View, likeProducerView } from '@blue/view';
import type { ServerResponse } from 'node:http';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { ProblemTypes, writeProblem } from './problem-details';
import { HTTPResponseViewTarget } from './node-view-target';
import { ResponseEntityView } from './response-entity-view';
import { isResponseEntity } from './response-entity';
import { writeRenderResult } from './producer-writer';

/**
 * A dispatcher for Node.js that renders its output to the HTTP response.
 *
 * @example
 * ```ts
 * const dispatcher = new NodeDispatcher();
 * dispatcher.setApplicationContext(context);
 * dispatcher.initStrategies(context);
 * ```
 */
export class NodeDispatcher extends AbstractDispatcher {
    /**
     * Render the given `ModelAndView` to the HTTP response.
     *
     * Reads the `ServerResponse` from `route.attributes[NODE_RESPONSE_ATTRIBUTE]`
     * (set by the HTTP server adapter) and renders according to the result
     * shape: response entities and document-producing views write the response
     * directly; fragment views render into an `HTTPResponseViewTarget`.
     *
     * @param mv - The `ModelAndView` to render.
     * @param route - The route associated with the `ModelAndView`.
     */
    override async render(mv: ModelAndView, route: Route): Promise<void> {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
        const viewTarget = new HTTPResponseViewTarget(res);

        // ResponseEntity — produce a full response document.
        if (isResponseEntity(mv)) {
            await writeRenderResult(res, await new ResponseEntityView().renderTo(mv, route));
            return;
        }

        // Producing views (e.g. ServerSentEventView): the handler returned a
        // stateful producing view for THIS request — stream its response
        // document. (Spring's ViewMethodReturnValueHandler parity.)
        if (likeProducerView(mv)) {
            await writeRenderResult(res, await mv.renderTo(null, route));
            return;
        }

        // JSON API — a plain return with no view (object OR scalar): serialize
        // it as a JSON response document. Only a real ModelAndView carries
        // view/viewName semantics.
        if (!(mv instanceof ModelAndView) && mv !== undefined && mv !== null) {
            await writeRenderResult(res, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mv),
            });
            return;
        }

        const language = this.languageResolver ? this.languageResolver.resolveLanguage(route) : '',
            viewName = mv?.viewName;

        let view: View | null = null;

        if (viewName) {
            view = await this._resolveViewName(viewName, language);
            if (!view) {
                if (res && !res.headersSent) {
                    writeProblem(res, {
                        type: ProblemTypes.notFound,
                        title: 'Not Found',
                        status: 404,
                        detail: `View not found: ${viewName}`,
                        instance: route.path,
                    });
                }
                return;
            }
        } else {
            view = mv?.view;
            if (!view) {
                // No view — fall back to serializing the model as JSON.
                await writeRenderResult(res, {
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mv?.model ?? {}),
                });
                return;
            }
        }

        if (likeApplicationContextAware(view)) {
            view.setApplicationContext(this.applicationContext);
        }

        // Document-producing views (e.g. EJS whole pages) write the response
        // directly; fragment views render into the response view target.
        if (likeProducerView(view)) {
            await writeRenderResult(res, await view.renderTo(mv.model, route));
            return;
        }

        await view.render(mv.model, route, viewTarget);
    }
}
