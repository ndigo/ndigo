/**
 * @author Jeff Rose
 * @module has
 */

import detect from './detect-node';
import { has, had } from './has';

detect();

if( has.object_freeze ){
    Object.freeze( had );
}

export { defineDetector, defineDetectors, resetDetector } from './has';

export default has;
