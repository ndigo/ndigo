/**
 * @module blue-resilience
 * @since 1.0.0
 * @author Jeff Rose
 */
import { methodAnnotation, type MethodDescriptor, type MethodInvocation, type MethodInterceptor } from '@blue/proxy';
import { CircuitOpenError } from './circuit-breaker';
import { fixedBackoff, type BackoffPolicy } from './backoff';

/**
 * Total call attempts per invocation when `@retry` omits `attempts`
 * (AD-43 D-3): the first attempt plus two retries.
 */
export const DEFAULT_RETRY_ATTEMPTS = 3;

/**
 * `@retry` annotation key: methods carrying a {@link RetrySpec} are retried
 * by a registered {@link RetryInterceptor}.
 *
 * ```ts
 * class PushAPI {
 *     @retry({ attempts: 3, backoff: exponentialBackoff({ initialMs: 100 }) })
 *     push(payload: PushPayload): Promise<void> {}
 * }
 * ```
 *
 * The advice is async: through a woven proxy a `@retry`-advised **sync**
 * method returns a Promise even though its declared type is not (the
 * annotation is invisible to the type system). Prefer advising
 * Promise-returning methods.
 */
export const retry = methodAnnotation<RetrySpec>('retry');

/**
 * Retry policy for one method. **Idempotency is the caller's contract**
 * (AD-43 D-3): retrying re-invokes the join point, so a non-idempotent call
 * must constrain {@link RetrySpec.retryable}.
 */
export interface RetrySpec {
    /**
     * Total call attempts, first attempt included. Defaults to
     * {@link DEFAULT_RETRY_ATTEMPTS}. Must be a positive integer —
     * invalid values fail loudly at weave time.
     */
    attempts?: number;
    /**
     * Delay before each retry attempt (1-based attempt number). Defaults to
     * no delay (`fixedBackoff(0)`).
     */
    backoff?: BackoffPolicy;
    /**
     * Which errors are worth retrying. Defaults to every error except
     * {@link CircuitOpenError} — failing fast must not be beaten by retry
     * backoff, so an open circuit is never retried by default.
     */
    retryable?: (error: unknown) => boolean;
}

/**
 * Default {@link RetrySpec.retryable}: retry every thrown error except
 * {@link CircuitOpenError}. A retry loop over an open circuit would hammer
 * the fail-fast boundary with backoff delays shorter than `resetMs`.
 */
const retryableDefault = (error: unknown): boolean => !(error instanceof CircuitOpenError);

/**
 * Rejects invalid {@link RetrySpec.attempts} values at weave time (and on
 * hand-built chains) instead of clamping them: `attempts: 0` silently doing
 * one attempt would hide a configuration error.
 */
function validateRetrySpec(spec: RetrySpec): void {
    const { attempts } = spec;
    if (attempts !== undefined && (typeof attempts !== 'number' || !Number.isInteger(attempts) || attempts < 1)) {
        throw new TypeError(`@retry attempts must be a positive integer — got ${String(attempts)}`);
    }
}

/**
 * Around-advice that re-invokes `next()` after a failure. This interceptor
 * awaits `next()` — its result is only final after the whole inner chain —
 * so the value it returns is always a settled value (or a rejection).
 *
 * Because `invoke` is async, a woven **sync** method advised by this
 * interceptor returns a Promise through the proxy (see {@link retry}).
 *
 * @see AD-43 D-3 for the retry semantics and idempotency contract.
 */
export class RetryInterceptor implements MethodInterceptor {
    matches(method: MethodDescriptor): boolean {
        const spec = method.annotation(retry);
        if (spec !== undefined) {
            // Fail loud at weave time, not per call.
            validateRetrySpec(spec);
            return true;
        }
        return false;
    }

    async invoke(invocation: MethodInvocation, next: () => unknown): Promise<unknown> {
        const spec = invocation.annotation(retry);
        if (spec === undefined) {
            // matches() gates the chain; keep hand-built chains safe.
            return next();
        }
        validateRetrySpec(spec);

        const attempts = spec.attempts ?? DEFAULT_RETRY_ATTEMPTS;
        const backoff = spec.backoff ?? fixedBackoff(0);
        const retryable = spec.retryable ?? retryableDefault;

        for (let attempt = 1; attempt <= attempts; attempt += 1) {
            try {
                // eslint-disable-next-line no-await-in-loop -- retries are inherently sequential; the next attempt may only run after this one failed.
                return await next();
            } catch (error) {
                if (attempt >= attempts || !retryable(error)) {
                    throw error;
                }
                // eslint-disable-next-line no-await-in-loop -- the backoff delay precedes the next sequential attempt.
                await new Promise<void>((resolve) => setTimeout(resolve, backoff.delay(attempt)));
            }
        }
    }
}
