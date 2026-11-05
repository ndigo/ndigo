/**
 * Publishable-surface rule for `packages/` (AD-86).
 *
 * `packages/` is the repository's published surface: every directory in it is
 * a consumer package. Repo-only tooling lives in `src/`, `scripts/`, or
 * `agent-local/` instead. `scripts/check-manifests.mjs` enforces the rule via
 * `surfaceViolations`; `scripts/test-package-surface.mjs` pins its behavior.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

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
            `packages/${dirName}/ has no package.json — packages/ is the published surface; repo-only tooling belongs in src/ or scripts/ (AD-86)`,
        ];
    }
    const name = manifest.name ?? dirName;
    if (manifest.private === true) {
        return [
            `${name} is "private": true — packages/ is the published surface (AD-86); remove the flag or move the package out of packages/`,
        ];
    }
    return [];
}
