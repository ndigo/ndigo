/**
 * Checkout feature module — lazy-loaded by the host via dynamic import.
 * @module ndigo-host
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ApplicationContext } from '@ndigo/context';
import { CART } from '../context-tokens';

/**
 * Create the checkout feature context.
 *
 * @param parent - The host shell context.
 * @returns A child context for the checkout feature.
 */
export function createContext(parent: ApplicationContext): ApplicationContext {
    const ctx = parent.newChild('checkout');
    // `cart` resolves from the shell (shared dependency) — the demo exercises
    // the shared singleton instead of leaving it unused. A missing cart falls
    // back to the plain checkout note.
    const cart = ctx.getValue(CART);
    if (!cart) {
        ctx.setValue('checkoutNote', 'Cart is shared from the shell');
        return ctx;
    }

    cart.add('Ndigo Mug');
    ctx.setValue('checkoutNote', `Cart is shared from the shell (${cart.items.length} item(s))`);
    return ctx;
}
