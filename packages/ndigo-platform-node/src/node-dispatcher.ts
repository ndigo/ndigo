/**
 * Node.js dispatcher extending the platform-independent `AbstractDispatcher` for server-side rendering.
 */
import { AbstractDispatcher, ModelAndView, NoViewFoundError } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { MediaTypes } from '@ndigo/core';
import { HTTPHeaders } from '@ndigo/http';
import { likeProducerView, likeView } from '@ndigo/view';
import type { ProducerView, ViewTarget } from '@ndigo/view';
import { getNodeRequest, getNodeResponse } from './node-request';
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
     * Render the given handler result to the HTTP response.
     *
     * Node-only result shapes are written before the shared pipeline runs:
     * response entities, document-producing views, and plain JSON values are
     * complete documents. Everything else — a named view, a realized view, or
     * a bare view instance — resolves a target (the registered
     * `ResponseViewTargeter`, an explicit result target, or the response
     * fallback) and renders through the shared pipeline.
     *
     * @param mv - The handler result to render.
     * @param route - The route associated with the result.
     * @returns A promise that resolves once rendered.
     */
    override async render(mv: ModelAndView, route: Route): Promise<void> {
        if (await this._renderPlatformResult(mv, route)) {
            return;
        }

        try {
            await super.render(mv, route);
        } catch (error) {
            if (error instanceof NoViewFoundError) {
                this._writeViewNotFound(route, error.viewName);
                return;
            }
            throw error;
        }
    }

    /**
     * Writes Node-only result shapes as complete documents.
     *
     * @param mv - The handler result.
     * @param route - The route being rendered.
     * @returns `true` when the result was written and the shared pipeline must
     *   not run.
     */
    protected async _renderPlatformResult(mv: ModelAndView, route: Route): Promise<boolean> {
        const res = getNodeResponse(route);

        // ResponseEntity — produce a full response document.
        if (isResponseEntity(mv)) {
            await writeRenderResult(res, await new ResponseEntityView().renderTo(mv, route));
            return true;
        }

        // Producing views (e.g. ServerSentEventView): the handler returned a
        // stateful producing view for THIS request — stream its response
        // document. (View-method return handling parity.)
        if (likeProducerView(mv)) {
            await writeRenderResult(res, await mv.renderTo(null, route));
            return true;
        }

        // JSON API — a plain return with no view (object OR scalar): serialize
        // it as a JSON response document. A bare view instance is a render
        // result, not JSON, so it falls through to the shared pipeline.
        if (!(mv instanceof ModelAndView) && !likeView(mv) && mv != null) {
            await writeRenderResult(res, {
                headers: { [HTTPHeaders.CONTENT_TYPE.name]: String(MediaTypes.APPLICATION_JSON) },
                body: JSON.stringify(mv),
            });
            return true;
        }

        // A ModelAndView with neither a view nor a name has nothing to render
        // into — Node's documented divergence is to serialize the model.
        if (mv instanceof ModelAndView && !mv.hasView) {
            await writeRenderResult(res, {
                headers: { [HTTPHeaders.CONTENT_TYPE.name]: String(MediaTypes.APPLICATION_JSON) },
                body: JSON.stringify(mv.model ?? {}),
            });
            return true;
        }

        return false;
    }

    /**
     * Writes the 404 problem document for an unresolvable view name.
     *
     * @param route - The route being rendered.
     * @param viewName - The unresolved view name.
     */
    protected _writeViewNotFound(route: Route, viewName: string): void {
        const res = getNodeResponse(route);
        if (res && !res.headersSent) {
            writeProblem(res, {
                type: ProblemTypes.notFound,
                title: 'Not Found',
                status: 404,
                detail: `View not found: ${viewName}`,
                instance: route.path,
            });
        }
    }

    /**
     * The per-request response destination when no targeter chooses one.
     *
     * @param route - The route being rendered.
     * @returns A target over the response carried by the route.
     */
    protected override getFallbackViewTarget(route: Route): ViewTarget {
        return new HTTPResponseViewTarget(getNodeResponse(route));
    }

    /**
     * Writes a document-producing view's response document.
     *
     * @param view - The producing view.
     * @param model - The model to render.
     * @param route - The route being rendered.
     * @returns `true` — the document was written and rendering is complete.
     */
    protected override async renderDocument(view: ProducerView, model: unknown, route: Route): Promise<boolean> {
        await writeRenderResult(getNodeResponse(route), await view.renderTo(model, route));
        return true;
    }

    /**
     * Projects the raw server request headers onto the route for content
     * negotiation, without mutating the route.
     *
     * @param route - The route being rendered.
     * @returns The negotiation request.
     */
    protected override getNegotiationRequest(route: Route): unknown {
        const nodeRequest = getNodeRequest(route);
        return nodeRequest?.headers ? { ...route, headers: nodeRequest.headers } : route;
    }
}
