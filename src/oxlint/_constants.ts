/**
 * Shared constants for the repository-only lint rules.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
export const INTEGRATION_LAYER_MAP: Record<string, string> = {
    linkedom: '@ndigo/dom',
};

/**
 * Package names that are allowed to import the libraries they encapsulate.
 */
export const INTEGRATION_LAYER_PACKAGES: string[] = ['@ndigo/dom'];

/**
 * Browser-environment globals the isomorphic-code guard watches for.
 */
export const BROWSER_GLOBALS: readonly string[] = [
    'window',
    'document',
    'navigator',
    'location',
    'history',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'btoa',
    'atob',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'performance',
    'screen',
];

/**
 * Package names that are browser-only and are allowed to use browser globals freely.
 */
export const BROWSER_ONLY_PACKAGES: readonly string[] = [
    '@ndigo/platform-web',
    '@ndigo/dom',
    '@ndigo/view-webcomponent',
    '@ndigo/boot',
];
