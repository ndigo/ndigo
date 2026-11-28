/**
 * Base Node auto-configuration entries: request binding, dispatch mapping,
 * flags, rate limiting, and security headers.
 */
import { entry, AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import {
    ARGUMENT_RESOLVERS,
    HANDLER_MAPPING,
    MetadataErrorResolver,
    RadixMetadataHandlerMapping,
    argumentValueConverters,
} from '@ndigo/dispatcher';
import { FixedWindowRateLimiter, RATE_LIMITER, type RateLimiter } from '@ndigo/rate-limit';
import { FLAG_EVALUATOR, type FlagEvaluator } from '@ndigo/flags';
import { createNodeArgumentResolvers } from './configure-argument-resolvers.js';
import { SecurityHeadersInterceptor } from './security-headers-interceptor.js';
import { RateLimitInterceptor } from './rate-limit-interceptor.js';
import { CORSInterceptor, type CORSInterceptorOptions } from './cors-interceptor.js';
import { FeatureGateInterceptor } from './feature-gate-interceptor.js';
import { EnvironmentFlagEvaluator } from './environment-flag-evaluator.js';
import { NodeParameterBindingErrorResolver } from './parameter-binding-error-resolver.js';
import { NodeLastResortErrorResolver } from './last-resort-error-resolver.js';
import { SessionPrincipalFlagContextResolver, type FlagEvaluationContextResolver } from './flag-context-resolver.js';
import { FLAG_CONTEXT_RESOLVER } from './context-tokens.js';

/**
 * Request-pipeline entries shared by the Node auto-configuration.
 */
export class NodeAutoConfigurationBase extends AsApplicationContextAware(Null) {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * @returns The string "NodeAutoConfigurationBase".
     */
    get [Symbol.toStringTag](): string {
        return 'NodeAutoConfigurationBase';
    }

    /** The owning application context (container-injected, wiring). */
    readonly applicationContext!: ApplicationContext;
    /**
     * Exposes the shared argument-value converter registry.
     *
     * @returns The Node.js argument-value converter registry.
     */
    @entry()
    argumentValueConverterRegistry() {
        return argumentValueConverters;
    }

    /**
     * Creates the Node.js argument resolvers used for request binding.
     *
     * @returns The Node.js argument resolvers.
     */
    @entry(ARGUMENT_RESOLVERS)
    argumentResolvers() {
        return createNodeArgumentResolvers();
    }

    /**
     * Provides the default handler mapping for Node.js request dispatch.
     *
     * Security headers and the (metadata-gated) rate-limit interceptor are
     * default-on; routes declare opt-in budgets with `@rateLimit` — routes
     * without metadata are untouched.
     *
     * @returns The default metadata-driven handler mapping.
     */
    @entry(HANDLER_MAPPING)
    handlerMapping() {
        const mapping = new RadixMetadataHandlerMapping();
        mapping.interceptors.unshift(new SecurityHeadersInterceptor());
        // Feature gate before rate limiting: a disabled feature is not a
        // traffic event worth charging a budget against.
        mapping.interceptors.push(this.featureGateInterceptor());
        mapping.interceptors.push(new RateLimitInterceptor(this.rateLimiter()));
        // CORS runs last (after feature/rate-limit) and is fail-closed by
        // default: no origin is permitted until an app sets `cors.allowedOrigins`,
        // so registering it globally is inert for unconfigured apps. This closes
        // the example-apps trap where CORSInterceptor existed but was wired nowhere.
        mapping.interceptors.push(new CORSInterceptor(this.corsOptions()));
        return mapping;
    }

    /**
     * CORS policy bound to the `cors.*` environment namespace, read once at
     * registration time. Fail-closed by default (empty `allowedOrigins`): no
     * cross-origin request is permitted until an app sets `cors.allowedOrigins`,
     * so the always-registered {@link CORSInterceptor} blocks by default and
     * apps opt in explicitly. Mirrors how `flagEvaluator()`/`rateLimiter()` bind
     * their namespaces from the application environment.
     *
     * @returns options for the auto-registered {@link CORSInterceptor}.
     */
    corsOptions(): CORSInterceptorOptions {
        const raw = this.applicationContext?.environment?.getProperty('cors');
        if (!raw || typeof raw !== 'object') return {};
        const cfg = raw as Record<string, unknown>;
        const options: CORSInterceptorOptions = {};
        if (Array.isArray(cfg.allowedOrigins)) {
            options.allowedOrigins = cfg.allowedOrigins.map(String);
        }
        if (typeof cfg.allowCredentials === 'boolean') {
            options.allowCredentials = cfg.allowCredentials;
        }
        if (Array.isArray(cfg.allowedMethods)) {
            options.allowedMethods = cfg.allowedMethods.map(String);
        }
        if (Array.isArray(cfg.allowedHeaders)) {
            options.allowedHeaders = cfg.allowedHeaders.map(String);
        }
        if (Array.isArray(cfg.exposedHeaders)) {
            options.exposedHeaders = cfg.exposedHeaders.map(String);
        }
        if (typeof cfg.maxAgeSeconds === 'number') {
            options.maxAgeSeconds = cfg.maxAgeSeconds;
        }
        return options;
    }

    /**
     * The shared in-memory rate limiter. Apps needing a
     * distributed backend provide their own {@link RateLimiter}
     * implementation (the `@ndigo/redis/rate-limit` driver is the
     * shared-store option); the entry is the default.
     *
     * @returns The default fixed-window rate limiter.
     */
    @entry(RATE_LIMITER)
    rateLimiter(): RateLimiter {
        return new FixedWindowRateLimiter();
    }

    /**
     * The default flag evaluator: reads `feature.*` properties
     * from the application environment, **live on every evaluation** — an
     * `environment.refresh()` flips flags without a redeploy.
     * Apps needing vendor flagging (flagd / OFREP / LaunchDarkly via the
     * `@ndigo/flags-openfeature` bridge) provide their own `FlagEvaluator`
     * entry; this is the zero-config default. The gate resolves the entry
     * per check, so an override reaches `@whenFeature` routes too.
     *
     * @returns The property-backed flag evaluator.
     */
    @entry(FLAG_EVALUATOR)
    flagEvaluator(): FlagEvaluator {
        return new EnvironmentFlagEvaluator();
    }

    /**
     * The default flag targeting-context resolver: the
     * session-bag principal when a session/identity interceptor ran first
     * (targeting key = principal id, roles as attributes), else the
     * client address. Apps override this entry for tenant/attribute
     * targeting.
     *
     * @returns The principal-first, address-fallback resolver.
     */
    @entry(FLAG_CONTEXT_RESOLVER)
    flagContextResolver(): FlagEvaluationContextResolver {
        return new SessionPrincipalFlagContextResolver();
    }

    /**
     * The feature-gate interceptor — **one instance**, registered as an
     * entry so the aware processor injects the application context
     * (`HTTPServer` precedent): the interceptor resolves the
     * `FLAG_EVALUATOR`/`FLAG_CONTEXT_RESOLVER` entries per check, and the
     * mapping holds that same injected instance.
     *
     * @returns The shared {@link FeatureGateInterceptor}.
     */
    @entry()
    featureGateInterceptor(): FeatureGateInterceptor {
        return (this.#featureGateInterceptorInstance ??= new FeatureGateInterceptor());
    }
    #featureGateInterceptorInstance: FeatureGateInterceptor | null = null;

    /**
     * Creates the default Node error-resolver chain: request-binding failures
     * (missing params, failed conversions, Zod validation) map to 400, then
     * user-configured `@errorMapping` handlers win.
     *
     * @returns The error resolvers.
     */
    @entry()
    errorResolvers() {
        return [
            new NodeParameterBindingErrorResolver(),
            new MetadataErrorResolver(),
            new NodeLastResortErrorResolver(),
        ];
    }
}
