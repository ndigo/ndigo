/**
 * `@whenFeature` route-gate enforcement (AD-82 D-4): per request, when the
 * handler method (or its class) carries `@whenFeature` metadata, the flag
 * is evaluated via the `FLAG_EVALUATOR` bean; an off/errored flag denies
 * the route with a 404 problem document — the repository's
 * `DisabledFeaturesHandler` analog (Azure's `@FeatureGate` default).
 *
 * Opt-in by metadata: un-gated handlers are untouched, so registering this
 * interceptor on the default mapping changes no existing route's behavior
 * (mirror of `RateLimitInterceptor`).
 *
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Route } from '@blue/router';
import {
    type InterceptorDenial,
    type ModelAndView,
    type RouteHandlerInterceptor,
    type RouteHandlerMethod,
    denialOf,
} from '@blue/dispatcher';
import { getWhenFeature, type FlagEvaluationContext, type FlagEvaluator } from '@blue/flags';
import type { ServerResponse } from 'node:http';
import { ProblemTypes, writeProblem } from './problem-details';
import { getNodeRequest, NODE_RESPONSE_ATTRIBUTE } from './node-request';

/**
 * Enforces `@whenFeature` gates (AD-82): off flag → **404** problem
 * document (`urn:blue:not-found`), written before the denial finalizer so
 * the body survives.
 */
export class FeatureGateInterceptor implements RouteHandlerInterceptor {
    readonly #evaluator: FlagEvaluator;

    constructor(evaluator: FlagEvaluator) {
        this.#evaluator = evaluator;
    }

    async preHandle(route: Route, handler: object | undefined): Promise<boolean | InterceptorDenial> {
        const flag = this.#flagFor(handler);
        if (flag === undefined) {
            return true;
        }

        // Never-throw evaluation (AD-82 D-2): a provider failure resolves
        // as the default (false) with reason ERROR — the gate is
        // fail-closed by posture. A flag that errors is a kill switch.
        // The client IP seeds the targeting context so percentage
        // rollouts (the local provider's `feature.rollout.*` channel)
        // bucket per requester — the same key the rate limiter uses
        // (AD-37).
        const evaluation = await this.#evaluator.evaluate<boolean>(flag, false, this.#targetingContext(route));
        if (evaluation.value === true) {
            return true;
        }

        this.#reject(route, flag);
        return denialOf(404, { body: { error: 'Not Found' } });
    }

    async postHandle(_route: Route, _handler: object | undefined, _modelAndView: ModelAndView): Promise<void> {
        // no-op — feature gating is a pre-handler concern.
    }

    async completeHandle(_route: Route, _handler: object | undefined, _error: Error | null): Promise<void> {
        // no-op.
    }

    /**
     * Reads `@whenFeature` metadata: method-level gate wins over
     * class-level; none → `undefined` (allow).
     */
    #flagFor(handler: object | undefined): string | undefined {
        const methodHandler = handler as RouteHandlerMethod | undefined;
        const methodName: string | null = typeof methodHandler?.method === 'string' ? methodHandler.method : null;

        const methodFlag = methodName ? getWhenFeature(methodHandler?.handler, methodName) : undefined;
        if (methodFlag !== undefined) {
            return methodFlag;
        }
        return getWhenFeature(methodHandler?.handler);
    }

    /**
     * Builds the evaluation context for a request: targeting key = the
     * client IP (the AD-37 trusted-proxy-resolved address, same as the
     * rate-limiter key). Absent address → no context (rollouts stay
     * closed for untargeted requests); providers that ignore the context
     * are unaffected.
     */
    #targetingContext(route: Route): FlagEvaluationContext | undefined {
        const request = getNodeRequest(route);
        const targetingKey = request?.remoteAddress;
        return typeof targetingKey === 'string' && targetingKey !== '' ? { targetingKey } : undefined;
    }

    /**
     * Writes the 404 problem document and ends the response — the
     * platform denial finalizer skips ended responses, so the body
     * survives (RateLimitInterceptor precedent).
     */
    #reject(route: Route, flag: string): void {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
        if (res && !res.writableEnded && !res.destroyed) {
            writeProblem(
                res,
                {
                    type: ProblemTypes.notFound,
                    title: 'Not Found',
                    status: 404,
                    detail: `Feature '${flag}' is not enabled.`,
                },
                {}
            );
        }
    }
}
