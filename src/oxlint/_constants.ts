/**
 * Shared constants for the repository-only lint rules.
 */
export const INTEGRATION_LAYER_MAP: Record<string, string> = {
    linkedom: '@ndigo/dom',
    ai: '@ndigo/ai-sdk',
};

/**
 * Package names that are allowed to import the libraries they encapsulate.
 */
export const INTEGRATION_LAYER_PACKAGES: string[] = ['@ndigo/dom', '@ndigo/ai-sdk'];
