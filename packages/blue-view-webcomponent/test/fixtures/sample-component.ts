/**
 * @module blue-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
import { TagMapping } from '../../src/tag-mapping';

/**
 * A component module fixture for lazy `WebComponentViewResolver` resolution:
 * the class is a named (not default) export carrying `@TagMapping` metadata,
 * and importing the module defines the element as a side effect.
 */

@TagMapping('sample-tag')
export class SampleComponent extends HTMLElement {}

export const SAMPLE_EXPORT = 'exported';
