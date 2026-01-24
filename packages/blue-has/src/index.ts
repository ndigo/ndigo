/**
 * @author Jeff Rose
 * @module has
 */

import detect from './detect-all';
import { has, had } from './has';

detect();

if (has.object_freeze) {
    Object.freeze(had);
}

export { defineDetector, defineDetectors, resetDetector } from './has';

export default has;
