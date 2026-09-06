/**
 * Node.js dispatcher extending the platform-independent `AbstractDispatcher` for server-side rendering.
 *
 * Overrides `render()` to write the view output to the HTTP response via
 * `HTTPResponseViewTarget`, instead of the browser DOM. The dispatch pipeline
 * (handler mapping, interceptors, error resolution) is inherited unchanged.
 *
 * @module
 * @since 1.0.0
 */

import { AbstractDispatcher } from '@blue/dispatcher';
import { ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { likeApplicationContextAware } from '@blue/context';
import { View, likeView } from '@blue/view';
import type { ServerResponse } from 'node:http';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { HTTPResponseViewTarget } from './node-view-target';
import { ResponseEntityView } from './response-entity-view';
import { isResponseEntity } from './response-entity';

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
     * (set by the HTTP server adapter), creates an `HTTPResponseViewTarget`, and
     * renders the view into it.
     *
     * @param mv - The `ModelAndView` to render.
     * @param route - The route associated with the `ModelAndView`.
     */
    override async render(mv: ModelAndView, route: Route): Promise<void> {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
        const viewTarget = new HTTPResponseViewTarget(res);

        // ResponseEntity — write status/headers/body directly
        if (isResponseEntity(mv)) {
            await new ResponseEntityView().render(mv, route);
            return;
        }

        // Imperative View return (e.g. ServerSentEventView): the handler produced a
        // stateful view for THIS request — render it directly, do not
        // JSON-serialize. (Spring's ViewMethodReturnValueHandler parity.)
        if (likeView(mv)) {
            await mv.render(null, route, viewTarget);
            return;
        }

        // JSON API — a plain return with no view (object OR scalar): serialize
        // it directly. Only a real ModelAndView carries view/viewName semantics.
        if (!(mv instanceof ModelAndView) && mv !== undefined && mv !== null) {
            // Scalars (string/number/boolean) would be misread by the view
            // target's `typeof === 'string' → HTML` heuristic; emit them as JSON.
            if (typeof mv === 'string' || typeof mv === 'number' || typeof mv === 'boolean') {
                if (res && !res.headersSent) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(mv));
                }
                return;
            }
            await viewTarget.commit(mv, null, route);
            return;
        }

        const language = this.languageResolver ? this.languageResolver.resolveLanguage(route) : '',
            viewName = mv?.viewName;

        let view: View | null = null;

        if (viewName) {
            view = await this._resolveViewName(viewName, language);
            if (!view) {
                if (res && !res.headersSent) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: `View not found: ${viewName}` }));
                }
                return;
            }
        } else {
            view = mv?.view;
            if (!view) {
                // No view — fall back to serializing the model as JSON
                if (res && !res.headersSent) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(mv?.model ?? {}));
                }
                return;
            }
        }

        if (likeApplicationContextAware(view)) {
            view.setApplicationContext(this.applicationContext);
        }

        await view.render(mv.model, route, viewTarget);
    }
}
