/**
 * Typed context tokens shared by the host shell and its features.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@ndigo/context';

/** The shell-wide shared cart singleton (ADR-34 token lookup). */
export interface Cart {
    readonly items: string[];
    add(item: string): void;
}

/** Token whose `description` ('cart') is the runtime registry key. */
export const CART = new ContextToken<Cart>('cart');
