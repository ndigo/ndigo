/**
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Container integration: turns interceptors into an entry processor.
 *
 * Register with `factory.addProcessor(interception([...]))`; every instance
 * the factory then produces is checked at initialization and replaced by one
 * woven proxy when any interceptor matches one of its methods.
 */
import type { InitializationAwareProcessor } from '@ndigo/factory';
import type { MethodInterceptor } from './interceptor';
import { collectMethodSpecs, interceptAndRegister, isIntercepted, wovenBy } from './weave';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-proxy:processor');

/**
 * Builds an initialization-aware entry processor advising every method an
 * interceptor matches, on every instance the container creates.
 *
 * - Matched entries are replaced by one woven proxy (cached by the factory
 *   like any other singleton).
 * - Entries where nothing matches keep their identity.
 * - Re-processing an already-woven instance by *this same* processor is
 *   idempotent: the proxy passes through unchanged (weaving provenance
 *   records which processor owns the proxy).
 * - A *different* `interception(...)` result meeting an already-woven
 *   instance throws: a container may register exactly one interception
 *   processor, and all advice must be combined in that one call. A silent
 *   second registration would look configured but never run.
 * - An instance already woven standalone (`interceptMethods`) passes through
 *   with a warning: there is no duplicate registration to fail on, and the
 *   warning names the real cause instead of the misleading "register exactly
 *   one interception(...) processor" error.
 *
 * Interceptor ordering is applied per entry inside {@link collectMethodSpecs}
 * (`order`, stable — missing order counts as 0), so the `order` contract
 * holds on the container path and the standalone path alike.
 *
 * @param interceptors - The advice to apply.
 */
export function interception(interceptors: readonly MethodInterceptor[]): InitializationAwareProcessor {
    // Identity token recorded as weaving provenance: distinguishes proxies
    // this processor wove from standalone-woven and foreign-processor proxies.
    const owner = {};

    return {
        processBeforeInitialization<T>(_entryName: string, instance: T): T {
            return instance;
        },

        processAfterInitialization<T = unknown>(entryName: string, instance: T): T {
            if (typeof instance !== 'object' || instance === null) {
                return instance;
            }

            const specs = collectMethodSpecs(instance, entryName, interceptors);
            if (specs.length === 0) {
                return instance;
            }
            if (isIntercepted(instance)) {
                const woveBy = wovenBy(instance);
                if (woveBy === owner) {
                    return instance;
                }
                if (woveBy === undefined) {
                    logger.warn(
                        `entry '${entryName}' was already woven standalone (interceptMethods) — the interception(...) processor leaves it unchanged, so its interceptors do not run on this instance`
                    );
                    return instance;
                }
                throw new Error(
                    `entry '${entryName}' is already intercepted — register exactly one interception(...) processor and combine all interceptors in it`
                );
            }

            const proxy = interceptAndRegister(instance, specs, owner);
            return proxy as T;
        },
    };
}
