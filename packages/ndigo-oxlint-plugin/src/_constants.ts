/**
 * Browser-environment constants for the consumer-facing rules.
 *
 * @since 1.0.0
 * @author Jeff Rose
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
