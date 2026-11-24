/**
 * Shared constants for the repository-only lint rules.
 *
 * `INTEGRATION_LAYER_MAP` maps an encapsulated library to the Ndigo package(s)
 * that are allowed to import it. A single string is normal; an array is used
 * when a library has more than one legitimate integration site (e.g. TOON is
 * decoded lazily by `@ndigo/boot` and encoded statically by `@ndigo/view-toon`).
 */
export const INTEGRATION_LAYER_MAP: Record<string, string | readonly string[]> = {
    ai: '@ndigo/ai-sdk',
    '@toon-format/toon': ['@ndigo/boot', '@ndigo/view-toon'],
};

/**
 * Package names that are allowed to import the libraries they encapsulate.
 */
export const INTEGRATION_LAYER_PACKAGES: string[] = ['@ndigo/ai-sdk', '@ndigo/boot', '@ndigo/view-toon'];
