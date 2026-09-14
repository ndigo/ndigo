/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { parseWildcard } from './wildcard-expression.js';

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
        super(parseWildcard(pattern));
    }
}
