/**
 * Integration-layer constants for the repository-only lint rules.
 * @module src/oxlint
 * @since 1.0.0
 * @author Jeff Rose
 */
export const INTEGRATION_LAYER_MAP: Record<string, string> = {
    linkedom: '@blue/dom',
};

/**
 * Package names that are allowed to import the libraries they encapsulate.
 */
export const INTEGRATION_LAYER_PACKAGES: string[] = ['@blue/dom'];
