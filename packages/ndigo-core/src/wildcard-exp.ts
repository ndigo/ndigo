/**
 * @module ndigo-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { WildcardConverter } from './wildcard-expression.js';

const wildcardConverter = new WildcardConverter();
/**
 * A regular expression compiled from a wildcard pattern.
 */
export default class WildcardExp extends RegExp {
    /**
     * Compiles a wildcard pattern into a regular expression.
     *
     * @param pattern - Wildcard pattern to compile.
     */
    constructor(pattern: string = '*') {
        super(wildcardConverter.convert(pattern));
    }
}
