/**
 * A `RegExp` subclass compiled from a wildcard pattern.
 */
import { WildcardConverter } from './wildcard-converter.js';

const wildcardConverter = new WildcardConverter();

/**
 * A regular expression compiled from a wildcard pattern.
 *
 * @example
 * ```ts
 * const re = new WildcardExp('*.ts');
 * re.test('foo.ts'); // true
 * ```
 */
export class WildcardExp extends RegExp {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "WildcardExp".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object WildcardExp]"
     */
    get [Symbol.toStringTag](): string {
        return 'WildcardExp';
    }

    /**
     * Compiles a wildcard pattern into a regular expression.
     *
     * @param pattern - Wildcard pattern to compile.
     */
    constructor(pattern: string = '*') {
        super(wildcardConverter.convert(pattern));
    }
}
