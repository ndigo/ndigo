/**
 * Catalog feature module — lazy-loaded by the host via dynamic import.
 * @module ndigo-host
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ApplicationContext } from '@ndigo/context';

/**
 * Create the catalog feature context.
 *
 * @param parent - The host shell context.
 * @returns A child context for the catalog feature.
 */
export function createContext(parent: ApplicationContext): ApplicationContext {
    const ctx = parent.newChild('catalog');
    ctx.setValue('catalogItems', [
        { id: 1, name: 'Ndigo Mug', price: 12.99 },
        { id: 2, name: 'Ndigo Tee', price: 24.5 },
        { id: 3, name: 'Ndigo Sticker', price: 3.25 },
    ]);
    return ctx;
}
