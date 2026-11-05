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
 * The evaluator and the targeting-context resolver are resolved from the
 * application context **per gate check**, never captured at construction:
 * entry values are created while sources register — before an app's own
 * configuration registers its entries — so an eager capture would pin the
 * auto-configuration defaults and a `FLAG_EVALUATOR` or
 * `FLAG_CONTEXT_RESOLVER` bean override (the vendor-bridge recipe, AD-87)
 * would never reach the gate. `HTTPServer`'s late `getValue` resolution is
 * the precedent; the interceptor registers as an entry so the aware
 * processor injects the application context into it.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Route } from '@ndigo/router';
import {
    type InterceptorDenial,
    type ModelAndView,
    type RouteHandlerInterceptor,
    type RouteHandlerMethod,
    denialOf,
} from '@ndigo/dispatcher';
import { FLAG_EVALUATOR, getWhenFeature, type FlagEvaluator } from '@ndigo/flags';
import { $aware } from '@ndigo/factory';
import { IllegalStateError } from '@ndigo/core';
import type { ApplicationContext, ApplicationContextAware } from '@ndigo/context';
import type { ServerResponse } from 'node:http';
import { ProblemTypes, writeProblem } from './problem-details';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { FLAG_CONTEXT_RESOLVER } from './context-tokens';
import { SessionPrincipalFlagContextResolver, type FlagEvaluationContextResolver } from './flag-context-resolver';

/**
 * Constructor overrides for the interceptor's beans — embedding and unit
 * tests. In the wired application the `FLAG_EVALUATOR` /
 * `FLAG_CONTEXT_RESOLVER` beans are the source, resolved per check so
 * app-level overrides apply.
 */
export interface FeatureGateInterceptorOptions {
    /** The evaluator to use instead of the `FLAG_EVALUATOR` bean. */
    readonly evaluator?: FlagEvaluator;
    /** The context resolver to use instead of the `FLAG_CONTEXT_RESOLVER` bean. */
    readonly contextResolver?: FlagEvaluationContextResolver;
}

/**
 * Enforces `@whenFeature` gates (AD-82): off flag → **404** problem
 * document (`urn:ndigo:not-found`), written before the denial finalizer so
 * the body survives.
 */
export class FeatureGateInterceptor implements RouteHandlerInterceptor, ApplicationContextAware {
    readonly #evaluatorOverride: FlagEvaluator | undefined;
    readonly #contextResolverOverride: FlagEvaluationContextResolver | undefined;
    #applicationContext: ApplicationContext | null = null;
    #fallbackContextResolver: FlagEvaluationContextResolver | null = null;

    /**
     * @param options - Optional evaluator/resolver overrides; omit both to
     *   resolve the beans from the application context.
     */
    constructor(options: FeatureGateInterceptorOptions = {}) {
        this.#evaluatorOverride = options.evaluator;
        this.#contextResolverOverride = options.contextResolver;
    }

    /**
     * Marks the value as aware so the factory's aware injection calls
     * {@link setApplicationContext} when the entry registers (the
     * `HTTPServer` precedent).
     */
    get [$aware](): boolean {
        return true;
    }

    /** Injected by the aware processor when the interceptor entry registers. */
    setApplicationContext(context: ApplicationContext): void {
        this.#applicationContext = context;
    }

    async preHandle(route: Route, handler: object | undefined): Promise<boolean | InterceptorDenial> {
        const flag = this.#flagFor(handler);
        if (flag === undefined) {
            return true;
        }

        // Never-throw evaluation (AD-82 D-2): a provider failure resolves
        // as the default (false) with reason ERROR — the gate is
        // fail-closed by posture. A flag that errors is a kill switch.
        // The context resolver seeds the targeting key (session principal,
        // else the AD-37 client address) so percentage rollouts (the local
        // provider's `feature.rollout.*` channel) bucket per requester.
        const evaluation = await this.#evaluator().evaluate<boolean>(
            flag,
            false,
            this.#contextResolver().resolve(route)
        );
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
     * The evaluator for this check: the explicit override, else the
     * `FLAG_EVALUATOR` bean — resolved late so bean overrides apply.
     */
    #evaluator(): FlagEvaluator {
        if (this.#evaluatorOverride !== undefined) {
            return this.#evaluatorOverride;
        }
        if (this.#applicationContext?.hasValue?.(FLAG_EVALUATOR)) {
            return this.#applicationContext.getValue(FLAG_EVALUATOR);
        }
        throw new IllegalStateError(
            'FeatureGateInterceptor: no evaluator — pass one or register the FLAG_EVALUATOR bean'
        );
    }

    /**
     * The targeting-context resolver for this check: the explicit
     * override, else the `FLAG_CONTEXT_RESOLVER` bean, else the built-in
     * default (context-less construction — tests and embeddings).
     */
    #contextResolver(): FlagEvaluationContextResolver {
        if (this.#contextResolverOverride !== undefined) {
            return this.#contextResolverOverride;
        }
        if (this.#applicationContext?.hasValue?.(FLAG_CONTEXT_RESOLVER)) {
            return this.#applicationContext.getValue(FLAG_CONTEXT_RESOLVER);
        }
        return (this.#fallbackContextResolver ??= new SessionPrincipalFlagContextResolver());
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
