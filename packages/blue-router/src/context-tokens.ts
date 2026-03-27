/**
 * @author Jeff Rose
 */

import { ContextToken } from '@blue/factory';
import type { Router } from './router';

export const ROUTER = new ContextToken<Router>('router');
