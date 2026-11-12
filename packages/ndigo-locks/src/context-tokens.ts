/**
 * Context tokens for the `@ndigo/locks` entries (AD-73 D-4).
 */
import { ContextToken } from '@ndigo/factory';
import type { LockDriver } from './lock-driver';

/**
 * Token for the application context's shared {@link LockDriver} entry —
 * the `@scheduled({ lock })` runner resolves the driver through it when no
 * driver was passed to the constructor (the `NodeAutoConfiguration`
 * single-entry wiring).
 */
export const LOCK_DRIVER = new ContextToken<LockDriver>('lockDriver');
