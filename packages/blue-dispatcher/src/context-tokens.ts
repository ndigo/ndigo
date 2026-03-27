/**
 * @author Jeff Rose
 */

import { ContextToken } from '@blue/factory';
import type { BrowserDispatcher } from './dispatcher';

export const DISPATCHER = new ContextToken<BrowserDispatcher>('dispatcher');
