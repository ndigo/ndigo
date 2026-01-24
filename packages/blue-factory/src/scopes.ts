/**
 * @author Jeff Rose
 */

import { PrototypeScope, HashScope, SingletonScope } from './scope';

export const PROTOTYPE = new PrototypeScope();

export const SINGLETON = new SingletonScope();

export const HASH = new HashScope();
