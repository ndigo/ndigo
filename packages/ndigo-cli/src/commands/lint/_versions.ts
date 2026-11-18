/**
 * Dependency ranges `ndigo lint init` writes into a project's `package.json`.
 *
 * The CLI cannot import `@ndigo/oxlint-plugin` (that would drag the `oxlint`
 * peer into every CLI install), so the ranges live here and
 * `test/lint-init.spec.ts` fails when they drift from the workspace catalog
 * or the plugin's own version.
 */

/** Tested oxlint range; tracks the workspace catalog entry. */
export const OXLINT_VERSION_RANGE = '^1.91.0';

/** Plugin range; tracks `packages/ndigo-oxlint-plugin/package.json#version`. */
export const PLUGIN_VERSION_RANGE = '~0.0.1';
