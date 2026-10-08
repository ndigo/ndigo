/**
 * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getMapping, requestMapping, parameters, pathVariable } from '@blue/dispatcher';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Null } from '@blue/core';
import { ResponseEntity } from '@blue/platform-node';
import { HealthRegistry, type HealthStatus } from './health';
import { HEALTH_REGISTRY } from './health-registry-tokens';
import { readManagementSettings } from './management-properties';

/**
 * A producing view that writes the `/health` document at an explicit HTTP
 * status.
 *
 * `/health` must keep its `{ status, components, timestamp }` body even when
 * the aggregate is DOWN, but the framework renders every 4xx/5xx
 * `ResponseEntity` as `application/problem+json` (AD-10) — which would replace
 * that body. A producing view writes the document directly, so the health
 * payload survives alongside the `503` status (the actuator convention: a
 * DOWN aggregate is signalled by the status code, not by an error envelope).
 */
export class HealthResponseView {
    readonly #body: HealthStatus;
    readonly #status: number;

    /**
     * @param body - The aggregate health document.
     * @param status - The HTTP status to write (200 or 503).
     */
    constructor(body: HealthStatus, status: number) {
        this.#body = body;
        this.#status = status;
    }

    /**
     * Produces the health response document.
     *
     * @returns The status, JSON content type, and serialized health body.
     */
    async renderTo(): Promise<{ status: number; headers: Record<string, string>; body: string }> {
        return {
            status: this.#status,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.#body),
        };
    }
}

/**
 * Serves application health under `/health`.
 *
 * Runs the context-level {@link HealthRegistry} (all registered indicators —
 * including the telemetry indicator wired at context refresh by
 * {@link ManagementAutoConfiguration}). The registry is read-only here;
 * it is never mutated per request.
 *
 * The HTTP status mirrors the aggregate: `503 Service Unavailable` when any
 * component is `DOWN`, `200 OK` otherwise (`UP` or `UNKNOWN`) — so
 * orchestrators (Kubernetes probes, load balancers) can route on the status
 * code alone, per the actuator convention.
 *
 * @since 1.0.0
 */
@requestMapping('/health')
export class HealthController extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;

    /**
     * Returns the aggregate health status.
     *
     * @returns The health document at `503` when the aggregate is `DOWN`,
     *   `200` otherwise; `{ status: 'UNKNOWN' }` at `200` when no registry
     *   is wired.
     */
    @getMapping('/')
    async health(): Promise<HealthResponseView> {
        const registry = this.applicationContext?.getValue<HealthRegistry>(HEALTH_REGISTRY);
        const status: HealthStatus = registry
            ? await registry.checkAll()
            : { status: 'UNKNOWN', components: {}, timestamp: new Date().toISOString() };
        return new HealthResponseView(status, status.status === 'DOWN' ? 503 : 200);
    }

    /**
     * Serves a health group or a single component under `/health/:name`
     * (AD-76 D-6).
     *
     * A configured group (from `management.health.groups.<name>.include`)
     * shadows a same-named component and answers with the aggregate over
     * the members that are registered; a bare component answers with its
     * own result document. Unknown names 404; a group with no registered
     * members 404 too. A `DOWN` aggregate answers `503` exactly like the
     * root document.
     *
     * @param name - The group or component name.
     * @returns The health document at the aggregate status, or 404.
     */
    @getMapping('/:name')
    @parameters({ name: pathVariable('name') })
    async component(name: string): Promise<HealthResponseView | ResponseEntity<void>> {
        const registry = this.applicationContext?.getValue<HealthRegistry>(HEALTH_REGISTRY);
        if (!registry) {
            return ResponseEntity.notFound();
        }
        const groups = readManagementSettings(this.applicationContext?.environment).health.groups;
        const group = groups[name];
        if (group && group.include.length > 0) {
            const status = await registry.check(group.include);
            if (Object.keys(status.components).length === 0) {
                return ResponseEntity.notFound();
            }
            return new HealthResponseView(status, status.status === 'DOWN' ? 503 : 200);
        }
        if (!registry.names.includes(name)) {
            return ResponseEntity.notFound();
        }
        const status = await registry.check([name]);
        const result = status.components[name];
        return new HealthResponseView(
            { status: result.status, components: { [name]: result }, timestamp: status.timestamp },
            result.status === 'DOWN' ? 503 : 200
        );
    }
}
