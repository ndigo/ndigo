/**
 * Redis jobs subpath (`@ndigo/redis/jobs`) — the durable `JobDriver` backed by
 * sorted sets and one Lua claim script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
export { RedisJobDriver, type RedisJobDriverOptions } from './redis-job-driver';
