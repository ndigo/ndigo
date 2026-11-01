/**
 * Maps encapsulated third-party library names to their BlueJS integration layer package.
 * @module blue-oxlint-plugin
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

/**
 * Browser global names that should not be accessed unguarded in isomorphic packages.
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
    '@blue/platform-web',
    '@blue/dom',
    '@blue/view-webcomponent',
    '@blue/boot',
];
