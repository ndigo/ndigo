/**
 * Public API of `@ndigo/locks` — distributed locks with fencing tokens
 * (AD-73).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

export { likeLockDriver, type LockAcquireOptions, type LockDriver, type LockHandle } from './lock-driver';
export { InProcessLockDriver, type InProcessLockDriverOptions } from './in-process-lock-driver';
export { LOCK_DRIVER } from './context-tokens';
