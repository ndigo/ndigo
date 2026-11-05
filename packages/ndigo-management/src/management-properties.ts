/**
 * `management.*` configuration reads and the exposure model (AD-76 D-5/D-2).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type ConfigurableEnvironment, type Environment } from '@ndigo/context';
import { z } from 'zod';

/**
 * The endpoint ids the exposure model understands. `'*'` expands to this
 * set; `exclude` wins over `include`.
 */
export const MANAGEMENT_ENDPOINT_IDS: readonly string[] = Object.freeze([
    'health',
    'metrics',
    'loggers',
    'env',
    'configprops',
]);

/** The root path each endpoint id serves at. */
const ENDPOINT_PATHS: Record<string, string> = Object.freeze({
    health: '/health',
    metrics: '/metrics',
    loggers: '/loggers',
    env: '/env',
    configprops: '/configprops',
});

/**
 * The exposure defaults when neither options nor a `management.*` source
 * section is present (AD-76 D-2): the two pre-existing endpoints stay
 * served, everything new is opt-in.
 */
export const DEFAULT_EXPOSURE: readonly string[] = Object.freeze(['health', 'metrics']);

/**
 * Schema for the `management` config-file section — validation and the
 * file-model defaults live here (the AD-34 D3 shape that boot's schema
 * mode would apply; the reader below reuses it without importing
 * `@ndigo/boot`, per the REU-9 layering).
 */
const exposureShape = z.object({
    include: z.array(z.string()).default(() => ['health', 'metrics']),
    exclude: z.array(z.string()).default(() => []),
});
const envShape = z.object({
    showValues: z.boolean().default(() => false),
});
const endpointsShape = z.object({
    exposure: exposureShape.default(() => exposureShape.parse({})),
    env: envShape.default(() => envShape.parse({})),
});
const groupsShape = z.record(z.string(), z.object({ include: z.array(z.string()).default(() => []) }));
const healthShape = z.object({
    groups: groupsShape.default(() => groupsShape.parse({})),
});

/**
 * Schema for the `management` config-file section — validation and the
 * file-model defaults live here (the AD-34 D3 shape that boot's schema
 * mode would apply; the reader below reuses it without importing
 * `@ndigo/boot`, per the REU-9 layering).
 */
export const managementSchema = z
    .object({
        endpoints: endpointsShape.default(() => endpointsShape.parse({})),
        health: healthShape.default(() => healthShape.parse({})),
    })
    .default(() => ({ endpoints: endpointsShape.parse({}), health: healthShape.parse({}) }));

/** The validated `management.*` settings (see {@link managementSchema}). */
export type ManagementProperties = z.infer<typeof managementSchema>;

/** A plain JSON object (property-source documents are JSON). */
type JSONRecord = Record<string, unknown>;

const isPlainRecord = (value: unknown): value is JSONRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Merges `over` onto `base` recursively, arrays and scalars replace
 * whole — the property-index precedence model for nested documents.
 */
function deepMerge(base: JSONRecord, over: JSONRecord): JSONRecord {
    const merged: JSONRecord = { ...base };
    for (const [key, value] of Object.entries(over)) {
        const existing = merged[key];
        merged[key] = isPlainRecord(existing) && isPlainRecord(value) ? deepMerge(existing, value) : value;
    }
    return merged;
}

/**
 * Reads the `management` config-file section from the environment's
 * property sources (AD-76 D-5).
 *
 * Sources are visited lowest-precedence first and their `management`
 * subtrees deep-merged, so the result matches exactly what the property
 * index would resolve per dotted key — the same JSON-file convention
 * `@configurationProperties` classes bind. Values are raw source text:
 * no placeholder resolution, no secret decryption.
 *
 * The defaults kick in per missing section (`endpoints.exposure.include`
 * defaults to `["health","metrics"]`), so `{}` is a valid configuration.
 *
 * @param environment - The application environment.
 * @returns The validated management settings.
 */
export function readManagementSettings(environment: Environment | undefined): ManagementProperties {
    // `getPropertySources` is the configurable-environment seam (the same
    // cast the property-source processor applies, configuration.ts).
    const sources = (environment as ConfigurableEnvironment | undefined)?.getPropertySources();
    if (!sources) {
        return managementSchema.parse({});
    }
    let merged: JSONRecord = {};
    const ordered = [...sources.entries()].reverse(); // lowest precedence first
    for (const [, source] of ordered) {
        const section = source.properties['management'];
        if (isPlainRecord(section)) {
            merged = deepMerge(merged, section);
        }
    }
    return managementSchema.parse(merged);
}

/**
 * Computes the served endpoint-id set from an exposure pair.
 *
 * `'*'` in `include` expands to every known id; unknown ids are dropped
 * (the schema documents the vocabulary); `exclude` wins over `include`.
 *
 * @param include - The ids to serve (or `'*'`).
 * @param exclude - The ids to withhold.
 * @returns The served id set.
 */
export function resolveExposure(
    include: readonly string[] | undefined = DEFAULT_EXPOSURE,
    exclude: readonly string[] | undefined = []
): ReadonlySet<string> {
    const excluded = new Set(exclude);
    const selected = (include.includes('*') ? MANAGEMENT_ENDPOINT_IDS : include).filter(
        (id) => MANAGEMENT_ENDPOINT_IDS.includes(id) && !excluded.has(id)
    );
    return new Set(selected);
}

/**
 * The root path of a management endpoint id, e.g. `'loggers'` → `/loggers`.
 *
 * @param id - The endpoint id.
 * @returns The root path.
 */
export function endpointPath(id: string): string | undefined {
    return ENDPOINT_PATHS[id];
}

/**
 * Resolves whether an endpoint id is served: `options` (programmatic,
 * AD-76 D-5) win over the `management.*` source section; the default
 * posture serves health+metrics.
 *
 * @param environment - The application environment (may be undefined pre-injection).
 * @param options - The programmatic exposure override.
 * @param id - The endpoint id to test.
 * @returns `true` when the endpoint is served.
 */
export function isEndpointExposed(
    environment: Environment | undefined,
    options: { include?: string[]; exclude?: string[] } | undefined,
    id: string
): boolean {
    const settings = readManagementSettings(environment);
    return resolveExposure(
        options?.include ?? settings.endpoints.exposure.include,
        options?.exclude ?? settings.endpoints.exposure.exclude
    ).has(id);
}
