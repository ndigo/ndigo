/**
 * Context token for the shared health registry.
 */
import { ContextToken } from '@ndigo/context';
import { HealthRegistry } from './health';

/**
 * Context token for the shared {@link HealthRegistry} that the `/health`
 * endpoint reads. `ManagementAutoConfiguration` registers one and populates it
 * with indicator wiring.
 *
 * @example
 * ```ts
 * const registry = context.getValue<HealthRegistry>(HEALTH_REGISTRY);
 * ```
 */
export const HEALTH_REGISTRY = new ContextToken<HealthRegistry>('healthRegistry');
