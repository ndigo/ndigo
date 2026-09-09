import { StandardEnvironment } from '@blue/context';
import type { ResolverOptions } from '@blue/context';
import { JSONObject } from '@blue/core';

/**
 * Captures `process.env` into a plain JSONObject, dropping `undefined` entries
 * (Node deletes a key on `undefined` assignment, so runtime values are always
 * strings; the type layer models them as `string | undefined`).
 */
const snapshotProcessEnv = (): JSONObject => {
    const snapshot: JSONObject = {};
    for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined) snapshot[key] = value;
    }
    return snapshot;
};

/**
 * Node.js environment implementation that includes `process.env` as a
 * property source registered under the name `systemEnvironment`.
 *
 * Custom sources passed to the constructor take precedence over
 * `process.env` (they are registered before it).
 *
 * `process.env` is **snapshotted** at construction (spread copy into a plain
 * object): later mutations to `process.env` are invisible to this environment
 * until {@link NodeEnvironment.refresh} is called — the 12-factor contract
 * that sources are replaced, not mutated.
 *
 * Extends `StandardEnvironment` so that DI containers can discriminate between
 * browser and Node environments by class identity (e.g., `instanceof
 * NodeEnvironment`). All other environment behaviour (profiles, property
 * resolution) is inherited.
 */
export class NodeEnvironment extends StandardEnvironment {
    /**
     * Creates a Node.js environment.
     *
     * @param propertySources - Custom property sources (higher precedence than `process.env`).
     * @param options - Resolver options (index strategy).
     */
    constructor(propertySources: JSONObject[] = [], options: ResolverOptions = {}) {
        super(propertySources, options);
        this.getPropertySources().addLast('systemEnvironment', snapshotProcessEnv());
    }

    /**
     * Re-snapshots `process.env` into the `systemEnvironment` source and
     * refreshes the environment (formal `super.refresh()` — recompute from
     * current sources, AD-16 D3), keeping the source's position in the
     * precedence order.
     *
     * Call after mutating `process.env` at runtime to make the new values
     * observable through this environment.
     *
     * @returns `this`, for chaining.
     */
    refresh(): this {
        this.getPropertySources().replace('systemEnvironment', snapshotProcessEnv());
        super.refresh();
        return this;
    }
}
