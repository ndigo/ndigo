/**
 * Context tokens for `@ndigo/redis`.
 */
import { ContextToken } from '@ndigo/factory';
import type { RedisConnection } from './connection';

/**
 * Token for the application's shared {@link RedisConnection} entry. Apps
 * register a connected connection under it; consumers resolve it with
 * `context.getValue(REDIS_CONNECTION)` (or receive it via
 * `RedisConnectionAware`).
 */
export const REDIS_CONNECTION = new ContextToken<RedisConnection>('redisConnection');
