/** @author Jeff Rose */

/**
 * Maps encapsulated third-party library names to their BlueJS integration layer package.
 *
 * Any import from a key in this map should instead come from the corresponding value,
 * unless the importing file is inside the integration layer package itself or is a test file.
 *
 * @remarks
 * Keep this map in sync with the integration layer packages enforced by the ESLint rules.
 */
export const INTEGRATION_LAYER_MAP: Record<string, string> = {
    seedrandom: '@blue/util',
    slug: '@blue/util',
    ramda: '@blue/util',
    'date-fns': '@blue/util',
    objectmodel: '@blue/model',
};

/**
 * Package names that are allowed to import the libraries they encapsulate.
 */
export const INTEGRATION_LAYER_PACKAGES: string[] = ['@blue/util', '@blue/model'];

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
