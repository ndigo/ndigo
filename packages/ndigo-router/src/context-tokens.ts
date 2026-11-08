/**
 * Context tokens for the router.
 */
import { ContextToken } from '@ndigo/factory';
import type { Router } from './router';

/**
 * A `ContextToken` for retrieving the application's `Router` instance from the dependency injection context.
 */
export const ROUTER = new ContextToken<Router>('router');
