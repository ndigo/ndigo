/**
 * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getMapping, requestMapping } from '@blue/dispatcher';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Null } from '@blue/core';
import { HealthRegistry } from './health';
import { HEALTH_REGISTRY } from './health-registry-tokens';

/**
 * Serves application health under `/health`.
 *
 * Runs the context-level {@link HealthRegistry} (all registered indicators —
 * including the telemetry indicator wired at context refresh by
 * {@link ManagementAutoConfiguration}). The registry is read-only here;
 * it is never mutated per request.
 *
 * @since 1.0.0
 */
@requestMapping('/health')
export class HealthController extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;

    /**
     * Returns the aggregate health status.
     *
     * @returns `{ status, components, timestamp }`, or `{ status: 'UNKNOWN' }`
     *   when no registry is wired.
     */
    @getMapping('/')
    async health() {
        const registry = this.applicationContext?.getValue<HealthRegistry>(HEALTH_REGISTRY);
        if (!registry) {
            return { status: 'UNKNOWN', components: {}, timestamp: new Date().toISOString() };
        }
        return registry.checkAll();
    }
}
