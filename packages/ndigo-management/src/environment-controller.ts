/**
 * Serves environment/property-source visibility under `/env` (AD-76 D-3).
 * Registered WITHOUT route decorators — the auto-configuration wires the
 * routes explicitly so exposure can gate them.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    AsApplicationContextAware,
    type ApplicationContext,
    type ConfigurableEnvironment,
    REDACTED_VALUE,
} from '@ndigo/context';
import { compareBy, Null, stringComparator } from '@ndigo/core';
import { getMapping, requestMapping, parameters, queryValue } from '@ndigo/dispatcher';
import { ResponseEntity } from '@ndigo/platform-node';
import { isEndpointExposed, readManagementSettings } from './management-properties';

/**
 * The property sources are plain JSON documents (the config-file
 * convention); values are the raw stored text — never resolved, never
 * decrypted (a `{cipher:…}` marker is shown as the marker, SEC-A holds).
 */
const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Flattens a source's JSON tree to dotted keys (arrays and scalars are
 * leaves; objects recurse).
 *
 * @param node - The value to flatten.
 * @param prefix - The dotted prefix so far.
 * @param into - The accumulator.
 */
function flatten(node: unknown, prefix: string, into: Map<string, unknown>): void {
    if (isPlainRecord(node)) {
        for (const [key, value] of Object.entries(node)) {
            const path = prefix === '' ? key : `${prefix}.${key}`;
            if (isPlainRecord(value)) {
                flatten(value, path, into);
            } else {
                into.set(path, value);
            }
        }
    } else if (prefix !== '') {
        into.set(prefix, node);
    }
}

/**
 * Serves `/env`: the active profiles and every property source in
 * precedence order with its flattened dotted keys, values and origins.
 *
 * Payload follows the actuator env endpoint:
 * `{ activeProfiles, propertySources: [{ name, properties }] }`. Values are
 * `"<redacted>"` unless `management.endpoints.env.showValues: true`, and
 * even then only the raw stored text is emitted — decrypted plaintext
 * never reaches the wire (AD-76 D-3). `?toMatch=` filters to sources whose
 * name contains the term plus properties whose key starts with it.
 *
 * @since 1.0.0
 */
@requestMapping('/env')
export class EnvironmentController extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;
    readonly #exposure: { include?: string[]; exclude?: string[] };

    /**
     * @param exposure - The programmatic exposure override (AD-76 D-5);
     *   wins over the `management.*` source section.
     */
    constructor(exposure: { include?: string[]; exclude?: string[] } = {}) {
        super();
        this.#exposure = exposure;
    }

    /**
     * The environment document.
     *
     * @param toMatch - Optional filter term.
     * @returns The environment document.
     */
    @getMapping('/')
    @parameters({ toMatch: queryValue('toMatch') })
    env(toMatch?: string) {
        // A missing query parameter binds `null` — normalize before use.
        const term = toMatch ?? undefined;
        if (!isEndpointExposed(this.applicationContext?.environment, this.#exposure, 'env')) {
            return ResponseEntity.notFound();
        }
        const environment = this.applicationContext?.environment as ConfigurableEnvironment | undefined;
        const sources = environment?.getPropertySources();
        const showValues = readManagementSettings(this.applicationContext?.environment).endpoints.env.showValues;

        const propertySources: Array<{ name: string; properties: Record<string, { value?: string; origin: string }> }> =
            [];
        if (sources) {
            for (const [name, source] of sources.entries()) {
                const properties: Record<string, { value?: string; origin: string }> = {};
                const flattened = new Map<string, unknown>();
                flatten(source.properties, '', flattened);
                const nameMatches = term === undefined || name.includes(term);
                const sorted = [...flattened.entries()].sort(compareBy(([key]) => key, stringComparator.compare));
                for (const [key, value] of sorted) {
                    if (!nameMatches && term !== undefined && !key.startsWith(term)) {
                        continue;
                    }
                    properties[key] = {
                        value: showValues ? renderValue(value) : REDACTED_VALUE,
                        origin: name,
                    };
                }
                if (Object.keys(properties).length > 0) {
                    propertySources.push({ name, properties });
                }
            }
        }
        return { activeProfiles: environment?.activeProfiles ?? [], propertySources };
    }
}

/**
 * Renders a raw source value as stored text (JSON for compound values).
 */
function renderValue(value: unknown): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
}
