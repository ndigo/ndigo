/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@blue/factory';
import type { AbstractDispatcher } from './dispatcher';

/**
 * Context token for the {@link AbstractDispatcher}.
 */
export const DISPATCHER = new ContextToken<AbstractDispatcher>('dispatcher');
