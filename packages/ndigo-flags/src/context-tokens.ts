/**
 * Context tokens for `@ndigo/flags` (AD-82 D-2).
 *
 * @module ndigo-flags
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@ndigo/factory';
import type { FlagEvaluator } from './flag-evaluator';

/**
 * The application's flag evaluator bean (default:
 * `PropertyFlagProvider` over the environment, registered by
 * `NodeAutoConfiguration`). Apps override the bean with a remote or
 * OpenFeature-backed evaluator for vendor flagging.
 */
export const FLAG_EVALUATOR = new ContextToken<FlagEvaluator>('flagEvaluator');
