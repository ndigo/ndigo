/**
 * Catalog feature module — lazy-loaded by the host via dynamic import.
 *
 * @module
 */

import type { ApplicationContext } from '@blue/context';

/**
 * Create the catalog feature context.
 *
 * @param parent - The host shell context.
 * @returns A child context for the catalog feature.
 */
export function createContext(parent: ApplicationContext): ApplicationContext {
    const ctx = parent.newChild('catalog');
    ctx.setValue('catalogItems', [
        { id: 1, name: 'Blue Mug', price: 12.99 },
        { id: 2, name: 'Blue Tee', price: 24.5 },
        { id: 3, name: 'Blue Sticker', price: 3.25 },
    ]);
    return ctx;
}