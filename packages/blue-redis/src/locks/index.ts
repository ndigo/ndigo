/**
 * Redis locks subpath (`@blue/redis/locks`) — the multi-node `LockDriver`
 * with fencing tokens (AD-73).
 *
 * @module blue-redis
 * @since 1.0.0
 * @author Jeff Rose
 */
export { RedisLockDriver, type RedisLockDriverOptions } from './redis-lock-driver';
