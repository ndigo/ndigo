/**
 *
 * Configuration enumeration for the inspect manifest. Declares keys via
 * `@ndigo/context`'s `declaredConfigurationProperties()` (the seam `@ndigo/boot`
 * binds against; REU-9) and reports only *whether* the environment supplies a
 * value and which source won — values are never read or decrypted.
 */

import { declaredConfigurationProperties, relaxedKeyCandidates } from '@ndigo/context';
import type { Environment } from '@ndigo/context';
import type { InspectConfigEntry } from './types';

/**
 * Whether the environment currently supplies a value for a declared key,
 * probed by presence only: the exact declared key plus every relaxed-binding
 * spelling (`relaxedKeyCandidates`), matching the keys `@ndigo/boot` binds.
 *
 * @param environment - The environment to probe.
 * @param key - The declared keypath.
 * @returns `true` when any candidate is present.
 */
function hasValue(environment: Environment, key: string): boolean {
    if (environment.hasProperty(key)) return true;
    return relaxedKeyCandidates(key).some((candidate) => environment.hasProperty(candidate));
}

/**
 * The name of the source that won a declared key, probed over the same relaxed
 * candidate set as {@link hasValue}. `originOf` is source-name only (no value
 * read), so probing it cannot leak or decrypt a secret.
 *
 * @param environment - The environment to probe.
 * @param key - The declared keypath.
 * @returns The winning source name, or `null` when unknown.
 */
function originOf(environment: Environment, key: string): string | null {
    for (const candidate of relaxedKeyCandidates(key)) {
        const origin = environment.originOf(candidate);
        if (origin !== null) return origin;
    }
    return null;
}

/**
 * Enumerate the configuration keys the given classes declare.
 *
 * Values are never read or decrypted: `hasValue` comes from presence-only
 * probing (`hasProperty`, never `getProperty`) and `origin` from the winning
 * source name, so secrets in the environment cannot leak into the manifest and
 * a wired decryptor is never consulted. Keys are de-duplicated (first class
 * wins) and sorted by key.
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
                hasValue: environment !== undefined && hasValue(environment, declared.key),
            };
            if (declared.type !== undefined) entry.type = declared.type;
            if (environment !== undefined) {
                const origin = originOf(environment, declared.key);
                if (origin !== null) entry.origin = origin;
            }
            entries.set(declared.key, entry);
        }
    }

    return [...entries.values()].sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}
