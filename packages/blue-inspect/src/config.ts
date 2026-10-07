/**
 * @module blue-inspect
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Configuration enumeration for the inspect manifest. Declares keys via
 * `@blue/boot`'s `declaredConfigurationProperties()` and reports only
 * *whether* the environment supplies a value — never the value itself.
 */

import { declaredConfigurationProperties } from '@blue/boot';
import type { Environment } from '@blue/context';
import type { InspectConfigEntry } from './types';

/**
 * Enumerate the configuration keys the given classes declare.
 *
 * Values are never read: `hasValue` is derived from presence and `origin` from
 * the winning source name, so secrets in the environment cannot leak into the
 * manifest. Keys are de-duplicated (first class wins) and sorted by key.
 *
 * @param classes - The `@configurationProperties` classes to enumerate.
 * @param environment - The environment to probe for presence, when available.
 * @returns The sorted, value-free configuration entries.
 */
export function collectConfig(classes: readonly Function[], environment?: Environment): InspectConfigEntry[] {
    const entries = new Map<string, InspectConfigEntry>();

    for (const ctor of classes) {
        for (const declared of declaredConfigurationProperties(ctor as new () => unknown)) {
            if (entries.has(declared.key)) continue;
            const entry: InspectConfigEntry = {
                key: declared.key,
                hasValue: environment !== undefined && environment.getProperty(declared.key) !== undefined,
            };
            if (declared.type !== undefined) entry.type = declared.type;
            if (environment !== undefined) {
                const origin = environment.originOf(declared.key);
                if (origin !== null) entry.origin = origin;
            }
            entries.set(declared.key, entry);
        }
    }

    return [...entries.values()].sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}
