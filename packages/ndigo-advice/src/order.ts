/**
 * The order bands advice registers into.
 *
 * A rule's `order` decides where its advice sits relative to everything else:
 * lower numbers run closer to the caller, so a lower band wraps the bands
 * above it in the list below. Naming the bands lets independently authored
 * rules interleave predictably instead of guessing numbers relative to each
 * other.
 */

/**
 * The conventional order bands.
 *
 * A transaction sits inside resilience on purpose: retrying a transaction must
 * start a fresh one per attempt, so the boundary is the unit that retries —
 * not one statement inside a retry.
 *
 * A rule that names no order, and whose interceptor names none either, lands in
 * {@link AdviceOrder.Application}: the band for user policy that has no
 * stronger ordering requirement. Sitting at the default means such a rule never
 * accidentally wraps observability, which would turn one span into one span per
 * retry attempt.
 *
 * @example
 * ```ts
 * registry.add({
 *     when: hasAnnotation(retry),
 *     use: new RetryInterceptor(),
 *     order: AdviceOrder.Resilience,
 * });
 * ```
 */
export const AdviceOrder = {
    /** Traces, metrics, logging: must observe retries, not be re-run by them. */
    Observability: 100,
    /** Retry and circuit breaking: several attempts per outer call. */
    Resilience: 200,
    /** Transaction boundaries: one fresh transaction per attempt. */
    Transaction: 300,
    /** Feature-specific policy that belongs inside framework concerns. */
    Application: 400,
    /** Closest to the method: may short-circuit before the real call. */
    Innermost: 500,
} as const;

/**
 * The position a rule occupies when neither it nor its interceptor names one.
 */
export const DEFAULT_ADVICE_ORDER: number = AdviceOrder.Application;

/**
 * The conventional order band values.
 */
export type AdviceOrderBand = (typeof AdviceOrder)[keyof typeof AdviceOrder];
