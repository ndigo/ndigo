/**
 * Public API of `@blue/flags-openfeature` — the OpenFeature bridge for
 * `@blue/flags` (AD-87): the `FlagEvaluator` over an
 * `@openfeature/server-sdk` client, so vendor providers (flagd, OFREP,
 * LaunchDarkly, …) arrive behind the existing SPI.
 *
 * @module blue-flags-openfeature
 * @since 1.0.0
 * @author Jeff Rose
 */

export { OpenFeatureFlagEvaluator, type OpenFeatureFlagEvaluatorOptions } from './openfeature-flag-evaluator';
