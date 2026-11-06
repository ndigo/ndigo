/**
 * Shared dependency registry for the application context hierarchy.
 */
import { satisfiesVersion } from '@ndigo/core';

/**
 * A single shared dependency entry.
 */
export interface SharedDependencyEntry {
    /** Whether this dependency must be a singleton. Default `true`. */
    singleton: boolean;
    /** Declared version string (e.g. `'1.2.0'`). */
    version: string;
}

/**
 * Result of validating a feature's dependency manifest against the registry.
 */
export interface DependencyValidationResult {
    valid: boolean;
    missing: string[];
    versionMismatches: Array<{ name: string; required: string; found: string }>;
    warnings: string[];
}

/**
 * Registry that holds shared dependency declarations and validates feature manifests.
 */
export interface SharedDependencyRegistry {
    /**
     * Declare shared dependencies from shell configuration.
     *
     * @param manifest - A map of token description (string) to dependency entry.
     */
    declare(manifest: Record<string, SharedDependencyEntry>): void;

    /**
     * Validate a feature's dependency requirements against this registry.
     *
     * @param required - Map of dependency name to semver range, e.g. `{ ROUTER: '^1.0.0' }`.
     * @param optional - Map of optional dependency name to semver range.
     * @returns Validation result with any missing or mismatched dependencies.
     */
    validate(required: Record<string, string>, optional: Record<string, string>): DependencyValidationResult;

    /**
     * Get a dependency entry by name.
     *
     * @param name - The dependency name (token description).
     * @returns The dependency entry, or `undefined` if not declared.
     */
    getDependency(name: string): SharedDependencyEntry | undefined;
}

/**
 * Default implementation of `SharedDependencyRegistry`.
 *
 * Validates feature dependencies against the ancestor context chain
 * at mount time, checking both the registry's declarations and actual
 * runtime entry presence.
 */
export class DefaultSharedDependencyRegistry implements SharedDependencyRegistry {
    #services: Map<string, SharedDependencyEntry>;

    constructor() {
        this.#services = new Map();
    }

    declare(manifest: Record<string, SharedDependencyEntry>): void {
        for (const [key, entry] of Object.entries(manifest)) {
            this.#services.set(key, entry);
        }
    }

    getDependency(name: string): SharedDependencyEntry | undefined {
        return this.#services.get(name);
    }

    validate(required: Record<string, string>, optional: Record<string, string>): DependencyValidationResult {
        const missing: string[] = [];
        const versionMismatches: Array<{ name: string; required: string; found: string }> = [];
        const warnings: string[] = [];

        for (const [name, range] of Object.entries(required)) {
            const entry = this.#services.get(name);

            if (!entry) {
                missing.push(name);
                continue;
            }

            if (!satisfiesVersion(entry.version, range)) {
                versionMismatches.push({ name, required: range, found: entry.version });
            }
        }

        for (const [name, range] of Object.entries(optional)) {
            const entry = this.#services.get(name);

            if (!entry) {
                warnings.push(`Optional dependency '${name}' not declared in shell`);
                continue;
            }

            if (!satisfiesVersion(entry.version, range)) {
                warnings.push(`Optional dependency '${name}' version ${entry.version} does not satisfy '${range}'`);
            }
        }

        return {
            valid: missing.length === 0 && versionMismatches.length === 0,
            missing,
            versionMismatches,
            warnings,
        };
    }
}
