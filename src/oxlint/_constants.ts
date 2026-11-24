/**
 * Shared constants for the repository-only lint rules.
 *
 * `INTEGRATION_LAYER_MAP` maps an encapsulated library to the Ndigo package(s)
 * that are allowed to import it. A single string is normal; an array is used
 * when a library has more than one legitimate integration site (e.g. TOON is
 * decoded lazily by `@ndigo/boot` and encoded statically by `@ndigo/view-toon`).
 *
 * `INTEGRATION_LAYER_KINDS` records *why* each boundary exists: an adapter takes
 * upstream values at its entry points, a boundary hides the upstream entirely,
 * and a facade deliberately re-exports the upstream API as the contract. The
 * kind is documentation, not enforcement — the import rule enforces ownership.
 */
export const INTEGRATION_LAYER_MAP: Record<string, string | readonly string[]> = {
    ai: '@ndigo/ai-sdk',
    '@toon-format/toon': ['@ndigo/boot', '@ndigo/view-toon'],
    '@preact/signals-core': '@ndigo/signals',
};

/**
 * Package names that are allowed to import the libraries they encapsulate.
 * Derived from {@link INTEGRATION_LAYER_MAP} so there is one ownership list.
 */
export const INTEGRATION_LAYER_PACKAGES: string[] = [
    ...new Set(
        Object.values(INTEGRATION_LAYER_MAP).flatMap((owners) => (typeof owners === 'string' ? [owners] : owners))
    ),
];

/**
 * Why each integration layer exists. Every package in
 * {@link INTEGRATION_LAYER_PACKAGES} must have an entry; the constants spec
 * fails when the two drift.
 */
export const INTEGRATION_LAYER_KINDS: Record<string, 'adapter' | 'boundary' | 'facade'> = {
    '@ndigo/ai-sdk': 'adapter',
    '@ndigo/boot': 'boundary',
    '@ndigo/view-toon': 'boundary',
    '@ndigo/signals': 'facade',
};
