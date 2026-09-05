import { ContextToken } from '@blue/context';
import { HealthRegistry } from './health';

/**
 * Context token for the shared {@link HealthRegistry} that the `/health`
 * endpoint reads. `ManagementAutoConfiguration` registers one and populates it
 * with indicator wiring.
 */
export const HEALTH_REGISTRY = new ContextToken<HealthRegistry>('healthRegistry');
