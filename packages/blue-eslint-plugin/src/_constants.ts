/** @author opencode */

/**
 * Maps encapsulated third-party library names to their BlueJS integration layer package.
 *
 * Any import from a key in this map should instead come from the corresponding value,
 * unless the importing file is inside the integration layer package itself or is a test file.
 */
export const INTEGRATION_LAYER_MAP: Record<string, string> = {
    ramda: '@blue/util',
    'date-fns': '@blue/util',
    'date-fns-tz': '@blue/util',
    seedrandom: '@blue/util',
    slug: '@blue/util',
    arcsecond: '@blue/parser',
    objectmodel: '@blue/model',
};

/**
 * Package names that ARE integration layer packages (allowed to import their encapsulated libraries).
 */
export const INTEGRATION_LAYER_PACKAGES: string[] = ['@blue/util', '@blue/parser', '@blue/model'];
