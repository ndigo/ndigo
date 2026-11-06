/**
 * Public API of `@ndigo/flags` — feature flags (AD-82): the `FlagEvaluator`
 * SPI (typed, async, never-throw), the property-backed local provider,
 * and the `@whenFeature` gate metadata.
 */

export {
    likeFlagEvaluator,
    validateFlagKey,
    type FlagErrorCode,
    type FlagEvaluation,
    type FlagEvaluationContext,
    type FlagEvaluationReason,
    type FlagEvaluator,
    type FlagValue,
} from './flag-evaluator';
export {
    PropertyFlagProvider,
    stableBucket,
    type FlagPropertyReader,
    type PropertyFlagProviderOptions,
} from './property-flag-provider';
export { getWhenFeature, whenFeature, WHEN_FEATURE_KEY } from './when-feature';
export { FLAG_EVALUATOR } from './context-tokens';
