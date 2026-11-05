/**
 * `@whenFeature` — declarative feature-gate metadata (AD-82 D-4).
 *
 * The decorator is **passive metadata** — the `@scheduled` / `@rateLimit`
 * pattern: decoration-time validation, a `Symbol.metadata` key, and a
 * reader for the enforcing interceptor. The route-level enforcement is
 * `FeatureGateInterceptor` in `@ndigo/platform-node` (default-on in the
 * node mapping, mirror of `RateLimitInterceptor`); service-method usage
 * composes as an explicit `evaluator.evaluate()` check or an AD-42
 * interceptor.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { validateFlagKey } from './flag-evaluator';

/**
 * Metadata key for `@whenFeature` — class-level under `WHEN_FEATURE_KEY`,
 * method-level under `${WHEN_FEATURE_KEY}:<methodName>` (method wins).
 */
export const WHEN_FEATURE_KEY = 'flags:whenFeature';

/**
 * Marks a class or method as gated on a feature flag: the handler is only
 * reachable while the flag evaluates truthy.
 *
 * ```ts
 * @whenFeature('todo.dueDates')
 * @routeMapping('/todo/due')
 * async dueDates() { … }
 * ```
 *
 * The flag key is validated at decoration time (fail loud at definition).
 * A disallowed decorator kind throws.
 *
 * @param flag - The flag key (`[A-Za-z0-9._:-]+`); the local provider
 *   resolves it as `feature.<flag>`.
 * @returns The class or method decorator.
 */
export function whenFeature(flag: string) {
    validateFlagKey(flag, '@whenFeature');
    return function (target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void {
        void target;
        const kind = context.kind;
        if (kind !== 'class' && kind !== 'method') {
            throw new TypeError(`@whenFeature can only be applied to a class or method — received '${kind}'.`);
        }
        context.metadata[kind === 'class' ? WHEN_FEATURE_KEY : `${WHEN_FEATURE_KEY}:${String(context.name)}`] = flag;
    };
}

/**
 * Reads the feature gate recorded by `@whenFeature`.
 *
 * @param target - The decorated class constructor or instance.
 * @param methodName - The decorated method name, when reading method-level
 *   metadata (preferred; falls back to class-level when `methodName` is
 *   omitted or the method carries no gate).
 * @returns The flag key, or `undefined` when un-gated.
 */
export function getWhenFeature(target: unknown, methodName?: string): string | undefined {
    // `Symbol.metadata` lives on the class constructor, not the instance or
    // prototype — normalize like conditional.ts's metadata carrier.
    const carrier = (typeof target === 'function' ? target : target?.constructor) as
        | { [Symbol.metadata]?: Record<string, unknown> }
        | undefined;
    const metadata = carrier?.[Symbol.metadata] ?? {};
    if (methodName !== undefined) {
        const methodFlag = metadata[`${WHEN_FEATURE_KEY}:${methodName}`] as string | undefined;
        if (methodFlag !== undefined) return methodFlag;
    }
    return (metadata[WHEN_FEATURE_KEY] as string | undefined) ?? undefined;
}
