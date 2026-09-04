/**
 * Checkout feature module — lazy-loaded by the host via dynamic import.
 *
 * Demonstrates a feature that requires the shell's shared `cart` dependency.
 *
 * @module
 */

import type { ApplicationContext } from '@blue/context';

/**
 * Create the checkout feature context.
 *
 * @param parent - The host shell context.
 * @returns A child context for the checkout feature.
 */
export function createContext(parent: ApplicationContext): ApplicationContext {
    const ctx = parent.newChild('checkout');
    // `cart` resolves from the shell (shared dependency).
    ctx.setValue('checkoutNote', 'Cart is shared from the shell');
    return ctx;
}