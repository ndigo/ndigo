/**
 * Publishable-surface rule for `packages/` (AD-85).
 *
 * `packages/` is the repository's published surface: every directory in it is
 * a consumer package. Repo-only tooling lives in `src/`, `scripts/`, or
 * `agent-local/` instead. `scripts/check-manifests.mjs` enforces the rule via
 * `surfaceViolations`; `scripts/test-package-surface.mjs` pins its behavior.
 *
 * @module scripts/package-surface
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Publish-pending packages allowed to carry `private: true` for now. Every
 * entry records the decision that granted the exception and is expected to
 * be removed when the package flips publishable — the map shrinks, never
 * grows silently.
 */
export const SURFACE_EXCEPTIONS = new Map([
    ['@blue/host', 'AD-18: private first, publishable later — remove when @blue/host publishes'],
]);

/**
 * Violations of the publishable-surface rule for one `packages/` directory.
 *
 * @param {string} dirName - the directory name under `packages/`.
 * @param {object|null} manifest - the parsed package.json, or null when absent.
 * @returns {string[]} human-readable violations (empty when conformant).
 */
export function surfaceViolations(dirName, manifest) {
    if (manifest === null) {
        return [
            `packages/${dirName}/ has no package.json — packages/ is the published surface; repo-only tooling belongs in src/ or scripts/ (AD-85)`,
        ];
    }
    const name = manifest.name ?? dirName;
    if (manifest.private === true && !SURFACE_EXCEPTIONS.has(name)) {
        return [
            `${name} is "private": true — packages/ is the published surface (AD-85); remove the flag or record a publish-pending exception in scripts/package-surface.mjs`,
        ];
    }
    return [];
}
