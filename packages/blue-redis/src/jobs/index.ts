/**
 * Redis jobs subpath (`@blue/redis/jobs`) — the durable `JobDriver` backed by
 * sorted sets and one Lua claim script.
 *
 * @module blue-redis
 * @since 1.0.0
 * @author Jeff Rose
 */
export { RedisJobDriver, type RedisJobDriverOptions } from './redis-job-driver';
