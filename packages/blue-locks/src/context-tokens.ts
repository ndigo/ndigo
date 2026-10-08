/**
 * Context tokens for the `@blue/locks` beans (AD-73 D-4).
 *
 * @module blue-locks
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@blue/factory';
import type { LockDriver } from './lock-driver';

/**
 * Token for the application context's shared {@link LockDriver} bean —
 * the `@scheduled({ lock })` runner resolves the driver through it when no
 * driver was passed to the constructor (the `NodeAutoConfiguration`
 * single-bean wiring).
 */
export const LOCK_DRIVER = new ContextToken<LockDriver>('lockDriver');
