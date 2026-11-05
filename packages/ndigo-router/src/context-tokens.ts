/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@ndigo/factory';
import type { Router } from './router';

/**
 * A `ContextToken` for retrieving the application's `Router` instance from the dependency injection context.
 * @since 1.0.0
 */
export const ROUTER = new ContextToken<Router>('router');
