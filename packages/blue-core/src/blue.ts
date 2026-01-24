/**
 * @author Jeff Rose
 */

import { createNull } from './null';

const blue = createNull();

// TODO This fails on the benchmark scripts because globalThis doesn't exist. Need to fix the scripts and then restore this.
/*
Reflect.defineProperty( globalThis, 'blue', {
    value: blue,
    configurable: true,
    enumerable: true,
    writable: false
} );
*/

export default blue;
