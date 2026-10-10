/**
 * Context tokens for `@blue/flags` (AD-82 D-2).
 *
 * @module blue-flags
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@blue/factory';
import type { FlagEvaluator } from './flag-evaluator';

/**
 * The application's flag evaluator bean (default:
 * `PropertyFlagProvider` over the environment, registered by
 * `NodeAutoConfiguration`). Apps override the bean with a remote or
 * OpenFeature-backed evaluator for vendor flagging.
 */
export const FLAG_EVALUATOR = new ContextToken<FlagEvaluator>('flagEvaluator');
