/**
 * Public API of `@ndigo/flags-openfeature` — the OpenFeature bridge for
 * `@ndigo/flags` (AD-87): the `FlagEvaluator` over an
 * `@openfeature/server-sdk` client, so vendor providers (flagd, OFREP,
 * LaunchDarkly, …) arrive behind the existing SPI, plus the evaluation
 * telemetry hook. The browser counterpart lives in the `/web` entry.
 *
 * @module ndigo-flags-openfeature
 * @since 1.0.0
 * @author Jeff Rose
 */

export { OpenFeatureFlagEvaluator, type OpenFeatureFlagEvaluatorOptions } from './openfeature-flag-evaluator';
export { FeatureFlagTelemetryHook } from './feature-flag-telemetry-hook';
