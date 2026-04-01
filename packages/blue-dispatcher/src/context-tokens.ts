/**
 * @author Jeff Rose
 */

import { ContextToken } from '@blue/factory';
import type { BrowserDispatcher } from './dispatcher';

/**
 * Context token for the {@link BrowserDispatcher}.
 */
export const DISPATCHER = new ContextToken<BrowserDispatcher>('dispatcher');
