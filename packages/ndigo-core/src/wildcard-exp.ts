/**
 * A `RegExp` subclass compiled from a wildcard pattern.
 */
import { WildcardConverter } from './wildcard-converter.js';

const wildcardConverter = new WildcardConverter();
/**
 * A regular expression compiled from a wildcard pattern.
 */
export class WildcardExp extends RegExp {
    /**
     * Compiles a wildcard pattern into a regular expression.
     *
     * @param pattern - Wildcard pattern to compile.
     */
    constructor(pattern: string = '*') {
        super(wildcardConverter.convert(pattern));
    }
}
